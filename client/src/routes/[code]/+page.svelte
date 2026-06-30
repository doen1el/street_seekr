<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { game } from '$lib/ws.svelte';
	import { profile } from '$lib/profile.svelte';
	import Lobby from '$lib/components/play/Lobby.svelte';
	import GameView from '$lib/components/play/GameView.svelte';
	import RoundSummary from '$lib/components/play/RoundSummary.svelte';
	import GameOver from '$lib/components/play/GameOver.svelte';

	const code = $derived((page.params.code ?? '').toUpperCase());
	let joining = $state(true);

	onMount(async () => {
		if (game.state.room?.code === code) {
			joining = false;
			return;
		}
		if (!profile.name) {
			goto(`/?join=${code}`);
			return;
		}
		try {
			await game.join(code, profile.value);
		} catch {
		} finally {
			joining = false;
		}
	});

	$effect(() => {
		if (!joining && !game.state.room) goto('/');
	});

	const room = $derived(game.state.room);
	const gen = $derived(room?.generation ?? game.state.generation);
</script>

{#if game.state.gameOver}
	<GameOver />
{/if}

{#if game.reconnecting}
	<div class="alert alert-warning fixed top-2 left-1/2 z-50 w-auto -translate-x-1/2 py-1 text-sm shadow">
		Reconnecting…
	</div>
{/if}

{#if !room}
	<div class="grid min-h-screen place-items-center bg-base-200">
		<span class="loading loading-lg loading-spinner"></span>
	</div>
{:else if room.status === 'generating'}
	<div class="grid min-h-screen place-items-center bg-base-200">
		<div class="card bg-base-100 p-8 text-center shadow-xl">
			<h2 class="text-xl font-bold">Building the challenge…</h2>
			<p class="mt-2 opacity-70">
				Found {gen?.found ?? 0} / {gen?.target ?? room.maxRounds} locations
			</p>
			<progress
				class="progress progress-primary mt-4 w-64"
				value={gen?.found ?? 0}
				max={gen?.target ?? room.maxRounds}
			></progress>
		</div>
	</div>
{:else if room.status === 'playing' && game.state.round}
	<GameView />
{:else if room.status === 'summary' && game.state.roundResult}
	<RoundSummary />
{:else}
	<Lobby />
{/if}

{#if game.state.error && room}
	<div class="toast toast-end z-50">
		<div class="alert alert-error">
			<span>{game.state.error}</span>
			<button class="btn btn-ghost btn-xs" onclick={() => game.dismissError()}>✕</button>
		</div>
	</div>
{/if}
