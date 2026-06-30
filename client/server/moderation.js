import { Filter } from 'bad-words';

const filter = new Filter();

/**
 * Replaces detected profanity with asterisks. Reuses the project's existing
 * `bad-words` dependency; never throws (returns the input on failure).
 * @param {unknown} input
 * @returns {string}
 */
export function cleanText(input) {
	if (typeof input !== 'string' || input.length === 0) return '';
	try {
		return filter.clean(input);
	} catch {
		return input;
	}
}

/**
 * @param {unknown} input
 * @returns {boolean} whether the text contains detectable profanity.
 */
export function isProfane(input) {
	if (typeof input !== 'string' || input.length === 0) return false;
	try {
		return filter.isProfane(input);
	} catch {
		return false;
	}
}
