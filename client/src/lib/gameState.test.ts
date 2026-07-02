import { describe, expect, it } from 'vitest';
import { ServerMsg } from '../../server/protocol.js';
import { applyServerMessage, initialState, type ClientState } from './gameState';

const room = (over: Partial<any> = {}) => ({
	code: 'ABCD',
	solo: false,
	status: 'lobby',
	settings: {},
	players: [],
	currentRound: 0,
	maxRounds: 5,
	generation: null,
	roundEndsAt: 0,
	...over
});

const pano = { id: 'pic1', collectionId: 'seq1', sequenceId: 'seq1', viewerBaseUrl: 'https://v' };

function run(msgs: any[], now = 1000): ClientState {
	return msgs.reduce((s, m) => applyServerMessage(s, m, now), initialState());
}

describe('applyServerMessage', () => {
	it('CREATED sets playerId and clears any prior game', () => {
		const start = { ...initialState(), gameOver: { winnerName: 'x', isTie: false, players: [], lastRound: null } };
		const s = applyServerMessage(start, { type: ServerMsg.CREATED, playerId: 'p1', code: 'ABCD' });
		expect(s.playerId).toBe('p1');
		expect(s.gameOver).toBeNull();
		expect(s.error).toBeNull();
	});

	it('ROOM_STATE lobby clears round/result/generation but keeps gameOver', () => {
		const start: ClientState = {
			...initialState(),
			round: { round: 1 } as any,
			roundResult: { round: 1 } as any,
			generation: { found: 1, target: 2 },
			gameOver: { winnerName: 'x', isTie: false, players: [], lastRound: null }
		};
		const s = applyServerMessage(start, { type: ServerMsg.ROOM_STATE, room: room({ status: 'lobby' }) });
		expect(s.room?.code).toBe('ABCD');
		expect(s.round).toBeNull();
		expect(s.roundResult).toBeNull();
		expect(s.generation).toBeNull();
		expect(s.gameOver).not.toBeNull();
	});

	it('ROOM_STATE playing clears only gameOver', () => {
		const start = { ...initialState(), gameOver: { winnerName: 'x', isTie: false, players: [], lastRound: null } };
		const s = applyServerMessage(start, { type: ServerMsg.ROOM_STATE, room: room({ status: 'playing' }) });
		expect(s.gameOver).toBeNull();
		expect(s.room?.status).toBe('playing');
	});

	it('GENERATION_PROGRESS tracks found/target', () => {
		const s = applyServerMessage(initialState(), { type: ServerMsg.GENERATION_PROGRESS, found: 3, target: 5 });
		expect(s.generation).toEqual({ found: 3, target: 5 });
	});

	it('ROUND_START sets round info and resets per-round flags', () => {
		const start = {
			...initialState(),
			roundResult: { round: 1 } as any,
			gameOver: { winnerName: 'x' } as any,
			guessAccepted: true,
			generation: { found: 5, target: 5 }
		};
		const s = applyServerMessage(
			start,
			{ type: ServerMsg.ROUND_START, round: 2, maxRounds: 5, roundEndsAt: 9999, serverNow: 5000, timeLimit: 60, pano },
			5000
		);
		expect(s.round).toMatchObject({ round: 2, maxRounds: 5, roundEndsAt: 9999, timeLimit: 60, pano });
		expect(s.roundResult).toBeNull();
		expect(s.gameOver).toBeNull();
		expect(s.guessAccepted).toBe(false);
		expect(s.generation).toBeNull();
	});

	it('ROUND_END computes nextRoundAt from the injected clock', () => {
		const s = applyServerMessage(
			initialState(),
			{
				type: ServerMsg.ROUND_END,
				round: 1,
				location: [2.3, 48.8],
				pano,
				guesses: [{ playerId: 'p1', location: [2.31, 48.81], points: 800 }],
				players: [],
				nextInMs: 12000,
				isLast: false
			},
			1000
		);
		expect(s.roundResult?.location).toEqual([2.3, 48.8]);
		expect(s.roundResult?.guesses[0].points).toBe(800);
		expect(s.roundResult?.nextRoundAt).toBe(13000);
		expect(s.roundResult?.isLast).toBe(false);
	});

	it('GAME_OVER sets the result and clears round state', () => {
		const start = { ...initialState(), round: { round: 5 } as any, roundResult: { round: 5 } as any };
		const s = applyServerMessage(start, {
			type: ServerMsg.GAME_OVER,
			winnerName: 'Alice',
			isTie: false,
			players: [{ id: 'p1' }]
		});
		expect(s.gameOver).toMatchObject({ winnerName: 'Alice', isTie: false });
		expect(s.round).toBeNull();
		expect(s.roundResult).toBeNull();
	});

	it('GUESS_RESULT flips guessAccepted', () => {
		const s = applyServerMessage(initialState(), { type: ServerMsg.GUESS_RESULT, accepted: true });
		expect(s.guessAccepted).toBe(true);
	});

	it('CHAT appends and caps at 50 entries', () => {
		let s = initialState();
		for (let i = 0; i < 60; i++) {
			s = applyServerMessage(s, { type: ServerMsg.CHAT, kind: 'msg', name: 'A', text: `m${i}` });
		}
		expect(s.chat).toHaveLength(50);
		expect(s.chat.at(-1)?.text).toBe('m59');
		expect(s.chat[0].text).toBe('m10');
	});

	it('CHAT_HISTORY replaces the log', () => {
		const start = applyServerMessage(initialState(), { type: ServerMsg.CHAT, kind: 'msg', name: 'A', text: 'old' });
		const s = applyServerMessage(start, {
			type: ServerMsg.CHAT_HISTORY,
			entries: [{ kind: 'msg', name: 'B', text: 'new' }]
		});
		expect(s.chat).toHaveLength(1);
		expect(s.chat[0].text).toBe('new');
	});

	it('ROOM_EXISTS and ERROR are recorded', () => {
		const a = applyServerMessage(initialState(), { type: ServerMsg.ROOM_EXISTS, code: 'WXYZ', exists: false });
		expect(a.roomCheck).toEqual({ code: 'WXYZ', exists: false });
		const b = applyServerMessage(initialState(), { type: ServerMsg.ERROR, message: 'boom' });
		expect(b.error).toBe('boom');
	});

	it('is pure — does not mutate the input state', () => {
		const start = initialState();
		const frozen = Object.freeze(start);
		expect(() => applyServerMessage(frozen, { type: ServerMsg.GUESS_RESULT, accepted: true })).not.toThrow();
	});

	it('ignores unknown message types', () => {
		const start = { ...initialState(), playerId: 'p1' };
		expect(applyServerMessage(start, { type: 'nonsense' })).toBe(start);
	});
});
