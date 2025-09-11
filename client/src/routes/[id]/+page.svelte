<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms/client';
	import { onMount } from 'svelte';
	import { pb } from '$lib/client/pocketbase';
	import Lobby from '../../components/Lobby.svelte';
	import MakeGuess from '../../components/MakeGuess.svelte';
	import Summary from '../../components/Summary.svelte';
	import type { PageData } from './$types';
	import { m } from '$lib/paraglide/messages.js';

	export let data: PageData;

	let game = data.game;
	let currentPlayer = data.currentPlayer;
	let isGeneratingChallenge = false;
	let clientGenerating = false;
	let guesses: any[] = [];
	let playersFinished = 0;
	let allPlayersFinished = false;
	let correctLocation: [number, number] = [0, 0];
	let view: 'guessing' | 'summary' = game.status === 'summary' ? 'summary' : 'guessing';
	let guessSubmitted = false;
	let joining = false;
	let showJoinSpinner = false;
	let joinSpinnerTimer: ReturnType<typeof setTimeout> | null = null;

	$: game = data.game;
	$: currentPlayer = data.currentPlayer;
	$: isPlayerInGame = currentPlayer ? (game.players || []).includes(currentPlayer.id) : false;
	$: players = game.expand?.players || [];
	$: messages = game.expand?.messages || [];
	$: readyPlayers = game.expand?.ready_players || [];
	$: isAdmin = game.admin === currentPlayer?.id;
	$: allPlayersReady = players.length > 0 && players.length === readyPlayers.length;
	$: isCurrentPlayerReady = readyPlayers.some((p: any) => p.id === currentPlayer?.id);
	$: imageId = game.challenge?.rounds[game.currentRound - 1];
	$: isFinalRound = game.currentRound >= game.maxRounds;

	const SETTINGS_FIELDS = [
		'maxRounds',
		'timeLimit',
		'maxPoints',
		'graceDistance',
		'fallOfRate',
		'private',
		'polygon',
		'locationStrings'
	];

	const serverClockOffset = Date.now() - (data.serverNow ?? Date.now());

	function nowServerMs() {
		return Date.now() - serverClockOffset;
	}

	function computeRemainingSeconds(g: any): number | null {
		if (!g?.round_deadline_at) return null;
		const deadlineMs = new Date(g.round_deadline_at).getTime();
		return Math.max(0, Math.ceil((deadlineMs - nowServerMs()) / 1000));
	}

	const {
		form,
		errors,
		enhance: joinEnhance
	} = superForm(data.form, {
		onSubmit: () => {
			joining = true;
			if (joinSpinnerTimer) clearTimeout(joinSpinnerTimer);
			joinSpinnerTimer = setTimeout(() => (showJoinSpinner = true), 1000);
		},
		onResult: ({ result }) => {
			joining = false;
			if (joinSpinnerTimer) clearTimeout(joinSpinnerTimer);
			showJoinSpinner = false;
			if (result.type === 'success') invalidateAll();
		},
		onError: () => {
			joining = false;
			if (joinSpinnerTimer) clearTimeout(joinSpinnerTimer);
			showJoinSpinner = false;
		}
	});

	onMount(() => {
		const unsubGame = pb.collection('games').subscribe(
			game.id,
			(e) => {
				const prevStatus = game.status;

				if (isAdmin) {
					const preserved: Record<string, any> = {};
					for (const f of SETTINGS_FIELDS) {
						preserved[f] = game[f];
					}
					const incoming = e.record;
					const merged: any = { ...incoming };
					for (const f of SETTINGS_FIELDS) {
						merged[f] = preserved[f];
					}
					data.game = merged;
				} else {
					data.game = e.record;
				}

				if (currentPlayer && !(e.record.players || []).includes(currentPlayer.id)) {
					isPlayerInGame = false;
				}

				if (!e.record.is_generating_challenge || e.record.status === 'playing') {
					clientGenerating = false;
				}

				if (e.record.status === 'summary' && view === 'guessing') {
					view = 'summary';
					fetchSummaryData();
				} else if (e.record.status === 'playing' && view === 'summary') {
					view = 'guessing';
					guessSubmitted = false;
					guesses = [];
				}

				if (prevStatus !== 'summary' && e.record.status === 'summary') {
					fetchSummaryData().then(() => {
						console.debug('[Game RT] forced summary refetch done', {
							afterLen: guesses.length,
							ids: guesses.map((g) => g.id)
						});
					});
				}
			},
			{ expand: 'players,admin,ready_players,messages.player' }
		);

		const unsubGuesses = pb.collection('guesses').subscribe(
			`game="${game.id}"`,
			(e) => {
				if (!e.record) return;

				const recRound = Number(e.record.round);
				const curRound = Number(game.currentRound);
				if (recRound !== curRound) return;

				let changed = false;

				if (e.action === 'create' || e.action === 'update') {
					const idx = guesses.findIndex((g) => g.id === e.record.id);
					if (idx === -1) {
						guesses = [...guesses, e.record];
					} else {
						guesses = [...guesses.slice(0, idx), e.record, ...guesses.slice(idx + 1)];
					}
					changed = true;
				} else if (e.action === 'delete') {
					const idx = guesses.findIndex((g) => g.id === e.record.id);
					if (idx !== -1) {
						guesses = [...guesses.slice(0, idx), ...guesses.slice(idx + 1)];
						changed = true;
					}
				}

				if (changed) {
					playersFinished = guesses.length;
					allPlayersFinished = playersFinished === players.length;

					if (game.status === 'summary' && guesses.length < players.length) {
						console.debug('[RT guesses] partial list in summary, triggering refetch', {
							got: guesses.length,
							expect: players.length
						});
						fetchSummaryData().then(() => {
							console.debug(
								'[RT guesses] post-refetch guesses',
								guesses.map((g) => g.id)
							);
						});
					}

					if (view === 'summary' || allPlayersFinished) {
						fetchPlayersForScores();
					}
				}
			},
			{ expand: 'player' }
		);

		const unsubPlayers = pb.collection('players').subscribe('*', (e) => {
			if (!e.record) return;

			const currentPlayers = data.game.expand?.players || [];
			const idx = currentPlayers.findIndex((p: any) => p.id === e.record.id);

			if (e.action === 'delete') {
				if (idx !== -1) {
					const updatedPlayers = [
						...currentPlayers.slice(0, idx),
						...currentPlayers.slice(idx + 1)
					];
					const ready = data.game.expand?.ready_players || [];
					const rpIdx = ready.findIndex((p: any) => p.id === e.record.id);
					const updatedReady =
						rpIdx === -1 ? ready : [...ready.slice(0, rpIdx), ...ready.slice(rpIdx + 1)];

					data.game = {
						...data.game,
						expand: { ...data.game.expand, players: updatedPlayers, ready_players: updatedReady }
					};
				}
				return;
			}

			if (!(game.players || []).includes(e.record.id)) return;

			const updatedPlayers =
				idx === -1
					? [...currentPlayers, e.record]
					: [
							...currentPlayers.slice(0, idx),
							{ ...currentPlayers[idx], ...e.record },
							...currentPlayers.slice(idx + 1)
						];

			data.game = { ...data.game, expand: { ...data.game.expand, players: updatedPlayers } };
		});

		if (game.status === 'summary') {
			fetchSummaryData();
		}

		return () => {
			unsubGame.then((unsub) => unsub());
			unsubGuesses.then((unsub) => unsub());
			unsubPlayers.then((unsub) => unsub());
		};
	});

	$: currentRound = game.challenge?.rounds[game.currentRound - 1];

	$: correctLocation = currentRound?.location
		? [currentRound.location[1], currentRound.location[0]]
		: [0, 0];

	$: remainingSeconds = computeRemainingSeconds(game);

	let summaryRefetchTimer: any = null;
	$: {
		if (game.status === 'summary') {
			const missing = players.length - guesses.length;
			if (missing > 0) {
				if (summaryRefetchTimer) clearTimeout(summaryRefetchTimer);
				summaryRefetchTimer = setTimeout(() => {
					console.debug('[Watcher] missing guesses, refetching', {
						players: players.length,
						guesses: guesses.length
					});
					fetchSummaryData().then(() => {
						console.debug('[Watcher] after forced fetch', {
							players: players.length,
							guesses: guesses.length,
							ids: guesses.map((g) => g.id)
						});
					});
				}, 250);
			}
		}
	}

	async function fetchSummaryData() {
		try {
			console.debug('[fetchSummaryData] start', {
				round: game.currentRound,
				status: game.status
			});
			const guessesResponse = await pb.collection('guesses').getFullList({
				filter: `game="${game.id}" && round=${game.currentRound}`,
				sort: 'updated',
				expand: 'player'
			});
			guesses = guessesResponse.map((g) => ({ ...g, __src: 'fetch' }));
			playersFinished = guessesResponse.length;
			allPlayersFinished = playersFinished === players.length;

			await fetchPlayersForScores();
		} catch (err) {
			console.error('Error fetching summary data:', err);
		}
	}

	async function fetchPlayersForScores() {
		try {
			const fresh = await pb.collection('games').getOne(game.id, {
				expand: 'players,admin,ready_players,messages.player'
			});
			data.game = fresh;
		} catch (e) {
			console.warn('fetchPlayersForScores failed', e);
		}
	}

	async function handleGuess(event: any) {
		const guessLocation = event.detail;

		const formData = new FormData();
		if (guessLocation) {
			formData.append('location', JSON.stringify(guessLocation));
		}

		await fetch('?/submitGuess', {
			method: 'POST',
			body: formData
		});

		await fetchSummaryData();

		view = 'summary';

		guessSubmitted = true;
	}

	async function sendMessage(message: any) {
		if (!currentPlayer) return;
		try {
			const messageRecord = await pb.collection('messages').create({
				message: message,
				player: currentPlayer.id
			});
			await pb.collection('games').update(game.id, {
				'messages+': messageRecord.id
			});
		} catch (err) {
			console.error('Error while sending message:', err);
		}
	}

	async function updateGameSettings() {
		if (!isAdmin) return;
		const formData = new FormData();
		formData.append('maxRounds', String(game.maxRounds));
		formData.append('timeLimit', String(game.timeLimit));
		formData.append('private', String(game.private));
		formData.append('graceDistance', String(game.graceDistance));
		formData.append('fallOfRate', String(game.fallOfRate));
		formData.append('maxPoints', String(game.maxPoints));
		formData.append('polygon', JSON.stringify(game.polygon || null));
		formData.append('locationStrings', JSON.stringify(game.locationStrings || []));
		await fetch('?/updateGameSettings', { method: 'POST', body: formData });
	}

	async function updatePolygonFromInput(locationString: any) {
		const formData = new FormData();
		formData.append('locationString', locationString);
		const res = await fetch('?/updatePolygon', { method: 'POST', body: formData });
		const actionResult = await res.json();

		if (actionResult.type === 'success' && actionResult.data) {
			try {
				const parsedArray = JSON.parse(actionResult.data);
				return JSON.parse(parsedArray[0]);
			} catch (e) {
				return null;
			}
		}
		return null;
	}

	async function kickPlayer(playerId: string) {
		if (!isAdmin || !playerId || playerId === currentPlayer?.id) return;

		const fd = new FormData();
		fd.append('playerId', playerId);

		const res = await fetch('?/kickPlayer', { method: 'POST', body: fd });
		if (!res.ok) {
			console.warn('Kick failed', await res.text());
			return;
		}

		const curPlayers = data.game.expand?.players || [];
		const curReady = data.game.expand?.ready_players || [];
		data.game = {
			...data.game,
			expand: {
				...data.game.expand,
				players: curPlayers.filter((p: any) => p.id !== playerId),
				ready_players: curReady.filter((p: any) => p.id !== playerId)
			}
		};

		await invalidateAll();
	}

	$: if (currentPlayer && $form.username === '') {
		$form.username = currentPlayer.username;
	}

	$: isGeneratingChallenge = !!(clientGenerating || game.is_generating_challenge);
</script>

{#if !isPlayerInGame}
	<div
		class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]"
	>
		<div class="card w-full max-w-md bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">{m.join_game_name({ name: game.name })}</h2>
				<p>{m.please_enter_name_to_join()}</p>
				<form method="POST" action="?/join" use:joinEnhance class="mt-4 flex flex-col gap-4">
					<div class="form-control">
						<input
							type="text"
							name="username"
							placeholder="Dein Name"
							class="input-bordered input input-lg w-full"
							class:input-error={$errors.username}
							bind:value={$form.username}
							disabled={joining}
							aria-busy={joining}
						/>
						{#if $errors.username}
							<label class="label" for="username">
								<span class="label-text-alt text-error">{$errors.username}</span>
							</label>
						{/if}
					</div>
					<div class="card-actions flex-col gap-2">
						<button
							type="submit"
							class="btn relative w-full btn-primary"
							disabled={joining || !($form.username && $form.username.trim().length > 0)}
							aria-busy={joining}
						>
							<span class:invisible={joining}>{m.join()}</span>
							{#if showJoinSpinner}
								<span class="absolute inset-0 grid place-items-center">
									<span class="loading loading-sm loading-spinner"></span>
								</span>
							{/if}
						</button>
						<a href="/" class="btn w-full btn-ghost">{m.back_to_main_menu()}</a>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

{#if isGeneratingChallenge}
	<div class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
		<div class="flex flex-col items-center gap-4 text-white">
			<span class="loading loading-lg loading-spinner"></span>
			<span class="text-2xl font-bold">{m.creating_game()}</span>
			{#if game.generation_target >= 1 || game.generation_found >= 0}
				<div class="w-64">
					<progress
						class="progress w-full progress-primary"
						value={game.generation_found}
						max={game.generation_target}
					></progress>
					<p class="mt-1 text-center font-mono text-sm">
						{game.generation_found}/{game.generation_target}
					</p>
				</div>
			{:else}
				<p class="text-sm opacity-70">{m.please_wait()}</p>
			{/if}
		</div>
	</div>
{/if}

<div class="transition-all duration-300" class:pointer-events-none={!isPlayerInGame}>
	{#if game.status === 'lobby'}
		<Lobby
			{game}
			{players}
			{messages}
			{isAdmin}
			{readyPlayers}
			{allPlayersReady}
			{isCurrentPlayerReady}
			{currentPlayer}
			onSendMessage={sendMessage}
			onUpdateSettings={updateGameSettings}
			onUpdatePolygon={updatePolygonFromInput}
			onKickPlayer={kickPlayer}
		/>
	{:else if game.status === 'playing' || game.status === 'summary'}
		{#if view === 'guessing'}
			<MakeGuess
				{imageId}
				username={currentPlayer?.username}
				currentRound={game.currentRound}
				totalRounds={game.maxRounds}
				roundDuration={game.timeLimit}
				remainingSeconds={remainingSeconds ?? game.timeLimit}
				on:guess={handleGuess}
			/>
		{:else if view === 'summary'}
			<Summary
				{players}
				{game}
				{guesses}
				{correctLocation}
				{isAdmin}
				{allPlayersFinished}
				{isFinalRound}
				onKick={kickPlayer}
			/>
		{/if}
	{:else}
		<div class="p-8 text-center">
			<h1 class="text-3xl">{m.unknown_game_status()}: {game.status}</h1>
		</div>
	{/if}
</div>
