<script lang="ts">
	import { onMount } from 'svelte';
	import type { LatLngExpression } from 'leaflet';
	import { enhance } from '$app/forms';
	import type { RecordModel } from 'pocketbase';
	import GameSummary from './GameSummary.svelte';
	import { m } from '$lib/paraglide/messages.js';

	export let players: PlayerSummary[] = [];
	export let guesses: Guess[] = [];
	export let correctLocation: LatLngExpression;
	export let isAdmin = false;
	export let allPlayersFinished = false;
	export let isFinalRound = false;
	export let game: RecordModel;

	let mapContainer: HTMLElement;
	let map: any;
	let L: any;
	let markersLayer: any;

	interface PlayerSummary extends RecordModel {
		username: string;
		totalPoints: number;
		lastRoundPoints: number;
	}
	interface Guess extends RecordModel {
		player: string;
		location: LatLngExpression;
	}

	onMount(async () => {
		L = await import('leaflet');

		map = L.map(mapContainer).setView([20, 0], 2);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map);

		markersLayer = L.layerGroup().addTo(map);
		renderMap();
	});

	function toLatLngArray(pos: LatLngExpression | null | undefined): [number, number] | null {
        if (!pos) return null;
        if (Array.isArray(pos) && pos.length >= 2) {
            return [Number(pos[0]), Number(pos[1])];
        }
        if (typeof pos === 'object') {
            if ('lat' in pos && 'lng' in pos) {
                const latVal =
                    typeof (pos as any).lat === 'function' ? (pos as any).lat() : (pos as any).lat;
                const lngVal =
                    typeof (pos as any).lng === 'function' ? (pos as any).lng() : (pos as any).lng;
                return [Number(latVal), Number(lngVal)];
            }
        }
        if (typeof pos === 'string') {
            try {
                const parsed = JSON.parse(pos);
                return toLatLngArray(parsed as any);
            } catch {
                return null;
            }
        }
        return null;
    }

	$: correctLatLng = toLatLngArray(correctLocation);

	$: perPlayerRoundPoints = (() => {
        const map = new Map<string, number>();
        for (const g of guesses) {
            const pid = g.player || g.expand?.player?.id;
            if (!pid) continue;
            map.set(pid, Number(g.points || 0));
        }
        return map;
    })();

	$: playersWithGuesses = players.map((p) => {
        const guess = guesses.find((g: any) => g.player === p.id || g.expand?.player?.id === p.id);
        let guessCoords = toLatLngArray(guess?.location);
        let distanceKm: number | null = null;
        if (guessCoords && correctLatLng) {
            const distanceMeters = calculateDistance(
                guessCoords[0],
                guessCoords[1],
                correctLatLng[0],
                correctLatLng[1]
            );
            distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
        }
        return {
            ...p,
            guessLocation: guessCoords,
            points: perPlayerRoundPoints.get(p.id) ?? guess?.points ?? p.lastRoundPoints ?? 0,
            distance: distanceKm,
            __guessId: guess?.id,
            __guessSrc: (guess as any)?.__src
        };
    });

	$: roundWinner =
        [...players]
            .map((p) => ({
                ...p,
                __roundPts: perPlayerRoundPoints.get(p.id) ?? p.lastRoundPoints ?? 0
            }))
            .sort((a, b) => b.__roundPts - a.__roundPts)[0] || players[0];
	$: sortedPlayers = [...players].sort((a, b) => b.totalPoints - a.totalPoints);
	$: __renderKey = JSON.stringify({
		correctLatLng,
		playersWithGuesses: playersWithGuesses.map((p) => ({
			id: p.id,
			guessLocation: p.guessLocation
		}))
	});
	$: if (map && L && markersLayer && __renderKey) {
		renderMap();
	}

	function renderMap() {
		if (!map || !markersLayer || !L) return;

		markersLayer.clearLayers();

		const allPoints: [number, number][] = [];

		if (correctLatLng) {
			L.marker(correctLatLng, {
				icon: L.divIcon({
					html: `<div class="flex items-center justify-center text-success"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="size-10"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg></div>`,
					className: '',
					iconSize: [40, 40],
					iconAnchor: [20, 20]
				})
			}).addTo(markersLayer);

			allPoints.push(correctLatLng);
		}

		for (const player of playersWithGuesses) {
			if (!player.guessLocation) continue;

			const pLatLng = player.guessLocation;
			allPoints.push(pLatLng);

			L.marker(pLatLng, {
				icon: L.divIcon({
					html: `<img src="https://api.dicebear.com/9.x/miniavs/svg?seed=${player.username}" alt="${player.username}" class="w-10 h-10 rounded-full border-2 border-primary bg-base-100 p-0.5">`,
					className: '',
					iconSize: [40, 40],
					iconAnchor: [20, 20]
				})
			}).addTo(markersLayer);

			if (correctLatLng) {
				L.polyline([pLatLng, correctLatLng], {
					color: 'gray',
					weight: 2,
					dashArray: '5, 10'
				}).addTo(markersLayer);
			}
		}

		if (allPoints.length === 1) {
			map.setView(allPoints[0], 10);
		} else if (allPoints.length > 1) {
			const bounds = L.latLngBounds(allPoints);
			map.fitBounds(bounds, { padding: [50, 50] });
		}
	}

	export function calculateDistance(
		lat1: number,
		lon1: number,
		lat2: number,
		lon2: number
	): number {
		lat1 = Number(lat1);
		lon1 = Number(lon1);
		lat2 = Number(lat2);
		lon2 = Number(lon2);

		const R = 6371000;
		const dLat = toRad(lat2 - lat1);
		const dLon = toRad(lon2 - lon1);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	}

	function toRad(degrees: number): number {
		return degrees * (Math.PI / 180);
	}
</script>

<div class="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
	<div class="card h-[60vh] bg-base-100 shadow-xl lg:col-span-2 lg:h-auto">
		<div bind:this={mapContainer} class="h-full w-full rounded-2xl"></div>
	</div>

	<div class="flex flex-col gap-6">
		<div class="card bg-base-100 text-center shadow-xl">
			<div class="card-body">
				<h2 class="card-title self-center">
					{#if game.status === 'summary' && (allPlayersFinished || isFinalRound)}
						{isFinalRound ? m.winner_of_game() : m.winner_of_round()}
					{:else}
						{m.waiting_for_players?.() || 'Waiting for other players...'}
					{/if}
				</h2>
				{#if game.status === 'summary' && (allPlayersFinished || isFinalRound)}
				<div class="avatar my-2 justify-center">
					<div class="w-24 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
						<img
							src="https://api.dicebear.com/9.x/miniavs/svg?seed={roundWinner.username}"
							alt="Avatar"
						/>
					</div>
				</div>
				{/if}
				{#if game.status === 'summary' && (allPlayersFinished || isFinalRound)}
					<p class="text-2xl font-bold">{roundWinner.username}</p>
					<p class="text-lg text-primary">{roundWinner.lastRoundPoints} {m.points()}</p>
				{/if}
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="mb-4 card-title self-center">{m.leaderboard()}</h2>
				<div class="overflow-x-auto">
					<table class="table">
						<thead>
							<tr>
								<th>{m.player()}</th>
								<th>{m.distance()}</th>
								<th>{m.points_round()}</th>
								<th>{m.total_points()}</th>
							</tr>
						</thead>
						<tbody>
							{#each sortedPlayers as player, i}
								<tr class="hover">
									<td class="flex items-center gap-3">
										<span class="w-4 font-bold">{i + 1}.</span>
										<div class="avatar">
											<div class="mask h-10 w-10 mask-squircle">
												<img
													src="https://api.dicebear.com/9.x/miniavs/svg?seed={player.username}"
													alt="Avatar"
												/>
											</div>
										</div>
										{player.username}
									</td>
									<td>
										{#if playersWithGuesses.find((p) => p.id === player.id)?.distance !== null}
                                            {playersWithGuesses.find((p) => p.id === player.id)?.distance} km
										{:else}
											{#if game.status === 'summary' && (allPlayersFinished || isFinalRound)}
											<span class="text-error">{m.no_guess()}</span>
											{:else}
											<span class="italic opacity-70">{m.still_guessing()}</span>
											{/if}
										{/if}
									</td>
									<td class="font-semibold text-info">
										+{playersWithGuesses.find((p) => p.id === player.id)?.points || 0}
									</td>
									<td class="font-bold">
										{player.totalPoints}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>

		{#if isAdmin}
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body flex-row items-center justify-center gap-4">
					<form method="POST" action="?/nextRound" use:enhance class="flex-grow">
						<button type="submit" class="btn w-full btn-primary" disabled={!allPlayersFinished}>
							{#if isFinalRound}
								{m.back_to_lobby()}
							{:else}
								{m.next_round()}
							{/if}
						</button>
					</form>
				</div>
			</div>
		{/if}
	</div>
</div>

{#if game.status === 'summary' && isFinalRound && allPlayersFinished}
    <GameSummary
        gameId={game.id}
        {players}
        rounds={game.maxRounds}
        refreshKey={`${game.status}:${guesses.length}:${players.map(p=>p.totalPoints).join('-')}`}
    />
{/if}
