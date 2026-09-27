import { page } from '$app/state';
import { parsePattern } from './rhythm';

export const numerators = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const denominators = [1, 2, 4, 8, 16];

const DEFAULTS = { num: 4, den: 4, right: '2+4', left: '22' };

function intParam(sp: URLSearchParams, name: string, options: number[], fallback: number): number {
	const v = Number(sp.get(name));
	return options.includes(v) ? v : fallback;
}

function patternParam(sp: URLSearchParams, name: string, fallback: string): string {
	const v = sp.get(name);
	if (v == null) return fallback;
	return parsePattern(v, { beats: 4, unit: 4 }).error ? fallback : v;
}

// Reactive rhythm parameters, read from the URL (with per-param fallbacks). Instantiate
// at a component's top level, then drive `sync()` from an $effect so every change is
// written back to the URL (replace — history isn't spammed):
//
//   const params = new RhythmParams();
//   $effect(() => params.sync());
export class RhythmParams {
	numerator = $state(DEFAULTS.num);
	denominator = $state(DEFAULTS.den);
	right = $state(DEFAULTS.right);
	left = $state(DEFAULTS.left);

	constructor() {
		const sp = page.url.searchParams;
		this.numerator = intParam(sp, 'num', numerators, DEFAULTS.num);
		this.denominator = intParam(sp, 'den', denominators, DEFAULTS.den);
		this.right = patternParam(sp, 'r', DEFAULTS.right);
		this.left = patternParam(sp, 'l', DEFAULTS.left);
	}

	// Reads all params (so an $effect tracks them) and writes them to the URL.
	sync() {
		const q = [
			`num=${this.numerator}`,
			`den=${this.denominator}`,
			`r=${encodeURIComponent(this.right)}`,
			`l=${encodeURIComponent(this.left)}`
		].join('&');
		history.replaceState(history.state, '', `?${q}`);
	}
}
