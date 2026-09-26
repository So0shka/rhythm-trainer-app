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
		</label>
	</section>

	{#if timeSig}
		<section class="flex flex-col gap-10">
			<div class="flex flex-col gap-6">
				{#if right}
					<RhythmBar grid={right.grid} label="Right" />
				{/if}
				{#if left}
					<RhythmBar grid={left.grid} label="Left" />
				{/if}
			</div>
			<div class="flex flex-col gap-6 border-t border-neutral-200 pt-8">
				{#if right}
					<NotationBar notes={right.parsed.notes} label="Right" />
				{/if}
				{#if left}
					<NotationBar notes={left.parsed.notes} label="Left" />
				{/if}
			</div>
		</section>
	{/if}
</main>
