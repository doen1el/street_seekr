/** Message types the client sends to the server. */
export const ClientMsg = /** @type {const} */ ({
	CREATE: 'create',
	JOIN: 'join',
	LEAVE: 'leave',
	SETTINGS: 'settings',
	READY: 'ready',
	START: 'start',
	GUESS: 'guess',
	NEXT: 'next',
	SAY: 'say',
	KICK: 'kick',
	CHECK_ROOM: 'check_room',
	GET_LEADERBOARD: 'get_leaderboard',
	GET_STATS: 'get_stats'
});

/** Message types the server sends to the client. */
export const ServerMsg = /** @type {const} */ ({
	CREATED: 'created',
	ROOM_STATE: 'room_state',
	GENERATION_PROGRESS: 'generation_progress',
	ROUND_START: 'round_start',
	ROUND_END: 'round_end',
	GAME_OVER: 'game_over',
	GUESS_RESULT: 'guess_result',
	CHAT: 'chat',
	CHAT_HISTORY: 'chat_history',
	ROOM_EXISTS: 'room_exists',
	LEADERBOARD: 'leaderboard',
	STATS: 'stats',
	ERROR: 'error'
});

/**
 * @typedef {Object} Profile
 * @property {string} name
 * @property {string} avatar
 * @property {string} clientId
 */

/**
 * Lobby settings (mirror the old PocketBase `games` fields).
 *
 * @typedef {Object} Settings
 * @property {number} maxRounds
 * @property {number} timeLimit
 * @property {number} graceDistance
 * @property {number} fallOfRate
 * @property {number} maxPoints
 * @property {number} density
 * @property {boolean} private
 * @property {import('geojson').Feature | null} polygon
 * @property {string[]} locationStrings
 */

/**
 * @typedef {Object} PublicPlayer
 * @property {string} id
 * @property {string} name
 * @property {string} avatar
 * @property {boolean} isHost
 * @property {boolean} connected
 * @property {boolean} ready
 * @property {number} totalPoints
 * @property {number} lastRoundPoints
 * @property {boolean} hasGuessed
 */

/**
 * Room state as broadcast to clients.
 *
 * @typedef {Object} PublicRoom
 * @property {string} code
 * @property {boolean} solo
 * @property {'lobby' | 'generating' | 'playing' | 'summary' | 'finished'} status
 * @property {Settings} settings
 * @property {PublicPlayer[]} players
 * @property {number} currentRound
 * @property {number} maxRounds
 * @property {{ found: number, target: number } | null} generation
 * @property {number} roundEndsAt
 */

export {};
