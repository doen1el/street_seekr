// Written by Claude Code (Opus 4.8)
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateRoundsForChallenge } from './generate.js';
import { clearCoverageCache } from './coverage.js';
import { bboxIntersects } from './select.js';

const SOURCE = { apiBaseUrl: 'https://example.org/api', viewerBaseUrl: 'https://example.org' };

/** @param {unknown} body @param {number} [status] */
function jsonRes(body, status = 200) {
	return {
		ok: status < 400,
		status,
		statusText: '',
		json: async () => body,
		text: async () => JSON.stringify(body)
	};
}

/** A minimal in-memory Panoramax STAC API honouring the bbox filter. */
function fakePanoramax(collections) {
	return async (url) => {
		const u = new URL(url);
		const parts = u.pathname.split('/').filter(Boolean); // ['api','collections',...]
		if (parts[1] === 'collections' && parts.length === 2) {
			const bboxParam = u.searchParams.get('bbox');
			const bbox = bboxParam ? bboxParam.split(',').map(Number) : null;
			const matched = collections.filter((c) => !bbox || bboxIntersects(c.bbox, bbox));
			return jsonRes({
				collections: matched.map((c) => ({
					id: c.id,
					extent: { spatial: { bbox: [c.bbox] } },
					'stats:items': { count: c.items.length }
				})),
				links: []
			});
		}
		if (parts[1] === 'collections' && parts[3] === 'items') {
			const id = decodeURIComponent(parts[2]);
			const c = collections.find((x) => x.id === id);
			return jsonRes({
				features: (c?.items ?? []).map((it) => ({
					id: it.id,
					collection: id,
					geometry: { type: 'Point', coordinates: [it.lon, it.lat] },
					properties: it.only360 ? { 'geovisio:projection_type': 'equirectangular' } : {},
					links: it.only360 ? [{ rel: 'next' }] : []
				}))
			});
		}
		return jsonRes({ message: 'not found' }, 404);
	};
}

/**
 * Like `fakePanoramax` but also serves `/search?bbox=` (the federated fast path)
 * and `/collections/{id}` metadata (with `stats:items.count`), so the min-items
 * filter — which reads that count — can be exercised on the search path.
 */
function fakePanoramaxWithSearch(collections) {
	return async (url) => {
		const u = new URL(url);
		const parts = u.pathname.split('/').filter(Boolean);
		if (parts[1] === 'search') {
			const bbox = (u.searchParams.get('bbox') ?? '').split(',').map(Number);
			const features = [];
			for (const c of collections) {
				for (const it of c.items) {
					if (it.lon >= bbox[0] && it.lon <= bbox[2] && it.lat >= bbox[1] && it.lat <= bbox[3]) {
						features.push({
							id: it.id,
							collection: c.id,
							geometry: { type: 'Point', coordinates: [it.lon, it.lat] },
							properties: {}
						});
					}
				}
			}
			return jsonRes({ features });
		}
		// collection metadata (no trailing /items) → item count
		if (parts[1] === 'collections' && parts.length === 3) {
			const c = collections.find((x) => x.id === decodeURIComponent(parts[2]));
			if (!c) return jsonRes({ message: 'not found' }, 404);
			return jsonRes({ id: c.id, 'stats:items': { count: c.items.length } });
		}
		if (parts[1] === 'collections' && parts[3] === 'items') {
			const c = collections.find((x) => x.id === decodeURIComponent(parts[2]));
			return jsonRes({
				features: (c?.items ?? []).map((it) => ({
					id: it.id,
					collection: c.id,
					geometry: { type: 'Point', coordinates: [it.lon, it.lat] },
					properties: {}
				}))
			});
		}
		return jsonRes({ message: 'not found' }, 404);
	};
}

/** @param {number} n @param {string} prefix @param {number} base */
function seqItems(n, prefix, base) {
	return Array.from({ length: n }, (_, i) => ({
		id: `${prefix}-${i}`,
		lon: base + i * 0.001,
		lat: base + i * 0.001
	}));
}

/** Deterministic LCG so selection is reproducible. */
function lcg(seed) {
	let s = seed >>> 0;
	return () => {
		s = (s * 1664525 + 1013904223) >>> 0;
		return s / 2 ** 32;
	};
}

const UNIT_SQUARE = {
	type: 'Feature',
	properties: {},
	geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] }
};

beforeEach(() => clearCoverageCache());

describe('generateRoundsForChallenge — polygon mode', () => {
	const collections = [
		{
			id: 'c1',
			bbox: [0.1, 0.1, 0.4, 0.4],
			items: [
				{ id: 'c1-a', lon: 0.2, lat: 0.2 },
				{ id: 'c1-b', lon: 0.3, lat: 0.3 },
				{ id: 'c1-c', lon: 0.35, lat: 0.35 },
				{ id: 'c1-out', lon: 9, lat: 9 }
			]
		},
		{ id: 'c2', bbox: [0.5, 0.5, 0.9, 0.9], items: [{ id: 'c2-a', lon: 0.6, lat: 0.6 }, { id: 'c2-b', lon: 0.7, lat: 0.7 }] },
		{ id: 'c3-far', bbox: [50, 50, 51, 51], items: [{ id: 'c3-a', lon: 50.5, lat: 50.5 }] }
	];

	it('returns the requested count from sequences inside the polygon', async () => {
		const rounds = await generateRoundsForChallenge(UNIT_SQUARE, 4, {
			sources: [SOURCE],
			fetcher: fakePanoramax(collections),
			rng: lcg(42)
		});
		expect(rounds).toHaveLength(4);
		for (const r of rounds) {
			expect(r.location[0]).toBeGreaterThanOrEqual(0);
			expect(r.location[0]).toBeLessThanOrEqual(1);
			expect(['c1', 'c2']).toContain(r.collectionId);
			expect(r.sequenceId).toBe(r.collectionId);
		}
		const ids = rounds.map((r) => r.id);
		expect(new Set(ids).size).toBe(4);
		expect(ids).not.toContain('c1-out');
		expect(ids).not.toContain('c3-a');
	});

	it('under-delivers gracefully when coverage is insufficient', async () => {
		const rounds = await generateRoundsForChallenge(UNIT_SQUARE, 10, {
			sources: [SOURCE],
			fetcher: fakePanoramax(collections),
			rng: lcg(7)
		});
		expect(rounds).toHaveLength(5);
		expect(new Set(rounds.map((r) => r.id)).size).toBe(5);
	});

	it('reports progress as rounds are found', async () => {
		const onProgress = vi.fn();
		await generateRoundsForChallenge(UNIT_SQUARE, 3, {
			sources: [SOURCE],
			fetcher: fakePanoramax(collections),
			rng: lcg(1),
			onProgress
		});
		expect(onProgress).toHaveBeenCalledTimes(3);
		expect(onProgress).toHaveBeenLastCalledWith(3, 3);
	});

	it('honours only360 by skipping flat pictures', async () => {
		const pano = [
			{
				id: 'p',
				bbox: [0.1, 0.1, 0.9, 0.9],
				items: [
					{ id: 'flat', lon: 0.5, lat: 0.5 },
					{ id: 'sphere', lon: 0.6, lat: 0.6, only360: true }
				]
			}
		];
		const rounds = await generateRoundsForChallenge(UNIT_SQUARE, 5, {
			sources: [SOURCE],
			fetcher: fakePanoramax(pano),
			rng: lcg(3),
			only360: true
		});
		expect(rounds.map((r) => r.id)).toEqual(['sphere']);
	});
});

describe('generateRoundsForChallenge — minSequenceItems', () => {
	// c-long has 12 pictures (a real traversal), c-short has 3 (a stray upload).
	const collections = [
		{ id: 'c-long', bbox: [0.1, 0.1, 0.5, 0.5], items: seqItems(12, 'long', 0.15) },
		{ id: 'c-short', bbox: [0.6, 0.6, 0.9, 0.9], items: seqItems(3, 'short', 0.62) }
	];

	it('search path: only draws from sequences with >= minSequenceItems pictures', async () => {
		const rounds = await generateRoundsForChallenge(UNIT_SQUARE, 5, {
			sources: [SOURCE],
			fetcher: fakePanoramaxWithSearch(collections),
			rng: lcg(42),
			minSequenceItems: 10
		});
		expect(rounds.length).toBeGreaterThan(0);
		expect(rounds.every((r) => r.collectionId === 'c-long')).toBe(true);
		expect(rounds.some((r) => r.id.startsWith('short'))).toBe(false);
	});

	it('search path: without a minimum, the short sequence is eligible', async () => {
		const rounds = await generateRoundsForChallenge(UNIT_SQUARE, 15, {
			sources: [SOURCE],
			fetcher: fakePanoramaxWithSearch(collections),
			rng: lcg(42)
		});
		expect(rounds.some((r) => r.collectionId === 'c-short')).toBe(true);
	});

	it('drain (fallback) path: filters short sequences via itemCount', async () => {
		// fakePanoramax has no /search, so generation falls back to sequence draining.
		const rounds = await generateRoundsForChallenge(UNIT_SQUARE, 8, {
			sources: [SOURCE],
			fetcher: fakePanoramax(collections),
			rng: lcg(7),
			minSequenceItems: 10
		});
		expect(rounds.length).toBeGreaterThan(0);
		expect(rounds.every((r) => r.collectionId === 'c-long')).toBe(true);
	});
});

describe('generateRoundsForChallenge — global mode', () => {
	it('samples from the cached coverage grid', async () => {
		const collections = [
			{
				id: 'paris',
				bbox: [2.3, 48.8, 2.31, 48.81],
				items: [
					{ id: 'paris-a', lon: 2.3, lat: 48.8 },
					{ id: 'paris-b', lon: 2.305, lat: 48.805 }
				]
			}
		];
		const rounds = await generateRoundsForChallenge(null, 2, {
			sources: [SOURCE],
			fetcher: fakePanoramax(collections),
			rng: lcg(99)
		});
		expect(rounds).toHaveLength(2);
		expect(rounds.every((r) => r.collectionId === 'paris')).toBe(true);
		expect(new Set(rounds.map((r) => r.id)).size).toBe(2);
	});

	it('returns nothing when there is no coverage anywhere', async () => {
		const rounds = await generateRoundsForChallenge(null, 3, {
			sources: [SOURCE],
			fetcher: fakePanoramax([]),
			rng: lcg(5)
		});
		expect(rounds).toEqual([]);
	});
});
