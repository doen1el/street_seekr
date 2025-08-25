<script lang="ts">
	import ActiveGames from '../components/ActiveGames.svelte';
	import JoinCreateCard from '../components/JoinCreateCard.svelte';
	import type { PageData } from './$types';
	import { m } from '$lib/paraglide/messages.js';
	import { onMount } from 'svelte';
	import { pb } from '$lib/client/pocketbase';

	export let data: PageData;

	let liveUsername = data.joinForm?.data.username || '';

	let games = [...data.games];

     function isVisible(record: any) {
        return record.status === 'lobby' && record.private === false;
    }

    function upsertGame(record: any) {
        if (isVisible(record)) {
            const idx = games.findIndex(g => g.id === record.id);
            if (idx === -1) {
                games = [record, ...games];
            } else {
                games = [...games.slice(0, idx), record, ...games.slice(idx + 1)];
            }
        } else {
            const idx = games.findIndex(g => g.id === record.id);
            if (idx !== -1) {
                games = [...games.slice(0, idx), ...games.slice(idx + 1)];
            }
        }
    }

    function removeGame(id: string) {
        const idx = games.findIndex(g => g.id === id);
        if (idx !== -1) {
            games = [...games.slice(0, idx), ...games.slice(idx + 1)];
        }
    }

    onMount(() => {
        const subPromise = pb.collection('games').subscribe('*', (e) => {
            if (e.action === 'create' || e.action === 'update') {
                upsertGame(e.record);
            } else if (e.action === 'delete') {
                removeGame(e.record.id);
            }
        });

        return () => {
            subPromise.then(unsub => unsub());
        };
    });
</script>

<div class="flex flex-grow flex-col items-center justify-center gap-10 bg-base-200 p-4">
	<JoinCreateCard {data} on:usernameChange={(e) => (liveUsername = e.detail)}/>
	{#if data.currentGame}
		<div class="card w-full max-w-2xl bg-base-100 text-base-content shadow-xl">
			<div class="card-body items-center text-center">
				<h2 class="card-title">{m.you_are_still_in_a_game()}</h2>
				<p>
				{m.you_are_still_in_a_game_description({name: data.currentGame.name})}
				</p>
				<div class="card-actions justify-end">
					<a href="/{data.currentGame.code}" class="btn">{m.join_game()}</a>
				</div>
			</div>
		</div>
	{/if}
	<ActiveGames data={{ ...data, games }} username={liveUsername} />
</div>
