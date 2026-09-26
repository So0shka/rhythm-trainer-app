<script lang="ts">
	import { parseTimeSignature, parsePattern, buildGrid, pickSubdivisions } from '$lib/rhythm';
	import RhythmBar from '$lib/RhythmBar.svelte';
	import NotationBar from '$lib/NotationBar.svelte';

	let timeSigInput = $state('4/4');
	let rightInput = $state('2+4');
	let leftInput = $state('22');

	const timeSig = $derived(parseTimeSignature(timeSigInput));

	const rightParsed = $derived(timeSig ? parsePattern(rightInput, timeSig) : null);
	const leftParsed = $derived(timeSig ? parsePattern(leftInput, timeSig) : null);

	// Shared subdivision so both hands' squares are divided the same way.
	const subdivisions = $derived(
		pickSubdivisions([...(rightParsed?.notes ?? []), ...(leftParsed?.notes ?? [])])
	);

	const right = $derived(
		timeSig && rightParsed
			? { parsed: rightParsed, grid: buildGrid(timeSig, rightParsed.notes, subdivisions) }
			: null
	);
	const left = $derived(
		timeSig && leftParsed
			? { parsed: leftParsed, grid: buildGrid(timeSig, leftParsed.notes, subdivisions) }
			: null
	);

	// Transport / playback
	let bpm = $state(90);
	let playing = $state(false);
	let positionBeats = $state(0);
	let raf = 0;
	let lastT = 0;

	function frame(t: number) {
		if (!playing) return;
		const beats = timeSig?.beats ?? 4;
		if (lastT) positionBeats = (positionBeats + ((t - lastT) / 1000) * (bpm / 60)) % beats;
		lastT = t;
		raf = requestAnimationFrame(frame);
	}

	function toggle() {
		playing = !playing;
		if (playing) {
			lastT = 0;
			raf = requestAnimationFrame(frame);
		} else {
			cancelAnimationFrame(raf);
		}
	}

	$effect(() => () => cancelAnimationFrame(raf));

	const position = $derived(playing ? positionBeats : null);

	// Single playhead spanning both bars. Offsets match RhythmBar's layout:
	// label column w-24 (96px) + gap-4 (16px), squares w-16 (64px) with gap-2 (8px).
	const SQUARE = 64;
	const GAP = 8;
	const LABEL_OFFSET = 112;
	// Treat the gap after each square as part of that beat's duration, so the playhead
	// advances a constant SQUARE+GAP per beat — smooth, no jump across gaps, and aligned
	// to each square's left edge on whole beats.
	const playheadX = $derived.by(() =>
		position == null ? null : LABEL_OFFSET + position * (SQUARE + GAP)
	);
</script>

<main class="mx-auto max-w-3xl px-6 pt-8 pb-16 text-neutral-900">
	<h1 class="mb-6 text-2xl font-bold">Rhythm Trainer</h1>

	<section class="mb-10 flex flex-wrap gap-5">
		<label class="flex flex-col gap-1.5">
			<span class="text-sm font-semibold text-neutral-600">Time signature</span>
			<input
				bind:value={timeSigInput}
				placeholder="4/4"
				class="w-20 rounded-md border border-neutral-300 px-3 py-2 focus:border-neutral-900 focus:outline-none"
			/>
			{#if !timeSig}
				<small class="text-red-700">Enter a time signature, e.g. 4/4</small>
			{/if}
		</label>

		<label class="flex flex-col gap-1.5">
			<span class="text-sm font-semibold text-neutral-600">Right hand</span>
			<input
				bind:value={rightInput}
				placeholder="e.g. 2+4"
				class="w-48 rounded-md border border-neutral-300 px-3 py-2 focus:border-neutral-900 focus:outline-none"
			/>
			{#if right?.parsed.error}
				<small class="text-red-700">{right.parsed.error}</small>
			{:else if right?.parsed.warning}
				<small class="text-yellow-700">{right.parsed.warning}</small>
			{/if}
			{#if right}
				<div class="mt-1 flex h-10 items-end overflow-x-auto overflow-y-hidden">
					<NotationBar notes={right.parsed.notes} />
				</div>
			{/if}
		</label>

		<label class="flex flex-col gap-1.5">
			<span class="text-sm font-semibold text-neutral-600">Left hand</span>
			<input
				bind:value={leftInput}
				placeholder="e.g. 22"
				class="w-48 rounded-md border border-neutral-300 px-3 py-2 focus:border-neutral-900 focus:outline-none"
			/>
			{#if left?.parsed.error}
				<small class="text-red-700">{left.parsed.error}</small>
			{:else if left?.parsed.warning}
				<small class="text-yellow-700">{left.parsed.warning}</small>
			{/if}
			{#if left}
				<div class="mt-1 flex h-10 items-end overflow-x-auto overflow-y-hidden">
					<NotationBar notes={left.parsed.notes} />
				</div>
			{/if}
		</label>
	</section>

	{#if timeSig}
		<section class="mb-8 flex items-center gap-6">
			<button
				onclick={toggle}
				class="w-24 rounded-md bg-neutral-900 px-4 py-2 font-semibold text-white hover:bg-neutral-700"
			>
				{playing ? 'Pause' : 'Play'}
			</button>
			<label class="flex items-center gap-3">
				<span class="text-sm font-semibold text-neutral-600">Tempo</span>
				<input type="range" min="40" max="240" step="5" bind:value={bpm} class="w-40" />
				<span class="w-16 text-sm tabular-nums text-neutral-700">{bpm} BPM</span>
			</label>
		</section>

		<section class="flex flex-col gap-10">
			<div class="relative flex flex-col gap-6">
				{#if playheadX != null}
					<div
						class="pointer-events-none absolute bottom-0 z-10 w-0.5 rounded-full"
						style="left: {playheadX}px; top: -16px; background-color: #ef4444"
					></div>
				{/if}
				{#if right}
					<RhythmBar grid={right.grid} label="Right" accent="blue" {position} />
				{/if}
				{#if left}
					<RhythmBar grid={left.grid} label="Left" accent="green" {position} />
				{/if}
			</div>
		</section>
	{/if}
</main>
