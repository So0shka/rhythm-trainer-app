<script lang="ts">
	import type { RhythmGrid } from './rhythm';

	let { grid, label }: { grid: RhythmGrid; label: string } = $props();

	const beatCells = $derived(
		Array.from({ length: grid.beats }, (_, b) =>
			grid.slots.slice(b * grid.subdivisions, (b + 1) * grid.subdivisions)
		)
	);
</script>

<div class="flex items-center gap-4">
	<div class="w-24 flex-none font-semibold text-neutral-600">{label}</div>
	<div class="flex gap-2">
		{#each beatCells as slots, beat (beat)}
			<div class="flex flex-col items-center gap-1">
				<div class="flex h-16 w-16 gap-1 rounded-md border-2 border-neutral-900 bg-white p-1">
					{#each slots as state, s (s)}
						<div
							class="flex-1 rounded-sm"
							class:bg-neutral-900={state === 'onset'}
							class:bg-neutral-400={state === 'sustain'}
						></div>
					{/each}
				</div>
				<div class="text-xs text-neutral-400">{beat + 1}</div>
			</div>
		{/each}
	</div>
</div>
