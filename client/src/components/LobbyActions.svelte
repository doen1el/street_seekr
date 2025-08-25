<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import { m } from '$lib/paraglide/messages.js';

    export let isAdmin: boolean;
    export let allPlayersReady: boolean;
    export let isCurrentPlayerReady: boolean;
</script>

<div class="card bg-base-100 shadow-xl">
    <div class="card-body">
        <h2 class="card-title">{m.actions()}</h2>
        <div class="card-actions flex-col gap-2">
            {#if isAdmin}
                <form 
                    method="POST" 
                    action="?/startGame" 
                    use:enhance
                    class="w-full"
                >
                    <button type="submit" class="btn w-full btn-primary" disabled={!allPlayersReady}>
                        {m.start_game()}
                    </button>
                </form>
                {#if !allPlayersReady}
                    <p class="text-center text-xs text-base-content/60">
                       {m.waint_until_all_players_are_ready()}
                    </p>
                {/if}
            {:else}
                <form method="POST" action="?/toggleReady" use:enhance class="w-full">
                    <button type="submit" class="btn w-full" class:btn-primary={!isCurrentPlayerReady} class:btn-secondary={isCurrentPlayerReady}>
                        {#if isCurrentPlayerReady}
                            {m.not_ready()}
                        {:else}
                           {m.ready()}
                        {/if}
                    </button>
                </form>
            {/if}
            <button
                class="btn w-full btn-outline btn-error"
                on:click={() => (window as any).leave_game_modal.showModal()}>{m.leave_game()}</button
            >
        </div>
    </div>
</div>

<dialog id="leave_game_modal" class="modal">
    <div class="modal-box">
        <h3 class="text-lg font-bold">{m.leave_game()}</h3>
        {#if isAdmin}
            <p class="py-4">
                {m.leave_game_admin_confirmation()}
            </p>
        {:else}
            <p class="py-4">{m.leave_game_confirmation()}</p>
        {/if}
        <div class="modal-action">
            <form
                method="POST"
                action="?/leaveGame"
                use:enhance={() => {
                    return async ({ result }) => {
                        if (result.type === 'redirect') {
                            await goto(result.location);
                        }
                    };
                }}
            >
                <button class="btn btn-error" type="submit">{m.yes_leave()}</button>
            </form>
            <form method="dialog">
                <button class="btn">{m.abort()}</button>
            </form>
        </div>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button>{m.close()}</button>
    </form>
</dialog>