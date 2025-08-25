<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { pb } from '$lib/client/pocketbase';
    import { m } from '$lib/paraglide/messages.js';
    
    export let gameId: string;
    export let players: any[] = [];
    export let rounds: number = 0;
     export let refreshKey: string = '';
    
    let allGuesses: any[] = [];
    let loading = true;
    let summaryData: Array<{
        player: any;
        roundScores: number[];
        totalPoints: number;
    }> = [];
    let unsub: (() => void) | null = null;

    let fetchDebounce: ReturnType<typeof setTimeout> | null = null;
    let isFetching = false;
    let hasLoadedOnce = false;
    let lastTriggeredKey = '';

    onMount(async () => {
        await fetchAllGuesses();
        setupSubscription();
    });

    onDestroy(() => {
        if (unsub) unsub();
        if (fetchDebounce) clearTimeout(fetchDebounce);
    });

    async function setupSubscription() {
        const promise = pb.collection('guesses').subscribe(
            `game="${gameId}"`,
            () => {
                if (fetchDebounce) clearTimeout(fetchDebounce);
                fetchDebounce = setTimeout(() => {
                    fetchAllGuesses();
                }, 120);
            },
            { expand: 'player' }
        );
        unsub = await promise;
    }

     async function fetchAllGuesses(source: 'init' | 'rt' | 'refresh' = 'init') {
        if (isFetching) return;
        isFetching = true;
        try {
            const list = await pb.collection('guesses').getFullList({
                filter: `game="${gameId}"`,
                sort: 'round,updated',
                expand: 'player',
                requestKey: 'gameSummaryGuesses'
            });
            allGuesses = list;
            hasLoadedOnce = true;
            loading = false;
        } catch (err: any) {
            const msg = String(err?.message || '');
            if (msg.includes('autocancelled') || msg.includes('aborted')) {
            } else {
                if (!hasLoadedOnce) {
                    loading = false;
                }
            }
        } finally {
            isFetching = false;
        }
    }

    $: if (!loading) {
        computeSummary();
    }

    $: if (refreshKey && refreshKey !== lastTriggeredKey) {
        lastTriggeredKey = refreshKey;
        if (fetchDebounce) clearTimeout(fetchDebounce);
        fetchDebounce = setTimeout(() => fetchAllGuesses('refresh'), 80);
    }
    
    function computeSummary() {
        summaryData = players.map(player => {
            const playerGuessesRaw = allGuesses.filter(g =>
                g.player === player.id ||
                g.expand?.player?.id === player.id
            );

            const byRound = new Map<number, any>();
            for (const g of playerGuessesRaw) {
                const roundIndexRaw = typeof g.round === 'string' ? parseInt(g.round, 10) : g.round;
                const roundIndex = (roundIndexRaw || 0) - 1;
                if (roundIndex < 0 || roundIndex >= rounds) continue;
                const existing = byRound.get(roundIndex);
                if (!existing || new Date(g.updated) > new Date(existing.updated)) {
                    byRound.set(roundIndex, g);
                }
            }

            const roundScores: number[] = Array.from({ length: rounds }, () => 0);
            for (const [rIndex, g] of byRound.entries()) {
                roundScores[rIndex] = Number(g.points ?? g.totalPoints ?? g.score ?? 0);
            }
            const totalPoints = roundScores.reduce((a, b) => a + b, 0);
            return { player, roundScores, totalPoints };
        });

        summaryData.sort((a, b) => b.totalPoints - a.totalPoints);
    }
</script>

<div class="card bg-base-100 shadow-xl ml-5 mr-6">
    <div class="card-body">
        <h2 class="card-title self-center">{m.game_summary()}</h2>
        
        {#if loading}
            <div class="flex justify-center my-8">
                <span class="loading loading-spinner loading-lg"></span>
            </div>
        {:else}
            <div class="overflow-x-auto">
                <table class="table">
                    <thead>
                        <tr>
                            <th>{m.player()}</th>
                            {#each Array(rounds) as _, i}
                                <th>{m.round()} {i+1}</th>
                            {/each}
                            <th>{m.total()}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each summaryData as data, i}
                            <tr class="hover">
                                <td class="flex items-center gap-3">
                                    <span class="w-4 font-bold">{i + 1}.</span>
                                    <div class="avatar">
                                        <div class="mask h-8 w-8 mask-squircle">
                                            <img
                                                src="https://api.dicebear.com/9.x/miniavs/svg?seed={data.player.username}"
                                                alt="Avatar"
                                            />
                                        </div>
                                    </div>
                                    {data.player.username}
                                </td>
                                {#each data.roundScores as score}
                                    <td class="text-center">{score}</td>
                                {/each}
                                <td class="font-bold text-center">{data.totalPoints}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </div>
</div>