import type { Cookies } from '@sveltejs/kit';
import type { RecordModel } from 'pocketbase';

export async function getOrCreatePlayer(
	locals: App.Locals,
	cookies: Cookies,
	username: string
): Promise<RecordModel> {
	const playerId = cookies.get('player_id');

	if (playerId) {
		try {
			const player = await locals.pb.collection('players').getOne(playerId);
			if (player.username !== username) {
				return await locals.pb.collection('players').update(player.id, { username });
			}
			return player;
		} catch (_) {
			cookies.delete('player_id', { path: '/' });
		}
	}

	const newPlayer = await locals.pb.collection('players').create({
		username
	});

	cookies.set('player_id', newPlayer.id, {
		path: '/',
		maxAge: 60 * 60 * 24 * 365
	});

	return newPlayer;
}
