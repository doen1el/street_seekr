export const AVATAR_STYLES = [
	'miniavs',
	'adventurer',
	'open-peeps',
	'notionists',
	'bottts',
	'fun-emoji',
	'croodles',
	'thumbs',
	'micah',
	'lorelei',
	'pixel-art'
];

export const DEFAULT_AVATAR = AVATAR_STYLES[0];

/** @param {unknown} value @returns {boolean} */
export function isAvatarStyle(value) {
	return typeof value === 'string' && AVATAR_STYLES.includes(value);
}
