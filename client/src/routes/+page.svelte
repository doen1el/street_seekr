<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { LogIn, X } from 'lucide-svelte';
	import { game, getLastRoom } from '$lib/ws.svelte';
	import { profile } from '$lib/profile.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import Avatar from '$lib/components/play/Avatar.svelte';
	import SoloModal from '$lib/components/play/SoloModal.svelte';

	let name = $state(profile.name);
	let code = $state((page.url.searchParams.get('join') ?? '').toUpperCase());
	let busy = $state(false);

	let lastRoom = $state<string | null>(null);
	onMount(() => (lastRoom = getLastRoom()));

	async function rejoin() {
		if (!lastRoom || busy) return;
		busy = true;
		game.dismissError();
		if (name.trim()) profile.set(name.trim());
		try {
			await game.join(lastRoom, profile.value);
			await goto(`/${lastRoom}`);
		} catch {
			lastRoom = null;
			busy = false;
		}
	}

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
	{#if lastRoom}
		<div
			class="flex w-full max-w-md items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 shadow"
		>
			<span class="flex-1 text-sm">
				{m.rejoin_your_game()} <span class="font-mono font-bold tracking-wider">{lastRoom}</span>
			</span>
			<button class="btn btn-sm btn-primary" disabled={busy} onclick={rejoin}>
				<LogIn class="size-4" /> {m.rejoin()}
			</button>
			<button
				class="btn btn-circle btn-ghost btn-sm"
				aria-label={m.dismiss()}
				onclick={() => (lastRoom = null)}
			>
				<X class="size-4" />
			</button>
		</div>
	{/if}

	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<div class="card-body gap-4">
			<div class="flex items-center gap-3">
				<button
					type="button"
					class="shrink-0 rounded-full ring-2 ring-base-300 ring-offset-2 ring-offset-base-100 transition hover:ring-primary"
					onclick={() => profile.nextAvatar()}
					title={m.change_avatar()}
					aria-label={m.change_avatar()}
				>
					<Avatar name={name || 'you'} style={profile.avatar} size={56} />
				</button>
				<input
					class="input input-bordered input-lg w-full"
					maxlength="20"
					placeholder={m.pick_a_name()}
					bind:value={name}
				/>
			</div>

			<button class="btn btn-primary btn-lg" disabled={!canPlay || busy} onclick={create}>
				{m.create_a_room()}
			</button>

			<div class="divider my-0 text-xs">{m.or_join()}</div>

			<div>
				<div class="join w-full">
					<input
						class="input input-lg join-item input-bordered w-full uppercase"
						class:input-error={roomMissing}
						class:input-success={roomExists}
						maxlength="4"
						placeholder={m.room_code()}
						bind:value={code}
						oninput={(e) => (code = (e.currentTarget as HTMLInputElement).value.toUpperCase())}
					/>
					<button class="btn btn-lg join-item btn-secondary" disabled={!canJoin} onclick={join}>{m.join()}</button>
				</div>
			</div>

			<div class="divider my-0 text-xs">{m.or_word()}</div>

			<SoloModal {name} disabled={!canPlay} />

			{#if game.state.error}
				<div class="alert alert-error py-2 text-sm">{game.state.error}</div>
			{/if}
		</div>
	</div>
</div>
