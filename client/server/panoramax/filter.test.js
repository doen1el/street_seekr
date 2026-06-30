// Written by Claude Code (Opus 4.8)
import { describe, expect, it } from 'vitest';
import { hasPanoramaxNavigationLinks, isStrict360Panorama } from './filter.js';

describe('hasPanoramaxNavigationLinks', () => {
	it('returns true when next/prev links exist', () => {
		expect(hasPanoramaxNavigationLinks({ links: [{ rel: 'self' }, { rel: 'next' }] })).toBe(true);
	});
	it('returns false when navigation links are absent', () => {
		expect(hasPanoramaxNavigationLinks({ links: [{ rel: 'self' }] })).toBe(false);
	});
	it('returns false when links are malformed', () => {
		expect(hasPanoramaxNavigationLinks({ links: 'invalid' })).toBe(false);
	});
	it('returns true when prev exists without next', () => {
		expect(hasPanoramaxNavigationLinks({ links: [{ rel: 'prev' }] })).toBe(true);
	});
});

describe('isStrict360Panorama', () => {
	it('accepts explicit equirectangular projection metadata', () => {
		expect(isStrict360Panorama({ properties: { 'geovisio:projection_type': 'equirectangular' } })).toBe(true);
	});
	it('accepts near 2:1 interior orientation dimensions', () => {
		expect(
			isStrict360Panorama({ properties: { 'pers:interior_orientation': { sensor_array_dimensions: [4000, 2000] } } })
		).toBe(true);
	});
	it('accepts 360 marker in asset URL', () => {
		expect(isStrict360Panorama({ assets: { hd: { href: 'https://example.org/pictures/scene-360.jpg' } } })).toBe(true);
	});
	it('rejects normal flat image metadata', () => {
		expect(
			isStrict360Panorama({
				properties: {
					'geovisio:projection_type': 'perspective',
					'pers:interior_orientation': { sensor_array_dimensions: [4032, 3024] }
				},
				assets: { hd: { href: 'https://example.org/pictures/plain.jpg' } }
			})
		).toBe(false);
	});
	it('accepts 2:1 edge ratio boundaries', () => {
		expect(isStrict360Panorama({ properties: { 'pers:interior_orientation': { sensor_array_dimensions: [1900, 1000] } } })).toBe(true);
		expect(isStrict360Panorama({ properties: { 'pers:interior_orientation': { sensor_array_dimensions: [2100, 1000] } } })).toBe(true);
	});
	it('rejects outside of 2:1 ratio when no other hints exist', () => {
		expect(isStrict360Panorama({ properties: { 'pers:interior_orientation': { sensor_array_dimensions: [1800, 1000] } } })).toBe(false);
	});
});
