<script>
	import { Earth } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { getLocale, setLocale } from '$lib/paraglide/runtime';

	let currentLocale = $state('en');

	onMount(() => {
		try {
			currentLocale = getLocale();
		} catch {}
	});

	// @ts-ignore
	function switchLocale(lang) {
		if (lang === currentLocale) return;
		currentLocale = lang;
		setLocale(lang);
	}
</script>

<div class="sticky top-0 z-[2000] navbar bg-base-100 shadow-sm">
	<div class="flex-1">
		<a
			href="/"
			class="btn btn-ghost gap-2 px-2 text-2xl font-bold normal-case"
			aria-label="StreetSeekr home"
		>
			<Earth class="size-7" />
			StreetSeekr
		</a>
	</div>
	<div class="flex-none">
		<div class="join mr-2 hidden sm:inline-flex">
			<button
				class="btn join-item btn-ghost btn-sm"
				class:btn-active={currentLocale === 'de'}
				onclick={() => switchLocale('de')}
			>
				DE
			</button>
			<button
				class="btn join-item btn-ghost btn-sm"
				class:btn-active={currentLocale === 'en'}
				onclick={() => switchLocale('en')}
			>
				EN
			</button>
		</div>
	</div>
</div>
