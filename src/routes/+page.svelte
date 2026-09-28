<script lang="ts">
	import { parsePattern, buildGrid, pickSubdivisions } from '$lib/core/rhythm';
	import { Metronome } from '$lib/core/metronome';
	import { themes } from '$lib/core/theme';
	import { RhythmParams, numerators, denominators } from '$lib/core/rhythmParams.svelte';
	import RhythmBar from '$lib/components/RhythmBar.svelte';
	import NoteInput from '$lib/components/NoteInput.svelte';
	import MuteButton from '$lib/components/MuteButton.svelte';
	import MonochromeButton from '$lib/components/MonochromeButton.svelte';
	import PlayheadButton from '$lib/components/PlayheadButton.svelte';
	import BubbleButton from '$lib/components/BubbleButton.svelte';
	import SelectBox from '$lib/components/SelectBox.svelte';
	import TempoRange from '$lib/components/TempoRange.svelte';
	import PlayHead from '$lib/components/PlayHead.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import InstallButton from '$lib/components/InstallButton.svelte';

	// Rhythm parameters, read from and synced to the URL.
	const params = new RhythmParams();
	$effect(() => params.sync());

	const timeSig = $derived({ beats: params.numerator, unit: params.denominator });

	const rightParsed = $derived(parsePattern(params.right, timeSig));
	const leftParsed = $derived(parsePattern(params.left, timeSig));

	// Shared subdivision so both hands' squares are divided the same way.
	const subdivisions = $derived(pickSubdivisions([...rightParsed.notes, ...leftParsed.notes]));

	const right = $derived({
		parsed: rightParsed,
		grid: buildGrid(timeSig, rightParsed.notes, subdivisions)
	});
	const left = $derived({
		parsed: leftParsed,
		grid: buildGrid(timeSig, leftParsed.notes, subdivisions)
	});

	// Transport / playback
	let bpm = $state(90);
	let playing = $state(false);
	let metronome = $state(true);
	let monochrome = $state(false);
	let playhead = $state(true);
	let bubble = $state(false);

	const theme = $derived(monochrome ? themes.mono : themes.color);
	let positionBeats = $state(0);
	let raf = 0;
	let lastT = 0;
	let lastBeat = -1;
	const metro = new Metronome();

	function frame(t: number) {
		if (!playing) return;
		const beats = timeSig.beats;
		if (lastT) positionBeats = (positionBeats + ((t - lastT) / 1000) * (bpm / 60)) % beats;
		lastT = t;
		const cur = Math.floor(positionBeats);
		if (cur !== lastBeat) {
			if (metronome) metro.click(cur === 0);
			lastBeat = cur;
		}
		raf = requestAnimationFrame(frame);
	}

	function toggle() {
		playing = !playing;
		if (playing) {
			metro.resume();
			lastT = 0;
			lastBeat = -1;
			raf = requestAnimationFrame(frame);
		} else {
			cancelAnimationFrame(raf);
			positionBeats = 0;
		}
	}

	$effect(() => () => {
		cancelAnimationFrame(raf);
		metro.close();
	});

	const position = $derived(playing ? positionBeats : null);
</script>

<main class="mx-auto max-w-3xl px-6 pt-6 pb-16 text-neutral-900 sm:px-8">
	<div class="mb-6 flex items-center justify-center gap-2">
		<h1 class="text-2xl font-bold uppercase">Rhythm Trainer</h1>
		<ShareButton />
	</div>

	<!-- Settings — one compact row per parameter, notes to the right of the input.
	     Dimmed (not hidden) while playing so the layout never shifts. -->
	<section
		class="mx-auto mb-10 flex w-70 flex-col gap-3 transition-opacity duration-300"
		class:opacity-40={playing}
		class:pointer-events-none={playing}
	>
		<div class="flex items-center gap-3">
			<span class="w-6 flex-none text-sm font-semibold text-neutral-500">Sig</span>
			<SelectBox bind:value={params.numerator} options={numerators} />
			<span class="text-neutral-400">/</span>
			<SelectBox bind:value={params.denominator} options={denominators} />
		</div>

		<NoteInput label="R" bind:value={params.right} notes={right.parsed.notes} placeholder="e.g. 2+4" />
		<NoteInput label="L" bind:value={params.left} notes={left.parsed.notes} placeholder="e.g. 22" />
	</section>

	<!-- Rhythm bars (middle), centered on the page -->
	<section class="relative mx-auto flex w-fit flex-col gap-6">
		{#if playhead}
			<PlayHead {position} />
		{/if}
		<RhythmBar grid={right.grid} label="R" colors={theme.right} {position} {bubble} />
		<RhythmBar grid={left.grid} label="L" colors={theme.left} {position} {bubble} />
	</section>

	<!-- Tempo -->
	<section class="mt-10 flex justify-center">
		<TempoRange bind:bpm />
	</section>

	<!-- Play + mute (bottom, one row) -->
	<section class="mt-6 flex items-center justify-center gap-3">
		<PlayheadButton bind:on={playhead} />
		<BubbleButton bind:on={bubble} />

		<button
			onclick={toggle}
			class="max-w-40 grow basis-0 rounded-lg bg-neutral-900 px-6 py-3 text-lg font-semibold text-white hover:bg-neutral-700"
		>
			{playing ? 'Pause' : 'Play'}
		</button>

		<MonochromeButton bind:on={monochrome} />
		<MuteButton bind:on={metronome} />
	</section>

	<section class="mt-4 flex justify-center">
		<InstallButton />
	</section>
</main>
