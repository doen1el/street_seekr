<script>
	import { Earth } from "lucide-svelte";
    import { onMount } from "svelte";
    import { setLocale } from "$lib/paraglide/runtime";

    let currentLocale = "en";

    onMount(() => {
        try {
            const saved =
                localStorage.getItem("paraglide:locale") ||
                localStorage.getItem("inlang.locale");
            if (saved === "de" || saved === "en") currentLocale = saved;
            else if (navigator.language?.toLowerCase().startsWith("de")) currentLocale = "de";
        } catch {}
    });

    // @ts-ignore
    async function switchLocale(lang) {
        currentLocale = lang;
        try { localStorage.setItem("paraglide:locale", lang); } catch {}
        setLocale(lang);
    }

</script>
<div class="sticky top-0 navbar bg-base-100 shadow-sm z-[2000]">
	<div class="flex-1">
		<a href="/" class="btn btn-ghost gap-2 px-2 text-2xl font-bold normal-case" aria-label="StreetSeekr home">
			<Earth class="size-7" />
			StreetSeekr
		</a>
	</div>
	<div class="flex-none">
         <div class="join hidden sm:inline-flex mr-2">
            <button
                class="btn btn-ghost btn-sm join-item"
                class:btn-active={currentLocale === "de"}
                on:click={() => switchLocale("de")}
            >
                DE
            </button>
            <button
                class="btn btn-ghost btn-sm join-item"
                class:btn-active={currentLocale === "en"}
                on:click={() => switchLocale("en")}
            >
                EN
            </button>
        </div>
    </div>
</div>
