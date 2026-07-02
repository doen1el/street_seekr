import { ServerMsg } from './protocol.js';
import { roomManager } from './rooms.js';
import {
	SETTINGS_BOUNDS,
	ROUND_SUMMARY_PAUSE_MS,
	GET_READY_MS,
	ROUND_LOAD_GRACE_MS
} from './config.js';
import { recordGameResult } from './db.js';
import { generateRandomPointsForChallenge } from './panoramax/index.js';

/** @typedef {import('./rooms.js').Room} Room */
/** @typedef {import('./rooms.js').Player} Player */

/** @param {Player} player @param {object} msg */
function send(player, msg) {
	if (player.socket.readyState === 1) player.socket.send(JSON.stringify(msg));
}

/** Room is still tracked and has players. @param {Room} room */
function isAlive(room) {
	return roomManager.getRoom(room.code) === room && room.players.size > 0;
}

/** @param {Room} room */
function clearTimers(room) {
	if (room.roundTimer) clearTimeout(room.roundTimer);
	if (room.pauseTimer) clearTimeout(room.pauseTimer);
	room.roundTimer = null;
	room.pauseTimer = null;
}

/* lobby */

/** @param {number} value @param {{min:number,max:number}} bounds @param {number} fallback */
function clampInt(value, bounds, fallback) {
	const n = Number(value);
	if (!Number.isFinite(n)) return fallback;
	return Math.max(bounds.min, Math.min(bounds.max, Math.round(n)));
}

/** @param {number} value @param {{min:number,max:number}} bounds @param {number} fallback */
function clampFloat(value, bounds, fallback) {
	const n = Number(value);
	if (!Number.isFinite(n)) return fallback;
	return Math.max(bounds.min, Math.min(bounds.max, n));
}

/** @param {any} raw @param {import('./protocol.js').Settings} current */
function sanitizeSettings(raw, current) {
	/** @type {Partial<import('./protocol.js').Settings>} */
	const out = {};
	if ('maxRounds' in raw) out.maxRounds = clampInt(raw.maxRounds, SETTINGS_BOUNDS.maxRounds, current.maxRounds);
	if ('timeLimit' in raw) out.timeLimit = clampInt(raw.timeLimit, SETTINGS_BOUNDS.timeLimit, current.timeLimit);
	if ('graceDistance' in raw)
		out.graceDistance = clampFloat(raw.graceDistance, SETTINGS_BOUNDS.graceDistance, current.graceDistance);
	if ('fallOfRate' in raw)
		out.fallOfRate = clampFloat(raw.fallOfRate, SETTINGS_BOUNDS.fallOfRate, current.fallOfRate);
	if ('maxPoints' in raw) out.maxPoints = clampInt(raw.maxPoints, SETTINGS_BOUNDS.maxPoints, current.maxPoints);
	if ('density' in raw) out.density = clampInt(raw.density, SETTINGS_BOUNDS.density, current.density);
	if ('private' in raw) out.private = !!raw.private;
	if ('polygon' in raw) out.polygon = raw.polygon && typeof raw.polygon === 'object' ? raw.polygon : null;
	if ('locationStrings' in raw && Array.isArray(raw.locationStrings)) {
		out.locationStrings = raw.locationStrings
			.filter((/** @type {any} */ s) => typeof s === 'string')
			.map((/** @type {string} */ s) => s.trim().slice(0, 120))
			.filter(Boolean)
			.slice(0, 50);
	}
	return out;
}

/**
 * Host changes lobby settings. Readiness is intentionally kept (changing settings
 * used to un-ready everyone, which was annoying).
 * @param {Room} room @param {Player} player @param {any} settings
 */
export function updateSettings(room, player, settings) {
	if (room.hostId !== player.id || room.status !== 'lobby') return;
	Object.assign(room.settings, sanitizeSettings(settings, room.settings));
	roomManager.broadcastState(room);
}

/** @param {Room} room @param {Player} player @param {boolean} ready */
export function setReady(room, player, ready) {
	if (room.status !== 'lobby' || player.id === room.hostId) return;
	player.ready = !!ready;
	roomManager.broadcastState(room);
}

/** @param {Room} room @param {Player} player @param {string} targetId */
export function kickPlayer(room, player, targetId) {
	if (room.hostId !== player.id || room.status !== 'lobby') return;
	if (targetId === room.hostId) return;
	const target = room.players.get(targetId);
	if (!target) return;
	send(target, { type: ServerMsg.ERROR, message: 'You were removed from the room.', code: 'kicked' });
	roomManager.removePlayer(room, targetId);
	if (roomManager.getRoom(room.code) === room) roomManager.broadcastState(room);
}

/** Whether every connected non-host player is ready. @param {Room} room */
export function allReady(room) {
	for (const p of room.players.values()) {
		if (p.id === room.hostId || !p.connected) continue;
		if (!p.ready) return false;
	}
	return true;
}

/* game */

/**
 * Host starts the game: generates the challenge (streaming progress), then runs
 * the authoritative round loop.
 * @param {Room} room @param {Player} player
 */
export async function startGame(room, player) {
	if (room.hostId !== player.id) {
		return send(player, { type: ServerMsg.ERROR, message: 'Only the host can start the game.' });
	}
	if (room.status !== 'lobby') return;
	if (!allReady(room)) {
		return send(player, { type: ServerMsg.ERROR, message: 'Not all players are ready yet.' });
	}

	clearTimers(room);
	const target = room.settings.maxRounds;
	room.status = 'generating';
	room.generation = { found: 0, target };
	room.challenge = null;
	room.currentRound = 0;
	room.guesses = new Map();
	for (const p of room.players.values()) {
		p.totalPoints = 0;
		p.lastRoundPoints = 0;
	}
	roomManager.broadcastState(room);
	console.log(`[game] ${room.code} generating ${target} rounds`);

	/** @type {import('./panoramax/index.js').RoundPoint[]} */
	let rounds = [];
	try {
		rounds = await generateRandomPointsForChallenge(room.settings.polygon, target, (found) => {
			if (roomManager.getRoom(room.code) !== room || room.status !== 'generating') return;
			room.generation = { found, target };
			roomManager.broadcast(room, { type: ServerMsg.GENERATION_PROGRESS, found, target });
		});
	} catch (err) {
		console.error('[game] generation failed', err instanceof Error ? err.message : err);
	}

	if (roomManager.getRoom(room.code) !== room || room.status !== 'generating') {
		cleanupRoom(room);
		return;
	}

	if (rounds.length < target) {
		room.status = 'lobby';
		room.generation = null;
		send(player, {
			type: ServerMsg.ERROR,
			message:
				rounds.length === 0
					? 'No Street View coverage in this area. Try a different area or play worldwide.'
					: `Only found ${rounds.length}/${target} spots here. Try a bigger/different area or play worldwide.`,
			code: 'insufficient_coverage'
		});
		roomManager.broadcastState(room);
		console.log(`[game] ${room.code} generation insufficient (${rounds.length}/${target})`);
		return;
	}

	room.challenge = { rounds };
	room.generation = null;
	startRound(room, 1);
}

/** @param {Room} room @param {number} n */
function startRound(room, n) {
	clearTimers(room);
	if (!isAlive(room) || !room.challenge) return cleanupRoom(room);

	room.currentRound = n;
	room.status = 'playing';

	const startsAt = Date.now() + GET_READY_MS;
	room.roundStartsAt = startsAt;
	room.roundEndsAt = startsAt + room.settings.timeLimit * 1000;
	room.roundTimerStarted = false;
	room.guesses.set(n, new Map());
	for (const p of room.players.values()) {
		p.lastRoundPoints = 0;
		p.finished = false;
	}

	const r = room.challenge.rounds[n - 1];
	roomManager.broadcast(room, {
		type: ServerMsg.ROUND_START,
		round: n,
		maxRounds: room.settings.maxRounds,
		roundStartsAt: startsAt,
		roundEndsAt: room.roundEndsAt,
		serverNow: Date.now(),
		timeLimit: room.settings.timeLimit,
		pano: { id: r.id, collectionId: r.collectionId, sequenceId: r.sequenceId, viewerBaseUrl: r.viewerBaseUrl }
	});
	roomManager.broadcastState(room);
	console.log(`[game] ${room.code} round ${n}/${room.settings.maxRounds} @ ${r.location}`);

	room.roundTimer = setTimeout(
		() => endRound(room),
		GET_READY_MS + ROUND_LOAD_GRACE_MS + room.settings.timeLimit * 1000
	);
}

/**
 * A client reports its panorama has loaded. The first such report starts the actual
 * guess clock (timeLimit from now, clamped into the get-ready→grace window) so nobody
 * loses time to a cold load. @param {Room} room @param {Player} _player
 */
export function handleLoaded(room, _player) {
	if (room.status !== 'playing' || room.roundTimerStarted) return;
	room.roundTimerStarted = true;
	const startAt = Math.min(
		Math.max(Date.now(), room.roundStartsAt),
		room.roundStartsAt + ROUND_LOAD_GRACE_MS
	);
	room.roundEndsAt = startAt + room.settings.timeLimit * 1000;
	if (room.roundTimer) clearTimeout(room.roundTimer);
	room.roundTimer = setTimeout(() => endRound(room), Math.max(0, room.roundEndsAt - Date.now()));
	roomManager.broadcast(room, {
		type: ServerMsg.ROUND_TIMER,
		round: room.currentRound,
		roundEndsAt: room.roundEndsAt
	});
}

/**
 * Records a player's guess and scores it against the round anchor.
 * @param {Room} room @param {Player} player @param {any} location `[lng, lat]`
 */
export function handleGuess(room, player, location) {
	if (room.status !== 'playing' || !room.challenge) return;
	if (Date.now() > room.roundEndsAt) return;
	const roundGuesses = room.guesses.get(room.currentRound);
	if (!roundGuesses) return;
	const anchor = room.challenge.rounds[room.currentRound - 1];
	if (!anchor) return;

	const loc = normalizeGuess(location);
	let points = 0;
	if (loc) {
		const dist = haversine(loc[1], loc[0], anchor.location[1], anchor.location[0]);
		points = computeScore(dist, room.settings);
	}

	roundGuesses.set(player.id, { location: loc, points });
	send(player, { type: ServerMsg.GUESS_RESULT, accepted: true });
	roomManager.broadcastState(room);
}

/**
 * A player marks themselves finished with the round. When every connected player is
 * finished, the round ends early. @param {Room} room @param {Player} player
 */
export function handleFinish(room, player) {
	if (room.status !== 'playing') return;
	player.finished = true;
	roomManager.broadcastState(room);
	const connected = [...room.players.values()].filter((p) => p.connected);
	if (connected.length > 0 && connected.every((p) => p.finished)) endRound(room);
}

/** @param {Room} room */
function endRound(room) {
	clearTimers(room);
	if (!room.challenge) return;
	const n = room.currentRound;
	const anchor = room.challenge.rounds[n - 1];
	const roundGuesses = room.guesses.get(n) ?? new Map();

	for (const [pid, g] of roundGuesses) {
		const p = room.players.get(pid);
		if (p) {
			p.totalPoints += g.points;
			p.lastRoundPoints = g.points;
		}
	}

	room.status = 'summary';
	const isLast = n >= room.settings.maxRounds;
	roomManager.broadcast(room, {
		type: ServerMsg.ROUND_END,
		round: n,
		location: anchor.location,
		pano: { id: anchor.id, collectionId: anchor.collectionId, viewerBaseUrl: anchor.viewerBaseUrl },
		guesses: [...roundGuesses.entries()].map(([playerId, g]) => ({
			playerId,
			location: g.location,
			points: g.points
		})),
		players: roomManager.toPublic(room).players,
		nextInMs: ROUND_SUMMARY_PAUSE_MS,
		isLast
	});
	roomManager.broadcastState(room);
	console.log(`[game] ${room.code} round ${n} ended (answer ${anchor.location})`);

	if (!isAlive(room)) return cleanupRoom(room);
}

/** Host advances from the round summary to the next round (or the final results). @param {Room} room @param {Player} player */
export function handleNext(room, player) {
	if (room.hostId !== player.id || room.status !== 'summary') return;
	if (room.pauseTimer) {
		clearTimeout(room.pauseTimer);
		room.pauseTimer = null;
	}
	const n = room.currentRound;
	if (n >= room.settings.maxRounds) endGame(room);
	else startRound(room, n + 1);
}

/** @param {Room} room */
function endGame(room) {
	clearTimers(room);
	room.status = 'finished';

	const players = roomManager.toPublic(room).players;
	const max = players.reduce((m, p) => Math.max(m, p.totalPoints), 0);
	const winners = players.filter((p) => p.totalPoints === max && max > 0);
	const isTie = winners.length > 1;

	roomManager.broadcast(room, {
		type: ServerMsg.GAME_OVER,
		winnerName: !isTie && winners.length === 1 ? winners[0].name : null,
		isTie,
		players
	});
	console.log(`[game] ${room.code} game over — winner: ${winners.map((w) => w.name).join(', ') || 'none'}`);

	if (!room.solo) {
		const winnerIds = new Set(winners.map((w) => w.id));
		const isContest = room.players.size > 1;
		for (const p of room.players.values()) {
			recordGameResult(p.profile, { won: isContest && winnerIds.has(p.id), score: p.totalPoints });
		}
	}

	room.status = 'lobby';
	room.challenge = null;
	room.currentRound = 0;
	room.guesses = new Map();
	room.generation = null;
	for (const p of room.players.values()) {
		p.totalPoints = 0;
		p.lastRoundPoints = 0;
		p.ready = false;
	}
	roomManager.broadcastState(room);
}

/**
 * Brings a freshly (re)joined player up to speed with the room's current phase.
 * @param {Room} room @param {Player} player
 */
export function syncJoiner(room, player) {
	if (room.status === 'generating') {
		send(player, {
			type: ServerMsg.GENERATION_PROGRESS,
			found: room.generation?.found ?? 0,
			target: room.generation?.target ?? room.settings.maxRounds
		});
		return;
	}
	if (!room.challenge) return;
	const n = room.currentRound;

	if (room.status === 'playing') {
		const r = room.challenge.rounds[n - 1];
		if (r) {
			send(player, {
				type: ServerMsg.ROUND_START,
				round: n,
				maxRounds: room.settings.maxRounds,
				roundStartsAt: room.roundStartsAt,
				roundEndsAt: room.roundEndsAt,
				serverNow: Date.now(),
				timeLimit: room.settings.timeLimit,
				pano: { id: r.id, collectionId: r.collectionId, sequenceId: r.sequenceId, viewerBaseUrl: r.viewerBaseUrl }
			});
		}
		return;
	}

	if (room.status === 'summary') {
		const anchor = room.challenge.rounds[n - 1];
		const roundGuesses = room.guesses.get(n) ?? new Map();
		send(player, {
			type: ServerMsg.ROUND_END,
			round: n,
			location: anchor.location,
			pano: { id: anchor.id, collectionId: anchor.collectionId, viewerBaseUrl: anchor.viewerBaseUrl },
			guesses: [...roundGuesses.entries()].map(([playerId, g]) => ({
				playerId,
				location: g.location,
				points: g.points
			})),
			players: roomManager.toPublic(room).players,
			nextInMs: 0,
			isLast: n >= room.settings.maxRounds
		});
	}
}

/** A player left mid-round. Rounds now always run for their full time, so nothing to do. @param {Room} _room */
export function notifyPlayerLeft(_room) {}

/** Clears any pending timers for a room. @param {Room} room */
export function cleanupRoom(room) {
	clearTimers(room);
}

/* helpers */

/** @param {any} location @returns {[number, number] | null} `[lng, lat]` */
function normalizeGuess(location) {
	if (
		!Array.isArray(location) ||
		location.length !== 2 ||
		typeof location[0] !== 'number' ||
		typeof location[1] !== 'number' ||
		!Number.isFinite(location[0]) ||
		!Number.isFinite(location[1])
	) {
		return null;
	}
	return [location[0], location[1]];
}

/**
 * Exponential distance score: full points within the grace radius, decaying with
 * the falloff constant beyond it. Distances/constants are in metres.
 * @param {number} distanceMeters @param {import('./protocol.js').Settings} settings
 */
function computeScore(distanceMeters, settings) {
	const grace = settings.graceDistance * 1000;
	const falloff = settings.fallOfRate * 1000;
	if (distanceMeters <= grace) return settings.maxPoints;
	const beyond = distanceMeters - grace;
	return Math.max(0, Math.round(settings.maxPoints * Math.exp(-beyond / falloff)));
}

/** Great-circle distance in metres. @param {number} lat1 @param {number} lon1 @param {number} lat2 @param {number} lon2 */
function haversine(lat1, lon1, lat2, lon2) {
	const R = 6371000;
	const toRad = (/** @type {number} */ d) => (d * Math.PI) / 180;
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
