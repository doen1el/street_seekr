<script lang="ts">
    import type { PageData } from '../routes/$types';
    import { m } from '$lib/paraglide/messages.js';

    export let data: PageData;
    export let username: string = '';
    export let joinActiveErrors: any = null;

    $: effectiveUsername =
        username ||
        (data?.joinForm && (data.joinForm as any).username) ||
        (data?.createForm && (data.createForm as any).username) ||
        '';

</script>

{#if data.games.length !== 0}
    <div class="w-full max-w-4xl">
        <h2 class="mb-4 text-center text-3xl font-bold">{m.active_games()}</h2>

        {#if joinActiveErrors?.username}
            <div class="alert alert-error mb-4 text-sm">
                <span>{joinActiveErrors.username}</span>
            </div>
        {/if}
        {#if joinActiveErrors?.code}
            <div class="alert alert-error mb-4 text-sm">
                <span>{joinActiveErrors.code}</span>
            </div>
        {/if}

        <div class="overflow-x-auto">
            <table class="table w-full table-zebra shadow-md">
                <thead>
                    <tr>
                        <th>{m.name()}</th>
                        <th>{m.status()}</th>
                        <th>{m.players()}</th>
                        <th class="text-right">{m.actions()}</th>
                    </tr>
                </thead>
                <tbody>
                     {#each data.games as game (game.id)}
                        <tr>
                            <td><div class="font-bold">{game.name}</div></td>
                            <td>{game.status}</td>
                            <td>{game.players.length}</td>
                            <td class="text-right">
                                <form method="POST" action="?/joinActive" class="inline-flex items-center gap-2">
                                    <input type="hidden" name="code" value={game.code} />
                                    <input type="hidden" name="username" value={effectiveUsername} />
                                    <button
                                        type="submit"
                                        class="btn btn-sm btn-primary"
                                        disabled={!effectiveUsername}
                                    >
                                        {m.join()}
                                    </button>
                                </form>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        
    </div>
{/if}