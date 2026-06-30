import { WebSocketServer } from 'ws';
import { ClientMsg, ServerMsg } from './protocol.js';
import { roomManager } from './rooms.js';
import {
	updateSettings,
	setReady,
	startGame,
	handleGuess,
	handleNext,
	kickPlayer,
	notifyPlayerLeft,
	cleanupRoom,
	syncJoiner
} from './game.js';
import { cleanText } from './moderation.js';
import { isAvatarStyle, DEFAULT_AVATAR } from './avatars.js';
import { getLeaderboard, getPlayerStats } from './db.js';
import { createRateLimiter } from './ratelimit.js';
import { RATE_LIMITS, MAX_ROOMS, MAX_MESSAGE_BYTES, RECONNECT_GRACE_MS } from './config.js';

const WS_PATH = '/ws';
const ATTACHED = Symbol.for('streetseekr.wss.attached');

/**
 * @param {import('http').Server | import('http2').Http2SecureServer} httpServer
 * @param {{ dev?: boolean }} [options] `dev` disables the Origin check (local dev).
 * @returns {WebSocketServer}
 */
export function attachWebSocketServer(httpServer, { dev = false } = {}) {
	if (/** @type {any} */ (httpServer)[ATTACHED]) {
		return /** @type {any} */ (httpServer)[ATTACHED];
	}

	const wss = new WebSocketServer({ noServer: true, maxPayload: MAX_MESSAGE_BYTES });

	httpServer.on('upgrade', (req, socket, head) => {
		let pathname;
		try {
			pathname = new URL(req.url ?? '', 'http://localhost').pathname;
		} catch {
			return;
		}
		if (pathname !== WS_PATH) return;
		if (!isAllowedOrigin(req, dev)) {
			socket.destroy();
			return;
		}
		wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
	});

	wss.on('connection', (ws) => handleConnection(/** @type {any} */ (ws)));

	/** @type {any} */ (httpServer)[ATTACHED] = wss;
	console.log(`[ws] WebSocket server attached on ${WS_PATH}`);
	return wss;
}

/**
 * Cross-site WebSocket (CSWSH) protection.
 * @param {import('http').IncomingMessage} req
 * @param {boolean} dev
 * @returns {boolean}
 */
function isAllowedOrigin(req, dev) {
	if (dev) return true;
	const origin = req.headers.origin;
	if (!origin) return true;
	let originHost;
	try {
		originHost = new URL(origin).host;
	} catch {
		return false;
	}
	if (req.headers.host && originHost === req.headers.host) return true;
	const allowed = (process.env.STREETSEEKR_ALLOWED_ORIGINS || '')
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
	return allowed.includes(origin);
}

/**
 * Per-connection state and message dispatch.
 * @param {import('ws').WebSocket} ws
 */
function handleConnection(ws) {
	/** @type {{ room: import('./rooms.js').Room, playerId: string } | null} */
	let session = null;

	const limiter = createRateLimiter();
	/** @param {string} key @returns {boolean} true when the action is rate-limited */
	const limited = (key) => {
		const l = RATE_LIMITS[key] ?? RATE_LIMITS.default;
		return !limiter.allow(key, l.max, l.windowMs);
	};

	const send = (/** @type {object} */ msg) => {
		if (ws.readyState === 1) ws.send(JSON.stringify(msg));
	};

	/** Resolves the live room + player for the current session, or null. */
	const active = () => {
		if (!session) return null;
		const player = session.room.players.get(session.playerId);
		return player ? { room: session.room, player } : null;
	};

	ws.on('message', (data) => {
		if (!limiter.allow('__global', RATE_LIMITS.default.max, RATE_LIMITS.default.windowMs)) return;

		let msg;
		try {
			msg = JSON.parse(data.toString());
		} catch {
			return send({ type: ServerMsg.ERROR, message: 'Invalid message' });
		}

		switch (msg.type) {
			case ClientMsg.CREATE: {
				if (limited('create'))
					return send({ type: ServerMsg.ERROR, message: 'Too many rooms — slow down.' });
				const profile = sanitizeProfile(msg.profile);
				if (!profile) return send({ type: ServerMsg.ERROR, message: 'Invalid profile' });
				if (roomManager.rooms.size >= MAX_ROOMS)
					return send({ type: ServerMsg.ERROR, message: 'Server is at capacity, try again later.' });
				const room = roomManager.createRoom({ solo: !!msg.solo });
				const player = roomManager.addPlayer(room, profile, ws);
				session = { room, playerId: player.id };
				console.log(`[ws] ${profile.name} created room ${room.code}`);
				send({ type: ServerMsg.CREATED, code: room.code, playerId: player.id });
				roomManager.broadcastState(room);
				break;
			}

			case ClientMsg.JOIN: {
				if (limited('join'))
					return send({ type: ServerMsg.ERROR, message: 'Too many attempts — slow down.' });
				const profile = sanitizeProfile(msg.profile);
				if (!profile) return send({ type: ServerMsg.ERROR, message: 'Invalid profile' });
				const room = roomManager.getRoom(msg.code);

				const reconnecting =
					!!room &&
					!!profile.clientId &&
					[...room.players.values()].some((p) => p.profile.clientId === profile.clientId);

				if (!room || (room.solo && !reconnecting))
					return send({ type: ServerMsg.ERROR, message: 'Room not found', code: 'not_found' });

				if (session) leaveCurrent(true);

				const player = roomManager.addPlayer(room, profile, ws);
				session = { room, playerId: player.id };
				console.log(
					`[ws] ${profile.name} ${reconnecting ? 'reconnected to' : 'joined'} room ${room.code} (${room.players.size} total)`
				);
				send({ type: ServerMsg.CREATED, code: room.code, playerId: player.id });
				roomManager.broadcastState(room);

				syncJoiner(room, player);
				if (room.chatLog.length) send({ type: ServerMsg.CHAT_HISTORY, entries: room.chatLog });
				break;
			}

			case ClientMsg.LEAVE: {
				leaveCurrent(true);
				break;
			}

			case ClientMsg.SETTINGS: {
				if (limited('settings')) break;
				const a = active();
				if (a) updateSettings(a.room, a.player, msg);
				break;
			}

			case ClientMsg.READY: {
				const a = active();
				if (a) setReady(a.room, a.player, !!msg.ready);
				break;
			}

			case ClientMsg.START: {
				const a = active();
				if (a) startGame(a.room, a.player);
				break;
			}

			case ClientMsg.GUESS: {
				if (limited('guess')) break;
				const a = active();
				if (a) handleGuess(a.room, a.player, msg.location);
				break;
			}

			case ClientMsg.NEXT: {
				const a = active();
				if (a) handleNext(a.room, a.player);
				break;
			}

			case ClientMsg.KICK: {
				const a = active();
				if (a && typeof msg.playerId === 'string') {
					kickPlayer(a.room, a.player, msg.playerId);
				}
				break;
			}

			case ClientMsg.SAY: {
				if (limited('say')) break;
				const a = active();
				const text =
					typeof msg.text === 'string' ? cleanText(msg.text.trim().slice(0, 200)).trim() : '';
				if (a && text) {
					roomManager.chat(a.room, {
						kind: 'msg',
						name: a.player.profile.name,
						text,
						playerId: a.player.id
					});
				}
				break;
			}

			case ClientMsg.CHECK_ROOM: {
				if (limited('check_room')) break;
				const code = typeof msg.code === 'string' ? msg.code.toUpperCase().slice(0, 8) : '';
				const r = roomManager.getRoom(code);
				send({ type: ServerMsg.ROOM_EXISTS, code, exists: !!r && !r.solo });
				break;
			}

			case ClientMsg.GET_LEADERBOARD: {
				if (limited('check_room')) break;
				send({ type: ServerMsg.LEADERBOARD, players: getLeaderboard(10) });
				break;
			}

			case ClientMsg.GET_STATS: {
				if (limited('check_room')) break;
				const clientId =
					typeof msg.clientId === 'string' ? msg.clientId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) : '';
				send({ type: ServerMsg.STATS, stats: getPlayerStats(clientId) });
				break;
			}

			default:
				send({ type: ServerMsg.ERROR, message: `Unknown message type: ${msg.type}` });
		}
	});

	ws.on('close', () => leaveCurrent(false));
	ws.on('error', () => leaveCurrent(false));

	/**
	 * @param {boolean} explicit `true` = user-initiated leave (remove now);
	 *   `false` = the socket dropped (keep the slot & score for a grace window so
	 *   a refresh / reconnect can resume).
	 */
	function leaveCurrent(explicit) {
		if (!session) return;
		const { room, playerId } = session;
		session = null;
		const player = room.players.get(playerId);
		if (!player) return;
		if (player.socket !== ws) return;

		if (explicit) {
			finalizeRemoval(room, playerId);
			return;
		}

		player.connected = false;
		if (player.disconnectTimer) clearTimeout(player.disconnectTimer);
		player.disconnectTimer = setTimeout(() => finalizeRemoval(room, playerId), RECONNECT_GRACE_MS);

		if (room.hostId === playerId) {
			const next = [...room.players.values()].find((p) => p.connected && p.id !== playerId);
			if (next) room.hostId = next.id;
		}

		console.log(
			`[ws] ${player.profile.name} disconnected from ${room.code} — ${Math.round(RECONNECT_GRACE_MS / 1000)}s to reconnect`
		);
		notifyPlayerLeft(room);
		roomManager.broadcastState(room);
	}
}

/**
 * Permanently removes a player and tidies up.
 * @param {import('./rooms.js').Room} room
 * @param {string} playerId
 */
function finalizeRemoval(room, playerId) {
	const player = room.players.get(playerId);
	if (!player) return;
	const name = player.profile.name;
	roomManager.removePlayer(room, playerId);
	if (roomManager.getRoom(room.code) === room) {
		console.log(`[ws] ${name} left ${room.code} (${room.players.size} left)`);
		notifyPlayerLeft(room);
		roomManager.broadcastState(room);
	} else {
		console.log(`[ws] ${name} left — room ${room.code} closed`);
		cleanupRoom(room);
	}
}

/**
 * Validates, normalizes and moderates an incoming profile.
 * @param {any} raw
 * @returns {import('./protocol.js').Profile | null}
 */
function sanitizeProfile(raw) {
	if (!raw || typeof raw.name !== 'string') return null;
	const name = cleanText(
		raw.name
			.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, '')
			.replace(/\s+/g, ' ')
			.trim()
			.slice(0, 20)
	).trim();
	if (name.length === 0) return null;
	const avatar = isAvatarStyle(raw.avatar) ? raw.avatar : DEFAULT_AVATAR;
	const clientId =
		typeof raw.clientId === 'string' ? raw.clientId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) : '';
	return { name, avatar, clientId };
}
