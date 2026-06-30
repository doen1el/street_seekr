<script lang="ts">
	import { onMount } from 'svelte';
	import { game } from '$lib/ws.svelte';
	import Avatar from './Avatar.svelte';

	const result = $derived(game.state.roundResult!);
	const me = $derived(game.state.room?.players.find((p) => p.id === game.state.playerId));
	const isHost = $derived(!!me?.isHost);
	const ranked = $derived([...result.players].sort((a, b) => b.totalPoints - a.totalPoints));

	const playerById = $derived(new Map(result.players.map((p) => [p.id, p])));

	let mapEl: HTMLDivElement;
	let now = $state(Date.now());
	const countdown = $derived(Math.max(0, Math.ceil((result.nextRoundAt - now) / 1000)));

	onMount(() => {
		const tick = setInterval(() => (now = Date.now()), 1000);

		(async () => {
			const L = await import('leaflet');
			const map = L.map(mapEl, { zoomControl: false }).setView([20, 0], 2);
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; OpenStreetMap'
			}).addTo(map);

			const [aLng, aLat] = result.location;
			const pts: [number, number][] = [[aLat, aLng]];

			L.marker([aLat, aLng], {
				icon: L.divIcon({
					html: '<div class="grid h-6 w-6 place-items-center rounded-full bg-success text-success-content text-xs font-bold shadow">★</div>',
					className: '',
					iconSize: [24, 24],
					iconAnchor: [12, 12]
				})
			})
				.addTo(map)
				.bindPopup('Actual location');

			for (const g of result.guesses) {
				if (!g.location) continue;
				const [lng, lat] = g.location;
				const p = playerById.get(g.playerId);
				pts.push([lat, lng]);
				L.marker([lat, lng], {
					icon: L.divIcon({
						html: `<img src="https://api.dicebear.com/9.x/${p?.avatar ?? 'bottts'}/svg?seed=${encodeURIComponent(p?.name ?? '?')}" class="h-7 w-7 rounded-full border-2 border-primary bg-base-100" />`,
						className: '',
						iconSize: [28, 28],
						iconAnchor: [14, 14]
					})
				})
					.addTo(map)
					.bindPopup(`${p?.name ?? '?'} — ${g.points} pts`);
				L.polyline(
					[
						[aLat, aLng],
						[lat, lng]
					],
					{ color: '#888', weight: 2, dashArray: '4 6' }
				).addTo(map);
			}

			if (pts.length > 1) map.fitBounds(L.latLngBounds(pts).pad(0.3));
			else map.setView([aLat, aLng], 6);

			return () => map.remove();
		})();

		return () => clearInterval(tick);
	});
</script>

<div class="mx-auto grid w-full max-w-5xl gap-4 p-4 lg:grid-cols-[1fr_320px]">
	<div class="card overflow-hidden bg-base-100 shadow-xl">
		<div class="h-[340px] w-full lg:h-[480px]" bind:this={mapEl}></div>
	</div>

	<div class="flex flex-col gap-4">
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body gap-2">
				<h2 class="card-title">Round {result.round} results</h2>
				<ul class="flex flex-col divide-y divide-base-200">
					{#each ranked as p, i (p.id)}
						<li class="flex items-center gap-2 py-2">
							<span class="w-5 text-center font-mono opacity-60">{i + 1}</span>
							<Avatar name={p.name} style={p.avatar} size={32} />
							<span class="font-medium">{p.name}</span>
							<span class="ml-auto text-right">
								<span class="badge badge-sm badge-success">+{p.lastRoundPoints}</span>
								<span class="ml-1 font-mono font-bold">{p.totalPoints}</span>
							</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body gap-2">
				{#if isHost}
					<button class="btn btn-primary" onclick={() => game.next()}>
						{result.isLast ? 'Final results' : 'Next round'}
					</button>
				{:else}
					<p class="text-center text-sm opacity-70">
						{result.isLast ? 'Final results' : 'Next round'} in {countdown}s…
					</p>
				{/if}
			</div>
		</div>
	</div>
</div>
