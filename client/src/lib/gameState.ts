import { ServerMsg } from '../../server/protocol.js';

export type RoomStatus = 'lobby' | 'generating' | 'playing' | 'summary' | 'finished';

export interface Settings {
	maxRounds: number;
	timeLimit: number;
	graceDistance: number;
	fallOfRate: number;
	maxPoints: number;
	density: number;
	private: boolean;
	polygon: unknown | null;
	locationStrings: string[];
}

export interface PublicPlayer {
	id: string;
	name: string;
	avatar: string;
	isHost: boolean;
	connected: boolean;
	ready: boolean;
	finished: boolean;
	totalPoints: number;
	lastRoundPoints: number;
	hasGuessed: boolean;
}

export interface PublicRoom {
	code: string;
	solo: boolean;
	status: RoomStatus;
	settings: Settings;
	players: PublicPlayer[];
	currentRound: number;
	maxRounds: number;
	generation: { found: number; target: number } | null;
	roundEndsAt: number;
}

export interface Pano {
	id: string;
	collectionId: string;
	sequenceId?: string;
	viewerBaseUrl: string;
}

export interface RoundInfo {
	round: number;
	maxRounds: number;
	roundStartsAt: number;
	roundEndsAt: number;
	serverNow: number;
	timeLimit: number;
	pano: Pano;
}

export interface GuessReveal {
	playerId: string;
	location: [number, number] | null;
	points: number;
}

export interface RoundResult {
	round: number;
	location: [number, number];
	pano: Pano;
	guesses: GuessReveal[];
	players: PublicPlayer[];
	nextInMs: number;
	nextRoundAt: number;
	isLast: boolean;
}

export interface GameOver {
	winnerName: string | null;
	isTie: boolean;
	players: PublicPlayer[];
	lastRound: RoundResult | null;
}

export interface RoundHistoryEntry {
	round: number;
	points: Record<string, number>;
}

export interface ChatEntry {
	id: number;
	kind: string;
	name: string;
	text?: string;
	playerId?: string;
}

export interface LeaderboardEntry {
	name: string;
	avatar: string;
	gamesWon: number;
	gamesPlayed: number;
	totalScore: number;
	bestScore: number;
}

export interface PlayerStats {
	gamesPlayed: number;
	gamesWon: number;
	totalScore: number;
	bestScore: number;
}

export interface ClientState {
	room: PublicRoom | null;
	playerId: string | null;
	generation: { found: number; target: number } | null;
	round: RoundInfo | null;
	roundResult: RoundResult | null;
	gameOver: GameOver | null;
	roundHistory: RoundHistoryEntry[];
	roundResults: RoundResult[];
	chat: ChatEntry[];
	guessAccepted: boolean;
	roomCheck: { code: string; exists: boolean } | null;
	leaderboard: LeaderboardEntry[];
	stats: PlayerStats | null;
	error: string | null;
}

export function initialState(): ClientState {
	return {
		room: null,
		playerId: null,
		generation: null,
		round: null,
		roundResult: null,
		gameOver: null,
		roundHistory: [],
		roundResults: [],
		chat: [],
		guessAccepted: false,
		roomCheck: null,
		leaderboard: [],
		stats: null,
		error: null
	};
}

let chatSeq = 0;

function clearedGame(): Partial<ClientState> {
	return {
		generation: null,
		round: null,
		roundResult: null,
		gameOver: null,
		roundHistory: [],
		roundResults: [],
		chat: [],
		guessAccepted: false
	};
}

function chatEntry(raw: any): ChatEntry {
	return {
		id: ++chatSeq,
		kind: raw.kind,
		name: raw.name,
		text: raw.text,
		playerId: raw.playerId
	};
}

/**
 * Applies one server message to the state, returning the next state.
 *
 * @param now injectable clock so `nextRoundAt` is deterministic in tests.
 */
export function applyServerMessage(
	state: ClientState,
	msg: any,
	now: number = Date.now()
): ClientState {
	switch (msg?.type) {
		case ServerMsg.CREATED:
			return { ...state, playerId: msg.playerId, error: null, ...clearedGame() };

		case ServerMsg.ROOM_STATE: {
			const room: PublicRoom | null = msg.room ?? null;
			const next: ClientState = { ...state, room };
			if (room?.status === 'lobby') {
				next.round = null;
				next.roundResult = null;
				next.generation = null;
				next.guessAccepted = false;
			} else if (room?.status === 'playing') {
				next.gameOver = null;
			} else if (room?.status === 'generating') {
				next.generation = room.generation ?? state.generation;
			}
			return next;
		}

		case ServerMsg.GENERATION_PROGRESS:
			return { ...state, generation: { found: msg.found, target: msg.target } };

		case ServerMsg.ROUND_START:
			return {
				...state,
				generation: null,
				roundResult: null,
				gameOver: null,
				guessAccepted: false,
				roundHistory: msg.round === 1 ? [] : state.roundHistory,
				roundResults: msg.round === 1 ? [] : state.roundResults,
				round: {
					round: msg.round,
					maxRounds: msg.maxRounds,
					roundStartsAt: msg.roundStartsAt ?? now,
					roundEndsAt: msg.roundEndsAt,
					serverNow: msg.serverNow ?? now,
					timeLimit: msg.timeLimit,
					pano: msg.pano
				}
			};

		case ServerMsg.ROUND_TIMER:
			return state.round && state.round.round === msg.round
				? { ...state, round: { ...state.round, roundEndsAt: msg.roundEndsAt } }
				: state;

		case ServerMsg.ROUND_END: {
			const roundPlayers: PublicPlayer[] = msg.players ?? [];
			const entry: RoundHistoryEntry = {
				round: msg.round,
				points: Object.fromEntries(roundPlayers.map((p) => [p.id, p.lastRoundPoints]))
			};
			const roundHistory = [...state.roundHistory.filter((h) => h.round !== msg.round), entry].sort(
				(a, b) => a.round - b.round
			);
			const roundResult: RoundResult = {
				round: msg.round,
				location: msg.location,
				pano: msg.pano,
				guesses: msg.guesses ?? [],
				players: roundPlayers,
				nextInMs: msg.nextInMs ?? 0,
				nextRoundAt: now + (msg.nextInMs ?? 0),
				isLast: !!msg.isLast
			};
			const roundResults = [
				...state.roundResults.filter((r) => r.round !== msg.round),
				roundResult
			].sort((a, b) => a.round - b.round);
			return { ...state, roundHistory, roundResults, roundResult };
		}

		case ServerMsg.GAME_OVER:
			return {
				...state,
				round: null,
				roundResult: null,
				gameOver: {
					winnerName: msg.winnerName ?? null,
					isTie: !!msg.isTie,
					players: msg.players ?? [],
					lastRound: state.roundResult
				}
			};

		case ServerMsg.GUESS_RESULT:
			return { ...state, guessAccepted: !!msg.accepted };

		case ServerMsg.CHAT:
			return { ...state, chat: [...state.chat.slice(-49), chatEntry(msg)] };

		case ServerMsg.CHAT_HISTORY:
			return { ...state, chat: (msg.entries ?? []).map(chatEntry) };

		case ServerMsg.ROOM_EXISTS:
			return { ...state, roomCheck: { code: msg.code, exists: !!msg.exists } };

		case ServerMsg.LEADERBOARD:
			return { ...state, leaderboard: msg.players ?? [] };

		case ServerMsg.STATS:
			return { ...state, stats: msg.stats ?? null };

		case ServerMsg.ERROR:
			return { ...state, error: typeof msg.message === 'string' ? msg.message : 'Unknown error' };

		default:
			return state;
	}
}
