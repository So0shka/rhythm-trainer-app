<script lang="ts">
	import type { RhythmGrid } from './rhythm';

	let {
		grid,
		label,
		accent = 'blue',
		position = null
	}: {
		grid: RhythmGrid;
		label: string;
		accent?: 'blue' | 'green';
		position?: number | null;
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

<div class="flex items-center gap-4">
	<div class="w-24 flex-none font-semibold" style="color: {accentColor}">{label}</div>
	<div class="flex gap-2">
		{#each beatCells as slots, beat (beat)}
			<div class="flex flex-col items-center gap-1">
				<div class="flex h-16 w-16 gap-1 rounded-md border-2 border-neutral-900 bg-white p-1">
					{#each slots as state, s (s)}
						{@const gi = beat * grid.subdivisions + s}
						{@const lit = activeRun !== null && gi >= activeRun.start && gi < activeRun.end}
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
</div>
