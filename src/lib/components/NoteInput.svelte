<script lang="ts">
	import type { Note } from '../core/rhythm';
	import NotationBar from './NotationBar.svelte';

	let {
		value = $bindable(),
		notes,
		label,
		placeholder = ''
	}: {
		value: string;
		notes: Note[];
		label: string;
		placeholder?: string;
	} = $props();

	// Digits while focused, rendered notation while blurred.
	let focused = $state(false);
</script>

<div class="flex items-center gap-3">
	<span class="w-6 flex-none text-sm font-semibold text-neutral-500">{label}</span>
	<div class="relative w-full">
		<input
			bind:value
			onfocus={() => (focused = true)}
			onblur={() => (focused = false)}
			{placeholder}
			class="w-full rounded-md border border-neutral-300 px-3 py-1.5 focus:border-neutral-900 focus:outline-none"
			class:text-transparent={!focused}
		/>
		{#if !focused}
			<div class="pointer-events-none absolute inset-0 flex items-center overflow-hidden px-3">
				<NotationBar {notes} />
			</div>
		{/if}
	</div>
</div>
