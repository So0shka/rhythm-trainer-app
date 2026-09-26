// SMuFL codepoints from the "Individual notes" range (U+E1D0–U+E1EF) — complete
// notes with stems and flags, meant for inline rhythmic notation.
const NOTE_CODEPOINT: Record<number, number> = {
	1: 0xe1d2, // noteWhole
	2: 0xe1d3, // noteHalfUp
	4: 0xe1d5, // noteQuarterUp
	8: 0xe1d7, // note8thUp
	16: 0xe1d9, // note16thUp
	32: 0xe1db // note32ndUp
};

// Beamed group built from the short-stem "Note fragments" glyphs:
//   BLACK + [CONT + FRAC] * (N-1)
// A plain notehead, then for each following note a beam-continuation segment (CONT)
// plus a fractional-beam notehead (FRAC). The CONT segments tile into one continuous
// beam — single for 8ths, double for 16ths — that ends exactly on the last note.
const BEAM_FIRST = 0xe1f0; // textBlackNoteShortStem

const BEAM_CONT: Record<number, number> = {
	8: 0xe1f7, // textCont8thBeamShortStem
	16: 0xe1f9 // textCont16thBeamShortStem
};

const BEAM_FRAC: Record<number, number> = {
	8: 0xe1f2, // textBlackNoteFrac8thShortStem
	16: 0xe1f4 // textBlackNoteFrac16thShortStem
};

const REST_CODEPOINT: Record<number, number> = {
	1: 0xe4e3, // restWhole
	2: 0xe4e4, // restHalf
	4: 0xe4e5, // restQuarter
	8: 0xe4e6, // rest8th
	16: 0xe4e7, // rest16th
	32: 0xe4e8 // rest32nd
};

const AUGMENTATION_DOT = 0xe1e7;

export function noteGlyph(value: number): string {
	const cp = NOTE_CODEPOINT[value];
	return cp === undefined ? '' : String.fromCodePoint(cp);
}

export function restGlyph(value: number): string {
	const cp = REST_CODEPOINT[value];
	return cp === undefined ? '' : String.fromCodePoint(cp);
}

export function dotGlyphs(dots: number): string {
	return String.fromCodePoint(AUGMENTATION_DOT).repeat(dots);
}

export function isBeamableValue(value: number): boolean {
	return value in BEAM_CONT;
}

export function beamGlyphs(value: number, count: number): string {
	const cont = BEAM_CONT[value];
	const frac = BEAM_FRAC[value];
	if (cont === undefined || frac === undefined || count < 2) return '';
	const pair = String.fromCodePoint(cont) + String.fromCodePoint(frac);
	return String.fromCodePoint(BEAM_FIRST) + pair.repeat(count - 1);
}
