<script lang="ts">
	// `on` = sound enabled (metronome audible); toggled on click.
	let { on = $bindable() }: { on: boolean } = $props();
</script>

<button
	onclick={() => (on = !on)}
	aria-label={on ? 'Mute metronome' : 'Unmute metronome'}
	title={on ? 'Mute metronome' : 'Unmute metronome'}
	class="rounded-lg border p-3 {on
		? 'border-neutral-900 bg-neutral-900 text-white'
		: 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'}"
>
	{#if on}
		<svg viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6" aria-hidden="true">
			<path
				d="M13 4.5a.75.75 0 0 0-1.28-.53L7.44 8H4.75A1.75 1.75 0 0 0 3 9.75v4.5c0 .97.78 1.75 1.75 1.75h2.69l4.28 4.03A.75.75 0 0 0 13 19.5v-15Z"
			/>
			<path
				d="M16.5 8.25a.75.75 0 0 1 1.06 0 5.25 5.25 0 0 1 0 7.5.75.75 0 1 1-1.06-1.06 3.75 3.75 0 0 0 0-5.38.75.75 0 0 1 0-1.06Z"
			/>
		</svg>
	{:else}
		<svg viewBox="0 0 24 24" fill="none" class="h-6 w-6" aria-hidden="true">
			<path
				d="M13 4.5a.75.75 0 0 0-1.28-.53L7.44 8H4.75A1.75 1.75 0 0 0 3 9.75v4.5c0 .97.78 1.75 1.75 1.75h2.69l4.28 4.03A.75.75 0 0 0 13 19.5v-15Z"
				fill="currentColor"
			/>
			<path d="m16.5 9.5 4 4m0-4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
		</svg>
	{/if}
</button>
