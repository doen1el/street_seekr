import * as turf from '@turf/turf';
import type { Feature, MultiPolygon, Position, Polygon } from 'geojson';
import { env } from '$env/dynamic/private';

export async function handleUpdatePolygon(request: Request) {
	const formData = await request.formData();
	const locationString = (formData.get('locationString') as string) || '';
	const locationStrings = locationString
		.split(',')
		.map((s) => s.trim())
		.filter((s) => s);

	if (locationStrings.length === 0) {
		return JSON.stringify(null);
	}

	try {
		const NOMINATIM_URL = (loc: string) =>
			`https://nominatim.openstreetmap.org/search?q=${encodeURI(
				loc
			)}&polygon_geojson=1&limit=1&format=json`;

		const promises = locationStrings.map((loc) =>
			fetch(NOMINATIM_URL(loc), {
				headers: { 'User-Agent': 'StreetSeeker-Game/1.0' }
			}).then((res) => res.json())
		);

		const results = await Promise.all(promises);
		const allPolygonCoordinates: Position[][][] = [];

		for (const result of results) {
			if (result && result.length > 0 && result[0].geojson) {
				const geojson = result[0].geojson;
				if (geojson.type === 'Polygon') {
					allPolygonCoordinates.push(geojson.coordinates);
				} else if (geojson.type === 'MultiPolygon') {
					allPolygonCoordinates.push(...geojson.coordinates);
				}
			}
		}

		let finalPolygon: Feature<MultiPolygon> | null = null;
		if (allPolygonCoordinates.length > 0) {
			finalPolygon = turf.multiPolygon(allPolygonCoordinates);
		}

		return JSON.stringify(finalPolygon);
	} catch (err) {
		console.error('Error while accessing polygon:', err);
		return JSON.stringify(null);
	}
}

/**
 * Generate up to `count` random Panoramax image positions.
 *
 * Modes:
 * - Polygon provided:
 *   1. Uniformly sample many random candidate points inside the polygon.
 *   2. Select `count` spread-out "centers" via greedy farthest-point sampling.
 *   3. For each center query progressively larger bounding boxes until one pano is found (or give up).
 * - No polygon (global):
 *   1. Repeatedly pick random global points (excluding extreme polar latitudes).
 *   2. For each point query increasing bbox sizes until a pano is found.
 *
 * Guarantees:
 * - Sends at most one Panoramax Search API request per attempted bbox.
 * - Tries to reach `count` results but may return fewer if coverage is sparse.
 *
 * @param polygon Optional Polygon / MultiPolygon (geojson feature) restricting search area.
 * @param count   Desired number of random panorama images.
 * @returns       Array of objects: { id, sequenceId, location: [lon, lat] }.
 */
export async function generateRandomPointsForChallenge(
	polygon: Feature<Polygon | MultiPolygon> | null,
	count: number,
	onProgress?: (found: number, target: number) => Promise<void> | void
): Promise<Array<{ id: string; sequenceId: string; location: number[]; viewerBaseUrl: string }>> {
	console.log('[generateRandomPoints] start', { count, hasPolygon: !!polygon });
	const generationStartedAt = Date.now();
	const MAX_GENERATION_MS = Number(env.PANORAMAX_GENERATION_TIMEOUT_MS || 90000);
	const FETCH_TIMEOUT_MS = Number(env.PANORAMAX_FETCH_TIMEOUT_MS || 8000);
	const SEARCH_LIMIT = Number(env.PANORAMAX_SEARCH_LIMIT || 120);

	const PANORAMAX_API_URLS = (
		env.PANORAMAX_API_URLS || env.PANORAMAX_API_URL || 'https://panoramax.ign.fr/api'
	)
		.split(',')
		.map((url) => url.trim().replace(/\/$/, ''))
		.filter(Boolean);
	const PANORAMAX_VIEWER_URLS = (env.PUBLIC_PANORAMAX_VIEWER_URLS || env.PUBLIC_PANORAMAX_VIEWER_URL || '')
		.split(',')
		.map((url) => url.trim().replace(/\/$/, ''))
		.filter(Boolean);
	const PANORAMAX_API_TOKEN = env.PANORAMAX_API_TOKEN;

	if (!PANORAMAX_API_URLS.length) {
		console.warn('No Panoramax API URLs configured, cannot fetch images.');
		return [];
	}

	const sources = PANORAMAX_API_URLS.map((apiBaseUrl, index) => {
		const explicitViewer = PANORAMAX_VIEWER_URLS[index];
		const inferredViewer = apiBaseUrl.endsWith('/api') ? apiBaseUrl.slice(0, -4) : apiBaseUrl;
		return {
			apiBaseUrl,
			viewerBaseUrl: explicitViewer || inferredViewer
		};
	});

	const MAX_HALF_SIZE = 0.05;

	const [minLon, minLat, maxLon, maxLat] = polygon ? turf.bbox(polygon) : [-180, -85, 180, 85];

	const results: Array<{ id: string; sequenceId: string; location: number[]; viewerBaseUrl: string }> = [];
	const usedIds = new Set<string>();

	function shuffledSources() {
		const copy = [...sources];
		for (let i = copy.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[copy[i], copy[j]] = [copy[j], copy[i]];
		}
		return copy;
	}

	function randomPointInBBox(): [number, number] {
		return [Math.random() * (maxLon - minLon) + minLon, Math.random() * (maxLat - minLat) + minLat];
	}

	function shuffleInPlace<T>(array: T[]) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	function isValidCoords(item: any) {
		const coords = item?.geometry?.coordinates;
		return (
			Array.isArray(coords) &&
			coords.length === 2 &&
			typeof coords[0] === 'number' &&
			typeof coords[1] === 'number'
		);
	}

	function isInsidePolygon(item: any) {
		if (!polygon) return true;
		if (!isValidCoords(item)) return false;
		return turf.booleanPointInPolygon(turf.point(item.geometry.coordinates), polygon as any);
	}

	async function fetchJsonWithTimeout(url: string, headers: HeadersInit) {
		const res = await fetchWithTimeout(url, { headers }, FETCH_TIMEOUT_MS);
		if (!res.ok) {
			const text = await res.text();
			throw new Error(`Panoramax API ${res.status} ${res.statusText}: ${text.slice(0, 200)}`);
		}
		return await res.json();
	}

	function isGenerationTimedOut() {
		return Date.now() - generationStartedAt > MAX_GENERATION_MS;
	}

	async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), timeoutMs);
		try {
			return await fetch(url, { ...options, signal: controller.signal });
		} finally {
			clearTimeout(timeout);
		}
	}

	async function fetchRandomImageFromBBox(
		box: [number, number, number, number],
		retries = 3
	): Promise<{ id: string; sequenceId: string; location: number[]; viewerBaseUrl: string } | null> {
		if (isGenerationTimedOut()) return null;

		const params = new URLSearchParams({
			bbox: box.join(','),
			limit: String(SEARCH_LIMIT)
		});

		for (let attempt = 0; attempt <= retries; attempt++) {
			if (isGenerationTimedOut()) return null;

			for (const source of shuffledSources()) {
				if (isGenerationTimedOut()) return null;

				try {
					const url = `${source.apiBaseUrl}/search?${params.toString()}`;
					const headers: HeadersInit = {
						Accept: 'application/geo+json'
					};
					if (PANORAMAX_API_TOKEN) {
						headers.Authorization = `Bearer ${PANORAMAX_API_TOKEN}`;
					}

					const json = await fetchJsonWithTimeout(url, headers);
					let searchHits: any[] = Array.isArray(json?.features) ? json.features : [];

					searchHits = searchHits.filter((item) => {
						return isValidCoords(item) && isInsidePolygon(item) && !usedIds.has(String(item.id));
					});

					if (!searchHits.length) {
						continue;
					}

					shuffleInPlace(searchHits);

					const picked = searchHits[0];
					const [lon, lat] = picked.geometry.coordinates;
					const sequenceId =
						typeof picked?.collection === 'string' && picked.collection.length > 0
							? String(picked.collection)
							: String(picked.id);
					usedIds.add(String(picked.id));
					return {
						id: String(picked.id),
						sequenceId,
						location: [lon, lat],
						viewerBaseUrl: source.viewerBaseUrl
					};
				} catch (err) {
					const isNetworkError =
						err instanceof Error &&
						(err.message.includes('fetch failed') || err.message.includes('ECONNRESET'));

					console.error('[fetchRandomImageFromBBox] exception', {
						attempt: attempt + 1,
						maxRetries: retries + 1,
						isNetworkError,
						apiBaseUrl: source.apiBaseUrl,
						box,
						error:
							err instanceof Error
								? {
										name: err.name,
										message: err.message,
										cause: (err as any).cause
								  }
								: err
					});

					if (attempt < retries && isNetworkError) {
						await sleep(500 * (attempt + 1));
						continue;
					}
				}
			}
		}
		return null;
	}

	async function fetchRawHitsFromBBox(
		box: [number, number, number, number],
		limit: number,
		retries = 1
	): Promise<Array<{ item: any; viewerBaseUrl: string }>> {
		if (isGenerationTimedOut()) return [];

		const params = new URLSearchParams({
			bbox: box.join(','),
			limit: String(Math.max(1, limit))
		});

		for (let attempt = 0; attempt <= retries; attempt++) {
			if (isGenerationTimedOut()) return [];

			for (const source of shuffledSources()) {
				if (isGenerationTimedOut()) return [];
				try {
					const url = `${source.apiBaseUrl}/search?${params.toString()}`;
					const headers: HeadersInit = {
						Accept: 'application/geo+json'
					};
					if (PANORAMAX_API_TOKEN) {
						headers.Authorization = `Bearer ${PANORAMAX_API_TOKEN}`;
					}

					const json = await fetchJsonWithTimeout(url, headers);
					const features: any[] = Array.isArray(json?.features) ? json.features : [];
					if (!features.length) continue;

					return features
						.filter((item) => isValidCoords(item) && isInsidePolygon(item))
						.map((item) => ({ item, viewerBaseUrl: source.viewerBaseUrl }));
				} catch {
					continue;
				}
			}
		}

		return [];
	}

	async function discoverCoverageBBoxes(
		area: [number, number, number, number],
		targetCount: number
	): Promise<Array<[number, number, number, number]>> {
		const [aMinLon, aMinLat, aMaxLon, aMaxLat] = area;
		const spanLon = Math.max(0.01, aMaxLon - aMinLon);
		const spanLat = Math.max(0.01, aMaxLat - aMinLat);

		const lonStep = Math.max(0.5, Math.min(30, spanLon / 6));
		const latStep = Math.max(0.5, Math.min(20, spanLat / 6));

		const cells: Array<[number, number, number, number]> = [];
		for (let lon = aMinLon; lon < aMaxLon; lon += lonStep) {
			for (let lat = aMinLat; lat < aMaxLat; lat += latStep) {
				cells.push([
					Math.max(-180, lon),
					Math.max(-85, lat),
					Math.min(180, lon + lonStep),
					Math.min(85, lat + latStep)
				]);
			}
		}

		shuffleInPlace(cells);

		const maxProbes = Math.min(cells.length, Math.max(targetCount * 8, 24));
		const discovered: Array<[number, number, number, number]> = [];

		for (let i = 0; i < maxProbes; i++) {
			if (isGenerationTimedOut()) break;
			const cell = cells[i];
			const rawHits = await fetchRawHitsFromBBox(cell, 1, 0);
			if (rawHits.length > 0) {
				discovered.push(cell);
				if (discovered.length >= Math.max(targetCount * 2, 8)) {
					break;
				}
			}
		}

		console.log('[generateRandomPoints] coverage discovery', {
			area,
			probes: maxProbes,
			discovered: discovered.length
		});

		return discovered;
	}

	async function fetchRandomImageFromGlobalSearch(
		bbox: [number, number, number, number],
		retries = 2
	): Promise<{ id: string; sequenceId: string; location: number[]; viewerBaseUrl: string } | null> {
		if (isGenerationTimedOut()) return null;

		const params = new URLSearchParams({
			bbox: bbox.join(','),
			limit: String(Math.max(SEARCH_LIMIT, 60))
		});

		for (let attempt = 0; attempt <= retries; attempt++) {
			if (isGenerationTimedOut()) return null;

			for (const source of shuffledSources()) {
				if (isGenerationTimedOut()) return null;

				try {
					const url = `${source.apiBaseUrl}/search?${params.toString()}`;
					const headers: HeadersInit = {
						Accept: 'application/geo+json'
					};
					if (PANORAMAX_API_TOKEN) {
						headers.Authorization = `Bearer ${PANORAMAX_API_TOKEN}`;
					}

					const json = await fetchJsonWithTimeout(url, headers);
					let searchHits: any[] = Array.isArray(json?.features) ? json.features : [];

					searchHits = searchHits.filter((item) => {
						return isValidCoords(item) && isInsidePolygon(item) && !usedIds.has(String(item.id));
					});

					if (!searchHits.length) continue;

					shuffleInPlace(searchHits);
					const picked = searchHits[0];
					const [lon, lat] = picked.geometry.coordinates;
					const sequenceId =
						typeof picked?.collection === 'string' && picked.collection.length > 0
							? String(picked.collection)
							: String(picked.id);
					usedIds.add(String(picked.id));

					return {
						id: String(picked.id),
						sequenceId,
						location: [lon, lat],
						viewerBaseUrl: source.viewerBaseUrl
					};
				} catch (err) {
					console.error('[fetchRandomImageFromGlobalSearch] exception', {
						attempt: attempt + 1,
						maxRetries: retries + 1,
						apiBaseUrl: source.apiBaseUrl,
						error:
							err instanceof Error
								? {
										name: err.name,
										message: err.message,
										cause: (err as any).cause
								  }
								: err
					});
				}
			}
		}

		return null;
	}

	async function sleep(ms: number) {
		return new Promise((r) => setTimeout(r, ms));
	}

	/* ---------------- GLOBAL MODE ---------------- */
	if (!polygon) {
		const DELAY_MS = 200;
		const maxAttempts = count * 180;
		let attempts = 0;
		const halfSizes = [0.03, 0.06, 0.1, 0.18, 0.3, 0.5, 0.8];
		const globalCoverage = await discoverCoverageBBoxes([-180, -85, 180, 85], count);

		if (globalCoverage.length > 0) {
			const coverageAttemptsMax = Math.max(count * 8, 16);
			let coverageAttempts = 0;
			while (
				results.length < count &&
				coverageAttempts < coverageAttemptsMax &&
				!isGenerationTimedOut()
			) {
				coverageAttempts++;
				const seed = globalCoverage[Math.floor(Math.random() * globalCoverage.length)];
				const hit = await fetchRandomImageFromBBox(seed, 1);
				if (!hit) continue;
				results.push(hit);
				if (onProgress) await onProgress(results.length, count);
				console.log('[generateRandomPoints][global] coverage hit', {
					collected: results.length,
					target: count,
					coverageAttempts
				});
				await sleep(DELAY_MS);
			}
		}

		while (results.length < count && attempts < maxAttempts) {
			if (isGenerationTimedOut()) break;

			attempts++;
			const [lon, lat] = randomPointInBBox();

			for (const half of halfSizes) {
				const box: [number, number, number, number] = [
					Math.max(-180, lon - half),
					Math.max(-85, lat - half),
					Math.min(180, lon + half),
					Math.min(85, lat + half)
				];

				const hit = await fetchRandomImageFromBBox(box);
				if (hit) {
					results.push(hit);
					if (onProgress) await onProgress(results.length, count);
					console.log('[generateRandomPoints][global] hit', {
						collected: results.length,
						target: count,
						attempts,
						half
					});
					await sleep(DELAY_MS);
					break;
				}
			}

			if (attempts % 50 === 0 && results.length < count) {
				console.log('[generateRandomPoints][global] progress', {
					attempts,
					collected: results.length
				});
			}
		}

		console.log('[generateRandomPoints][global] finished', {
			requested: count,
			got: results.length,
			attempts
		});

		if (results.length < count && !isGenerationTimedOut()) {
			console.log('[generateRandomPoints][global] fallback_search start', {
				requested: count,
				current: results.length
			});

			let fallbackAttempts = 0;
			const fallbackMaxAttempts = Math.max(count * 3, 6);
			while (
				results.length < count &&
				fallbackAttempts < fallbackMaxAttempts &&
				!isGenerationTimedOut()
			) {
				fallbackAttempts++;
				const hit = await fetchRandomImageFromGlobalSearch([-180, -85, 180, 85]);
				if (!hit) break;
				results.push(hit);
				if (onProgress) await onProgress(results.length, count);
			}

			console.log('[generateRandomPoints][global] fallback_search end', {
				requested: count,
				got: results.length,
				fallbackAttempts
			});
		}
	} else {
		/* ---------------- POLYGON MODE ---------------- */
		const polygonCoverage = await discoverCoverageBBoxes([minLon, minLat, maxLon, maxLat], count);
		if (polygonCoverage.length > 0) {
			const coverageAttemptsMax = Math.max(count * 8, 12);
			let coverageAttempts = 0;
			while (
				results.length < count &&
				coverageAttempts < coverageAttemptsMax &&
				!isGenerationTimedOut()
			) {
				coverageAttempts++;
				const box = polygonCoverage[Math.floor(Math.random() * polygonCoverage.length)];
				const hit = await fetchRandomImageFromBBox(box, 1);
				if (!hit) continue;
				results.push(hit);
				if (onProgress) await onProgress(results.length, count);
				console.log('[generateRandomPoints][poly] coverage hit', {
					collected: results.length,
					target: count,
					coverageAttempts
				});
			}
		}

		const baseCandidateMultiplier = 6;
		const maxPasses = 5;
		const delayHit = 150;
		const delayMiss = 20;

		const halfSizeTiers: number[][] = [
			[0.006, 0.012, 0.02, 0.03],
			[0.04, 0.06, 0.08, 0.1],
			[0.12, 0.16, 0.22, 0.3]
		];

		let pass = 0;
		while (results.length < count && pass < maxPasses) {
			if (isGenerationTimedOut()) break;

			const remaining = count - results.length;
			const candidateTarget = Math.min(
				2000,
				Math.max(remaining * baseCandidateMultiplier, remaining * 2)
			);
			const candidates: [number, number][] = [];

			let safetyCounter = 0;
			while (candidates.length < candidateTarget && safetyCounter < candidateTarget * 10) {
				safetyCounter++;
				const p = randomPointInBBox();
				if (!turf.booleanPointInPolygon(turf.point(p), polygon as any)) continue;
				candidates.push(p);
			}

			const centers: [number, number][] = [];
			if (candidates.length) {
				centers.push(candidates.splice(Math.floor(Math.random() * candidates.length), 1)[0]);
			}

			while (centers.length < remaining && candidates.length) {
				let bestIdx = -1;
				let bestDist = -1;
				for (let i = 0; i < candidates.length; i++) {
					const [lon, lat] = candidates[i];
					let minD = Infinity;
					for (const [clon, clat] of centers) {
						const d = calculateDistance(lat, lon, clat, clon);
						if (d < minD) minD = d;
					}
					if (minD > bestDist) {
						bestDist = minD;
						bestIdx = i;
					}
				}
				if (bestIdx === -1) break;
				centers.push(candidates.splice(bestIdx, 1)[0]);
			}

			console.log('[generateRandomPoints][poly][pass] start', {
				pass,
				remaining,
				centers: centers.length,
				candidatesGenerated: candidates.length + centers.length
			});

			const tierIdx = Math.min(pass, halfSizeTiers.length - 1);
			const flattened = halfSizeTiers[tierIdx];

			const batchSize = 3;
			for (let i = 0; i < centers.length; i += batchSize) {
				if (isGenerationTimedOut()) break;

				if (results.length >= count) break;

				const batch = centers.slice(i, Math.min(i + batchSize, centers.length));
				const batchPromises = batch.map(async ([lon, lat]) => {
					for (const half of flattened) {
						const box: [number, number, number, number] = [
							Math.max(minLon, lon - half),
							Math.max(minLat, lat - half),
							Math.min(maxLon, lon + half),
							Math.min(maxLat, lat + half)
						];

						const hit = await fetchRandomImageFromBBox(box);
						if (hit) {
							await sleep(delayHit);
							return hit;
						} else {
							await sleep(delayMiss);
						}
					}
					return null;
				});

				const batchResults = await Promise.all(batchPromises);
				for (const hit of batchResults) {
					if (hit && results.length < count) {
						results.push(hit);
						if (onProgress) await onProgress(results.length, count);
						console.log('[generateRandomPoints][poly] hit', {
							pass,
							collected: results.length,
							target: count
						});
					}
				}
			}

			console.log('[generateRandomPoints][poly][pass] end', {
				pass,
				collected: results.length,
				target: count
			});

			pass++;
		}

		if (results.length < count) {
			console.warn('[generateRandomPoints][poly] insufficient coverage', {
				requested: count,
				got: results.length,
				passes: pass,
				timedOut: isGenerationTimedOut()
			});
		}
	}

	console.log('[generateRandomPoints] final', {
		requested: count,
		returned: results.length,
		uniqueIds: usedIds.size
	});
	return results;
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
	lat1 = Number(lat1);
	lon1 = Number(lon1);
	lat2 = Number(lat2);
	lon2 = Number(lon2);

	const R = 6371000;
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

function toRad(degrees: number): number {
	return degrees * (Math.PI / 180);
}
