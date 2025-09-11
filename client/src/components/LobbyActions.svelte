<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { m } from '$lib/paraglide/messages.js';

	export let isAdmin: boolean;
	export let allPlayersReady: boolean;
	export let isCurrentPlayerReady: boolean;

	let starting = false;
	let toggling = false;
	let leaving = false;

	let showStartingSpinner = false;
	let startingSpinnerTimer: ReturnType<typeof setTimeout> | null = null;
	let showTogglingSpinner = false;
	let togglingSpinnerTimer: ReturnType<typeof setTimeout> | null = null;
	let showLeavingSpinner = false;
	let leavingSpinnerTimer: ReturnType<typeof setTimeout> | null = null;
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title">{m.actions()}</h2>
		<div class="card-actions flex-col gap-2">
			{#if isAdmin}
				<form
					method="POST"
					action="?/startGame"
					use:enhance={() => {
						starting = true;
						if (startingSpinnerTimer) clearTimeout(startingSpinnerTimer);
						startingSpinnerTimer = setTimeout(() => (showStartingSpinner = true), 1000);
						return async ({ update }) => {
							try {
								await update();
							} finally {
								starting = false;
								if (startingSpinnerTimer) clearTimeout(startingSpinnerTimer);
								showStartingSpinner = false;
							}
						};
					}}
					class="w-full"
				>
					<button
						type="submit"
						class="btn relative w-full btn-primary"
						disabled={!allPlayersReady || starting || toggling || leaving}
						aria-busy={starting}
					>
						<span class:invisible={starting}>{m.start_game()}</span>
						{#if showStartingSpinner}
							<span class="absolute inset-0 grid place-items-center">
								<span class="loading loading-sm loading-spinner"></span>
							</span>
						{/if}
					</button>
				</form>
				{#if !allPlayersReady}
					<p class="text-center text-xs text-base-content/60">
						{m.waint_until_all_players_are_ready()}
					</p>
				{/if}
			{:else}
				<form
					method="POST"
					action="?/toggleReady"
					use:enhance={() => {
						toggling = true;
						if (togglingSpinnerTimer) clearTimeout(togglingSpinnerTimer);
						togglingSpinnerTimer = setTimeout(() => (showTogglingSpinner = true), 1000);
						return async ({ update }) => {
							try {
								await update();
							} finally {
								toggling = false;
								if (togglingSpinnerTimer) clearTimeout(togglingSpinnerTimer);
								showTogglingSpinner = false;
							}
						};
					}}
					class="w-full"
				>
					<button
						type="submit"
						class="btn relative w-full"
						class:btn-primary={!isCurrentPlayerReady}
						class:btn-secondary={isCurrentPlayerReady}
						disabled={toggling || starting || leaving}
						aria-busy={toggling}
					>
						<span class:invisible={toggling}>
							{#if isCurrentPlayerReady}{m.not_ready()}{:else}{m.ready()}{/if}
						</span>
						{#if showTogglingSpinner}
							<span class="absolute inset-0 grid place-items-center">
								<span class="loading loading-sm loading-spinner"></span>
							</span>
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
					leaving = true;
					if (leavingSpinnerTimer) clearTimeout(leavingSpinnerTimer);
					leavingSpinnerTimer = setTimeout(() => (showLeavingSpinner = true), 1000);
					return async ({ update }) => {
						try {
							await update();
						} finally {
							leaving = false;
							if (leavingSpinnerTimer) clearTimeout(leavingSpinnerTimer);
							showLeavingSpinner = false;
						}
					};
				}}
			>
				<button class="btn relative btn-error" type="submit" disabled={leaving} aria-busy={leaving}>
					<span class:invisible={leaving}>{m.yes_leave()}</span>
					{#if showLeavingSpinner}
						<span class="absolute inset-0 grid place-items-center">
							<span class="loading loading-sm loading-spinner"></span>
						</span>
					{/if}
				</button>
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
