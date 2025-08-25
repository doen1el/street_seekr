<script lang="ts">
    import type { RecordModel } from 'pocketbase';
    import Playerlist from './Playerlist.svelte';
    import GameSettings from './GameSettings.svelte';
    import LobbyActions from './LobbyActions.svelte';
    import LobbyChat from './LobbyChat.svelte';
    import { fly } from 'svelte/transition';
    import { m } from '$lib/paraglide/messages.js';

    export let game: RecordModel;
    export let players: any[] = [];
    export let messages: any[]= [];
    export let isAdmin = false;
    export let readyPlayers: any[]= [];
    export let allPlayersReady = false;
    export let isCurrentPlayerReady = false;
    export let currentPlayer: RecordModel | null = null;
    export let onSendMessage = (message: string) => Promise.resolve();
    export let onUpdateSettings = () => {};
    export let onUpdatePolygon = (locationString: any) => Promise.resolve(null);
    export let onKickPlayer: (id: string) => void = () => {};

    let showCopyFeedback = false;

    function handleCopyCode() {
        if (showCopyFeedback) return;
        navigator.clipboard.writeText(game.code);
        showCopyFeedback = true;
        setTimeout(() => {
            showCopyFeedback = false;
        }, 1500);
    }
</script>

<div class="min-h-screen bg-base-200 p-4 lg:p-8">
    <div class="mx-auto max-w-7xl">
        <div class="mb-2 flex items-center gap-2">
            <h1 class="text-4xl font-bold">{game.name}</h1>

            <div class="relative">
                <button class="rounded-md bg-base-300 btn font-mono mt-1" on:click={handleCopyCode}>
                    {m.code()}: {game.code}
                </button>
                {#if showCopyFeedback}
                    <div
                        transition:fly={{ y: -10, duration: 300 }}
                        class="absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-success px-2 py-1 text-sm font-bold text-success-content"
                    >
                        {m.copied()}
                    </div>
                {/if}
            </div>
        </div>
        <p class="mb-6 text-base-content/70">{m.waiting_for_players()}</p>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div class="flex flex-col gap-6 lg:col-span-2">
                <Playerlist
                    {players}
                    {readyPlayers}
                    adminId={game.admin}
                    isAdmin={isAdmin}
                    onKick={onKickPlayer}
                />
                <GameSettings {game} {isAdmin} onUpdate={onUpdateSettings} onPolygonUpdate={onUpdatePolygon} />
            </div>

            <div class="flex flex-col gap-6">
                <LobbyChat {messages} {currentPlayer} onSendMessage={onSendMessage} />
                <LobbyActions
                    {isAdmin}
                    {allPlayersReady}
                    {isCurrentPlayerReady}
                />
            </div>
        </div>
    </div>
</div>