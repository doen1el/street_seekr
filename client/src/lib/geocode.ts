import * as turf from '@turf/turf';
import type { Feature, MultiPolygon, Position } from 'geojson';

const NOMINATIM = (loc: string) =>
	`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(loc)}&polygon_geojson=1&limit=1&format=json`;

const MAX_POLYGON_BYTES = 1_000_000;

function fitToLimit(feature: Feature<MultiPolygon>): Feature<MultiPolygon> {
	if (JSON.stringify(feature).length <= MAX_POLYGON_BYTES) return feature;
	for (const tolerance of [0.005, 0.01, 0.02, 0.05, 0.1, 0.2]) {
		try {
			const simplified = turf.simplify(feature, { tolerance, highQuality: false, mutate: false });
			if (JSON.stringify(simplified).length <= MAX_POLYGON_BYTES) return simplified;
		} catch {
		}
	}
	return feature;
}

export async function resolvePolygon(
	locationStrings: string[]
): Promise<Feature<MultiPolygon> | null> {
	const names = locationStrings.map((s) => s.trim()).filter(Boolean);
	if (!names.length) return null;

	const results = await Promise.all(
		names.map((loc) =>
			fetch(NOMINATIM(loc))
				.then((r) => r.json())
				.catch(() => null)
		)
	);

	const coordinates: Position[][][] = [];
	for (const result of results) {
		const geojson = result?.[0]?.geojson;
		if (!geojson) continue;
		if (geojson.type === 'Polygon') coordinates.push(geojson.coordinates);
		else if (geojson.type === 'MultiPolygon') coordinates.push(...geojson.coordinates);
	}

	return coordinates.length ? fitToLimit(turf.multiPolygon(coordinates)) : null;
}
