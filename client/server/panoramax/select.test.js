// Written by Claude Code (Opus 4.8)
import { describe, expect, it } from 'vitest';
import {
	bboxIntersects,
	collectionsInBbox,
	isInsidePolygon,
	itemPoint,
	pickRandom,
	pointInBbox,
	usableItems,
	weightedPick
} from './select.js';

const SOURCE = { apiBaseUrl: 'https://example.org/api', viewerBaseUrl: 'https://example.org' };

/** @param {string} id @param {[number,number,number,number]} bbox @param {number} itemCount */
const coll = (id, bbox, itemCount) => ({ id, bbox, itemCount, source: SOURCE });
/** @param {string} id @param {number} lon @param {number} lat */
const item = (id, lon, lat) => ({ id, geometry: { type: 'Point', coordinates: [lon, lat] } });

const UNIT_SQUARE = {
	type: 'Feature',
	properties: {},
	geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] }
};

describe('bboxIntersects', () => {
	it('detects overlap and disjointness', () => {
		expect(bboxIntersects([0, 0, 1, 1], [0.5, 0.5, 2, 2])).toBe(true);
		expect(bboxIntersects([0, 0, 1, 1], [2, 2, 3, 3])).toBe(false);
		expect(bboxIntersects([0, 0, 1, 1], [1, 1, 2, 2])).toBe(true);
	});
});

describe('pointInBbox', () => {
	it('includes the interior and boundary', () => {
		expect(pointInBbox([0.5, 0.5], [0, 0, 1, 1])).toBe(true);
		expect(pointInBbox([1, 1], [0, 0, 1, 1])).toBe(true);
		expect(pointInBbox([1.1, 0.5], [0, 0, 1, 1])).toBe(false);
	});
});

describe('weightedPick', () => {
	it('selects by cumulative weight', () => {
		const items = [coll('a', [0, 0, 1, 1], 1), coll('b', [0, 0, 1, 1], 3)];
		const weight = (c) => c.itemCount;
		expect(weightedPick(items, weight, () => 0)?.id).toBe('a');
		expect(weightedPick(items, weight, () => 0.2)?.id).toBe('a');
		expect(weightedPick(items, weight, () => 0.5)?.id).toBe('b');
		expect(weightedPick(items, weight, () => 0.999)?.id).toBe('b');
	});
	it('skips zero-weight elements and handles empty pools', () => {
		const items = [coll('a', [0, 0, 1, 1], 0), coll('b', [0, 0, 1, 1], 5)];
		expect(weightedPick(items, (c) => c.itemCount, () => 0)?.id).toBe('b');
		expect(weightedPick([], () => 1)).toBeNull();
		expect(weightedPick(items, () => 0)).toBeNull();
	});
});

describe('pickRandom', () => {
	it('returns an element or null for empty', () => {
		expect(pickRandom([1, 2, 3], () => 0)).toBe(1);
		expect(pickRandom([1, 2, 3], () => 0.99)).toBe(3);
		expect(pickRandom([], () => 0)).toBeNull();
	});
});

describe('collectionsInBbox', () => {
	it('keeps only overlapping collections', () => {
		const cs = [coll('in', [0.1, 0.1, 0.2, 0.2], 1), coll('out', [9, 9, 10, 10], 1)];
		expect(collectionsInBbox(cs, [0, 0, 1, 1]).map((c) => c.id)).toEqual(['in']);
	});
});

describe('itemPoint', () => {
	it('extracts valid coordinates and rejects malformed ones', () => {
		expect(itemPoint(item('a', 2, 3))).toEqual([2, 3]);
		expect(itemPoint({ id: 'b', geometry: null })).toBeNull();
		expect(itemPoint({ id: 'c', geometry: { type: 'Point', coordinates: [1] } })).toBeNull();
	});
});

describe('isInsidePolygon', () => {
	it('respects polygon membership and treats no polygon as global', () => {
		expect(isInsidePolygon(item('a', 0.5, 0.5), UNIT_SQUARE)).toBe(true);
		expect(isInsidePolygon(item('b', 5, 5), UNIT_SQUARE)).toBe(false);
		expect(isInsidePolygon(item('c', 5, 5), null)).toBe(true);
	});
});

describe('usableItems', () => {
	it('filters by polygon and dedupes already-used ids', () => {
		const used = new Set(['dup']);
		const items = [item('inside', 0.5, 0.5), item('outside', 9, 9), item('dup', 0.5, 0.5)];
		expect(usableItems(items, { polygon: UNIT_SQUARE, usedIds: used }).map((i) => i.id)).toEqual(['inside']);
	});
	it('enforces 360 + navigation when only360 is set', () => {
		const flat = item('flat', 0.5, 0.5);
		const pano = {
			id: 'pano',
			geometry: { type: 'Point', coordinates: [0.5, 0.5] },
			properties: { 'geovisio:projection_type': 'equirectangular' },
			links: [{ rel: 'next' }]
		};
		expect(usableItems([flat, pano], { only360: true }).map((i) => i.id)).toEqual(['pano']);
		expect(usableItems([flat, pano], {}).length).toBe(2);
	});
});
