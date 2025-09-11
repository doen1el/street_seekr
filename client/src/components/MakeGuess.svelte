<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import GuessMap from './GuessMap.svelte';
	import { ChevronsRightLeft, Check } from 'lucide-svelte';
	import { m } from '$lib/paraglide/messages.js';

	export let imageId;
	export let currentRound;
	export let totalRounds;
	export let roundDuration;
	export let remainingSeconds: number | undefined;
	export let username;

	const dispatch = createEventDispatcher<{
		guess: [number, number] | null;
	}>();

	let mapillaryContainer: HTMLDivElement;
	let guessMapComponent: GuessMap;
	let mapSize: 'small' | 'large' = 'small';
	let selectedLocation: [number, number] | null = null;
	let guessMade = false;
	let showGuessSpinner = false;
	let guessSpinnerTimer: ReturnType<typeof setTimeout> | null = null;
	let timeLeft = remainingSeconds ?? roundDuration;
	let timer: ReturnType<typeof setInterval>;
	let viewer: any;

	onMount(() => {
		const M = (window as any).mapillary;
		const imageIdString = typeof imageId === 'string' ? imageId : imageId.id;
		const options: any = {
			accessToken: 'MLY|24624616097163218|ec5237dd86f3af21e29b932309d17828',
			container: mapillaryContainer,
			imageId: imageIdString,
			component: { cover: false, bearing: false, attribution: false, zoom: false, keyboard: false },
			cameraControls: M.CameraControls.Street,
			combinedPanning: false,
			renderMode: M.RenderMode.Letterbox
		};
		viewer = new M.Viewer(options);

		const prevHtmlOverflow = document.documentElement.style.overflow;
		const prevBodyOverflow = document.body.style.overflow;
		document.documentElement.style.overflow = 'hidden';
		document.body.style.overflow = 'hidden';

		timer = setInterval(() => {
			if (timeLeft > 0) {
				timeLeft--;
			} else {
				makeGuess();
				clearInterval(timer);
			}
		}, 1000);

		return () => {
			viewer.remove();
			clearInterval(timer);
			if (guessSpinnerTimer) clearTimeout(guessSpinnerTimer);

			document.documentElement.style.overflow = prevHtmlOverflow;
			document.body.style.overflow = prevBodyOverflow;
		};
	});

	onDestroy(() => {
		clearInterval(timer);
		if (guessSpinnerTimer) clearTimeout(guessSpinnerTimer);
	});

	$: minutes = Math.floor(timeLeft / 60);
	$: seconds = timeLeft % 60;

	$: if (remainingSeconds != null && !guessMade) {
		timeLeft = remainingSeconds;
	}

	function handleLocationSelected(event: CustomEvent<[number, number]>) {
		selectedLocation = event.detail;
	}

	function makeGuess() {
		if (guessMade) return;
		guessMade = true;
		clearInterval(timer);

		if (guessSpinnerTimer) clearTimeout(guessSpinnerTimer);
		guessSpinnerTimer = setTimeout(() => (showGuessSpinner = true), 1000);

		dispatch('guess', selectedLocation);
	}

	function toggleMapSize() {
		mapSize = mapSize === 'small' ? 'large' : 'small';
	}

	function resizeViewer() {
		viewer?.resize();
	}
</script>

<svelte:window on:resize={resizeViewer} />

<div class="fixed inset-0 mt-15 overflow-hidden" style="height: 100dvh; width: 100dvw;">
	<div bind:this={mapillaryContainer} class="h-full w-full"></div>

	<div
		class="absolute top-4 left-4 z-10 flex items-center gap-4 rounded-lg bg-base-200/80 p-3 shadow-lg backdrop-blur-sm"
	>
		<div class="flex flex-col items-center">
			<div class="text-xs font-semibold tracking-wider text-base-content/70 uppercase">
				{m.round()}
			</div>
			<div class="font-mono text-xl font-bold">{currentRound}/{totalRounds}</div>
		</div>
		<div class="h-10 w-px bg-base-content/20"></div>
		<div class="flex flex-col items-center">
			<div class="text-xs font-semibold tracking-wider text-base-content/70 uppercase">
				{m.time()}
			</div>
			<div class="font-mono text-xl font-bold">
				{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
			</div>
		</div>
	</div>

	<div
		class="absolute top-4 right-4 z-10 flex flex-col rounded-lg bg-base-200/80 shadow-2xl transition-all duration-300 ease-in-out"
		class:w-[300px]={mapSize === 'small'}
		class:h-[220px]={mapSize === 'small'}
		class:w-[50vw]={mapSize === 'large'}
		class:h-[50vh]={mapSize === 'large'}
		on:transitionend={() => guessMapComponent?.invalidateMapSize()}
	>
		<div class="h-0 flex-grow">
			<GuessMap
				{username}
				bind:this={guessMapComponent}
				on:locationSelected={handleLocationSelected}
				disabled={guessMade}
			/>
		</div>
		<div class="flex items-center justify-between rounded-b-lg bg-base-200/80 p-2 backdrop-blur-sm">
			<button
				class="btn btn-square btn-ghost btn-sm"
				on:click={toggleMapSize}
				title={mapSize === 'small' ? m.increase() : m.decrease()}
			>
				<ChevronsRightLeft class="size-4" />
			</button>

			<button
				class="btn relative font-bold btn-sm btn-primary"
				on:click={makeGuess}
				disabled={!selectedLocation || guessMade}
				aria-busy={guessMade}
			>
				<span class:invisible={guessMade} class="inline-flex items-center gap-1">
					<Check class="size-4" />
					{m.guess()}
				</span>
				{#if showGuessSpinner}
					<span class="absolute inset-0 grid place-items-center">
						<span class="loading loading-sm loading-spinner"></span>
					</span>
				{/if}
			</button>
		</div>
	</div>
</div>
