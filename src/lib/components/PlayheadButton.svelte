<script lang="ts">
	// `on` = show the moving playhead line over the bars.
	let { on = $bindable() }: { on: boolean } = $props();
</script>

<button
	onclick={() => (on = !on)}
	aria-label={on ? 'Hide playhead' : 'Show playhead'}
	title={on ? 'Hide playhead' : 'Show playhead'}
	class="rounded-lg border p-3 {on
		? 'border-neutral-900 bg-neutral-900 text-white'
		: 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'}"
>
	<svg viewBox="0 0 24 24" class="h-6 w-6" aria-hidden="true">
		<path d="M9 4h6l-3 3z" fill="currentColor" />
		<path d="M12 7v13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
	</svg>
</button>
