// Synthesized metronome click via the Web Audio API — no audio files needed.
// The strong beat (downbeat) is higher and louder than the weak beats.
export class Metronome {
	private ctx: AudioContext | null = null;

	// Create/resume the audio context. Must be called from a user gesture
	// (e.g. the Play button) or the browser will keep audio suspended.
	resume() {
		this.ctx ??= new AudioContext();
		this.ctx.resume();
	}

	click(strong: boolean) {
		const ctx = this.ctx;
		if (!ctx) return;
		const t = ctx.currentTime;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		// Sine wave with a gentle attack/decay for a soft, low click.
		osc.type = 'sine';
		osc.frequency.value = strong ? 1000 : 600;
		gain.gain.setValueAtTime(0.0001, t);
		gain.gain.exponentialRampToValueAtTime(strong ? 0.4 : 0.25, t + 0.006);
		gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
		osc.connect(gain).connect(ctx.destination);
		osc.start(t);
		osc.stop(t + 0.12);
	}

	close() {
		this.ctx?.close();
		this.ctx = null;
	}
}
