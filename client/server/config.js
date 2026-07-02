export const MAX_ROOMS = 500;

export const RECONNECT_GRACE_MS = 120000;

export const MAX_MESSAGE_BYTES = 2 * 1024 * 1024;

export const ROUND_SUMMARY_PAUSE_MS = 12000;

export const GET_READY_MS = 3000;

export const ROUND_LOAD_GRACE_MS = 12000;

export const DEFAULT_SETTINGS = Object.freeze({
	maxRounds: 5,
	timeLimit: 60,
	graceDistance: 0.5,
	fallOfRate: 1000,
	maxPoints: 1000,
	density: 1,
	private: false,
	polygon: null,
	locationStrings: []
});

export const SETTINGS_BOUNDS = Object.freeze({
	maxRounds: { min: 1, max: 15 },
	timeLimit: { min: 10, max: 600 },
	graceDistance: { min: 0, max: 50 },
	fallOfRate: { min: 0.1, max: 10000 },
	maxPoints: { min: 100, max: 10000 },
	density: { min: 1, max: 5 }
});

/**
 * Per-connection sliding-window rate limits: `max` actions per `windowMs`.
 * @type {Record<string, { max: number, windowMs: number }>}
 */
export const RATE_LIMITS = {
	default: { max: 60, windowMs: 5000 },
	create: { max: 6, windowMs: 60000 },
	join: { max: 12, windowMs: 60000 },
	settings: { max: 30, windowMs: 5000 },
	say: { max: 6, windowMs: 4000 },
	guess: { max: 10, windowMs: 4000 },
	check_room: { max: 30, windowMs: 10000 }
};
