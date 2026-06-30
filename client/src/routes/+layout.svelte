<script lang="ts">
	import '../app.css';
	import AppBar from '../components/AppBar.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
	<link rel="icon" type="image/svg+xml" href="/favicon.ico" />
	<title>StreetSeekr</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-base-200">
	<AppBar />
	<main class="flex flex-grow flex-col">
		{@render children?.()}
	</main>
</div>
