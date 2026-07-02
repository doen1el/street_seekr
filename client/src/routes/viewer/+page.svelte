<script lang="ts">
	import { onMount } from 'svelte';
	import '@panoramax/web-viewer/build/photoviewer.css';
	import { page } from '$app/state';

	const endpoint = page.url.searchParams.get('e') ?? '';
	const pic = page.url.searchParams.get('p') ?? '';
	const seq = page.url.searchParams.get('s') ?? '';

	onMount(() => {
		import('@panoramax/web-viewer/build/photoviewer.js').catch((e) =>
			console.error('[viewer] load failed', e)
		);
	});
</script>

<div class="fixed inset-0 z-[9999] overflow-hidden bg-base-300">
	{#if pic}
		<pnx-photo-viewer
			{endpoint}
			picture={pic}
			sequence={seq}
			nav="seq"
			focus="pic"
			widgets="false"
			style="display:block;width:100%;height:100%"
		></pnx-photo-viewer>
	{/if}
</div>
