/**
 * The realtime client: a single reactive WebSocket store the UI binds to.
 */
import { browser } from '$app/environment';
import { ClientMsg, ServerMsg } from '../../server/protocol.js';
import { applyServerMessage, initialState, type ClientState } from './gameState';
import type { Profile } from './profile.svelte';

const LAST_ROOM_KEY = 'streetseekr:lastRoom';
const MAX_BACKOFF_MS = 10000;

function remember(code: string) {
	if (!browser) return;
	try {
		localStorage.setItem(LAST_ROOM_KEY, code);
	} catch {
	}
}
function forget() {
	if (!browser) return;
	try {
		localStorage.removeItem(LAST_ROOM_KEY);
	} catch {
	}
}
export function getLastRoom(): string | null {
	if (!browser) return null;
	try {
		return localStorage.getItem(LAST_ROOM_KEY);
	} catch {
		return null;
	}
}

class GameSocket {
	state = $state<ClientState>(initialState());
	connected = $state(false);
	reconnecting = $state(false);

	#ws: WebSocket | null = null;
	#openPromise: Promise<void> | null = null;
	#pendingAck: { resolve: (code: string) => void; reject: (err: Error) => void } | null = null;
	#resume: { code: string; profile: Profile } | null = null;
	#shouldReconnect = false;
	#attempts = 0;
	#reconnectTimer: ReturnType<typeof setTimeout> | null = null;

	connect(): Promise<void> {
		if (!browser) return Promise.resolve();
		if (this.#ws && this.#ws.readyState <= 1 && this.#openPromise) return this.#openPromise;

		const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
		const ws = new WebSocket(`${proto}//${location.host}/ws`);
		this.#ws = ws;
		this.#shouldReconnect = true;

		this.#openPromise = new Promise((resolve, reject) => {
			ws.addEventListener('open', () => {
				this.connected = true;
				this.reconnecting = false;
				this.#attempts = 0;
				if (this.#resume) {
					this.#send({ type: ClientMsg.JOIN, code: this.#resume.code, profile: this.#resume.profile });
				}
				resolve();
			});
			ws.addEventListener('error', () => reject(new Error('WebSocket error')));
		});

		ws.addEventListener('close', () => {
			this.connected = false;
			if (this.#shouldReconnect) this.#scheduleReconnect();
		});
		ws.addEventListener('message', (ev) => this.#onMessage(ev));
		return this.#openPromise;
	}

	#scheduleReconnect() {
		if (this.#reconnectTimer) return;
		this.reconnecting = true;
		const delay = Math.min(500 * 2 ** this.#attempts, MAX_BACKOFF_MS);
		this.#attempts++;
		this.#reconnectTimer = setTimeout(() => {
			this.#reconnectTimer = null;
			this.#ws = null;
			this.#openPromise = null;
			this.connect().catch(() => {
			});
		}, delay);
	}

	#onMessage(ev: MessageEvent) {
		let msg: any;
		try {
			msg = JSON.parse(ev.data);
		} catch {
			return;
		}

		if (msg.type === ServerMsg.CREATED) {
			remember(msg.code);
			this.#pendingAck?.resolve(msg.code);
			this.#pendingAck = null;
		} else if (msg.type === ServerMsg.ERROR && this.#pendingAck) {
			this.#pendingAck.reject(new Error(typeof msg.message === 'string' ? msg.message : 'Error'));
			this.#pendingAck = null;
		}

		if (msg.type === ServerMsg.ERROR && msg.code === 'kicked') {
			this.#shouldReconnect = false;
			this.#resume = null;
			if (this.#reconnectTimer) {
				clearTimeout(this.#reconnectTimer);
				this.#reconnectTimer = null;
			}
			forget();
			this.state = { ...initialState(), error: 'You were removed from the room.' };
			return;
		}

		this.state = applyServerMessage(this.state, msg, Date.now());
	}

	#send(data: object) {
		this.#ws?.send(JSON.stringify(data));
	}

	async create(profile: Profile, solo = false): Promise<string> {
		await this.connect();
		this.#resume = null;
		return new Promise((resolve, reject) => {
			this.#pendingAck = {
				resolve: (code) => {
					this.#resume = { code, profile };
					resolve(code);
				},
				reject
			};
			this.#send({ type: ClientMsg.CREATE, profile, solo });
		});
	}

	async join(code: string, profile: Profile): Promise<string> {
		await this.connect();
		this.#resume = { code, profile };
		return new Promise((resolve, reject) => {
			this.#pendingAck = { resolve, reject };
			this.#send({ type: ClientMsg.JOIN, code, profile });
		});
	}

	setSettings(settings: Record<string, unknown>) {
		this.#send({ type: ClientMsg.SETTINGS, ...settings });
	}
	setReady(ready: boolean) {
		this.#send({ type: ClientMsg.READY, ready });
	}
	start() {
		this.#send({ type: ClientMsg.START });
	}
	guess(location: [number, number]) {
		this.#send({ type: ClientMsg.GUESS, location });
	}
	next() {
		this.#send({ type: ClientMsg.NEXT });
	}
	say(text: string) {
		this.#send({ type: ClientMsg.SAY, text });
	}
	kick(playerId: string) {
		this.#send({ type: ClientMsg.KICK, playerId });
	}

	async checkRoom(code: string): Promise<void> {
		await this.connect();
		this.#send({ type: ClientMsg.CHECK_ROOM, code });
	}

	async requestLeaderboard(): Promise<void> {
		await this.connect();
		this.#send({ type: ClientMsg.GET_LEADERBOARD });
	}

	async requestStats(clientId: string): Promise<void> {
		await this.connect();
		this.#send({ type: ClientMsg.GET_STATS, clientId });
	}

	dismissError() {
		this.state = { ...this.state, error: null };
	}

	dismissGameOver() {
		this.state = { ...this.state, gameOver: null };
	}

	leave() {
		this.#shouldReconnect = false;
		this.#resume = null;
		if (this.#reconnectTimer) {
			clearTimeout(this.#reconnectTimer);
			this.#reconnectTimer = null;
		}
		forget();
		this.#send({ type: ClientMsg.LEAVE });
		this.state = initialState();
	}
}

export const game = new GameSocket();
