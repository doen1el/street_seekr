<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Check } from 'lucide-svelte';
	import { game } from '$lib/ws.svelte';
	import { profile } from '$lib/profile.svelte';
	import Avatar from '$lib/components/play/Avatar.svelte';
	import Leaderboard from '$lib/components/play/Leaderboard.svelte';
	import SoloModal from '$lib/components/play/SoloModal.svelte';

	let name = $state(profile.name);
	let code = $state((page.url.searchParams.get('join') ?? '').toUpperCase());
	let busy = $state(false);

	const canPlay = $derived(name.trim().length > 0);
	const trimmedCode = $derived(code.trim().toUpperCase());

	$effect(() => {
		const c = trimmedCode;
		if (c.length < 3) return;
		const t = setTimeout(() => game.checkRoom(c).catch(() => {}), 300);
		return () => clearTimeout(t);
	});

	const roomCheck = $derived(
		game.state.roomCheck?.code === trimmedCode ? game.state.roomCheck : null
	);
	const roomExists = $derived(roomCheck?.exists === true);
	const roomMissing = $derived(trimmedCode.length >= 3 && roomCheck?.exists === false);
	const canJoin = $derived(canPlay && trimmedCode.length > 0 && roomExists && !busy);

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
		if (!canJoin) return;
		busy = true;
		game.dismissError();
		profile.set(name.trim());
		try {
			await game.join(trimmedCode, profile.value);
			await goto(`/${trimmedCode}`);
		} catch {
			busy = false;
		}
	}
</script>

<div class="flex h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-4 overflow-hidden p-4">
	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<div class="card-body gap-4">
			<div class="flex items-center gap-3">
				<button
					type="button"
					class="shrink-0 rounded-full ring-2 ring-base-300 ring-offset-2 ring-offset-base-100 transition hover:ring-primary"
					onclick={() => profile.nextAvatar()}
					title="Change avatar"
					aria-label="Change avatar"
				>
					<Avatar name={name || 'you'} style={profile.avatar} size={56} />
				</button>
				<input
					class="input input-bordered input-lg w-full"
					maxlength="20"
					placeholder="Pick a name"
					bind:value={name}
				/>
			</div>

			<button class="btn btn-primary btn-lg" disabled={!canPlay || busy} onclick={create}>
				Create a room
			</button>

			<div class="divider my-0 text-xs">or join</div>

			<div>
				<div class="join w-full">
					<input
						class="input input-lg join-item input-bordered w-full uppercase"
						class:input-error={roomMissing}
						maxlength="4"
						placeholder="ROOM CODE"
						bind:value={code}
						oninput={(e) => (code = (e.currentTarget as HTMLInputElement).value.toUpperCase())}
					/>
					<button class="btn btn-lg join-item btn-secondary" disabled={!canJoin} onclick={join}>Join</button>
				</div>
				{#if roomExists}
					<p class="mt-1 flex items-center gap-1 text-xs text-success">
						<Check class="size-3.5" /> Room found
					</p>
				{/if}
			</div>

			<div class="divider my-0 text-xs">or</div>

			<SoloModal {name} disabled={!canPlay} />

			{#if game.state.error}
				<div class="alert alert-error py-2 text-sm">{game.state.error}</div>
			{/if}
		</div>
	</div>

	<Leaderboard />
</div>
