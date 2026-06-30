/** Written by Claude Code (Opus 4.8)
 * Shared JSDoc types for the Panoramax sequence-finding module.
 *
 * Panoramax STAC API endpoints used:
 *  - `GET /api/collections[?bbox=]` — sequences (bbox filtered server-side).
 *  - `GET /api/collections/{id}/items` — ordered pictures of one sequence.
 *  - `GET /api/search?bbox=` — pictures inside a bbox (fallback path).
 *
 * @typedef {Object} PanoramaxSource
 * @property {string} apiBaseUrl   API base, no trailing slash (e.g. https://panoramax.ign.fr/api).
 * @property {string} viewerBaseUrl Viewer base used to build client links.
 * @property {string} [token]      Optional bearer token for private instances.
 *
 * @typedef {Object} CollectionRef
 * @property {string} id
 * @property {[number, number, number, number]} bbox  [minLon, minLat, maxLon, maxLat]
 * @property {number} itemCount    Picture count, used as a sampling weight.
 * @property {PanoramaxSource} source
 *
 * @typedef {Object} PanoItem
 * @property {string} id
 * @property {string} [collection]
 * @property {{ type: string, coordinates: [number, number] } | null} [geometry]
 * @property {Record<string, unknown>} [properties]
 * @property {Array<{ rel?: string, href?: string }>} [links]
 * @property {Record<string, { href?: string }>} [assets]
 *
 * @typedef {Object} RoundPoint
 * @property {string} id           Picture id (the anchor scored against).
 * @property {string} sequenceId   Equals collectionId (backwards-compat).
 * @property {string} collectionId Sequence id, for client navigation.
 * @property {[number, number]} location  [lon, lat] of the anchor.
 * @property {string} viewerBaseUrl
 *
 * @typedef {(url: string, init?: RequestInit) => Promise<Response>} Fetcher
 */

export {};
