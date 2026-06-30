/** Written by Claude Code (Opus 4.8)
 * Low-level Panoramax STAC API access.
 *
 * Every call takes an injectable fetcher (defaulting to the global `fetch`) so
 * the network can be stubbed in tests, and an `AbortSignal`-backed timeout so a
 * slow instance can never hang generation.
 *
 * @typedef {import('./types.js').CollectionRef} CollectionRef
 * @typedef {import('./types.js').PanoItem} PanoItem
 * @typedef {import('./types.js').PanoramaxSource} PanoramaxSource
 * @typedef {import('./types.js').Fetcher} Fetcher
 */

export const COLLECTIONS_PAGE_MAX = 1000; // Panoramax caps `limit` at 1000.

/** @param {PanoramaxSource} source @param {string} accept @returns {HeadersInit} */
function authHeaders(source, accept) {
	/** @type {Record<string, string>} */
	const headers = { Accept: accept };
	if (source.token) headers.Authorization = `Bearer ${source.token}`;
	return headers;
}

/**
 * @param {string} url @param {string} accept @param {PanoramaxSource} source
 * @param {Fetcher} fetcher @param {number} timeoutMs @returns {Promise<any>}
 */
async function getJson(url, accept, source, fetcher, timeoutMs) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const res = await fetcher(url, { headers: authHeaders(source, accept), signal: controller.signal });
		if (!res.ok) {
			const text = await res.text().catch(() => '');
			throw new Error(`Panoramax ${res.status} ${res.statusText}: ${text.slice(0, 160)}`);
		}
		return await res.json();
	} finally {
		clearTimeout(timer);
	}
}

/**
 * Normalizes a STAC `extent.spatial.bbox` (an array of bboxes, each 4 or 6
 * numbers) into a single flat `[minLon, minLat, maxLon, maxLat]`.
 * @param {unknown} spatialBbox
 * @returns {[number, number, number, number] | null}
 */
export function normalizeBbox(spatialBbox) {
	const first = Array.isArray(spatialBbox) ? spatialBbox[0] : null;
	if (!Array.isArray(first)) return null;
	const nums = first.map(Number);
	if (nums.some((n) => !Number.isFinite(n))) return null;
	if (nums.length === 4) return [nums[0], nums[1], nums[2], nums[3]];
	if (nums.length === 6) return [nums[0], nums[1], nums[3], nums[4]];
	return null;
}

/** @param {any} json @param {PanoramaxSource} source @returns {CollectionRef[]} */
function parseCollections(json, source) {
	const raw = Array.isArray(json?.collections) ? json.collections : [];
	/** @type {CollectionRef[]} */
	const out = [];
	for (const c of raw) {
		const id = typeof c?.id === 'string' ? c.id : null;
		const bbox = normalizeBbox(c?.extent?.spatial?.bbox);
		if (!id || !bbox) continue;
		const count = Number(c?.['stats:items']?.count);
		out.push({ id, bbox, itemCount: Number.isFinite(count) && count > 0 ? count : 1, source });
	}
	return out;
}

/** @param {any} json @returns {string | null} */
function nextLink(json) {
	const links = Array.isArray(json?.links) ? json.links : [];
	const next = links.find((/** @type {any} */ l) => l?.rel === 'next' && typeof l?.href === 'string');
	return next?.href ?? null;
}

/**
 * Fetches sequences from one source, optionally restricted to a bbox (filtered
 * server-side). Follows `rel:next` pagination up to `maxPages`.
 *
 * @param {PanoramaxSource} source
 * @param {[number, number, number, number] | null} bbox
 * @param {{ limit?: number, maxPages?: number, fetcher?: Fetcher, timeoutMs?: number }} [opts]
 * @returns {Promise<CollectionRef[]>}
 */
export async function fetchCollectionsByBBox(source, bbox, opts = {}) {
	const limit = Math.min(opts.limit ?? COLLECTIONS_PAGE_MAX, COLLECTIONS_PAGE_MAX);
	const maxPages = Math.max(1, opts.maxPages ?? 1);
	const fetcher = opts.fetcher ?? fetch;
	const timeoutMs = opts.timeoutMs ?? 8000;

	const params = new URLSearchParams({ limit: String(limit) });
	if (bbox) params.set('bbox', bbox.join(','));
	/** @type {string | null} */
	let url = `${source.apiBaseUrl}/collections?${params.toString()}`;

	/** @type {CollectionRef[]} */
	const collections = [];
	for (let page = 0; page < maxPages && url; page++) {
		const json = await getJson(url, 'application/json', source, fetcher, timeoutMs);
		collections.push(...parseCollections(json, source));
		url = nextLink(json);
	}
	return collections;
}

/** @param {any} json @returns {PanoItem[]} */
function parseItems(json) {
	const features = Array.isArray(json?.features) ? json.features : [];
	return features.filter((/** @type {any} */ f) => typeof f?.id === 'string');
}

/**
 * Fetches pictures of one sequence (ordered along the street).
 * @param {PanoramaxSource} source @param {string} collectionId
 * @param {{ limit?: number, fetcher?: Fetcher, timeoutMs?: number }} [opts]
 * @returns {Promise<PanoItem[]>}
 */
export async function fetchItems(source, collectionId, opts = {}) {
	const limit = Math.max(1, opts.limit ?? 500);
	const fetcher = opts.fetcher ?? fetch;
	const timeoutMs = opts.timeoutMs ?? 8000;
	const url = `${source.apiBaseUrl}/collections/${encodeURIComponent(collectionId)}/items?limit=${limit}`;
	const json = await getJson(url, 'application/geo+json', source, fetcher, timeoutMs);
	return parseItems(json);
}

/**
 * Searches pictures inside a bbox directly (fallback to the collections path).
 * @param {PanoramaxSource} source @param {[number, number, number, number]} bbox
 * @param {{ limit?: number, fetcher?: Fetcher, timeoutMs?: number }} [opts]
 * @returns {Promise<PanoItem[]>}
 */
export async function searchByBBox(source, bbox, opts = {}) {
	const limit = Math.max(1, opts.limit ?? 120);
	const fetcher = opts.fetcher ?? fetch;
	const timeoutMs = opts.timeoutMs ?? 8000;
	const url = `${source.apiBaseUrl}/search?bbox=${bbox.join(',')}&limit=${limit}`;
	const json = await getJson(url, 'application/geo+json', source, fetcher, timeoutMs);
	return parseItems(json);
}
