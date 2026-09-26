// Notation: a number is a note value (1 whole, 2 half, 4 quarter, 8, 16, 32).
// A "+" after a note dots it ("2+" = dotted half = 3 beats in 4/4).
// An "r" prefix makes it a rest of that value ("r4" = quarter rest, "r2+" = dotted half rest).

export type TimeSignature = { beats: number; unit: number };

export type Note = {
	value: number;
	dots: number;
	durationBeats: number;
	startBeat: number;
	rest: boolean;
};

export type ParsedPattern = {
	notes: Note[];
	totalBeats: number;
	error?: string;
	warning?: string;
};

export type SlotState = 'onset' | 'sustain' | 'rest';

export type RhythmGrid = {
	beats: number;
	subdivisions: number;
	slots: SlotState[];
};

// Longer spellings first so "16" reads as a sixteenth and "22" as two halves.
const VALID_VALUES = ['32', '16', '8', '4', '2', '1'];

const EPS = 1e-6;

export function parseTimeSignature(input: string): TimeSignature | null {
	const m = input.trim().match(/^(\d+)\s*\/\s*(\d+)$/);
	if (!m) return null;
	const beats = parseInt(m[1], 10);
	const unit = parseInt(m[2], 10);
	if (beats <= 0 || unit <= 0) return null;
	return { beats, unit };
}

function dotFactor(dots: number): number {
	return 2 - Math.pow(0.5, dots);
}

export function parsePattern(input: string, ts: TimeSignature): ParsedPattern {
	const notes: Note[] = [];
	const s = input.trim();
	if (!s) return { notes, totalBeats: 0 };

	const raw: { value: number; dots: number; rest: boolean }[] = [];
	let error: string | undefined;
	let pendingRest = false;
	let i = 0;
	while (i < s.length) {
		const ch = s[i];
		if (/\s/.test(ch)) {
			i++;
			continue;
		}
		if (ch === 'r' || ch === 'R') {
			if (pendingRest) {
				error = 'An "r" must be followed by a duration';
				break;
			}
			pendingRest = true;
			i++;
			continue;
		}
		if (ch === '+') {
			if (pendingRest || raw.length === 0) {
				error = 'A "+" must follow a note or rest';
				break;
			}
			raw[raw.length - 1].dots++;
			i++;
			continue;
		}
		let matched: string | null = null;
		for (const v of VALID_VALUES) {
			if (s.startsWith(v, i)) {
				matched = v;
				break;
			}
		}
		if (!matched) {
			error = `Unexpected character: "${ch}". Allowed: note values 1, 2, 4, 8, 16, 32, "+" and "r" (rest).`;
			break;
		}
		raw.push({ value: parseInt(matched, 10), dots: 0, rest: pendingRest });
		pendingRest = false;
		i += matched.length;
	}

	if (!error && pendingRest) error = 'An "r" must be followed by a duration';
	if (error) return { notes, totalBeats: 0, error };

	let start = 0;
	for (const t of raw) {
		const durationBeats = (ts.unit / t.value) * dotFactor(t.dots);
		notes.push({ value: t.value, dots: t.dots, durationBeats, startBeat: start, rest: t.rest });
		start += durationBeats;
	}

	const totalBeats = start;
	let warning: string | undefined;
	if (Math.abs(totalBeats - ts.beats) > EPS) {
		warning =
			totalBeats > ts.beats
				? `Pattern is longer than the bar: ${fmtBeats(totalBeats)} of ${ts.beats} beats`
				: `Pattern is shorter than the bar: ${fmtBeats(totalBeats)} of ${ts.beats} beats`;
	}

	return { notes, totalBeats, warning };
}

// Smallest number of subdivisions per beat that snaps every note start/end onto the grid.
function pickSubdivisions(notes: Note[]): number {
	const candidates = [1, 2, 3, 4, 6, 8, 12, 16];
	const points: number[] = [];
	for (const n of notes) {
		points.push(n.startBeat, n.startBeat + n.durationBeats);
	}
	for (const d of candidates) {
		if (points.every((p) => Math.abs(p * d - Math.round(p * d)) < EPS)) return d;
	}
	return 16;
}

export function buildGrid(ts: TimeSignature, notes: Note[]): RhythmGrid {
	const subdivisions = pickSubdivisions(notes);
	const totalSlots = ts.beats * subdivisions;
	const slots: SlotState[] = new Array(totalSlots).fill('rest');

	for (const note of notes) {
		if (note.rest) continue; // rests leave their slots empty
		const startSlot = Math.round(note.startBeat * subdivisions);
		const endSlot = Math.round((note.startBeat + note.durationBeats) * subdivisions);
		for (let s = startSlot; s < endSlot && s < totalSlots; s++) {
			slots[s] = s === startSlot ? 'onset' : 'sustain';
		}
	}

	return { beats: ts.beats, subdivisions, slots };
}

function fmtBeats(n: number): string {
	return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
}

export type NotationItem =
	| { kind: 'single'; note: Note }
	| { kind: 'beam'; value: number; notes: Note[] };

// Groups notes for engraving: runs of two or more same-value flagged notes within
// one beat are beamed together; everything else stands alone (with its own flag).
export function groupForNotation(notes: Note[]): NotationItem[] {
	const items: NotationItem[] = [];
	let run: Note[] = [];

	const flush = () => {
		if (run.length === 0) return;
		items.push(run.length === 1 ? { kind: 'single', note: run[0] } : { kind: 'beam', value: run[0].value, notes: run });
		run = [];
	};

	for (const n of notes) {
		const beamable = !n.rest && n.dots === 0 && (n.value === 8 || n.value === 16);
		if (!beamable) {
			flush();
			items.push({ kind: 'single', note: n });
			continue;
		}
		if (run.length) {
			const prev = run[run.length - 1];
			const sameBeat = Math.floor(prev.startBeat + EPS) === Math.floor(n.startBeat + EPS);
			if (sameBeat && prev.value === n.value) {
				run.push(n);
				continue;
			}
		}
		flush();
		run = [n];
	}
	flush();
	return items;
}
