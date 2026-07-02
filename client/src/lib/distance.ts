export function haversineKm(a: [number, number], b: [number, number]): number {
	const [lng1, lat1] = a;
	const [lng2, lat2] = b;
	const R = 6371;
	const toRad = (d: number) => (d * Math.PI) / 180;
	const dLat = toRad(lat2 - lat1);
	const dLng = toRad(lng2 - lng1);
	const s =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
	return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function formatKm(km: number): string {
	if (km >= 100) return `${Math.round(km).toLocaleString()} km`;
	return `${km.toFixed(1)} km`;
}
