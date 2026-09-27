<script lang="ts">
	// `on` = animations (the active square scales up / bounces as it plays).
	let { on = $bindable() }: { on: boolean } = $props();
</script>

<button
	onclick={() => (on = !on)}
	aria-label={on ? 'Disable animations' : 'Enable animations'}
	title={on ? 'Disable animations' : 'Enable animations'}
	class="rounded-lg border p-3 {on
		? 'border-neutral-900 bg-neutral-900 text-white'
		: 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'}"
>
	<svg viewBox="0 0 24 24" class="h-6 w-6" aria-hidden="true">
		<circle cx="12" cy="12" r="4" fill="currentColor" />
		<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6" opacity="0.5" />
	</svg>
</button>
