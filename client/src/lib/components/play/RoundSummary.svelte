<script lang="ts">
	import { game } from '$lib/ws.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { haversineKm, formatKm } from '$lib/distance';
	import Avatar from './Avatar.svelte';
	import SummaryMap from './SummaryMap.svelte';

	const result = $derived(game.state.roundResult);
	const me = $derived(game.state.room?.players.find((p) => p.id === game.state.playerId));
	const isHost = $derived(!!me?.isHost);

	const ranked = $derived(
		result ? [...result.players].sort((a, b) => b.totalPoints - a.totalPoints) : []
	);
	const winner = $derived(
		result ? [...result.players].sort((a, b) => b.lastRoundPoints - a.lastRoundPoints)[0] : undefined
	);

	const distanceById = $derived(
		new Map(
			(result?.guesses ?? [])
				.filter((g) => g.location)
				.map((g) => [g.playerId, haversineKm(result!.location, g.location as [number, number])])
		)
	);
</script>

{#if result}
	<div
		class="mx-auto grid h-[calc(100dvh-4rem)] w-full max-w-7xl gap-4 overflow-hidden p-4 lg:grid-cols-[1fr_440px]"
	>
		<!-- Map fills the height -->
		<div class="card min-h-[280px] overflow-hidden bg-base-100 shadow-xl">
			<SummaryMap
				rounds={[{ location: result.location, guesses: result.guesses }]}
				players={result.players}
			/>
		</div>

		<!-- Right rail -->
		<div class="flex min-h-0 flex-col gap-4 overflow-y-auto">
			<!-- Winner of round -->
			{#if winner}
				<div class="card shrink-0 bg-base-100 shadow-xl">
					<div class="card-body items-center gap-2 py-5 text-center">
						<h2 class="font-semibold opacity-70">{m.winner_of_round()}</h2>
						<div class="rounded-full ring-4 ring-success ring-offset-2 ring-offset-base-100">
							<Avatar name={winner.name} style={winner.avatar} size={72} />
						</div>
						<div class="text-xl font-bold">{winner.name}</div>
						<div class="font-semibold text-success">{m.x_points({ count: winner.lastRoundPoints })}</div>
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

			<!-- Action -->
			<div class="card shrink-0 bg-base-100 shadow-xl">
				<div class="card-body">
					{#if isHost}
						<button class="btn btn-block btn-success" onclick={() => game.next()}>
							{result.isLast ? m.final_results() : m.next_round()}
						</button>
					{:else}
						<p class="text-center text-sm opacity-70">
							{result.isLast ? m.waiting_host_final() : m.waiting_host_next()}
						</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
