<script lang="ts">
	import { goto } from '$app/navigation';
	import { User } from 'lucide-svelte';
	import type { Feature } from 'geojson';
	import { game } from '$lib/ws.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { profile } from '$lib/profile.svelte';
	import { resolvePolygon } from '$lib/geocode';
	import AreaMap from './AreaMap.svelte';
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
	let polygon = $state<Feature | null>(null);

	const fields: [keyof typeof s, () => string][] = [
		['maxRounds', m.rounds],
		['timeLimit', m.time_s],
		['maxPoints', m.maxPoints],
		['graceDistance', m.tolerance_km],
		['fallOfRate', m.falloff_km]
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
			const poly = polygon ?? (names.length ? await resolvePolygon(names) : null);
			const code = await game.create(profile.value, true);
			game.setSettings({
				maxRounds: Number(s.maxRounds),
				timeLimit: Number(s.timeLimit),
				maxPoints: Number(s.maxPoints),
				graceDistance: Number(s.graceDistance),
				fallOfRate: Number(s.fallOfRate),
				locationStrings: names,
				polygon: poly
			});
			game.start();
			dialog?.close();
			await goto(`/${code}`);
		} catch {
			error = m.could_not_start();
			busy = false;
		}
	}
</script>

<button class="btn btn-outline btn-lg btn-block" {disabled} onclick={open}>
	<User class="size-4" />
	{m.solo_play()}
</button>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box w-full max-w-2xl">
		<h3 class="text-lg font-bold">{m.solo_play()}</h3>
		<p class="mt-1 text-sm opacity-70">{m.solo_play_desc()}</p>

		<div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
			{#each fields as [field, label] (field)}
				<label class="form-control">
					<span class="label-text text-xs">{label()}</span>
					<input
						class="input input-sm input-bordered w-full"
						type="number"
						bind:value={s[field]}
					/>
				</label>
			{/each}
		</div>

		<div class="mt-3">
			<AreaMap bind:areaText bind:polygon />
		</div>

		{#if error}
			<div class="alert alert-error mt-3 py-2 text-sm">{error}</div>
		{/if}

		<div class="modal-action">
			<form method="dialog">
				<button class="btn btn-ghost" disabled={busy}>{m.cancel()}</button>
			</form>
			<button class="btn btn-primary" onclick={start} disabled={busy || !name.trim()}>
				{#if busy}<span class="loading loading-spinner loading-sm"></span>{/if}
				{busy ? m.starting() : m.start_solo_game()}
			</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label={m.close()}>close</button>
	</form>
</dialog>
