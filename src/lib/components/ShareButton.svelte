<script lang="ts">
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
		<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
	{/if}
</button>
