<script lang="ts">
	import { groupForNotation, type Note } from '../core/rhythm';
	import { noteGlyph, restGlyph, dotGlyphs, beamGlyphs } from '../core/smufl';

	let { notes }: { notes: Note[] } = $props();

	const items = $derived(groupForNotation(notes));
</script>

<div class="flex items-end gap-4">
	{#each items as item, i (i)}
		<span class="smufl mt-3 text-xl leading-none text-neutral-900">
			{#if item.kind === 'single'}{item.note.rest ? restGlyph(item.note.value) : noteGlyph(item.note.value)}{dotGlyphs(item.note.dots)}{:else}{beamGlyphs(item.value, item.notes.length)}{/if}
		</span>
	{/each}
</div>
