<script lang="ts">
	import { game } from '$lib/ws.svelte';
	import Avatar from './Avatar.svelte';

	const over = $derived(game.state.gameOver!);
	const ranked = $derived([...over.players].sort((a, b) => b.totalPoints - a.totalPoints));
</script>

<div class="fixed inset-0 z-50 grid place-items-center bg-base-300/70 p-4 backdrop-blur-sm">
	<div class="card w-full max-w-md bg-base-100 shadow-2xl">
		<div class="card-body items-center gap-3 text-center">
			<h2 class="text-2xl font-bold">Game over</h2>
			<p class="text-lg">
				{#if over.isTie}
					It's a tie!
				{:else if over.winnerName}
					🏆 <span class="font-bold">{over.winnerName}</span> wins!
				{:else}
					No winner this time.
				{/if}
			</p>

			<ul class="w-full">
				{#each ranked as p, i (p.id)}
					<li class="flex items-center gap-3 border-b border-base-200 py-2 last:border-0">
						<span class="w-5 text-center font-mono opacity-60">{i + 1}</span>
						<Avatar name={p.name} style={p.avatar} size={32} />
						<span class="font-medium">{p.name}</span>
						<span class="ml-auto font-mono font-bold">{p.totalPoints}</span>
					</li>
				{/each}
			</ul>

			<button class="btn mt-2 btn-primary" onclick={() => game.dismissGameOver()}>
				Back to lobby
			</button>
		</div>
	</div>
</div>
