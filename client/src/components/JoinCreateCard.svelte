<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from '../routes/$types';
	import { applyAction } from '$app/forms';
	import { m } from '$lib/paraglide/messages.js';
	import { createEventDispatcher } from 'svelte';
	import { pb } from '$lib/client/pocketbase';

	export let data: PageData;
	const dispatch = createEventDispatcher();

	let joining = false;
	let creating = false;
	let showJoinSpinner = false;
	let showCreateSpinner = false;
	let joinSpinnerTimer: ReturnType<typeof setTimeout> | null = null;
	let createSpinnerTimer: ReturnType<typeof setTimeout> | null = null;
	let joinCodeStatus: 'idle' | 'checking' | 'valid' | 'invalid' = 'idle';
	let joinCodeMessage = '';
	let joinCodeTimer: ReturnType<typeof setTimeout> | null = null;
	let lastToken = '';
	let isUsernameEmpty: boolean = true;

	$: isUsernameEmpty = !(
		$createForm?.username && $createForm.username.toString().trim().length > 0
	);

	$: {
		const raw = ($joinForm.code ?? '').toString();
		const code = raw.trim().toUpperCase();

		if (raw !== code) {
			$joinForm.code = code;
		}

		if (code.length === 6) {
			if (joinCodeTimer) clearTimeout(joinCodeTimer);
			joinCodeStatus = 'checking';
			joinCodeMessage = '';
			const token = (lastToken = code);

			joinCodeTimer = setTimeout(async () => {
				try {
					await pb.collection('games').getFirstListItem(`code="${code}"`);
					if (lastToken !== token) return;
					joinCodeStatus = 'valid';
				} catch {
					if (lastToken !== token) return;
					joinCodeStatus = 'invalid';
					joinCodeMessage = 'No game found for this code';
				}
			}, 250);
		} else {
			if (joinCodeTimer) clearTimeout(joinCodeTimer);
			joinCodeStatus = 'idle';
			joinCodeMessage = '';
		}
	}

	const {
		form: joinForm,
		errors: joinErrors,
		enhance: joinEnhance
	} = superForm(data.joinForm, {
		id: 'join',
		validators: false,
		dataType: 'json',
		onSubmit: () => {
			joining = true;
			if (joinSpinnerTimer) clearTimeout(joinSpinnerTimer);
			joinSpinnerTimer = setTimeout(() => (showJoinSpinner = true), 1000);
		},
		onResult: ({ result }) => {
			joining = false;
			if (joinSpinnerTimer) clearTimeout(joinSpinnerTimer);
			showJoinSpinner = false;
			applyAction(result);
		},
		onError: () => {
			joining = false;
			if (joinSpinnerTimer) clearTimeout(joinSpinnerTimer);
			showJoinSpinner = false;
		}
	});

	const {
		form: createForm,
		errors: createErrors,
		enhance: createEnhance
	} = superForm(data.createForm, {
		id: 'create',
		validators: false,
		dataType: 'json',
		onSubmit: () => {
			creating = true;
			if (createSpinnerTimer) clearTimeout(createSpinnerTimer);
			createSpinnerTimer = setTimeout(() => (showCreateSpinner = true), 1000);
		},
		onResult: ({ result }) => {
			creating = false;
			if (createSpinnerTimer) clearTimeout(createSpinnerTimer);
			showCreateSpinner = false;
			applyAction(result);
		},
		onError: () => {
			creating = false;
			if (createSpinnerTimer) clearTimeout(createSpinnerTimer);
			showCreateSpinner = false;
		}
	});

	$: $joinForm.username = $createForm.username;
	$: dispatch('usernameChange', $createForm.username);
</script>

<div class="card w-full max-w-2xl bg-base-100 shadow-xl">
	<div class="card-body items-center">
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
						class="input-bordered input input-lg w-full tracking-widest uppercase
					{joinCodeStatus === 'valid' ? ' input-success' : ''}"
						class:input-error={$joinErrors.code || joinCodeStatus === 'invalid'}
						bind:value={$joinForm.code}
						maxlength="6"
						autocapitalize="characters"
						autocomplete="off"
						spellcheck="false"
						on:input={(e) => {
							const v = (e.currentTarget as HTMLInputElement).value
								.toUpperCase()
								.replace(/[^A-Z0-9]/g, '')
								.slice(0, 6);
							$joinForm.code = v;
						}}
					/>
				</div>

				<button
					type="submit"
					class="btn relative w-full btn-lg btn-primary"
					disabled={joining ||
						creating ||
						$joinForm.code?.trim().length !== 6 ||
						joinCodeStatus !== 'valid' ||
						isUsernameEmpty}
					aria-busy={joining}
				>
					<span class:invisible={joining}>{m.join_game()}</span>
					{#if showJoinSpinner}
						<span class="absolute inset-0 grid place-items-center">
							<span class="loading loading-sm loading-spinner"></span>
						</span>
					{/if}
				</button>
			</form>

			<div class="divider lg:divider-horizontal">{m.or()}</div>

			<form
				method="POST"
				action="?/create"
				use:createEnhance
				class="flex flex-1 flex-col justify-center"
			>
				<input type="hidden" name="username" bind:value={$createForm.username} />
				<button
					type="submit"
					class="btn relative mt-auto w-full btn-lg btn-secondary"
					disabled={creating || joining || isUsernameEmpty}
					aria-busy={creating}
				>
					<span class:invisible={creating}>{m.create_new_game()}</span>
					{#if showCreateSpinner}
						<span class="absolute inset-0 grid place-items-center">
							<span class="loading loading-sm loading-spinner"></span>
						</span>
					{/if}
				</button>
			</form>
		</div>
	</div>
</div>
