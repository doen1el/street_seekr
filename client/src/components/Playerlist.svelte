<script lang="ts">
	import type { RecordModel } from 'pocketbase';
	import { CheckCircle, Hourglass } from 'lucide-svelte';
	import { m } from '$lib/paraglide/messages.js';

	export let players: RecordModel[] = [];
	export let readyPlayers: RecordModel[] = [];
	export let adminId: string;
    export let isAdmin: boolean = false;
    export let onKick: (id: string) => void = () => {};
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="mb-4 card-title">{m.players()} ({players.length})</h2>
		<ul class="space-y-2">
			{#each players as player}
				{@const isReady = readyPlayers.some((p: any) => p.id === player.id)}
				<li class="flex items-center justify-between rounded-lg bg-base-200 p-2">
					<span class="flex items-center gap-3 font-semibold">
						<div class="avatar">
							<div class="w-10 rounded-full">
								<img
									src="https://api.dicebear.com/9.x/miniavs/svg?seed={player.username}"
									alt="Avatar"
								/>
							</div>
						</div>
						{player.username}
						{#if adminId === player.id}
							<span class="badge text-xs badge-primary">{m.admin()}</span>
						{/if}
					</span>
					<div class="flex items-center gap-2">
						{#if isReady}
							<div class="badge badge-info">
								<CheckCircle size="15" /> {m.ready()}
							</div>
						{:else}
							<div class="badge badge-warning">
								<Hourglass size="15" /> {m.waiting()}
							</div>
						{/if}
						{#if isAdmin && player.id !== adminId}
                            <button
                                class="btn btn-xs btn-error"
                                title="Kick"
                                on:click={() => onKick(player.id)}
                            >
                                X
                            </button>
                        {/if}
					</div>
				</li>
			{/each}
		</ul>
	</div>
</div>
