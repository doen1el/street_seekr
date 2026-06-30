// DiceBear avatar styles offered to players.
export const AVATAR_STYLES = [
	'fun-emoji',
	'adventurer',
	'bottts',
	'croodles',
	'thumbs',
	'micah',
	'notionists',
	'lorelei',
	'open-peeps',
	'pixel-art'
];

export const DEFAULT_AVATAR = AVATAR_STYLES[0];

/** @param {unknown} value @returns {boolean} */
export function isAvatarStyle(value) {
	return typeof value === 'string' && AVATAR_STYLES.includes(value);
}
