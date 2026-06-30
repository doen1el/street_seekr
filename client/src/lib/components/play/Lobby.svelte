<script lang="ts">
	import { game } from '$lib/ws.svelte';
	import { resolvePolygon } from '$lib/geocode';
	import Avatar from './Avatar.svelte';

	const room = $derived(game.state.room!);
	const players = $derived(room.players);
	const me = $derived(players.find((p) => p.id === game.state.playerId));
	const isHost = $derived(!!me?.isHost);
	const allReady = $derived(players.length > 0 && players.every((p) => p.ready));

	let areaText = $state('');
	let areaInitialized = $state(false);
	let resolvingArea = $state(false);
	let chatText = $state('');

	$effect(() => {
		if (!areaInitialized && room) {
			areaText = (room.settings.locationStrings ?? []).join(', ');
			areaInitialized = true;
		}
	});

	const setNum = (field: string, value: string) => game.setSettings({ [field]: Number(value) });

	async function applyArea() {
		const names = areaText
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		resolvingArea = true;
		try {
			const polygon = await resolvePolygon(names);
			game.setSettings({ locationStrings: names, polygon });
		} finally {
			resolvingArea = false;
		}
	}

	function clearArea() {
		areaText = '';
		game.setSettings({ locationStrings: [], polygon: null });
	}

	function sendChat() {
		const t = chatText.trim();
		if (t) {
			game.say(t);
			chatText = '';
		}
	}
</script>

<div class="mx-auto grid w-full max-w-5xl gap-4 p-4 lg:grid-cols-[1fr_320px]">
	<div class="flex flex-col gap-4">
		<!-- Settings -->
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body gap-3">
				<h2 class="card-title">Settings</h2>
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
					{#each [['maxRounds', 'Rounds'], ['timeLimit', 'Time / round (s)'], ['maxPoints', 'Max points'], ['graceDistance', 'Grace (km)'], ['fallOfRate', 'Falloff (km)']] as [field, label] (field)}
						<label class="form-control">
							<span class="label-text text-xs">{label}</span>
							<input
								class="input input-sm input-bordered w-full"
								type="number"
								disabled={!isHost}
								value={(room.settings as Record<string, any>)[field]}
								onchange={(e) => setNum(field, (e.currentTarget as HTMLInputElement).value)}
							/>
						</label>
					{/each}
				</div>
			</div>
		</div>

		<!-- Area -->
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body gap-3">
				<h2 class="card-title">Area</h2>
				<p class="text-sm opacity-70">
					{room.settings.polygon
						? `Restricted to: ${(room.settings.locationStrings ?? []).join(', ') || 'custom area'}`
						: 'Global — anywhere with coverage.'}
				</p>
				{#if isHost}
					<div class="join w-full">
						<input
							class="input join-item input-sm input-bordered w-full"
							placeholder="e.g. Paris, Lyon"
							bind:value={areaText}
						/>
						<button class="btn join-item btn-sm btn-primary" onclick={applyArea} disabled={resolvingArea}>
							{resolvingArea ? '…' : 'Apply'}
						</button>
						<button class="btn join-item btn-sm" onclick={clearArea} disabled={resolvingArea}>Global</button>
					</div>
				{/if}
			</div>
		</div>

		<!-- Players -->
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body gap-2">
				<h2 class="card-title">Players ({players.length})</h2>
				<ul class="flex flex-col divide-y divide-base-200">
					{#each players as p (p.id)}
						<li class="flex items-center gap-3 py-2">
							<Avatar name={p.name} style={p.avatar} size={36} />
							<span class="font-medium" class:opacity-50={!p.connected}>{p.name}</span>
							{#if p.isHost}<span class="badge badge-sm badge-primary">host</span>{/if}
							{#if !p.connected}<span class="badge badge-ghost badge-sm">offline</span>{/if}
							<span class="ml-auto flex items-center gap-2">
								{#if p.isHost || p.ready}
									<span class="badge badge-success badge-sm">ready</span>
								{:else}
									<span class="badge badge-ghost badge-sm">not ready</span>
								{/if}
								{#if isHost && !p.isHost}
									<button class="btn btn-ghost btn-xs" onclick={() => game.kick(p.id)}>kick</button>
								{/if}
							</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>

	<!-- Sidebar: chat + actions -->
	<div class="flex flex-col gap-4">
		<div class="card flex-1 bg-base-100 shadow-xl">
			<div class="card-body gap-2">
				<h2 class="card-title text-base">Chat</h2>
				<div class="flex h-48 flex-col gap-1 overflow-y-auto text-sm lg:h-72">
					{#each game.state.chat as c (c.id)}
						<div><span class="font-semibold">{c.name}:</span> {c.text}</div>
					{:else}
						<div class="opacity-50">No messages yet.</div>
					{/each}
				</div>
				<div class="join">
					<input
						class="input join-item input-sm input-bordered w-full"
						placeholder="Say something…"
						bind:value={chatText}
						onkeydown={(e) => e.key === 'Enter' && sendChat()}
					/>
					<button class="btn join-item btn-sm" onclick={sendChat}>Send</button>
				</div>
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body gap-2">
				{#if isHost}
					<button class="btn btn-primary" disabled={!allReady} onclick={() => game.start()}>
						Start game
					</button>
					{#if !allReady}<p class="text-center text-xs opacity-60">Waiting for players to ready up.</p>{/if}
				{:else}
					<button
						class="btn"
						class:btn-success={me?.ready}
						onclick={() => game.setReady(!me?.ready)}
					>
						{me?.ready ? "Ready ✓ (tap to unready)" : "I'm ready"}
					</button>
				{/if}
				<button class="btn btn-ghost btn-sm" onclick={() => game.leave()}>Leave room</button>
			</div>
		</div>
	</div>
</div>
