<script lang="ts">
	// Rendered inside a positioned wrapper whose left edge is the first square.
	let { position }: { position: number | null } = $props();

	// Matches RhythmBar geometry: squares are w-16 (64px) with gap-2 (8px). The gap after
	// each square counts as part of that beat's duration, so the head advances a constant
	// SQUARE+GAP per beat — smooth, no jump, aligned to each square's left edge.
	const SQUARE = 64;
	const GAP = 8;
	const x = $derived(position == null ? null : position * (SQUARE + GAP));
</script>

{#if x != null}
	<div
		class="pointer-events-none absolute bottom-0 z-10 w-0.5 rounded-full"
		style="left: {x}px; top: -16px; background-color: #ef4444"
	></div>
{/if}
