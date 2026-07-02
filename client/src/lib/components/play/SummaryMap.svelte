<script lang="ts">
	import { onMount } from 'svelte';
	import { DEFAULT_AVATAR } from '../../../../server/avatars.js';

	type Guess = { playerId: string; location: [number, number] | null; points: number };
	type Round = { location: [number, number]; guesses: Guess[] };
	type Player = { id: string; name: string; avatar: string };

	let { rounds, players }: { rounds: Round[]; players: Player[] } = $props();

	let mapEl: HTMLDivElement;

	const actualIcon = () =>
		`<div class="grid h-8 w-8 place-items-center rounded-full bg-success text-success-content shadow-md ring-2 ring-white">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
		</div>`;

	const guessIcon = (p: Player | undefined) =>
		`<img src="https://api.dicebear.com/9.x/${p?.avatar ?? DEFAULT_AVATAR}/svg?seed=${encodeURIComponent(
			p?.name ?? '?'
		)}" class="h-9 w-9 rounded-full border-[3px] border-success bg-white shadow" />`;

	onMount(() => {
		const rs = rounds;
		const pls = players;
		let map: any;
		let disposed = false;
		(async () => {
			const L = await import('leaflet');
			if (disposed || !mapEl) return;
			const byId = new Map(pls.map((p) => [p.id, p]));
			map = L.map(mapEl, { zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false }).setView(
				[20, 0],
				2
			);
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; OpenStreetMap'
			}).addTo(map);

			const pts: [number, number][] = [];

			for (const round of rs) {
				const [aLng, aLat] = round.location;
				pts.push([aLat, aLng]);

				L.marker([aLat, aLng], {
					icon: L.divIcon({ html: actualIcon(), className: '', iconSize: [32, 32], iconAnchor: [16, 16] }),
					zIndexOffset: 1000
				})
					.addTo(map)
					.bindPopup('Actual location');

				for (const g of round.guesses) {
					if (!g.location) continue;
					const [lng, lat] = g.location;
					const p = byId.get(g.playerId);
					pts.push([lat, lng]);
					L.polyline(
						[
							[aLat, aLng],
							[lat, lng]
						],
						{ color: '#475569', weight: 2, dashArray: '4 6' }
					).addTo(map);
					L.marker([lat, lng], {
						icon: L.divIcon({ html: guessIcon(p), className: '', iconSize: [36, 36], iconAnchor: [18, 18] })
					})
						.addTo(map)
						.bindPopup(`${p?.name ?? '?'} — ${g.points} pts`);
				}
			}

			if (pts.length > 1) map.fitBounds(L.latLngBounds(pts).pad(0.35), { animate: false });
			else if (pts.length === 1) map.setView(pts[0], 6, { animate: false });
			setTimeout(() => map?.invalidateSize(), 0);
		})();

		return () => {
			disposed = true;
			if (map) {
				map.stop();
				map.remove();
			}
		};
	});
</script>

<div class="h-full w-full" bind:this={mapEl}></div>
