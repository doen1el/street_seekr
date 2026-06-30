/** Written by Claude Code (Opus 4.8)
 * Global coverage index.
 *
 * Random global points almost never land on Panoramax coverage, which made the
 * old global mode slow and timeout-prone. Instead we probe a coarse world grid
 * once (each cell is a cheap `/collections?bbox=` query), keep the cells that
 * actually contain sequences, and cache the result. Generation then samples from
 * real coverage.
 *
 * The cache is process-memory with a TTL. The seam is deliberately small so a
 * PocketBase-backed store can replace it later without touching callers.
 *
 * @typedef {import('./types.js').CollectionRef} CollectionRef
 * @typedef {import('./types.js').Fetcher} Fetcher
 * @typedef {import('./types.js').PanoramaxSource} PanoramaxSource
 * @typedef {[number, number, number, number]} Bbox
 *
 * @typedef {Object} CoverageCell
 * @property {Bbox} bbox
 * @property {CollectionRef[]} collections
 * @property {number} totalItems
 */
import { fetchCollectionsByBBox } from './client.js';

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h
/** @type {Map<string, { at: number, cells: CoverageCell[] }>} */
const coverageCache = new Map();

/** Clears the in-memory coverage cache (used by tests). */
export function clearCoverageCache() {
	coverageCache.clear();
}

/** @param {number} [lonStep] @param {number} [latStep] @returns {Bbox[]} */
export function worldGridCells(lonStep = 30, latStep = 30) {
	/** @type {Bbox[]} */
	const cells = [];
	for (let lon = -180; lon < 180; lon += lonStep) {
		for (let lat = -90; lat < 90; lat += latStep) {
			cells.push([lon, Math.max(-85, lat), Math.min(180, lon + lonStep), Math.min(85, lat + latStep)]);
		}
	}
	return cells;
}

/**
 * Runs `task` over `items` with bounded concurrency.
 * @template T, R @param {T[]} items @param {number} concurrency @param {(item: T) => Promise<R>} task
 * @returns {Promise<R[]>}
 */
async function mapPool(items, concurrency, task) {
	/** @type {R[]} */
	const results = new Array(items.length);
	let cursor = 0;
	const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
		while (cursor < items.length) {
			const i = cursor++;
			results[i] = await task(items[i]);
		}
	});
	await Promise.all(workers);
	return results;
}

/** @param {PanoramaxSource[]} sources @returns {string} */
function cacheKey(sources) {
	return sources.map((s) => s.apiBaseUrl).join('|');
}

/**
 * Discovers (and caches) the grid cells that contain Panoramax coverage.
 * @param {PanoramaxSource[]} sources
 * @param {{ fetcher?: Fetcher, timeoutMs?: number, concurrency?: number, collectionsPerCell?: number, lonStep?: number, latStep?: number, force?: boolean }} [opts]
 * @returns {Promise<CoverageCell[]>}
 */
export async function discoverCoverage(sources, opts = {}) {
	const key = cacheKey(sources);
	const cached = coverageCache.get(key);
	if (!opts.force && cached && Date.now() - cached.at < CACHE_TTL_MS) {
		return cached.cells;
	}

	const fetcher = opts.fetcher ?? fetch;
	const timeoutMs = opts.timeoutMs ?? 8000;
	const concurrency = opts.concurrency ?? 6;
	const collectionsPerCell = opts.collectionsPerCell ?? 200;
	const grid = worldGridCells(opts.lonStep ?? 30, opts.latStep ?? 30);

	const cells = (
		await mapPool(grid, concurrency, async (bbox) => {
			/** @type {CollectionRef[]} */
			const collections = [];
			for (const source of sources) {
				try {
					const found = await fetchCollectionsByBBox(source, bbox, {
						limit: collectionsPerCell,
						maxPages: 1,
						fetcher,
						timeoutMs
					});
					collections.push(...found);
				} catch {
					// A failing source/cell shouldn't sink the whole discovery.
				}
			}
			if (!collections.length) return null;
			const totalItems = collections.reduce((sum, c) => sum + c.itemCount, 0);
			return /** @type {CoverageCell} */ ({ bbox, collections, totalItems });
		})
	).filter((c) => c !== null);

	coverageCache.set(key, { at: Date.now(), cells });
	return cells;
}
