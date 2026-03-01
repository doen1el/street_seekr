import { describe, expect, it } from 'vitest';
import { hasPanoramaxNavigationLinks, isStrict360Panorama } from './panoramaxFilter';

describe('hasPanoramaxNavigationLinks', () => {
	it('returns true when next/prev links exist', () => {
		const item = {
			links: [
				{ rel: 'self' },
				{ rel: 'next' }
			]
		};
		expect(hasPanoramaxNavigationLinks(item)).toBe(true);
	});

	it('returns false when navigation links are absent', () => {
		const item = { links: [{ rel: 'self' }] };
		expect(hasPanoramaxNavigationLinks(item)).toBe(false);
	});

	it('returns false when links are malformed', () => {
		const item = { links: 'invalid' as any };
		expect(hasPanoramaxNavigationLinks(item)).toBe(false);
	});

	it('returns true when prev exists without next', () => {
		const item = {
			links: [{ rel: 'prev' }]
		};
		expect(hasPanoramaxNavigationLinks(item)).toBe(true);
	});
});

describe('isStrict360Panorama', () => {
	it('accepts explicit equirectangular projection metadata', () => {
		const item = {
			properties: {
				'geovisio:projection_type': 'equirectangular'
			}
		};
		expect(isStrict360Panorama(item)).toBe(true);
	});

	it('accepts near 2:1 interior orientation dimensions', () => {
		const item = {
			properties: {
				'pers:interior_orientation': {
					sensor_array_dimensions: [4000, 2000]
				}
			}
		};
		expect(isStrict360Panorama(item)).toBe(true);
	});

	it('accepts 360 marker in asset URL', () => {
		const item = {
			assets: {
				hd: { href: 'https://example.org/pictures/scene-360.jpg' }
			}
		};
		expect(isStrict360Panorama(item)).toBe(true);
	});

	it('rejects normal flat image metadata', () => {
		const item = {
			properties: {
				'geovisio:projection_type': 'perspective',
				'pers:interior_orientation': {
					sensor_array_dimensions: [4032, 3024]
				}
			},
			assets: {
				hd: { href: 'https://example.org/pictures/plain.jpg' }
			}
		};
		expect(isStrict360Panorama(item)).toBe(false);
	});

	it('accepts 2:1 edge ratio boundaries', () => {
		const lower = {
			properties: {
				'pers:interior_orientation': {
					sensor_array_dimensions: [1900, 1000]
				}
			}
		};
		const upper = {
			properties: {
				'pers:interior_orientation': {
					sensor_array_dimensions: [2100, 1000]
				}
			}
		};

		expect(isStrict360Panorama(lower)).toBe(true);
		expect(isStrict360Panorama(upper)).toBe(true);
	});

	it('rejects outside of 2:1 ratio when no other hints exist', () => {
		const item = {
			properties: {
				'pers:interior_orientation': {
					sensor_array_dimensions: [1800, 1000]
				}
			}
		};
		expect(isStrict360Panorama(item)).toBe(false);
	});
});
