<script lang="ts">
	let {
		bpm = $bindable(),
		min = 40,
		max = 240,
		step = 5
	}: {
		bpm: number;
		min?: number;
		max?: number;
		step?: number;
	} = $props();
</script>

<div class="flex items-center gap-3">
	<span class="text-sm font-semibold text-neutral-600">Tempo</span>
	<input type="range" {min} {max} {step} bind:value={bpm} class="w-56" />
	<span class="w-16 text-sm tabular-nums text-neutral-700">{bpm} BPM</span>
</div>
