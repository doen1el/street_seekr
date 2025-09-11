import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import type { RecordModel } from 'pocketbase';
import { getOrCreatePlayer } from '$lib/server/helper';
import {
	calculateDistance,
	generateRandomPointsForChallenge,
	handleUpdatePolygon
} from './mapActions';
import { m } from '$lib/paraglide/messages.js';

const joinLobbySchema = z.object({
	username: z.string().min(1, m.name_needs_at_least_1_character()).max(30)
});

export const load: PageServerLoad = async ({ locals, cookies, params }) => {
	const gameCode = params.id;
	let game: RecordModel;

	try {
		game = await locals.pb.collection('games').getFirstListItem(`code="${gameCode}"`, {
			expand: 'players,admin,ready_players,messages.player'
		});
	} catch (err) {
		throw error(404, 'Game not found');
	}

	if (game.admin && !game.ready_players?.includes(game.admin)) {
		const newReadyPlayers = [...(game.ready_players || []), game.admin];
		game = await locals.pb.collection('games').update(
			game.id,
			{ ready_players: newReadyPlayers },
			{
				expand: 'players,admin,ready_players,messages.player'
			}
		);
	}

	const playerId = cookies.get('player_id');
	let currentPlayer: RecordModel | null = null;
	let isPlayerInGame = false;

	if (playerId) {
		try {
			currentPlayer = await locals.pb.collection('players').getOne(playerId);
			isPlayerInGame = game.players?.includes(playerId);
		} catch (_) {
			cookies.delete('player_id', { path: '/' });
		}
	}

	const form = await superValidate(zod(joinLobbySchema));
	const serverNow = Date.now();

	return { game, currentPlayer, isPlayerInGame, form, serverNow };
};

export const actions: Actions = {
	join: async ({ request, locals, cookies, params }) => {
		const form = await superValidate(request, zod(joinLobbySchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		let game: RecordModel;
		try {
			game = await locals.pb.collection('games').getFirstListItem(`code="${params.id}"`);
		} catch (err) {
			return fail(404, { form, message: 'Game does not exist anymore' });
		}

		const player = await getOrCreatePlayer(locals, cookies, form.data.username);

		await cleanupPlayerOtherGames(locals, player.id, game.id);

		if (!game.players?.includes(player.id)) {
			const newPlayers = [...(game.players || []), player.id];
			await locals.pb.collection('games').update(game.id, { players: newPlayers });
		}

		await locals.pb.collection('players').update(player.id, { current_game: game.id });

		return { form };
	},

	updatePolygon: async ({ request }) => {
		return await handleUpdatePolygon(request);
	},

	updateGameSettings: async ({ request, locals, cookies, params }) => {
		const playerId = cookies.get('player_id');
		const formData = await request.formData();
		const game = await locals.pb.collection('games').getFirstListItem(`code="${params.id}"`);

		if (game.admin !== playerId)
			return fail(403, { message: 'Only an admin can change game settings' });

		await locals.pb.collection('games').update(game.id, {
			maxRounds: Number(formData.get('maxRounds')),
			timeLimit: Number(formData.get('timeLimit')),
			private: formData.get('private') === 'true',
			graceDistance: Number(formData.get('graceDistance')),
			fallOfRate: Number(formData.get('fallOfRate')),
			maxPoints: Number(formData.get('maxPoints')),
			density: Number(formData.get('density')),
			polygon: JSON.parse((formData.get('polygon') as string) || 'null'),
			locationStrings: JSON.parse((formData.get('locationStrings') as string) || '[]')
		});
		return { success: true };
	},

	toggleReady: async ({ locals, cookies, params }) => {
		const playerId = cookies.get('player_id');
		if (!playerId) return fail(401, { message: 'Not logged in' });

		const game = await locals.pb.collection('games').getFirstListItem(`code="${params.id}"`);

		if (playerId === game.admin) {
			return { success: true, message: 'Admin is always ready.' };
		}

		const readyPlayers = game.ready_players || [];

		if (readyPlayers.includes(playerId)) {
			const newReadyPlayers = readyPlayers.filter((id: string) => id !== playerId);
			await locals.pb.collection('games').update(game.id, { ready_players: newReadyPlayers });
		} else {
			const newReadyPlayers = [...readyPlayers, playerId];
			await locals.pb.collection('games').update(game.id, { ready_players: newReadyPlayers });
		}
		return { success: true };
	},

	leaveGame: async ({ locals, cookies, params }) => {
		const playerId = cookies.get('player_id');
		if (!playerId) {
			throw redirect(303, '/');
		}

		let game: RecordModel;
		try {
			game = await locals.pb.collection('games').getFirstListItem(`code="${params.id}"`);
		} catch (err) {
			throw redirect(303, '/');
		}

		const newPlayers = (game.players || []).filter((id: string) => id !== playerId);
		const newReadyPlayers = (game.ready_players || []).filter((id: string) => id !== playerId);

		if (game.admin === playerId) {
			if (newPlayers.length > 0) {
				const newAdminId = newPlayers[Math.floor(Math.random() * newPlayers.length)];
				await locals.pb.collection('games').update(game.id, {
					players: newPlayers,
					ready_players: newReadyPlayers,
					admin: newAdminId
				});
			} else {
				await locals.pb.collection('games').delete(game.id);
			}
		} else {
			await locals.pb.collection('games').update(game.id, {
				players: newPlayers,
				ready_players: newReadyPlayers
			});
		}

		cookies.delete('player_id', { path: '/' });
		throw redirect(303, '/');
	},

	startGame: async ({ locals, cookies, params }) => {
		const playerId = cookies.get('player_id');
		const game = await locals.pb.collection('games').getFirstListItem(`code="${params.id}"`);

		if (game.admin !== playerId) {
			return fail(403, { message: 'Only an admin can start a game' });
		}
		if (game.players.length !== game.ready_players.length) {
			return fail(400, { message: 'Not all players are ready yet' });
		}

		try {
			await locals.pb.collection('games').update(game.id, {
				is_generating_challenge: true,
				generation_found: 0,
				generation_target: game.maxRounds
			});

			const roundData = await generateRandomPointsForChallenge(
				game.polygon,
				game.maxRounds,
				async (found) => {
					await locals.pb.collection('games').update(game.id, {
						generation_found: found
					});
				}
			);

			if (roundData.length < game.maxRounds) {
				await locals.pb.collection('games').update(game.id, {
					is_generating_challenge: false,
					generation_found: 0
				});
				return fail(400, {
					message: `Couldnt find enough imageId's (${roundData.length}/${game.maxRounds}) in the selection.`
				});
			}

			await Promise.all(
				(game.players || []).map((id: string) =>
					locals.pb.collection('players').update(id, { totalPoints: 0, lastRoundPoints: 0 })
				)
			);

			const guesses = await locals.pb.collection('guesses').getFullList({
				filter: `game="${game.id}"`
			});

			await Promise.all(guesses.map((guess) => locals.pb.collection('guesses').delete(guess.id)));

			const deadline = new Date(Date.now() + game.timeLimit * 1000).toISOString();

			await locals.pb.collection('games').update(game.id, {
				challenge: { rounds: roundData },
				status: 'playing',
				currentRound: 1,
				is_generating_challenge: false,
				generation_found: roundData.length,
				ready_players: game.admin ? [game.admin] : [],
				round_deadline_at: deadline
			});

			return { success: true, message: 'Game is starting' };
		} catch (err) {
			await locals.pb.collection('games').update(game.id, {
				is_generating_challenge: false
			});
			console.error('Error creating a challenge', err);
			return fail(500, { message: 'Error creating a challenge' });
		}
	},

	submitGuess: async ({ request, locals, cookies, params }) => {
		const playerId = cookies.get('player_id');
		if (!playerId) return fail(401, { message: 'Not logged in' });

		const game = await locals.pb.collection('games').getFirstListItem(`code="${params.id}"`);
		const formData = await request.formData();
		const guessLocation = JSON.parse((formData.get('location') as string) || 'null');

		const currentRoundData = game.challenge.rounds[game.currentRound - 1];
		const correctLocation = currentRoundData.location;

		if (game.round_deadline_at) {
			const deadlineMs = new Date(game.round_deadline_at).getTime();
			if (Date.now() > deadlineMs) {
				return fail(400, { message: 'Round timed out' });
			}
		}

		let points = 0;
		if (guessLocation) {
			const distance = calculateDistance(
				guessLocation[0],
				guessLocation[1],
				correctLocation[1],
				correctLocation[0]
			);

			const graceDistance = game.graceDistance * 1000;
			const falloffMeters = game.fallOfRate * 1000;
			if (distance <= graceDistance) {
				points = game.maxPoints;
			} else {
				const beyond = distance - graceDistance;
				points = Math.max(0, Math.round(game.maxPoints * Math.exp(-beyond / falloffMeters)));
			}
		}

		await locals.pb.collection('guesses').create({
			game: game.id,
			player: playerId,
			round: game.currentRound,
			location: guessLocation,
			points: points
		});

		const player = await locals.pb.collection('players').getOne(playerId);
		await locals.pb.collection('players').update(playerId, {
			totalPoints: player.totalPoints + points,
			lastRoundPoints: points
		});

		const guessesForRound = await locals.pb.collection('guesses').getFullList({
			filter: `game.id = "${game.id}" && round = ${game.currentRound}`
		});

		if (guessesForRound.length === game.players.length) {
			await locals.pb.collection('games').update(game.id, { status: 'summary' });
		}

		return { success: true };
	},

	nextRound: async ({ locals, cookies, params }) => {
		const playerId = cookies.get('player_id');
		const game = await locals.pb.collection('games').getFirstListItem(`code="${params.id}"`);

		if (game.admin !== playerId)
			return fail(403, { message: 'Only an admin can procced with the next round' });

		if (game.currentRound >= game.maxRounds) {
			await locals.pb.collection('games').update(game.id, { status: 'lobby' });
		} else {
			const deadline = new Date(Date.now() + game.timeLimit * 1000).toISOString();
			await locals.pb.collection('games').update(game.id, {
				status: 'playing',
				currentRound: game.currentRound + 1,
				round_deadline_at: deadline
			});
		}

		return { success: true };
	},

	kickPlayer: async ({ locals, params, request, cookies }) => {
		const form = await request.formData();
		const targetPlayerId = String(form.get('playerId') || '');
		if (!targetPlayerId) return fail(400, { error: 'missing playerId' });

		const actingPlayerId = cookies.get('player_id');
		if (!actingPlayerId) return fail(401, { error: 'not logged in' });

		const gameCode = params.id;
		const game = await locals.pb
			.collection('games')
			.getFirstListItem(`code="${gameCode}"`, { expand: 'players,ready_players' });

		if (game.admin !== actingPlayerId) {
			return fail(403, { error: 'not admin' });
		}
		if (game.status !== 'lobby') {
			return fail(400, { error: 'cannot kick after game start' });
		}
		if (targetPlayerId === game.admin) {
			return fail(400, { error: 'cannot kick admin' });
		}
		if (!game.players?.includes(targetPlayerId)) {
			return fail(404, { error: 'player_not_in_game' });
		}

		try {
			await locals.pb.collection('games').update(game.id, {
				'players-': targetPlayerId,
				'ready_players-': targetPlayerId
			});
			try {
				await locals.pb.collection('players').update(targetPlayerId, {
					current_game: null
				});
			} catch (_) {}
			return { success: true };
		} catch (e) {
			return fail(500, { error: 'kick_failed' });
		}
	}
};

async function cleanupPlayerOtherGames(locals: any, playerId: string, keepGameId: string) {
	try {
		const otherGames = await locals.pb.collection('games').getFullList({
			filter: `players ?~ "${playerId}" && id != "${keepGameId}"`
		});

		for (const g of otherGames) {
			const newPlayers = (g.players || []).filter((id: string) => id !== playerId);
			const newReady = (g.ready_players || []).filter((id: string) => id !== playerId);

			if (g.admin === playerId) {
				if (newPlayers.length > 0) {
					const newAdminId = newPlayers[Math.floor(Math.random() * newPlayers.length)];
					await locals.pb.collection('games').update(g.id, {
						players: newPlayers,
						ready_players: newReady,
						admin: newAdminId
					});
				} else {
					try {
						await locals.pb.collection('games').delete(g.id);
					} catch {}
				}
			} else {
				await locals.pb.collection('games').update(g.id, {
					players: newPlayers,
					ready_players: newReady
				});
			}
		}

		const oldGuesses = await locals.pb.collection('guesses').getFullList({
			filter: `player="${playerId}" && game != "${keepGameId}"`
		});
		for (const gu of oldGuesses) {
			try {
				await locals.pb.collection('guesses').delete(gu.id);
			} catch {}
		}

		try {
			const oldMessages = await locals.pb.collection('messages').getFullList({
				filter: `player="${playerId}" && game != "${keepGameId}"`
			});
			for (const msg of oldMessages) {
				try {
					await locals.pb.collection('messages').delete(msg.id);
				} catch {}
			}
		} catch {}
	} catch (e) {
		console.warn('[cleanupPlayerOtherGames] failed', e);
	}
}
