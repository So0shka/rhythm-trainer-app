import { describe, it, expect } from 'vitest';
import { parseTimeSignature, parsePattern, buildGrid, groupForNotation } from './rhythm';
import { beamGlyphs } from './smufl';

const ts44 = { beats: 4, unit: 4 };

function onsets(pattern: string, ts = ts44) {
	const { notes } = parsePattern(pattern, ts);
	const grid = buildGrid(ts, notes);
	return grid.slots.map((s) => (s === 'onset' ? '*' : s === 'sustain' ? '-' : ' '));
}

describe('parseTimeSignature', () => {
	it('parses 4/4', () => {
		expect(parseTimeSignature('4/4')).toEqual({ beats: 4, unit: 4 });
	});
	it('tolerates whitespace', () => {
		expect(parseTimeSignature(' 3 / 8 ')).toEqual({ beats: 3, unit: 8 });
	});
	it('rejects garbage', () => {
		expect(parseTimeSignature('abc')).toBeNull();
	});
});

describe('parsePattern — examples from the spec', () => {
	it('"1" — a whole note fills the bar', () => {
		expect(onsets('1').join('')).toBe('*---');
	});
	it('"22" — two half notes', () => {
		expect(onsets('22').join('')).toBe('*-*-');
	});
	it('"2+4" — dotted half + quarter', () => {
		expect(onsets('2+4').join('')).toBe('*--*');
	});
});

describe('parsePattern — other cases', () => {
	it('"4444" — four quarter notes', () => {
		expect(onsets('4444').join('')).toBe('****');
	});
	it('eighth notes produce subdivisions', () => {
		const { notes } = parsePattern('88', ts44);
		const grid = buildGrid(ts44, notes);
		expect(grid.subdivisions).toBe(2);
		expect(grid.slots.slice(0, 2)).toEqual(['onset', 'onset']);
	});
	it('short pattern warns', () => {
		expect(parsePattern('4', ts44).warning).toContain('shorter');
	});
	it('long pattern warns', () => {
		expect(parsePattern('11', ts44).warning).toContain('longer');
	});
	it('exact bar has no warning', () => {
		expect(parsePattern('2+4', ts44).warning).toBeUndefined();
	});
	it('unexpected character errors', () => {
		expect(parsePattern('2x', ts44).error).toBeTruthy();
	});
	it('leading "+" errors', () => {
		expect(parsePattern('+2', ts44).error).toBeTruthy();
	});
});

describe('parsePattern — rests', () => {
	it('"r4" is a quarter rest (empty slots, no onset)', () => {
		const { notes } = parsePattern('r4', ts44);
		expect(notes[0]).toMatchObject({ value: 4, rest: true });
		expect(onsets('r4').join('')).toBe('    ');
	});
	it('"4 r4 4 r4" onsets only on beats 1 and 3', () => {
		expect(onsets('4 r4 4 r4').join('')).toBe('* * ');
	});
	it('a dotted rest parses ("r2+" = 3 beats)', () => {
		const { notes } = parsePattern('r2+', ts44);
		expect(notes[0]).toMatchObject({ value: 2, dots: 1, rest: true });
		expect(notes[0].durationBeats).toBeCloseTo(3);
	});
	it('a lone "r" errors', () => {
		expect(parsePattern('r', ts44).error).toBeTruthy();
	});
	it('"rr4" errors', () => {
		expect(parsePattern('rr4', ts44).error).toBeTruthy();
	});
	it('a rest breaks a beam group', () => {
		const items = groupForNotation(parsePattern('8 r8 8', ts44).notes);
		expect(items.map((i) => i.kind)).toEqual(['single', 'single', 'single']);
	});
});

describe('groupForNotation — beaming', () => {
	const group = (pattern: string, ts = ts44) => groupForNotation(parsePattern(pattern, ts).notes);

	it('"8888" beams two eighths per beat', () => {
		const items = group('8888');
		expect(items.map((i) => i.kind)).toEqual(['beam', 'beam']);
		expect(items.every((i) => i.kind === 'beam' && i.notes.length === 2)).toBe(true);
	});

	it('"4 8 8" — quarter alone, two eighths beamed', () => {
		const items = group('488');
		expect(items.map((i) => i.kind)).toEqual(['single', 'beam']);
	});

	it('a lone eighth is not beamed', () => {
		const items = group('84'); // eighth then quarter (does not fill bar, but grouping still applies)
		expect(items.map((i) => i.kind)).toEqual(['single', 'single']);
	});

	it('four sixteenths in one beat beam together', () => {
		const items = group('161616164'); // 4x16 (one beat) + ... rest quarters
		expect(items[0]).toMatchObject({ kind: 'beam', value: 16 });
		expect(items[0].kind === 'beam' && items[0].notes.length).toBe(4);
	});

	it('non-flagged notes stay single', () => {
		expect(group('22').map((i) => i.kind)).toEqual(['single', 'single']);
	});

	it('a dotted eighth is not beamed', () => {
		expect(group('8+16').map((i) => i.kind)).toEqual(['single', 'single']);
	});
});

describe('beamGlyphs — recipe', () => {
	const BLACK = String.fromCodePoint(0xe1f0); // plain notehead (first note)
	const CONT8 = String.fromCodePoint(0xe1f7); // 8th beam-continuation segment
	const FRAC8 = String.fromCodePoint(0xe1f2); // fractional-beam notehead

	it('a beam of N is BLACK + [CONT + FRAC] * (N-1)', () => {
		expect(beamGlyphs(8, 2)).toBe(BLACK + CONT8 + FRAC8);
		expect(beamGlyphs(8, 3)).toBe(BLACK + CONT8 + FRAC8 + CONT8 + FRAC8);
	});

	it('counts below 2 produce nothing (singles are drawn elsewhere)', () => {
		expect(beamGlyphs(8, 1)).toBe('');
	});
});
