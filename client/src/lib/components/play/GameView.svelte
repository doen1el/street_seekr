<script lang="ts">
	import { onMount } from 'svelte';
	import '@panoramax/web-viewer/build/photoviewer.css';
	import { ChevronsRightLeft, Check } from 'lucide-svelte';
	import { game } from '$lib/ws.svelte';
	import { profile } from '$lib/profile.svelte';

	const round = $derived(game.state.round!);
	const pano = $derived(round.pano);
	const endpoint = $derived(
		pano.viewerBaseUrl.endsWith('/api') ? pano.viewerBaseUrl : `${pano.viewerBaseUrl}/api`
	);
	const players = $derived(game.state.room?.players ?? []);
	const guessedCount = $derived(players.filter((p) => p.hasGuessed).length);

	let mapEl: HTMLDivElement;
	let map: any = null;
	let marker: any = null;
	let L: any = null;

	let selected = $state<[number, number] | null>(null); // [lng, lat]
	let guessed = $state(false);
	let mapBig = $state(false);
	let now = $state(Date.now());
	let offset = 0;
	let lastRound = -1;

	const remaining = $derived(Math.max(0, Math.ceil((round.roundEndsAt - (now + offset)) / 1000)));
	const mm = $derived(String(Math.floor(remaining / 60)).padStart(2, '0'));
	const ss = $derived(String(remaining % 60).padStart(2, '0'));

	onMount(() => {
		import('@panoramax/web-viewer/build/photoviewer.js').catch((e) =>
			console.error('[play] viewer load failed', e)
		);
		offset = round.serverNow - Date.now();

		const tick = setInterval(() => {
			now = Date.now();
			if (now + offset >= round.roundEndsAt) submit();
		}, 1000);

		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		(async () => {
			L = await import('leaflet');
			map = L.map(mapEl, { zoomControl: false }).setView([20, 0], 2);
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; OpenStreetMap'
			}).addTo(map);
			map.on('click', (e: any) => {
				if (guessed) return;
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
			});
		})();

		return () => {
			clearInterval(tick);
			document.body.style.overflow = prevOverflow;
			if (map) map.remove();
		};
	});

	$effect(() => {
		if (round.round !== lastRound) {
			lastRound = round.round;
			guessed = false;
			selected = null;
			if (marker && map) {
				map.removeLayer(marker);
				marker = null;
			}
		}
	});

	function submit() {
		if (guessed || !selected) return;
		guessed = true;
		game.guess(selected);
	}

	function toggleMap() {
		mapBig = !mapBig;
		setTimeout(() => map?.invalidateSize(), 260);
	}
</script>

<div class="fixed inset-0 overflow-hidden">
	{#key pano.id}
		<pnx-photo-viewer
			{endpoint}
			picture={pano.id}
			sequence={pano.collectionId}
			nav="seq"
			focus="pic"
			widgets="false"
			style="display:block;width:100%;height:100%"
		></pnx-photo-viewer>
	{/key}

	<!-- round + timer -->
	<div
		class="absolute top-4 left-4 z-10 flex items-center gap-4 rounded-lg bg-base-200/80 p-3 shadow-lg backdrop-blur-sm"
	>
		<div class="flex flex-col items-center">
			<div class="text-xs font-semibold uppercase opacity-70">Round</div>
			<div class="font-mono text-xl font-bold">{round.round}/{round.maxRounds}</div>
		</div>
		<div class="h-10 w-px bg-base-content/20"></div>
		<div class="flex flex-col items-center">
			<div class="text-xs font-semibold uppercase opacity-70">Time</div>
			<div class="font-mono text-xl font-bold" class:text-error={remaining <= 10}>{mm}:{ss}</div>
		</div>
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
			{#if guessed}
				<div
					class="absolute inset-0 z-[1000] grid place-items-center rounded-t-lg bg-base-100/70 text-center text-sm font-semibold"
				>
					Guess locked in.<br />Waiting for others… ({guessedCount}/{players.length})
				</div>
			{/if}
		</div>
		<div class="flex items-center justify-between rounded-b-lg p-2">
			<button class="btn btn-square btn-ghost btn-sm" onclick={toggleMap} title="Resize">
				<ChevronsRightLeft class="size-4" />
			</button>
			<button class="btn btn-sm btn-primary" disabled={!selected || guessed} onclick={submit}>
				<Check class="size-4" /> Guess
			</button>
		</div>
	</div>
</div>
