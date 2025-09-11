<script lang="ts">
	import { tick } from 'svelte';
	import type { RecordModel } from 'pocketbase';
	import { m } from '$lib/paraglide/messages.js';

	export let messages: (RecordModel & { expand?: { player: RecordModel } })[] = [];
	export let currentPlayer: RecordModel | null;
	export let onSendMessage: (message: string) => Promise<void>;

	let newMessage = '';
	let chatContainer: HTMLDivElement;
	let sending = false;
	let showSendingSpinner = false;
	let sendingSpinnerTimer: ReturnType<typeof setTimeout> | null = null;

	async function handleSubmit() {
		if (sending) return;
		const msg = newMessage.trim();
		if (!msg) return;

		sending = true;
		if (sendingSpinnerTimer) clearTimeout(sendingSpinnerTimer);
		sendingSpinnerTimer = setTimeout(() => (showSendingSpinner = true), 1000);

		try {
			await onSendMessage(msg);
			newMessage = '';
		} finally {
			sending = false;
			if (sendingSpinnerTimer) clearTimeout(sendingSpinnerTimer);
			showSendingSpinner = false;
		}
	}

	async function scrollToBottom() {
		await tick();
		if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
	}
	$: if (messages) scrollToBottom();
</script>

<div class="card h-full min-h-96 bg-base-100 shadow-xl">
	<div class="card-body flex flex-col">
		<h2 class="card-title">{m.chat()}</h2>
		<div
			bind:this={chatContainer}
			class="flex-grow space-y-2 overflow-y-auto rounded-lg bg-base-200 p-2"
		>
			{#if messages.length > 0}
				{#each messages as message (message.id)}
					{@const author = message.expand?.player}
					{#if author}
						{@const isOwnMessage = author.id === currentPlayer?.id}
						<div class="chat" class:chat-start={!isOwnMessage} class:chat-end={isOwnMessage}>
							<div class="avatar chat-image">
								<div class="w-10 rounded-full">
									<img
										alt="Avatar"
										src="https://api.dicebear.com/9.x/miniavs/svg?seed={author.username}"
									/>
								</div>
							</div>
							<div class="chat-header mb-1 text-xs opacity-50">{author.username}</div>
							<div class="chat-bubble" class:chat-bubble-primary={isOwnMessage}>
								{message.message}
							</div>
						</div>
					{/if}
				{/each}
			{:else}
				<div class="grid h-full place-items-center text-center text-sm text-base-content/50">
					{m.no_messages_yet()}
				</div>
			{/if}
		</div>
		<form on:submit|preventDefault={handleSubmit} class="mt-4 flex gap-2">
			<input
				type="text"
				bind:value={newMessage}
				placeholder="Message..."
				class="input-bordered input w-full"
				disabled={sending}
				aria-busy={sending}
			/>
			<button
				type="submit"
				class="btn relative btn-primary"
				disabled={newMessage.trim().length === 0 || sending}
				aria-busy={sending}
			>
				<span class:invisible={sending}>{m.send()}</span>
				{#if showSendingSpinner}
					<span class="absolute inset-0 grid place-items-center">
						<span class="loading loading-sm loading-spinner"></span>
					</span>
				{/if}
			</button>
		</form>
	</div>
</div>
