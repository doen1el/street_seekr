import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, type Cookies } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import type { RecordModel } from 'pocketbase';
import { getOrCreatePlayer } from '$lib/server/helper';
import { m } from '$lib/paraglide/messages.js';

const joinGameSchema = z.object({
	username: z.string().min(1, m.name_needs_at_least_1_character()).max(30),
	code: z.string().length(6, m.code_needs_to_be_6_characters())
});

const createGameSchema = z.object({
	username: z.string().min(1, m.name_needs_at_least_1_character()).max(30)
});

const joinActiveGameSchema = z.object({
	username: z.string().min(1, m.name_needs_at_least_1_character()).max(30),
	code: z.string().length(6, m.code_needs_to_be_6_characters())
});

export const load = async ({ locals, cookies }) => {
	let playerUsername = '';
	let currentGame: RecordModel | null = null;
	const playerId = cookies.get('player_id');

	if (playerId) {
		try {
			const player = await locals.pb.collection('players').getFirstListItem(`id="${playerId}"`);
			playerUsername = player.username;
			if (player.current_game) {
				try {
					currentGame = await locals.pb
						.collection('games')
						.getFirstListItem(`id = "${player.current_game}"`);
				} catch (gameError) {
					console.warn(
						`Could not find active game ${player.current_game} for player ${player.id}. Clearing it.`
					);
					await locals.pb.collection('players').update(player.id, { current_game: null });
				}
			}
		} catch (_) {
			console.warn('Player id is invalid or player not found.');
			cookies.delete('player_id', { path: '/' });
		}
	}

	const validationOptions = { errors: false };

	const joinForm = await superValidate(
		{ username: playerUsername },
		zod(joinGameSchema),
		validationOptions
	);
	const createForm = await superValidate(
		{ username: playerUsername },
		zod(createGameSchema),
		validationOptions
	);
	const joinActiveForm = await superValidate(
		{ username: playerUsername },
		zod(joinActiveGameSchema),
		validationOptions
	);

	const games = await locals.pb.collection('games').getFullList({
		sort: '-created',
		filter: 'status = "lobby" && private = false'
	});

	return { joinForm, createForm, joinActiveForm, games, currentGame };
};

export const actions = {
	join: async ({ request, locals, cookies }) => {
		const form = await superValidate(request, zod(joinGameSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const player = await getOrCreatePlayer(locals, cookies, form.data.username);

		let game: RecordModel;
		try {
			game = await locals.pb.collection('games').getFirstListItem(`code="${form.data.code}"`);
		} catch (err) {
			console.error(err);
			return fail(404, { form });
		}

		await cleanupPlayerOtherGames(locals, player.id, game.id);

		if (!game.players?.includes(player.id)) {
			try {
				await locals.pb.collection('games').update(game.id, { 'players+': player.id });
			} catch (e) {
				console.error('Failed to add player to game', e);
				return fail(500, { form });
			}
		}

		await locals.pb.collection('players').update(player.id, {
			current_game: game.id
		});

		throw redirect(303, `/${game.code}`);
	},

	create: async ({ request, locals, cookies }) => {
		const form = await superValidate(request, zod(createGameSchema));
		if (!form.valid) return fail(400, { form });

		const player = await getOrCreatePlayer(locals, cookies, form.data.username);

		let newGame: RecordModel;

		try {
			newGame = await locals.pb.collection('games').create({
				name: `${form.data.username}'s ${m.game()}`,
				players: [player.id],
				code: nanoid(6)
					.replace(/[^a-zA-Z0-9]/g, '')
					.toUpperCase(),
				admin: player.id,
				currentRound: 0,
				graceDistance: 10,
				fallOfRate: 400,
				density: 50,
				maxRounds: 3,
				timeLimit: 180,
				status: 'lobby',
				maxPoints: 5000,
				private: true
			});
			await cleanupPlayerOtherGames(locals, player.id, newGame.id);
			await locals.pb.collection('players').update(player.id, {
				current_game: newGame.id
			});
		} catch (err: any) {
			console.error(err);
			return fail(500, { form });
		}
		throw redirect(303, `/${newGame.code}`);
	},

	joinActive: async ({ request, locals, cookies }) => {
		const form = await superValidate(request, zod(joinActiveGameSchema));
		if (!form.valid) return fail(400, { form });

		const player = await getOrCreatePlayer(locals, cookies, form.data.username);

		let game: RecordModel;
		try {
			game = await locals.pb.collection('games').getFirstListItem(`code="${form.data.code}"`);
		} catch (err) {
			console.error(err);
			return fail(404, { form });
		}

		await cleanupPlayerOtherGames(locals, player.id, game.id);

		if (!game.players?.includes(player.id)) {
			try {
				await locals.pb.collection('games').update(game.id, { 'players+': player.id });
			} catch {
				const newPlayers = [...(game.players || []), player.id];
				await locals.pb.collection('games').update(game.id, { players: newPlayers });
			}
		}

		await locals.pb.collection('players').update(player.id, {
			current_game: game.id
		});

		throw redirect(303, `/${game.code}`);
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
