<script lang="ts">
	import type { RhythmGrid } from '../core/rhythm';
	import type { CellColors } from '../core/theme';

	let {
		grid,
		label,
		colors,
		position = null,
		bubble = false
	}: {
		grid: RhythmGrid;
		label: string;
		colors: CellColors;
		position?: number | null;
		bubble?: boolean;
	} = $props();

	const beatCells = $derived(
		Array.from({ length: grid.beats }, (_, b) =>
			grid.slots.slice(b * grid.subdivisions, (b + 1) * grid.subdivisions)
		)
	);

	// Beat currently under the position — the square that bounces in animations mode.
	const activeBeat = $derived(
		position == null ? -1 : Math.min(Math.floor(position), grid.beats - 1)
	);
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
			<div
				class="flex h-16 w-16 gap-1 rounded-md border-2 border-neutral-900 bg-white p-1 transition-transform duration-150"
				style={bubble && beat === activeBeat ? 'transform: scale(1.1)' : ''}
			>
				{#each slots as state, s (s)}
					<div
						class="flex-1 rounded-sm"
						style={state === 'onset'
							? `background-color: ${colors.onset}`
							: state === 'sustain'
								? `background-color: ${colors.sustain}`
								: ''}
					></div>
				{/each}
			</div>
			<div class="text-xs text-neutral-400">{beat + 1}</div>
		</div>
	{/each}
</div>
