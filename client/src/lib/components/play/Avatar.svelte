<script lang="ts">
	// DiceBear avatar rendered from the player's chosen style + name seed.
	let { name, style, size = 40 }: { name: string; style: string; size?: number } = $props();

	let url = $derived(
		`https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(name || '?')}`
	);
</script>

<img
	src={url}
	alt={name}
	width={size}
	height={size}
	style="width:{size}px;height:{size}px"
	class="rounded-full bg-base-100"
/>
