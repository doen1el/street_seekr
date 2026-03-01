export function hasPanoramaxNavigationLinks(item: any): boolean {
	const links = Array.isArray(item?.links) ? item.links : [];
	return links.some((link: any) => link?.rel === 'next' || link?.rel === 'prev');
}

export function isStrict360Panorama(item: any): boolean {
	const props = item?.properties || {};
	const candidates = [
		props['geovisio:projection_type'],
		props['projection_type'],
		props['img:projection'],
		props['camera:projection'],
		props['panoramax:projection_type'],
		props['pers:projection_type'],
		props['view:projection']
	]
		.filter((value) => typeof value === 'string')
		.map((value) => String(value).toLowerCase());

	if (
		candidates.some(
			(value) =>
				value.includes('equirectangular') ||
				value.includes('spherical') ||
				value.includes('360')
		)
	) {
		return true;
	}

	const dims = props['pers:interior_orientation']?.sensor_array_dimensions;
	if (Array.isArray(dims) && dims.length === 2) {
		const [width, height] = dims;
		if (typeof width === 'number' && typeof height === 'number' && height > 0) {
			const ratio = width / height;
			if (ratio >= 1.9 && ratio <= 2.1) return true;
		}
	}

	const assets = item?.assets || {};
	for (const key of Object.keys(assets)) {
		const href = String(assets[key]?.href || '').toLowerCase();
		if (href.includes('equirect') || href.includes('sphere') || href.includes('360')) return true;
	}

	return false;
}
