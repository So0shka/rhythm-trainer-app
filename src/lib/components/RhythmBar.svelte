<script lang="ts">
	import type { RhythmGrid } from '../core/rhythm';

	let {
		grid,
		label,
		accent = 'blue',
		position = null,
		monochrome = false
	}: {
		grid: RhythmGrid;
		label: string;
		accent?: 'blue' | 'green';
		position?: number | null;
		monochrome?: boolean;
	} = $props();

	const beatCells = $derived(
		Array.from({ length: grid.beats }, (_, b) =>
			grid.slots.slice(b * grid.subdivisions, (b + 1) * grid.subdivisions)
		)
	);

	const accentColor = $derived(accent === 'green' ? '#22c55e' : '#3b82f6');
	const accentLight = $derived(accent === 'green' ? '#86efac' : '#93c5fd');

	const activeSlot = $derived(
		position == null
			? -1
			: Math.min(Math.floor(position * grid.subdivisions), grid.slots.length - 1)
	);

	// The whole note currently under the playhead (onset + its held slots), so the
	// entire sounding note lights up rather than a single cell.
	const activeRun = $derived.by(() => {
		const a = activeSlot;
		const sl = grid.slots;
		if (a < 0 || sl[a] === 'rest') return null;
		let start = a;
		while (start > 0 && sl[start] === 'sustain') start--;
		let end = start + 1;
		while (end < sl.length && sl[end] === 'sustain') end++;
		return { start, end };
	});
</script>

<!-- Squares row only; the L/R label is absolutely placed to the left so it never
     offsets the squares — the bar itself stays centered on the page. -->
<div class="relative flex gap-2">
	<div
		class="absolute top-8 right-full mr-3 -translate-y-1/2 text-xl font-bold text-neutral-800 opacity-40"
	>
		{label}
	</div>
	{#each beatCells as slots, beat (beat)}
		<div class="flex flex-col items-center gap-1">
			<div class="flex h-16 w-16 gap-1 rounded-md border-2 border-neutral-900 bg-white p-1">
				{#each slots as state, s (s)}
					{@const gi = beat * grid.subdivisions + s}
					{@const lit =
						!monochrome && activeRun !== null && gi >= activeRun.start && gi < activeRun.end}
					<div
						class="flex-1 rounded-sm"
						class:bg-neutral-900={state === 'onset' && !lit}
						class:bg-neutral-400={state === 'sustain' && !lit}
						style={lit && state === 'onset'
							? `background-color: ${accentColor}`
							: lit && state === 'sustain'
								? `background-color: ${accentLight}`
								: ''}
					></div>
				{/each}
			</div>
			<div class="text-xs text-neutral-400">{beat + 1}</div>
		</div>
	{/each}
</div>
