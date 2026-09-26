<script lang="ts">
	import { groupForNotation, type Note } from './rhythm';
	import { noteGlyph, restGlyph, dotGlyphs, beamGlyphs } from './smufl';

	let { notes, label }: { notes: Note[]; label: string } = $props();

	const items = $derived(groupForNotation(notes));
</script>

<div class="flex items-center gap-4">
	<div class="w-24 flex-none font-semibold text-neutral-600">{label}</div>
	<div class="flex items-end gap-5">
		{#each items as item, i (i)}
			<span class="smufl text-5xl leading-none text-neutral-900">
				{#if item.kind === 'single'}{item.note.rest ? restGlyph(item.note.value) : noteGlyph(item.note.value)}{dotGlyphs(item.note.dots)}{:else}{beamGlyphs(item.value, item.notes.length)}{/if}
			</span>
		{/each}
	</div>
</div>
