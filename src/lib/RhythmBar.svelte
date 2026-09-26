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
			<div class="relative h-16 w-16 overflow-hidden rounded-md border-2 border-neutral-900 bg-white">
				<div class="absolute top-0.5 left-1.5 z-10 text-xs text-neutral-300">{beat + 1}</div>
				<div class="flex h-full w-full">
					{#each slots as state, s (s)}
						<div
							class="flex flex-1 items-center justify-center border-r border-dashed border-neutral-200 last:border-r-0"
						>
							{#if state === 'onset'}
								<div class="h-7 w-7 rounded-full bg-neutral-900"></div>
							{:else if state === 'sustain'}
								<div class="h-[3px] w-3/5 rounded-sm bg-neutral-300"></div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
