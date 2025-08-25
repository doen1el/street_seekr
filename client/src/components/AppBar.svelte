<script>
	import { Earth, Github } from "lucide-svelte";
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
	<div class="none">
		<Earth class="size-7" />
	</div>
	<div class="flex-1">
		<button class="text-2xl pl-2 font-bold btn-ghost">StreetSeeker</button>
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
        
        <a
            class="btn btn-square btn-ghost"
            aria-label="SourceCode"
            href="https://github.com/doen1el/street_seekr"
            target="_blank"
            rel="noopener noreferrer"
        >
            <Github class="size-6" />
        </a>
    </div>
</div>
