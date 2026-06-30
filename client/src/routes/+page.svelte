<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { game } from '$lib/ws.svelte';
	import { profile } from '$lib/profile.svelte';
	import Avatar from '$lib/components/play/Avatar.svelte';
	import Leaderboard from '$lib/components/play/Leaderboard.svelte';

	let name = $state(profile.name);
	let code = $state((page.url.searchParams.get('join') ?? '').toUpperCase());
	let busy = $state(false);

	const canPlay = $derived(name.trim().length > 0);

	async function create() {
		if (!canPlay || busy) return;
		busy = true;
		game.dismissError();
		profile.set(name.trim());
		try {
			const c = await game.create(profile.value);
			await goto(`/${c}`);
		} catch {
			busy = false;
		}
	}

	async function join() {
		const c = code.trim().toUpperCase();
		if (!canPlay || !c || busy) return;
		busy = true;
		game.dismissError();
		profile.set(name.trim());
		try {
			await game.join(c, profile.value);
			await goto(`/${c}`);
		} catch {
			busy = false;
		}
	}
</script>

<div class="flex min-h-screen flex-col items-center justify-center gap-6 bg-base-200 p-4">
	<h1 class="text-3xl font-bold">StreetSeekr</h1>

	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<div class="card-body gap-4">
			<div class="flex items-center gap-4">
				<button class="shrink-0" onclick={() => profile.nextAvatar()} title="Change avatar">
					<Avatar name={name || 'you'} style={profile.avatar} size={64} />
				</button>
				<label class="form-control w-full">
					<span class="label-text">Your name</span>
					<input
						class="input input-bordered w-full"
						maxlength="20"
						placeholder="Pick a name"
						bind:value={name}
					/>
				</label>
			</div>

			<button class="btn btn-primary" disabled={!canPlay || busy} onclick={create}>
				Create a room
			</button>

			<div class="divider text-xs">or join</div>

			<div class="join w-full">
				<input
					class="input join-item input-bordered w-full uppercase"
					maxlength="8"
					placeholder="ROOM CODE"
					bind:value={code}
					oninput={(e) => (code = (e.currentTarget as HTMLInputElement).value.toUpperCase())}
				/>
				<button class="btn join-item btn-secondary" disabled={!canPlay || !code.trim() || busy} onclick={join}>
					Join
				</button>
			</div>

			{#if game.state.error}
				<div class="alert alert-error py-2 text-sm">{game.state.error}</div>
			{/if}
		</div>
	</div>

	<Leaderboard />
</div>
