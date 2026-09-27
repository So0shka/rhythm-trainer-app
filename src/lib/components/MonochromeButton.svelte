<script lang="ts">
	// `on` = monochrome mode; when enabled the bars are not tinted by hand colour.
	let { on = $bindable() }: { on: boolean } = $props();
</script>

<button
	onclick={() => (on = !on)}
	aria-label={on ? 'Switch to colour highlight' : 'Monochrome mode'}
	title={on ? 'Switch to colour highlight' : 'Monochrome mode'}
	class="rounded-lg border p-3 {on
		? 'border-neutral-900 bg-neutral-900 text-white'
		: 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'}"
>
	<svg viewBox="0 0 24 24" class="h-6 w-6" aria-hidden="true">
		<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8" />
		<path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" />
	</svg>
</button>
