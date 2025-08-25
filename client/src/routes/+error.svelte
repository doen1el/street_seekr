<script lang="ts">
	import { page } from '$app/state';
	import { TriangleAlert, House } from 'lucide-svelte';
	import { m } from '$lib/paraglide/messages.js';
</script>

<div class="flex min-h-screen items-center justify-center bg-base-200 p-4">
	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<div class="card-body items-center text-center">
			<TriangleAlert class="mb-4 size-16 text-error" />
			<h1 class="text-5xl font-bold">{page.status}</h1>
			<p class="py-4 text-lg">{page.error?.message}</p>
			<div class="card-actions justify-center">
				<a href="/" class="btn btn-primary">
					<House class="size-4" />
					{m.back_to_main_menu()}
				</a>
			</div>
		</div>
	</div>
</div>
