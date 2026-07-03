<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { game } from '$lib/ws.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { profile } from '$lib/profile.svelte';
	import Avatar from '$lib/components/play/Avatar.svelte';
	import Lobby from '$lib/components/play/Lobby.svelte';
	import GameView from '$lib/components/play/GameView.svelte';
	import RoundSummary from '$lib/components/play/RoundSummary.svelte';
	import GameOver from '$lib/components/play/GameOver.svelte';

	const code = $derived((page.params.code ?? '').toUpperCase());
	let joining = $state(true);
	let needName = $state(false);
	let joinName = $state(profile.name);
	let busy = $state(false);

	onMount(async () => {
		if (game.state.room?.code === code) {
			joining = false;
			return;
		}
		if (profile.name) {
			try {
				await game.join(code, profile.value);
			} catch {
			} finally {
				joining = false;
			}
			return;
		}

		joining = false;
		needName = true;
		game.checkRoom(code).catch(() => {});
	});

	const roomCheck = $derived(game.state.roomCheck?.code === code ? game.state.roomCheck : null);
	const roomMissing = $derived(needName && roomCheck?.exists === false);

	async function submitJoin() {
		const n = joinName.trim();
		if (!n || busy) return;
		busy = true;
		game.dismissError();
		profile.set(n);
		try {
			await game.join(code, profile.value);
		} catch {
			busy = false;
		}
	}

	$effect(() => {
		if (busy && game.state.room?.code === code) {
			busy = false;
			needName = false;
		}
	});

	$effect(() => {
		if (!joining && !needName && !busy && !game.state.room) goto('/');
	});

	const room = $derived(game.state.room);

	let warmed = false;
	$effect(() => {
		if (!warmed && (room?.status === 'generating' || room?.status === 'playing')) {
			warmed = true;
			import('@panoramax/web-viewer/build/photoviewer.js').catch(() => {});
		}
	});
</script>

{#if game.reconnecting}
	<div class="alert alert-warning fixed top-2 left-1/2 z-50 w-auto -translate-x-1/2 py-1 text-sm shadow">
		{m.reconnecting()}
	</div>
{/if}

{#if game.state.gameOver}
	<GameOver />
{:else if !room}
	{#if !needName}
		<div class="grid min-h-screen place-items-center bg-base-200">
			<span class="loading loading-lg loading-spinner"></span>
		</div>
	{/if}
{:else if room.status === 'generating'}
	<div class="relative">
		<Lobby />
		<div class="fixed inset-0 z-[3000] grid place-items-center bg-black/50 px-4 backdrop-blur-sm">
			<div class="flex flex-col items-center gap-4 text-white">
				<span class="loading loading-spinner loading-lg"></span>
				<h2 class="text-2xl font-bold">{m.creating_game()}</h2>
				<progress class="progress h-2 w-64 progress-success"></progress>
			</div>
		</div>
	</div>
{:else if room.status === 'summary' && game.state.roundResult}
	<RoundSummary />
{:else if game.state.round}
	<GameView />
{:else}
	<Lobby />
{/if}

<!-- Join gate: pick a name + avatar over a blurred backdrop when opening a room link -->
{#if needName}
	<div class="fixed inset-0 z-[3000] grid place-items-center bg-base-300/40 p-4 backdrop-blur-md">
		<div class="card w-full max-w-sm bg-base-100 shadow-2xl">
			<div class="card-body gap-4">
				{#if roomMissing}
					<h2 class="text-center text-lg font-bold">{m.room_not_found()}</h2>
					<p class="text-center text-sm opacity-70">
						{m.room_gone({ code })}
					</p>
					<a href="/" class="btn btn-block btn-primary">{m.back_to_start()}</a>
				{:else}
					<h2 class="text-center text-lg font-bold">
						{m.join_room()} <span class="font-mono tracking-widest">{code}</span>
					</h2>
					<div class="flex items-center gap-3">
						<button
							type="button"
							class="shrink-0 rounded-full ring-2 ring-base-300 ring-offset-2 ring-offset-base-100 transition hover:ring-primary"
							onclick={() => profile.nextAvatar()}
							title={m.change_avatar()}
							aria-label={m.change_avatar()}
						>
							<Avatar name={joinName || 'you'} style={profile.avatar} size={56} />
						</button>
						<input
							class="input input-bordered input-lg w-full"
							maxlength="20"
							placeholder={m.pick_a_name()}
							bind:value={joinName}
							onkeydown={(e) => e.key === 'Enter' && submitJoin()}
						/>
					</div>
					<button
						class="btn btn-block btn-primary btn-lg"
						disabled={!joinName.trim() || busy}
						onclick={submitJoin}
					>
						{#if busy}<span class="loading loading-spinner loading-sm"></span>{/if}
						{m.join_game_action()}
					</button>
					{#if game.state.error}
						<div class="alert alert-error py-2 text-sm">{game.state.error}</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>
{/if}

{#if game.state.error && room}
	<div class="toast toast-end z-50">
		<div class="alert alert-error">
			<span>{game.state.error}</span>
			<button class="btn btn-ghost btn-xs" onclick={() => game.dismissError()}>✕</button>
		</div>
	</div>
{/if}
