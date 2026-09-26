import { describe, it, expect } from 'vitest';
import { parseTimeSignature, parsePattern, buildGrid } from './rhythm';

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
