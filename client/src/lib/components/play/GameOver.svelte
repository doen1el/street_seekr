<script lang="ts">
	import { game } from '$lib/ws.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { haversineKm, formatKm } from '$lib/distance';
	import Avatar from './Avatar.svelte';
	import SummaryMap from './SummaryMap.svelte';

	const over = $derived(game.state.gameOver);
	const lastRound = $derived(over?.lastRound ?? null);
	const ranked = $derived(over ? [...over.players].sort((a, b) => b.totalPoints - a.totalPoints) : []);
	const winner = $derived(
		over ? [...over.players].sort((a, b) => b.lastRoundPoints - a.lastRoundPoints)[0] : undefined
	);

	const rounds = $derived(game.state.roundHistory);

	const distanceById = $derived(
		new Map(
			(lastRound?.guesses ?? [])
				.filter((g) => g.location)
				.map((g) => [g.playerId, haversineKm(lastRound!.location, g.location as [number, number])])
		)
	);

	const mapRounds = $derived(
		game.state.roundResults.length
			? game.state.roundResults.map((r) => ({ location: r.location, guesses: r.guesses }))
			: lastRound
				? [{ location: lastRound.location, guesses: lastRound.guesses }]
				: []
	);
</script>

{#if over}
<div class="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4">
	<!-- Top: map + winner/leaderboard/action -->
	<div class="grid h-[68vh] max-h-[720px] min-h-[380px] gap-4 lg:grid-cols-[1fr_440px]">
		<div class="card min-h-[280px] overflow-hidden bg-base-100 shadow-xl">
			{#if mapRounds.length}
				<SummaryMap rounds={mapRounds} players={over.players} />
			{:else}
				<div class="grid h-full place-items-center opacity-50">{m.game_finished()}</div>
			{/if}
		</div>

		<div class="flex min-h-0 flex-col gap-4 overflow-y-auto">
			{#if winner}
				<div class="card shrink-0 bg-base-100 shadow-xl">
					<div class="card-body items-center gap-2 py-5 text-center">
						<h2 class="font-semibold opacity-70">
							{over.isTie ? m.its_a_tie() : m.winner()}
						</h2>
						<div class="rounded-full ring-4 ring-success ring-offset-2 ring-offset-base-100">
							<Avatar name={winner.name} style={winner.avatar} size={72} />
						</div>
						<div class="text-xl font-bold">{over.winnerName ?? winner.name}</div>
						<div class="font-semibold text-success">{m.x_points({ count: winner.totalPoints })}</div>
					</div>
				</div>
			{/if}

			<!-- Leaderboard -->
			<div class="card shrink-0 bg-base-100 shadow-xl">
				<div class="card-body gap-3">
					<h2 class="text-center text-lg font-bold">{m.leaderboard()}</h2>
					<table class="table-sm table w-full">
						<thead>
							<tr class="text-xs">
								<th>{m.player()}</th>
								<th class="text-right">{m.distance()}</th>
								<th class="text-right">{m.points_round()}</th>
								<th class="text-right">{m.total_points()}</th>
							</tr>
						</thead>
						<tbody>
							{#each ranked as p, i (p.id)}
								<tr>
									<td class="pr-3">
										<div class="flex items-center gap-2">
											<span class="font-mono text-sm opacity-50">{i + 1}.</span>
											<Avatar name={p.name} style={p.avatar} size={26} />
											<span class="truncate font-medium">{p.name}</span>
										</div>
									</td>
									<td class="pl-3 text-right text-sm whitespace-nowrap opacity-70">
										{distanceById.has(p.id) ? formatKm(distanceById.get(p.id)!) : '—'}
									</td>
									<td class="text-right font-semibold text-info">+{p.lastRoundPoints}</td>
									<td class="text-right font-bold">{p.totalPoints}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			<div class="card shrink-0 bg-base-100 shadow-xl">
				<div class="card-body">
					<button class="btn btn-block btn-success" onclick={() => game.dismissGameOver()}>
						{m.back_to_lobby()}
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Full-width game summary -->
	{#if rounds.length}
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body gap-3">
				<h2 class="text-center text-2xl font-bold">{m.game_summary()}</h2>
				<div class="overflow-x-auto">
					<table class="table">
						<thead>
							<tr>
								<th>{m.player()}</th>
								{#each rounds as r (r.round)}
									<th class="text-center">{m.round()} {r.round}</th>
								{/each}
								<th class="text-right">{m.total()}</th>
							</tr>
						</thead>
						<tbody>
							{#each ranked as p, i (p.id)}
								<tr>
									<td>
										<div class="flex items-center gap-2">
											<span class="font-mono opacity-50">{i + 1}.</span>
											<Avatar name={p.name} style={p.avatar} size={32} />
											<span class="font-medium">{p.name}</span>
										</div>
									</td>
									{#each rounds as r (r.round)}
										<td class="text-center">{r.points[p.id] ?? 0}</td>
									{/each}
									<td class="text-right font-bold">{p.totalPoints}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}
</div>

{/if}
