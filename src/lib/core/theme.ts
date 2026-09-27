// Colours a RhythmBar cell uses; `sustain` is the held-note tint.
export type CellColors = { onset: string; sustain: string };

export type Theme = {
	id: string;
	name: string;
	right: CellColors;
	left: CellColors;
};

export const themes = {
	color: {
		id: 'color',
		name: 'Colour',
		right: { onset: '#0084d1', sustain: '#d1d5db' },
		left: { onset: '#f54900', sustain: '#d1d5db' }
	},
	mono: {
		id: 'mono',
		name: 'Monochrome',
		right: { onset: '#171717', sustain: '#d1d5db' },
		left: { onset: '#171717', sustain: '#d1d5db' }
	}
} satisfies Record<string, Theme>;
