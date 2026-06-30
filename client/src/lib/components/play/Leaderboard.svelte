<script lang="ts">
	import { onMount } from 'svelte';
	import { game } from '$lib/ws.svelte';
	import Avatar from './Avatar.svelte';

	onMount(() => {
		game.requestLeaderboard();
	});

	const board = $derived(game.state.leaderboard);
</script>

{#if board.length}
	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<div class="card-body gap-2">
			<h2 class="card-title text-base">Leaderboard</h2>
			<ul class="flex flex-col divide-y divide-base-200">
				{#each board as p, i (p.name + i)}
					<li class="flex items-center gap-3 py-2">
						<span class="w-5 text-center font-mono opacity-60">{i + 1}</span>
						<Avatar name={p.name} style={p.avatar} size={28} />
						<span class="font-medium">{p.name}</span>
						<span class="ml-auto text-right text-sm">
							<span class="font-bold">{p.gamesWon}</span> wins
							<span class="opacity-60">· {p.totalScore} pts</span>
						</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
{/if}
