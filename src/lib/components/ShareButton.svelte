<script lang="ts">
	import ShareIcon from './ShareIcon.svelte';

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout>;

	async function share() {
		const url = location.href;
		// Native share sheet on mobile / supported browsers.
		if (navigator.share) {
			try {
				await navigator.share({ title: document.title, url });
			} catch {
				// user dismissed the share sheet — ignore
			}
			return;
		}
		// Fallback: copy the link to the clipboard.
		try {
			await navigator.clipboard.writeText(url);
			copied = true;
			clearTimeout(timer);
			timer = setTimeout(() => (copied = false), 1500);
		} catch {
			// clipboard unavailable (e.g. insecure context) — ignore
		}
	}
</script>

<button
	onclick={share}
	aria-label={copied ? 'Link copied' : 'Copy link'}
	title={copied ? 'Link copied' : 'Copy link'}
	class="p-1 text-neutral-500 hover:text-neutral-900"
>
	{#if copied}
		<svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" aria-hidden="true">
			<path
				d="m5 12 5 5 9-11"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	{:else}
		<ShareIcon class="inline h-6 w-6 align-text-top" />
	{/if}
</button>
