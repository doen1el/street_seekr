<script lang="ts">
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import { ChevronsRightLeft, Check, Flag } from 'lucide-svelte';
	import { game } from '$lib/ws.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { profile } from '$lib/profile.svelte';

	const round = $derived(game.state.round!);
	const pano = $derived(round.pano);
	const endpoint = $derived(
		pano.viewerBaseUrl.endsWith('/api') ? pano.viewerBaseUrl : `${pano.viewerBaseUrl}/api`
	);
	const players = $derived(game.state.room?.players ?? []);
	const me = $derived(players.find((p) => p.id === game.state.playerId));
	const finished = $derived(!!me?.finished);
	const finishedCount = $derived(players.filter((p) => p.finished).length);

	const viewerSrc = $derived(
		`/viewer?e=${encodeURIComponent(endpoint)}&p=${encodeURIComponent(pano.id)}&s=${encodeURIComponent(pano.collectionId)}`
	);

	let iframeEl = $state<HTMLIFrameElement>();
	let mapEl: HTMLDivElement;
	let map: any = null;
	let marker: any = null;
	let L: any = null;

	let selected = $state<[number, number] | null>(null); // [lng, lat] — current marker
	let panoReady = $state(false);
	let mapBig = $state(false);
	let now = $state(Date.now());
	let offset = 0;
	let lastRound = -1;
	let guessTimer: ReturnType<typeof setTimeout>;
	let endSubmitted = false;

	const nowS = $derived(now + offset);
	const notStarted = $derived(nowS < round.roundStartsAt);
	const getReady = $derived(Math.max(1, Math.ceil((round.roundStartsAt - nowS) / 1000)));
	const covering = $derived(notStarted || (!panoReady && nowS < round.roundStartsAt + 8000));
	const remaining = $derived(
		Math.max(0, Math.min(round.timeLimit, Math.ceil((round.roundEndsAt - nowS) / 1000)))
	);
	const mm = $derived(String(Math.floor(remaining / 60)).padStart(2, '0'));
	const ss = $derived(String(remaining % 60).padStart(2, '0'));

	function sendGuess() {
		if (selected) game.guess(selected);
	}

	function finish() {
		if (finished) return;
		clearTimeout(guessTimer);
		sendGuess();
		game.finish();
	}

	onMount(() => {
		offset = round.serverNow - Date.now();

		const tick = setInterval(() => {
			now = Date.now();
			if (now + offset >= round.roundEndsAt && !endSubmitted) {
				endSubmitted = true;
				sendGuess();
			}
			if (!panoReady) {
				try {
					if (iframeEl?.contentDocument?.querySelector('canvas')) {
						panoReady = true;
						game.loaded();
					}
				} catch {
				}
			}
		}, 200);

		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		(async () => {
			L = await import('leaflet');
			map = L.map(mapEl, { zoomControl: false }).setView([20, 0], 2);
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; OpenStreetMap'
			}).addTo(map);
			map.on('click', (e: any) => {
				if (finished) return;
				const { lat, lng } = e.latlng;
				selected = [lng, lat];
				const icon = L.divIcon({
					html: `<img src="https://api.dicebear.com/9.x/${profile.avatar}/svg?seed=${encodeURIComponent(profile.name)}" class="h-8 w-8 rounded-full border-2 border-primary bg-base-100" />`,
					className: '',
					iconSize: [32, 32],
					iconAnchor: [16, 32]
				});
				if (marker) marker.setLatLng([lat, lng]);
				else marker = L.marker([lat, lng], { icon }).addTo(map);
				clearTimeout(guessTimer);
				guessTimer = setTimeout(sendGuess, 250);
			});
		})();

		return () => {
			clearInterval(tick);
			clearTimeout(guessTimer);
			document.body.style.overflow = prevOverflow;
			if (map) map.remove();
		};
	});

	$effect(() => {
		if (round.round !== lastRound) {
			lastRound = round.round;
			selected = null;
			panoReady = false;
			endSubmitted = false;
			if (marker && map) {
				map.removeLayer(marker);
				marker = null;
			}
		}
	});

	function toggleMap() {
		mapBig = !mapBig;
		setTimeout(() => map?.invalidateSize(), 260);
	}
</script>

<div class="fixed inset-0 overflow-hidden">
	<!-- iframe reloads per round so the viewer gets a fresh window each time -->
	{#key viewerSrc}
		<iframe
			bind:this={iframeEl}
			title={m.street_view()}
			src={viewerSrc}
			class="h-full w-full border-0"
			style="display:block;width:100%;height:100%"
		></iframe>
	{/key}

	<!-- round + timer + finished -->
	<div
		class="absolute top-4 left-4 z-10 flex items-center gap-4 rounded-lg bg-base-200/80 p-3 shadow-lg backdrop-blur-sm"
	>
		<div class="flex flex-col items-center">
			<div class="text-xs font-semibold uppercase opacity-70">{m.round()}</div>
			<div class="font-mono text-xl font-bold">{round.round}/{round.maxRounds}</div>
		</div>
		<div class="h-10 w-px bg-base-content/20"></div>
		<div class="flex flex-col items-center">
			<div class="text-xs font-semibold uppercase opacity-70">{m.time()}</div>
			<div class="font-mono text-xl font-bold" class:text-error={remaining <= 10}>{mm}:{ss}</div>
		</div>
		{#if players.length > 1}
			<div class="h-10 w-px bg-base-content/20"></div>
			<div class="flex flex-col items-center">
				<div class="text-xs font-semibold uppercase opacity-70">{m.finished()}</div>
				<div class="font-mono text-xl font-bold">{finishedCount}/{players.length}</div>
			</div>
		{/if}
	</div>

	<!-- guess map -->
	<div
		class="absolute top-4 right-4 z-10 flex flex-col rounded-lg bg-base-200/80 shadow-2xl transition-all duration-300"
		class:w-[300px]={!mapBig}
		class:h-[220px]={!mapBig}
		class:w-[55vw]={mapBig}
		class:h-[60vh]={mapBig}
	>
		<div class="relative h-0 flex-grow">
			<div class="h-full w-full rounded-t-lg" bind:this={mapEl}></div>
			{#if finished}
				<div
					class="absolute inset-0 z-[1000] grid place-items-center rounded-t-lg bg-base-100/70 text-center text-sm font-semibold"
				>
					✓ {m.finished()}{#if players.length > 1}<br />{m.waiting()}… ({finishedCount}/{players.length}){/if}
				</div>
			{/if}
		</div>
		<div class="flex items-center justify-between gap-2 rounded-b-lg p-2">
			<button class="btn btn-square btn-ghost btn-sm" onclick={toggleMap} title={m.resize()}>
				<ChevronsRightLeft class="size-4" />
			</button>
			{#if !finished}
				<span class="flex-1 text-center text-xs opacity-60">
					{selected ? m.tap_map_to_move() : m.tap_map_to_guess()}
				</span>
				<button class="btn btn-sm btn-success" disabled={!selected} onclick={finish}>
					<Flag class="size-4" /> {m.finished_q()}
				</button>
			{:else}
				<span class="flex-1 text-center text-xs font-semibold text-success">
					<Check class="inline size-3.5" /> {m.guess_placed()}
				</span>
			{/if}
		</div>
	</div>

	<!-- get-ready countdown / loading cover between rounds -->
	{#if covering}
		<div class="absolute inset-0 z-20 grid place-items-center bg-base-300/60 backdrop-blur-md">
			<div
				class="flex flex-col items-center gap-5 rounded-3xl bg-base-100/90 px-12 py-9 shadow-2xl"
			>
				<div class="text-xs font-bold tracking-[0.2em] text-base-content/50 uppercase">
					{m.round()} {round.round} / {round.maxRounds}
				</div>
				{#if notStarted}
					{#key getReady}
						<div
							class="grid size-28 place-items-center rounded-full bg-primary/10 ring-4 ring-primary/30"
							in:scale={{ duration: 300, start: 0.5 }}
						>
							<span class="font-mono text-6xl font-black text-primary">{getReady}</span>
						</div>
					{/key}
					<div class="text-base font-semibold text-base-content/70">{m.get_ready()}</div>
				{:else}
					<span class="loading loading-xl loading-spinner text-primary"></span>
					<div class="text-base font-semibold text-base-content/70">{m.loading_panorama()}</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
