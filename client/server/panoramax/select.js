/** Written by Claude Code (Opus 4.8)
 * Pure selection helpers — no network, no env — fully unit-testable.
 *
 * These replace blind rejection-sampling: instead of throwing random points at
 * the world and hoping a bbox query hits coverage, we pick from sequences known
 * to have imagery, weighted by their picture count (so per-picture sampling is
 * roughly uniform).
 *
 * @typedef {import('./types.js').CollectionRef} CollectionRef
 * @typedef {import('./types.js').PanoItem} PanoItem
 * @typedef {[number, number, number, number]} Bbox
 * @typedef {() => number} Rng
 */
import * as turf from '@turf/turf';
import { hasPanoramaxNavigationLinks, isStrict360Panorama } from './filter.js';

/** Axis-aligned bbox overlap test. @param {Bbox} a @param {Bbox} b @returns {boolean} */
export function bboxIntersects(a, b) {
	return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
}

/** @param {[number, number]} point @param {Bbox} bbox @returns {boolean} */
export function pointInBbox(point, bbox) {
	return point[0] >= bbox[0] && point[0] <= bbox[2] && point[1] >= bbox[1] && point[1] <= bbox[3];
}

/**
 * Weighted random pick. Elements with weight <= 0 are never chosen.
 * @template T
 * @param {T[]} items @param {(item: T) => number} weightFn @param {Rng} [rng]
 * @returns {T | null}
 */
export function weightedPick(items, weightFn, rng = Math.random) {
	let total = 0;
	for (const item of items) total += Math.max(0, weightFn(item));
	if (total <= 0) return null;
	let r = rng() * total;
	for (const item of items) {
		r -= Math.max(0, weightFn(item));
		if (r < 0) return item;
	}
	return items[items.length - 1] ?? null;
}

/** Uniform random element, or null when empty. @template T @param {T[]} items @param {Rng} [rng] @returns {T | null} */
export function pickRandom(items, rng = Math.random) {
	if (!items.length) return null;
	return items[Math.floor(rng() * items.length)] ?? null;
}

/** @param {CollectionRef[]} collections @param {Bbox} areaBbox @returns {CollectionRef[]} */
export function collectionsInBbox(collections, areaBbox) {
	return collections.filter((c) => bboxIntersects(c.bbox, areaBbox));
}

/** Extracts [lon, lat] from a STAC item, or null. @param {PanoItem} item @returns {[number, number] | null} */
export function itemPoint(item) {
	const coords = item?.geometry?.coordinates;
	if (
		!Array.isArray(coords) ||
		coords.length !== 2 ||
		typeof coords[0] !== 'number' ||
		typeof coords[1] !== 'number'
	) {
		return null;
	}
	return [coords[0], coords[1]];
}

/**
 * @param {PanoItem} item
 * @param {import('geojson').Feature<import('geojson').Polygon | import('geojson').MultiPolygon> | null} polygon
 * @returns {boolean}
 */
export function isInsidePolygon(item, polygon) {
	if (!polygon) return true;
	const point = itemPoint(item);
	if (!point) return false;
	return turf.booleanPointInPolygon(turf.point(point), /** @type {any} */ (polygon));
}

/**
 * Filters a sequence's items down to those usable as a round anchor: valid
 * point, inside the polygon, not already used, and — when `only360` is set — an
 * actual 360° panorama with navigation links.
 *
 * @param {PanoItem[]} items
 * @param {{ polygon?: import('geojson').Feature | null, usedIds?: Set<string>, only360?: boolean }} [opts]
 * @returns {PanoItem[]}
 */
export function usableItems(items, opts = {}) {
	const { polygon = null, usedIds, only360 = false } = opts;
	return items.filter((item) => {
		if (!itemPoint(item)) return false;
		if (usedIds?.has(item.id)) return false;
		if (!isInsidePolygon(item, /** @type {any} */ (polygon))) return false;
		if (only360 && !(isStrict360Panorama(item) && hasPanoramaxNavigationLinks(item))) return false;
		return true;
	});
}
