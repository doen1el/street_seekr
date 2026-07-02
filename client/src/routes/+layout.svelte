<script lang="ts">
	import '../app.css';
	import AppBar from '../components/AppBar.svelte';
	import { game } from '$lib/ws.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	const hideAppBar = $derived(
		game.state.room?.status === 'playing' || page.url.pathname === '/viewer'
	);
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
	<link rel="icon" type="image/svg+xml" href="/favicon.ico" />
	<link rel="preconnect" href="https://api.panoramax.xyz" crossorigin="anonymous" />
	<link rel="preconnect" href="https://panoramax.openstreetmap.fr" crossorigin="anonymous" />
	<title>StreetSeekr</title>
</svelte:head>

<div class="app-bg flex min-h-screen flex-col bg-base-200">
	{#if !hideAppBar}
		<AppBar />
	{/if}
	<main class="flex flex-grow flex-col">
		{@render children?.()}
	</main>
</div>
