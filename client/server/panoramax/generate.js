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
 * @property {number} [searchLimit]
 * @property {number} [searchTimeoutMs]
 * @property {number} [minSequenceItems] Skip sequences with fewer than this many pictures (default 1 = no minimum).
 * @property {boolean} [only360]
 * @property {(found: number, target: number) => void | Promise<void>} [onProgress]
 */
import * as turf from '@turf/turf';
import {
	fetchCollectionItemCount,
	fetchCollectionsByBBox,
	fetchItems,
	searchByBBox
} from './client.js';
import { discoverCoverage } from './coverage.js';
import { itemPoint, pickRandom, usableItems, weightedPick } from './select.js';

/** @template T @param {T[]} arr @param {() => number} rng @returns {T[]} */
function shuffle(arr, rng) {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

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
		searchLimit = 500,
		searchTimeoutMs = 10000,
		minSequenceItems = 1,
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
	/** @type {Map<string, number>} */
	const countCache = new Map();

	/**
	 * True when a sequence has at least `minSequenceItems` pictures. Short sequences
	 * (a few stray uploads) tend to make nondescript rounds, so they're skipped.
	 * The count comes from a cheap, cached `stats:items.count` metadata request.
	 * @param {PanoramaxSource} source @param {string | undefined} cid @returns {Promise<boolean>}
	 */
	async function sequenceLongEnough(source, cid) {
		if (minSequenceItems <= 1) return true;
		if (!cid) return false;
		let count = countCache.get(cid);
		if (count === undefined) {
			try {
				count = await fetchCollectionItemCount(source, cid, { fetcher, timeoutMs: fetchTimeoutMs });
			} catch {
				count = 0;
			}
			countCache.set(cid, count);
		}
		return count >= minSequenceItems;
	}

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
		// Use the item's OWN collection for viewer navigation: on the federated instance
		// a fetched item can belong to a different sequence than the one we queried, and
		// a mismatched sequence makes the viewer show a picture from the wrong place.
		const collectionId = /** @type {any} */ (item).collection ?? collection.id;
		results.push({
			id: item.id,
			sequenceId: collectionId,
			collectionId,
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
		// `itemCount` here is the sequence's picture count (from `stats:items.count`),
		// so short sequences are dropped up front — no per-item metadata call needed.
		if (minSequenceItems > 1) {
			groups = groups.map((g) => g.filter((c) => c.itemCount >= minSequenceItems));
		}
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

		// Fast path: search pictures directly inside the area bbox and keep the ones
		// inside the polygon. Draining whole sequences whose bbox merely overlaps the
		// bbox made large areas (e.g. a whole country) churn on out-of-area border
		// sequences and time out; a direct item search lands on real coverage at once.
		// A covered area answers in <5s; an area the source doesn't cover (e.g. the US
		// on a France-centric instance) either times out or returns nothing. The search
		// is authoritative for "what pictures are in this bbox", so we only fall back to
		// sequence-draining when the search *endpoint* is unavailable (a non-timeout
		// error, e.g. an instance without /search — or the mocked tests).
		let searchWorked = false;
		let searchEndpointFailed = false;
		for (const source of sources) {
			if (results.length >= count || timedOut()) break;
			/** @type {PanoItem[]} */
			let items = [];
			try {
				items = await searchByBBox(source, areaBbox, {
					limit: searchLimit,
					fetcher,
					timeoutMs: searchTimeoutMs
				});
				searchWorked = true;
			} catch (err) {
				const timedOut =
					err instanceof Error && (err.name === 'AbortError' || /abort/i.test(err.message));
				if (!timedOut) searchEndpointFailed = true;
				console.log('[panoramax] area search failed:', err instanceof Error ? err.message : err);
				items = [];
			}
			const usable = shuffle(usableItems(items, { polygon, usedIds, only360 }), rng);
			// prefer distinct sequences for spread, then fill from the rest
			const usedCollections = new Set();
			for (const preferDistinct of [true, false]) {
				for (const item of usable) {
					if (results.length >= count || timedOut()) break;
					if (usedIds.has(item.id)) continue;
					const collectionId = /** @type {any} */ (item).collection;
					if (preferDistinct && usedCollections.has(collectionId)) continue;
					const point = itemPoint(item);
					if (!point) continue;
					// only keep pictures from sequences long enough to be a real traversal
					if (!(await sequenceLongEnough(source, collectionId))) continue;
					usedIds.add(item.id);
					usedCollections.add(collectionId);
					results.push({
						id: item.id,
						sequenceId: collectionId,
						collectionId,
						location: point,
						viewerBaseUrl: source.viewerBaseUrl
					});
					if (onProgress) await onProgress(results.length, count);
				}
			}
		}

		// Fallback: drain sequences only when the search endpoint is unavailable. If the
		// search ran (even returning nothing) or timed out, trust it and fail fast.
		if (results.length < count && !timedOut() && searchEndpointFailed && !searchWorked) {
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
		}
	} else {
		const cells = await discoverCoverage(sources, { fetcher, timeoutMs: fetchTimeoutMs });
		await drainGroups(cells.map((c) => c.collections));
	}

	return results;
}
