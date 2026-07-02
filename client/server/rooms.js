import { ServerMsg } from './protocol.js';
import { DEFAULT_SETTINGS } from './config.js';
import { touchPlayer } from './db.js';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 4;

let playerSeq = 0;

/**
 * @typedef {import('./protocol.js').Profile} Profile
 * @typedef {import('./protocol.js').Settings} Settings
 * @typedef {import('./protocol.js').PublicRoom} PublicRoom
 * @typedef {import('./protocol.js').PublicPlayer} PublicPlayer
 */

/**
 * @typedef {Object} Player
 * @property {string} id
 * @property {Profile} profile
 * @property {boolean} ready
 * @property {boolean} finished
 * @property {number} totalPoints
 * @property {number} lastRoundPoints
 * @property {boolean} connected
 * @property {import('ws').WebSocket} socket
 * @property {ReturnType<typeof setTimeout> | null} disconnectTimer
 */

/**
 * @typedef {Object} Room
 * @property {string} code
 * @property {boolean} solo
 * @property {'lobby' | 'generating' | 'playing' | 'summary' | 'finished'} status
 * @property {Settings} settings
 * @property {Map<string, Player>} players
 * @property {string | null} hostId
 * @property {number} createdAt
 * @property {Array<{kind: string, name: string, text?: string, playerId?: string}>} chatLog
 * @property {{ found: number, target: number } | null} generation
 * @property {{ rounds: any[] } | null} challenge
 * @property {number} currentRound
 * @property {number} roundStartsAt
 * @property {number} roundEndsAt
 * @property {boolean} roundTimerStarted
 * @property {Map<number, Map<string, { location: number[] | null, points: number }>>} guesses
 * @property {ReturnType<typeof setTimeout> | null} roundTimer
 * @property {ReturnType<typeof setTimeout> | null} pauseTimer
 */

export class RoomManager {
	constructor() {
		/** @type {Map<string, Room>} */
		this.rooms = new Map();
	}

	/** @returns {string} A unique, unused room code. */
	generateCode() {
		let code;
		do {
			code = '';
			for (let i = 0; i < CODE_LENGTH; i++) {
				code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
			}
		} while (this.rooms.has(code));
		return code;
	}

	/**
	 * @param {{ solo?: boolean }} [options]
	 * @returns {Room}
	 */
	createRoom({ solo = false } = {}) {
		/** @type {Room} */
		const room = {
			code: this.generateCode(),
			solo,
			status: 'lobby',
			settings: { ...DEFAULT_SETTINGS },
			players: new Map(),
			hostId: null,
			createdAt: Date.now(),
			chatLog: [],
			generation: null,
			challenge: null,
			currentRound: 0,
			roundStartsAt: 0,
			roundEndsAt: 0,
			roundTimerStarted: false,
			guesses: new Map(),
			roundTimer: null,
			pauseTimer: null
		};
		this.rooms.set(room.code, room);
		return room;
	}

	/** @param {string} code @returns {Room | undefined} */
	getRoom(code) {
		return this.rooms.get(code?.toUpperCase());
	}

	/**
	 * Adds a player to a room, reattaching to an existing slot when the same
	 * `clientId` reconnects (preserving score and host status). The first player
	 * to join becomes the host.
	 *
	 * @param {Room} room
	 * @param {Profile} profile
	 * @param {import('ws').WebSocket} socket
	 * @returns {Player}
	 */
	addPlayer(room, profile, socket) {
		if (profile.clientId) {
			for (const existing of room.players.values()) {
				if (existing.profile.clientId !== profile.clientId) continue;
				if (existing.disconnectTimer) {
					clearTimeout(existing.disconnectTimer);
					existing.disconnectTimer = null;
				}
				existing.socket = socket;
				existing.connected = true;
				existing.profile = profile;
				touchPlayer(profile);
				return existing;
			}
		}

		const id = `p${++playerSeq}`;
		touchPlayer(profile);
		/** @type {Player} */
		const player = {
			id,
			profile,
			ready: false,
			finished: false,
			totalPoints: 0,
			lastRoundPoints: 0,
			connected: true,
			socket,
			disconnectTimer: null
		};
		room.players.set(id, player);
		if (!room.hostId) room.hostId = id;
		return player;
	}

	/**
	 * Removes a player; drops the room when empty and reassigns the host.
	 * @param {Room} room
	 * @param {string} playerId
	 */
	removePlayer(room, playerId) {
		const leaving = room.players.get(playerId);
		if (leaving?.disconnectTimer) {
			clearTimeout(leaving.disconnectTimer);
			leaving.disconnectTimer = null;
		}
		room.players.delete(playerId);
		if (room.players.size === 0) {
			this.rooms.delete(room.code);
			return;
		}
		if (room.hostId === playerId) {
			room.hostId = room.players.keys().next().value ?? null;
		}
	}

	/**
	 * Projects internal room state to the public shape sent to clients.
	 * @param {Room} room
	 * @returns {PublicRoom}
	 */
	toPublic(room) {
		const roundGuesses = room.guesses.get(room.currentRound);
		return {
			code: room.code,
			solo: room.solo,
			status: room.status,
			settings: room.settings,
			currentRound: room.currentRound,
			maxRounds: room.settings.maxRounds,
			generation: room.generation,
			roundEndsAt: room.roundEndsAt,
			players: [...room.players.values()].map((p) => ({
				id: p.id,
				name: p.profile.name,
				avatar: p.profile.avatar,
				isHost: p.id === room.hostId,
				connected: p.connected,
				ready: p.id === room.hostId || p.ready,
				finished: p.finished,
				totalPoints: p.totalPoints,
				lastRoundPoints: p.lastRoundPoints,
				hasGuessed: roundGuesses?.has(p.id) ?? false
			}))
		};
	}

	/**
	 * Sends a message to every connected player in a room.
	 * @param {Room} room
	 * @param {object} msg
	 */
	broadcast(room, msg) {
		const payload = JSON.stringify(msg);
		for (const player of room.players.values()) {
			if (player.connected && player.socket.readyState === 1) {
				player.socket.send(payload);
			}
		}
	}

	/** @param {Room} room */
	broadcastState(room) {
		this.broadcast(room, { type: ServerMsg.ROOM_STATE, room: this.toPublic(room) });
	}

	/**
	 * Records a chat entry (capped) and broadcasts it.
	 * @param {Room} room
	 * @param {{kind: string, name: string, text?: string, playerId?: string}} entry
	 */
	chat(room, entry) {
		room.chatLog.push(entry);
		if (room.chatLog.length > 50) room.chatLog.shift();
		this.broadcast(room, { type: ServerMsg.CHAT, ...entry });
	}
}

export const roomManager = new RoomManager();
