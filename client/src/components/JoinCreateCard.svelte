<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from '../routes/$types';
	import { applyAction } from '$app/forms';
	import { m } from '$lib/paraglide/messages.js';
	import { createEventDispatcher } from 'svelte';

	export let data: PageData;
	const dispatch = createEventDispatcher();

	const {
		form: joinForm,
		errors: joinErrors,
		enhance: joinEnhance
	} = superForm(data.joinForm, {
		id: 'join',
		validators: false,
		dataType: 'json',
		onResult: ({ result }) => applyAction(result)
	});

	const {
		form: createForm,
		errors: createErrors,
		enhance: createEnhance
	} = superForm(data.createForm, {
		id: 'create',
		validators: false,
		dataType: 'json',
		onResult: ({ result }) => applyAction(result)
	});

	$: $joinForm.username = $createForm.username;

	$: dispatch('usernameChange', $createForm.username);
</script>

<div class="card w-full max-w-2xl bg-base-100 shadow-xl">
	<div class="card-body items-center">
		<h2 class="mb-4 card-title">{m.start_game()}</h2>
		<div class="form-control w-full max-w-xs">
			<input
				id="username"
				type="text"
				name="username"
				placeholder={m.name()}
				class="input-bordered input input-lg w-full max-w-xs"
				class:input-error={$createErrors.username || $joinErrors.username}
				bind:value={$createForm.username}
			/>
			<div class="mt-1 h-5">
				<span
					class="text-xs text-error"
					class:invisible={!$createErrors.username && !$joinErrors.username}
				>
					{$createErrors.username || $joinErrors.username || ' '}
				</span>
			</div>
		</div>

		<div class="mt-4 flex w-full flex-col gap-4 lg:flex-row lg:gap-8">
			<form method="POST" action="?/join" use:joinEnhance class="flex flex-1 flex-col gap-4">
				<input type="hidden" name="username" bind:value={$joinForm.username} />
				<div class="form-control w-full">
					<input
						id="join-code"
						type="text"
						name="code"
						placeholder={m.code()}
						class="input-bordered input input-lg w-full"
						class:input-error={$joinErrors.code}
						bind:value={$joinForm.code}
					/>
					<div class="mt-1 h-5">
						<span class="text-xs text-error" class:invisible={!$joinErrors.code}>
							{$joinErrors.code || ' '}
						</span>
					</div>
				</div>
				<button type="submit" class="btn w-full btn-lg btn-primary">{m.join_game()}</button>
			</form>

			<div class="divider lg:divider-horizontal">{m.or()}</div>

			<form
				method="POST"
				action="?/create"
				use:createEnhance
				class="flex flex-1 flex-col justify-center"
			>
				<input type="hidden" name="username" bind:value={$createForm.username} />
				<button type="submit" class="btn mt-auto w-full btn-lg btn-secondary">
					{m.create_new_game()}
				</button>
			</form>
		</div>
	</div>
</div>
