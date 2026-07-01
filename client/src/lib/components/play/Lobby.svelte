<script lang="ts">
	import { onMount } from 'svelte';
	import { game } from '$lib/ws.svelte';
	import { resolvePolygon } from '$lib/geocode';
	import { DEFAULT_AVATAR } from '../../../../server/avatars.js';
	import {
		Crown,
		Check,
		Copy,
		Hourglass,
		X,
		Send,
		Pencil,
		Trash2,
		LogOut,
		Play
	} from 'lucide-svelte';
	import Avatar from './Avatar.svelte';
	import type { Settings } from '$lib/gameState';

	const room = $derived(game.state.room!);
	const players = $derived(room.players);
	const me = $derived(players.find((p) => p.id === game.state.playerId));
	const isHost = $derived(!!me?.isHost);
	const host = $derived(players.find((p) => p.isHost));
	const allReady = $derived(players.length > 0 && players.every((p) => p.isHost || p.ready));

	const numberFields: [keyof Settings, string][] = [
		['maxRounds', 'Rounds'],
		['timeLimit', 'Time (s)'],
		['maxPoints', 'Max Points'],
		['graceDistance', 'Tolerance (km)'],
		['fallOfRate', 'Falloff (km)']
	];

	const setNum = (field: string, value: string) => game.setSettings({ [field]: Number(value) });

	const avatarStyle = (playerId?: string) =>
		players.find((p) => p.id === playerId)?.avatar ?? DEFAULT_AVATAR;

	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout>;
	async function copyCode() {
		try {
			await navigator.clipboard.writeText(room.code);
			copied = true;
			clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copied = false), 1500);
		} catch {
		}
	}

	let areaText = $state('');
	let areaInitialized = $state(false);
	let resolvingArea = $state(false);

	$effect(() => {
		if (!areaInitialized && room) {
			areaText = (room.settings.locationStrings ?? []).join(', ');
			areaInitialized = true;
		}
	});

	async function applyArea() {
		if (!isHost) return;
		const names = areaText
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		if (!names.length) {
			game.setSettings({ locationStrings: [], polygon: null });
			return;
		}
		resolvingArea = true;
		try {
			const polygon = await resolvePolygon(names);
			game.setSettings({ locationStrings: names, polygon });
		} finally {
			resolvingArea = false;
		}
	}

	let chatText = $state('');
	let chatEl: HTMLDivElement;

	function sendChat() {
		const t = chatText.trim();
		if (t) {
			game.say(t);
			chatText = '';
		}
	}

	$effect(() => {
		void game.state.chat.length;
		if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
	});

	let mapEl: HTMLDivElement;
	let map: any = null;
	let L: any = null;
	let polyLayer: any = null;
	let drawLayer: any = null;
	let vertexGroup: any = null;

	let drawing = $state(false);
	let drawPts = $state<[number, number][]>([]); // [lat, lng]

	function renderSettingsPolygon() {
		if (!map || !L) return;
		if (polyLayer) {
			map.removeLayer(polyLayer);
			polyLayer = null;
		}
		const poly = room.settings.polygon as any;
		if (!poly) return;
		try {
			polyLayer = L.geoJSON(poly, {
				style: { color: '#047857', weight: 2, fillColor: '#10b981', fillOpacity: 0.25 }
			}).addTo(map);
			const b = polyLayer.getBounds();
			if (b.isValid()) map.fitBounds(b, { padding: [24, 24], maxZoom: 6 });
		} catch {
		}
	}

	function redrawDraw() {
		if (!map || !L) return;
		if (drawLayer) {
			map.removeLayer(drawLayer);
			drawLayer = null;
		}
		if (vertexGroup) {
			map.removeLayer(vertexGroup);
			vertexGroup = null;
		}
		if (!drawPts.length) return;

		const shape =
			drawPts.length >= 3
				? L.polygon(drawPts, {
						interactive: false,
						color: '#047857',
						weight: 2,
						fillColor: '#10b981',
						fillOpacity: 0.25
					})
				: L.polyline(drawPts, { interactive: false, color: '#047857', weight: 2, dashArray: '4 4' });
		drawLayer = shape.addTo(map);
		vertexGroup = L.layerGroup(
			drawPts.map((p) =>
				L.circleMarker(p, {
					interactive: false,
					radius: 4,
					color: '#047857',
					fillColor: '#ffffff',
					fillOpacity: 1,
					weight: 2
				})
			)
		).addTo(map);
	}

	function startDraw() {
		if (!isHost) return;
		drawing = true;
		drawPts = [];
		if (polyLayer) {
			map.removeLayer(polyLayer);
			polyLayer = null;
		}
		redrawDraw();
	}

	function cancelDraw() {
		drawing = false;
		drawPts = [];
		redrawDraw();
		renderSettingsPolygon();
	}

	function finishDraw() {
		if (drawPts.length < 3) return;
		const ring = drawPts.map(([lat, lng]) => [lng, lat]);
		ring.push(ring[0]);
		const polygon = {
			type: 'Feature',
			properties: {},
			geometry: { type: 'MultiPolygon', coordinates: [[ring]] }
		};
		drawing = false;
		drawPts = [];
		redrawDraw();
		areaText = '';
		game.setSettings({ locationStrings: [], polygon });
	}

	function clearArea() {
		drawing = false;
		drawPts = [];
		redrawDraw();
		if (polyLayer) {
			map.removeLayer(polyLayer);
			polyLayer = null;
		}
		areaText = '';
		game.setSettings({ locationStrings: [], polygon: null });
	}

	onMount(() => {
		let disposed = false;
		const onResize = () => map?.invalidateSize();
		(async () => {
			L = await import('leaflet');
			if (disposed) return;
			map = L.map(mapEl).setView([20, 0], 2);
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; OpenStreetMap'
			}).addTo(map);
			map.on('click', (e: any) => {
				if (!drawing) return;
				drawPts = [...drawPts, [e.latlng.lat, e.latlng.lng]];
				redrawDraw();
			});
			setTimeout(() => map?.invalidateSize(), 0);
			setTimeout(() => map?.invalidateSize(), 250);
			renderSettingsPolygon();
			window.addEventListener('resize', onResize);
		})();

		return () => {
			disposed = true;
			window.removeEventListener('resize', onResize);
			if (map) map.remove();
			map = null;
		};
	});

	$effect(() => {
		void (room.settings.polygon as any);
		if (map && !drawing) renderSettingsPolygon();
	});
</script>

<div
	class="mx-auto flex h-[calc(100dvh-4rem)] w-full flex-col gap-3 overflow-hidden p-4 lg:p-6 xl:w-2/3 xl:max-w-6xl"
>
	<!-- Header: title left, copy-code button on the right over the chat -->
	<header class="grid shrink-0 items-center gap-6 lg:grid-cols-[1fr_360px]">
		<h1 class="truncate text-2xl font-bold sm:text-3xl">{host?.name ?? 'New'}'s Game</h1>
		<div class="flex lg:justify-end">
			<button
				class="btn btn-ghost gap-2 font-mono text-base font-semibold tracking-widest"
				onclick={copyCode}
				title="Copy room code"
			>
				{#if copied}
					<Check class="size-4 text-success" /> Copied!
				{:else}
					<Copy class="size-4 opacity-70" /> {room.code}
				{/if}
			</button>
		</div>
	</header>

	<div class="grid min-h-0 flex-1 gap-6 lg:grid-cols-[1fr_360px]">
		<!-- Main column -->
		<div class="flex min-h-0 flex-col gap-4">
			<!-- Players -->
			<div class="card shrink-0 bg-base-100 shadow-xl">
				<div class="card-body gap-2 p-4">
					<h2 class="text-lg font-bold">Players ({players.length})</h2>
					<ul class="flex max-h-[20vh] flex-col gap-2 overflow-y-auto pr-1">
						{#each players as p (p.id)}
							<li class="flex items-center gap-3 rounded-lg bg-base-200 px-3 py-2">
								<Avatar name={p.name} style={p.avatar} size={36} />
								<span class="font-semibold" class:opacity-50={!p.connected}>{p.name}</span>
								{#if p.isHost}
									<span class="badge badge-success badge-sm gap-1">
										<Crown class="size-3" /> Admin
									</span>
								{/if}
								{#if !p.connected}
									<span class="badge badge-ghost badge-sm">offline</span>
								{/if}
								<div class="ml-auto flex items-center gap-2">
									{#if p.isHost || p.ready}
										<span class="badge badge-info badge-sm gap-1 font-medium">
											<Check class="size-3" /> Ready
										</span>
									{:else}
										<span class="badge badge-warning badge-sm gap-1 font-medium">
											<Hourglass class="size-3" /> Waiting
										</span>
									{/if}
									{#if isHost && !p.isHost}
										<button
											class="btn btn-square btn-xs btn-error"
											aria-label="Kick {p.name}"
											onclick={() => game.kick(p.id)}
										>
											<X class="size-3.5" />
										</button>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				</div>
			</div>

			<!-- Game settings -->
			<div class="card min-h-0 flex-1 bg-base-100 shadow-xl">
				<div class="card-body flex min-h-0 flex-col gap-2 p-4">
					<h2 class="text-lg font-bold">Game Settings</h2>

					<div class="grid shrink-0 grid-cols-2 gap-x-3 gap-y-1 md:grid-cols-3">
						{#each numberFields as [field, label] (field)}
							<label class="form-control">
								<span class="label-text text-xs opacity-70">{label}</span>
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

					<div class="flex shrink-0 items-center gap-3">
						<span class="text-sm opacity-70">Private Game</span>
						<input
							type="checkbox"
							class="toggle toggle-sm toggle-success"
							disabled={!isHost}
							checked={room.settings.private}
							onchange={(e) =>
								game.setSettings({ private: (e.currentTarget as HTMLInputElement).checked })}
						/>
					</div>

					<label class="form-control shrink-0">
						<span class="label-text text-xs opacity-70">List of Areas</span>
						<div class="relative">
							<input
								class="input input-sm input-bordered w-full pr-9"
								placeholder="e.g. America, France"
								disabled={!isHost}
								bind:value={areaText}
								onchange={applyArea}
							/>
							{#if resolvingArea}
								<span
									class="loading loading-spinner loading-xs absolute top-1/2 right-3 -translate-y-1/2"
								></span>
							{/if}
						</div>
						<span class="label-text-alt mt-0.5 text-[0.7rem] opacity-60">
							Restrict to areas (comma-separated) or draw a polygon on the map.
						</span>
					</label>

					<div class="relative min-h-0 flex-1">
						<div
							class="h-full w-full overflow-hidden rounded-lg border border-base-300"
							bind:this={mapEl}
						></div>

						{#if isHost}
							<div class="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
								{#if drawing}
									<button
										class="btn btn-square btn-sm btn-success"
										aria-label="Finish area"
										disabled={drawPts.length < 3}
										onclick={finishDraw}
									>
										<Check class="size-4" />
									</button>
									<button
										class="btn btn-square btn-sm"
										aria-label="Cancel drawing"
										onclick={cancelDraw}
									>
										<X class="size-4" />
									</button>
								{:else}
									<button class="btn btn-square btn-sm" aria-label="Draw area" onclick={startDraw}>
										<Pencil class="size-4" />
									</button>
								{/if}
								<button class="btn btn-square btn-sm" aria-label="Clear area" onclick={clearArea}>
									<Trash2 class="size-4" />
								</button>
							</div>
						{/if}

						{#if drawing}
							<div
								class="absolute bottom-3 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-base-100/90 px-3 py-1 text-xs shadow"
							>
								Click the map to add points ({drawPts.length}) — need at least 3.
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Sidebar: chat + actions -->
		<div class="flex min-h-0 flex-col gap-4">
			<div class="card min-h-0 flex-1 bg-base-100 shadow-xl">
				<div class="card-body flex min-h-0 flex-col gap-3 p-4">
					<h2 class="text-lg font-bold">Chat</h2>
					<div
						bind:this={chatEl}
						class="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto rounded-lg bg-base-200 p-3"
					>
						{#each game.state.chat as c (c.id)}
							{@const mine = c.playerId === game.state.playerId}
							<div class="chat" class:chat-end={mine} class:chat-start={!mine}>
								<div class="avatar chat-image">
									<div class="w-8 rounded-full">
										<Avatar name={c.name} style={avatarStyle(c.playerId)} size={32} />
									</div>
								</div>
								<div class="chat-header mb-0.5 text-xs opacity-60">{c.name}</div>
								<div class="chat-bubble" class:chat-bubble-success={mine}>{c.text}</div>
							</div>
						{:else}
							<div class="m-auto text-sm opacity-50">No messages yet.</div>
						{/each}
					</div>
					<div class="join shrink-0">
						<input
							class="input join-item input-bordered input-sm w-full"
							placeholder="Message…"
							bind:value={chatText}
							onkeydown={(e) => e.key === 'Enter' && sendChat()}
						/>
						<button class="btn join-item btn-primary btn-sm" onclick={sendChat} aria-label="Send">
							<Send class="size-4" /> Send
						</button>
					</div>
				</div>
			</div>

			<div class="card shrink-0 bg-base-100 shadow-xl">
				<div class="card-body gap-2 p-4">
					<h2 class="text-lg font-bold">Actions</h2>
					{#if isHost}
						<button
							class="btn btn-block btn-primary"
							disabled={!allReady}
							onclick={() => game.start()}
						>
							<Play class="size-4" /> Start Game
						</button>
						{#if !allReady}
							<p class="text-sm opacity-60">Wait until all players are ready.</p>
						{/if}
					{:else}
						<button
							class="btn btn-block"
							class:btn-success={me?.ready}
							onclick={() => game.setReady(!me?.ready)}
						>
							{me?.ready ? 'Ready ✓ — tap to unready' : "I'm ready"}
						</button>
					{/if}
					<button class="btn btn-outline btn-block btn-error" onclick={() => game.leave()}>
						<LogOut class="size-4" /> Leave Game
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
