/** Written by Claude Code (Opus 4.8)
 * Round generation — the public entry point.
 *
 *  - **Polygon mode:** fetch the sequences whose bbox overlaps the area
 *    (`/collections?bbox=`, filtered server-side), weighted-pick one, then pick a
 *    picture inside the polygon. One bounded query set instead of hundreds of
 *    random sub-bbox probes.
 *  - **Global mode:** sample from the cached coverage grid so we only ever look
 *    where imagery actually exists. Cells are drawn uniformly for geographic
 *    spread, then a sequence within the cell is weighted by item count.
 *
 * Each round carries its `collectionId`, enabling GeoGuessr-style movement along
 * the sequence on the client. The guess is scored against the anchor's location.
 *
 * @typedef {import('./types.js').CollectionRef} CollectionRef
 * @typedef {import('./types.js').Fetcher} Fetcher
 * @typedef {import('./types.js').PanoItem} PanoItem
 * @typedef {import('./types.js').PanoramaxSource} PanoramaxSource
 * @typedef {import('./types.js').RoundPoint} RoundPoint
 * @typedef {[number, number, number, number]} Bbox
 *
 * @typedef {Object} GenerateOptions
 * @property {PanoramaxSource[]} sources
 * @property {Fetcher} [fetcher]
 * @property {() => number} [rng]
 * @property {number} [generationTimeoutMs]
 * @property {number} [fetchTimeoutMs]
 * @property {number} [collectionPages]
 * @property {number} [collectionsPerPage]
 * @property {number} [itemsLimit]
 * @property {boolean} [only360]
 * @property {(found: number, target: number) => void | Promise<void>} [onProgress]
 */
import * as turf from '@turf/turf';
import { fetchCollectionsByBBox, fetchItems } from './client.js';
import { discoverCoverage } from './coverage.js';
import { itemPoint, pickRandom, usableItems, weightedPick } from './select.js';

/**
 * @param {import('geojson').Feature<import('geojson').Polygon | import('geojson').MultiPolygon> | null} polygon
 * @param {number} count
 * @param {GenerateOptions} opts
 * @returns {Promise<RoundPoint[]>}
 */
export async function generateRoundsForChallenge(polygon, count, opts) {
	const {
		sources,
		fetcher = fetch,
		rng = Math.random,
		generationTimeoutMs = 60000,
		fetchTimeoutMs = 8000,
		collectionPages = 1,
		collectionsPerPage = 300,
		itemsLimit = 250,
		only360 = false,
		onProgress
	} = opts;

	if (!sources.length || count <= 0) return [];

	const deadline = Date.now() + generationTimeoutMs;
	const timedOut = () => Date.now() >= deadline;

	/** @type {RoundPoint[]} */
	const results = [];
	/** @type {Set<string>} */
	const usedIds = new Set();
	/** @type {Map<string, PanoItem[]>} */
	const itemsCache = new Map();

	/** @param {CollectionRef} collection @returns {Promise<PanoItem[]>} */
	async function itemsOf(collection) {
		const cached = itemsCache.get(collection.id);
		if (cached) return cached;
		/** @type {PanoItem[]} */
		let items = [];
		try {
			items = await fetchItems(collection.source, collection.id, {
				limit: itemsLimit,
				fetcher,
				timeoutMs: fetchTimeoutMs
			});
		} catch {
			items = [];
		}
		itemsCache.set(collection.id, items);
		return items;
	}

	/** @param {CollectionRef} collection */
	const usableOf = (collection) =>
		usableItems(itemsCache.get(collection.id) ?? [], { polygon, usedIds, only360 });

	/** @param {CollectionRef} collection @param {PanoItem} item @param {[number, number]} point */
	async function record(collection, item, point) {
		usedIds.add(item.id);
		results.push({
			id: item.id,
			sequenceId: collection.id,
			collectionId: collection.id,
			location: point,
			viewerBaseUrl: collection.source.viewerBaseUrl
		});
		if (onProgress) await onProgress(results.length, count);
	}

	/**
	 * Draws anchors from `groups` (each group = sequences sharing a locality).
	 * Groups are sampled uniformly for spread; a sequence is weighted by item
	 * count and consumed on use so rounds land on distinct streets. When every
	 * group is exhausted, a reuse pass allows further anchors from sequences that
	 * still have usable pictures, so a high round count over few sequences fills.
	 * @param {CollectionRef[][]} groups
	 */
	async function drainGroups(groups) {
		const all = groups.flat();
		let work = groups.map((g) => [...g]).filter((g) => g.length);

		while (results.length < count && !timedOut()) {
			work = work.filter((g) => g.length);
			if (!work.length) {
				const refill = all.filter((c) => usableOf(c).length > 0);
				if (!refill.length) break;
				work = [refill];
				continue;
			}

			const group = /** @type {CollectionRef[]} */ (pickRandom(work, rng));
			const pick = weightedPick(group, (c) => c.itemCount, rng);
			if (!pick) {
				group.length = 0;
				continue;
			}
			group.splice(group.indexOf(pick), 1);

			await itemsOf(pick);
			const chosen = pickRandom(usableOf(pick), rng);
			if (!chosen) continue;
			const point = /** @type {[number, number]} */ (itemPoint(chosen));
			await record(pick, chosen, point);
		}
	}

	if (polygon) {
		const areaBbox = /** @type {Bbox} */ (turf.bbox(polygon).slice(0, 4));
		/** @type {CollectionRef[]} */
		const collections = [];
		for (const source of sources) {
			if (timedOut()) break;
			try {
				collections.push(
					...(await fetchCollectionsByBBox(source, areaBbox, {
						limit: collectionsPerPage,
						maxPages: collectionPages,
						fetcher,
						timeoutMs: fetchTimeoutMs
					}))
				);
			} catch {
				// Skip a failing source rather than aborting the whole generation.
			}
		}
		await drainGroups([collections]);
	} else {
		const cells = await discoverCoverage(sources, { fetcher, timeoutMs: fetchTimeoutMs });
		await drainGroups(cells.map((c) => c.collections));
	}

	return results;
}
