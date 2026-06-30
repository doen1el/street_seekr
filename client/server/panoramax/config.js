/** Written by Claude Code (Opus 4.8)
 * Env wiring. Reads `process.env` (works in the plain-node WS server and in the
 * adapter-node runtime), so the rest of the module stays env-free and testable.
 *
 * @typedef {import('./types.js').PanoramaxSource} PanoramaxSource
 * @typedef {import('./types.js').RoundPoint} RoundPoint
 */
import { generateRoundsForChallenge } from './generate.js';

/** @param {string | undefined} value @returns {string[]} */
function csv(value) {
	return (value ?? '')
		.split(',')
		.map((s) => s.trim().replace(/\/$/, ''))
		.filter(Boolean);
}

/** Builds the configured Panoramax sources from the environment. @returns {PanoramaxSource[]} */
export function getSourcesFromEnv() {
	const apiUrls = csv(
		process.env.PANORAMAX_API_URLS || process.env.PANORAMAX_API_URL || 'https://panoramax.ign.fr/api'
	);
	const viewerUrls = csv(
		process.env.PUBLIC_PANORAMAX_VIEWER_URLS || process.env.PUBLIC_PANORAMAX_VIEWER_URL
	);
	const token = process.env.PANORAMAX_API_TOKEN || undefined;

	return apiUrls.map((apiBaseUrl, i) => {
		const inferredViewer = apiBaseUrl.endsWith('/api') ? apiBaseUrl.slice(0, -4) : apiBaseUrl;
		return { apiBaseUrl, viewerBaseUrl: viewerUrls[i] || inferredViewer, token };
	});
}

/**
 * Drop-in replacement for the old `generateRandomPointsForChallenge`: same
 * signature, powered by the sequence-aware generator. Returned objects also
 * carry `collectionId` for sequence navigation.
 *
 * @param {import('geojson').Feature | null} polygon
 * @param {number} count
 * @param {(found: number, target: number) => void | Promise<void>} [onProgress]
 * @returns {Promise<RoundPoint[]>}
 */
export async function generateRandomPointsForChallenge(polygon, count, onProgress) {
	const sources = getSourcesFromEnv();
	if (!sources.length) {
		console.warn('[panoramax] no API URLs configured, cannot fetch images.');
		return [];
	}
	return generateRoundsForChallenge(/** @type {any} */ (polygon), count, {
		sources,
		onProgress,
		generationTimeoutMs: Number(process.env.PANORAMAX_GENERATION_TIMEOUT_MS || 60000),
		fetchTimeoutMs: Number(process.env.PANORAMAX_FETCH_TIMEOUT_MS || 8000),
		only360: process.env.PANORAMAX_ONLY_360 === 'true'
	});
}
