export function createRateLimiter() {
	/** @type {Map<string, number[]>} */
	const hits = new Map();

	return {
		/**
		 * Records an attempt for `key` and reports whether it is within the limit.
		 * @param {string} key
		 * @param {number} max
		 * @param {number} windowMs
		 * @returns {boolean}
		 */
		allow(key, max, windowMs) {
			const now = Date.now();
			const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
			if (recent.length >= max) {
				hits.set(key, recent);
				return false;
			}
			recent.push(now);
			hits.set(key, recent);
			return true;
		}
	};
}
