<script lang="ts">
	import { goto } from '$app/navigation';
	import { User } from 'lucide-svelte';
	import { game } from '$lib/ws.svelte';
	import { profile } from '$lib/profile.svelte';
	import { resolvePolygon } from '$lib/geocode';
	import { DEFAULT_SETTINGS } from '../../../../server/config.js';

	let { name, disabled = false }: { name: string; disabled?: boolean } = $props();

	let dialog = $state<HTMLDialogElement>();
	let busy = $state(false);
	let error = $state<string | null>(null);

	let s = $state({
		maxRounds: DEFAULT_SETTINGS.maxRounds,
		timeLimit: DEFAULT_SETTINGS.timeLimit,
		maxPoints: DEFAULT_SETTINGS.maxPoints,
		graceDistance: DEFAULT_SETTINGS.graceDistance,
		fallOfRate: DEFAULT_SETTINGS.fallOfRate
	});
	let areaText = $state('');

	const fields: [keyof typeof s, string][] = [
		['maxRounds', 'Rounds'],
		['timeLimit', 'Time / round (s)'],
		['maxPoints', 'Max points'],
		['graceDistance', 'Grace (km)'],
		['fallOfRate', 'Falloff (km)']
	];

	function open() {
		if (disabled) return;
		error = null;
		dialog?.showModal();
	}

	async function start() {
		const n = name.trim();
		if (busy || !n) return;
		busy = true;
		error = null;
		game.dismissError();
		profile.set(n);
		try {
			const names = areaText
				.split(',')
				.map((v) => v.trim())
				.filter(Boolean);
			const polygon = names.length ? await resolvePolygon(names) : null;
			const code = await game.create(profile.value, true);
			game.setSettings({
				maxRounds: Number(s.maxRounds),
				timeLimit: Number(s.timeLimit),
				maxPoints: Number(s.maxPoints),
				graceDistance: Number(s.graceDistance),
				fallOfRate: Number(s.fallOfRate),
				locationStrings: names,
				polygon
			});
			game.start();
			dialog?.close();
			await goto(`/${code}`);
		} catch {
			error = 'Could not start the game — please try again.';
			busy = false;
		}
	}
</script>

<button class="btn btn-outline btn-lg btn-block" {disabled} onclick={open}>
	<User class="size-4" />
	Solo Play
</button>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Solo Play</h3>
		<p class="mt-1 text-sm opacity-70">Play on your own — tune it however you like.</p>

		<div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
			{#each fields as [field, label] (field)}
				<label class="form-control">
					<span class="label-text text-xs">{label}</span>
					<input
						class="input input-sm input-bordered w-full"
						type="number"
						bind:value={s[field]}
					/>
				</label>
			{/each}
		</div>

		<label class="form-control mt-3">
			<span class="label-text text-xs">Area (optional)</span>
			<input
				class="input input-sm input-bordered w-full"
				placeholder="e.g. Paris, Lyon — blank = worldwide"
				bind:value={areaText}
			/>
		</label>

		{#if error}
			<div class="alert alert-error mt-3 py-2 text-sm">{error}</div>
		{/if}

		<div class="modal-action">
			<form method="dialog">
				<button class="btn btn-ghost" disabled={busy}>Cancel</button>
			</form>
			<button class="btn btn-primary" onclick={start} disabled={busy || !name.trim()}>
				{#if busy}<span class="loading loading-spinner loading-sm"></span>{/if}
				{busy ? 'Starting…' : 'Start solo game'}
			</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close">close</button>
	</form>
</dialog>
