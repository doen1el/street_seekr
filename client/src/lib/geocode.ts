import * as turf from '@turf/turf';
import type { Feature, MultiPolygon, Position } from 'geojson';

const NOMINATIM = (loc: string) =>
	`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(loc)}&polygon_geojson=1&limit=1&format=json`;

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

	return coordinates.length ? turf.multiPolygon(coordinates) : null;
}
