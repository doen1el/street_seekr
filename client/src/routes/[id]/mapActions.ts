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

//TODO: This function is some AI slop, but it works for now.
/**
 * Generate up to `count` random Mapillary panorama image positions.
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
 * - Sends at most one Mapillary Images API request per attempted bbox.
 * - Tries to reach `count` results but may return fewer if coverage is sparse.
 *
 * @param polygon Optional Polygon / MultiPolygon (geojson feature) restricting search area.
 * @param count   Desired number of random panorama images.
 * @returns       Array of objects: { id, location: [lon, lat] }.
 */
export async function generateRandomPointsForChallenge(
	polygon: Feature<Polygon | MultiPolygon> | null,
	count: number,
	onProgress?: (found: number, target: number) => Promise<void> | void
): Promise<Array<{ id: string; location: number[] }>> {
	console.log('[generateRandomPoints] start', { count, hasPolygon: !!polygon });

	const BASE_URL = 'https://graph.mapillary.com/images';
	const MAPILLARY_ACCESS_TOKEN = env.MAPILLARY_ACCESS_TOKEN;

	if (!MAPILLARY_ACCESS_TOKEN) {
		console.warn('No Mapillary access token configured, cannot fetch images.');
		return [];
	}

	const [minLon, minLat, maxLon, maxLat] = polygon ? turf.bbox(polygon) : [-180, -90, 180, 90];

	const results: Array<{ id: string; location: number[] }> = [];

	function randomPointInBBox(): [number, number] {
		return [Math.random() * (maxLon - minLon) + minLon, Math.random() * (maxLat - minLat) + minLat];
	}

	async function fetchRandomImageFromBBox(
		box: [number, number, number, number]
	): Promise<{ id: string; location: number[] } | null> {
		const params = new URLSearchParams({
			access_token: MAPILLARY_ACCESS_TOKEN,
			bbox: box.join(','),
			fields: 'id,geometry,is_pano',
			limit: '20',
			is_pano: 'true'
		});
		try {
			const res = await fetch(`${BASE_URL}?${params.toString()}`);
			if (!res.ok) return null;
			let imgs: any[] = (await res.json())?.data || [];
			if (polygon) {
				imgs = imgs.filter((it) =>
					turf.booleanPointInPolygon(turf.point(it.geometry.coordinates), polygon as any)
				);
			}
			if (!imgs.length) return null;
			const picked = imgs[Math.floor(Math.random() * imgs.length)];
			const [lon, lat] = picked.geometry.coordinates;
			return { id: picked.id, location: [lon, lat] };
		} catch {
			return null;
		}
	}

	async function sleep(ms: number) {
		return new Promise((r) => setTimeout(r, ms));
	}

	/* ---------------- GLOBAL MODE (unverändert) ---------------- */
	if (!polygon) {
		const DELAY_MS = 250;
		const maxAttempts = count * 80;
		let attempts = 0;
		while (results.length < count && attempts < maxAttempts) {
			attempts++;
			const [lon, lat] = randomPointInBBox();
			if (lat > 75 || lat < -60) continue;
			const halfSizes = [0.25, 0.6, 1.2, 2.0];
			for (const half of halfSizes) {
				const box: [number, number, number, number] = [
					Math.max(minLon, lon - half),
					Math.max(minLat, lat - half),
					Math.min(maxLon, lon + half),
					Math.min(maxLat, lat + half)
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
			if (attempts % 60 === 0 && results.length < count) {
				console.log('[generateRandomPoints][global] progress', {
					attempts,
					collected: results.length
				});
			}
		}
		console.log('[generateRandomPoints][global] finished', {
			requested: count,
			got: results.length
		});
	} else {
		/* ---------------- POLYGON MODE MIT RETRIES ---------------- */
		const baseCandidateMultiplier = 6;
		const maxPasses = 5; // Sicherheit
		const delayHit = 250;
		const delayMiss = 40;

		// gestaffelte HalfSize-Tiers (werden je Pass erweitert)
		const halfSizeTiers: number[][] = [
			[0.1, 0.18, 0.25, 0.35, 0.5],
			[0.6, 0.8, 1.0],
			[1.3, 1.6, 2.0],
			[2.5, 3.5],
			[5, 6.5, 8]
		];

		let pass = 0;
		while (results.length < count && pass < maxPasses) {
			const remaining = count - results.length;
			const candidateTarget = Math.min(
				5000,
				Math.max(remaining * baseCandidateMultiplier, remaining)
			);
			// Kandidaten sammeln
			const candidates: [number, number][] = [];
			while (candidates.length < candidateTarget) {
				const p = randomPointInBBox();
				if (!turf.booleanPointInPolygon(turf.point(p), polygon as any)) continue;
				candidates.push(p);
			}

			// Farthest-point Auswahl für diesen Pass
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
				centers: centers.length
			});

			// Tiers bis pass einschließen (mehr Reichweite je Pass)
			const activeHalfSizes = halfSizeTiers.slice(0, Math.min(pass + 1, halfSizeTiers.length));
			const flattened = activeHalfSizes.flat();

			for (const [lon, lat] of centers) {
				if (results.length >= count) break;
				let found = false;
				for (const half of flattened) {
					const box: [number, number, number, number] = [
						Math.max(minLon, lon - half),
						[Math.max(minLat, lat - half)][0],
						Math.min(maxLon, lon + half),
						Math.min(maxLat, lat + half)
					];
					const hit = await fetchRandomImageFromBBox(box);
					if (hit) {
						results.push(hit);
						if (onProgress) await onProgress(results.length, count);
						console.log('[generateRandomPoints][poly] hit', {
							pass,
							collected: results.length,
							target: count,
							half
						});
						found = true;
						await sleep(delayHit);
						break;
					} else {
						await sleep(delayMiss);
					}
				}
				if (!found) {
					console.log('[generateRandomPoints][poly] center failed', { pass, center: [lon, lat] });
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
			console.warn('[generateRandomPoints][poly] insufficient coverage after retries', {
				requested: count,
				got: results.length,
				passes: pass
			});
		}
	}

	console.log('[generateRandomPoints] final', {
		requested: count,
		returned: results.length,
		locations: results.map((r) => r.location)
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
