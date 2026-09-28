// Synthesized metronome click via the Web Audio API — no audio files needed.
// The strong beat (downbeat) is higher and louder than the weak beats.
export class Metronome {
	private ctx: AudioContext | null = null;
	private unlocked = false;

	// Create/resume the audio context. Must be called from a user gesture
	// (e.g. the Play button) or the browser will keep audio suspended.
	resume() {
		if (!this.ctx) {
			// Safari < 14.1 (older iOS) only exposes the prefixed constructor.
			const Ctx =
				window.AudioContext ??
				(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
			this.ctx = new Ctx();
		}

		// iOS 16.4+: play through the ring/silent switch instead of being muted by it.
		const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
		if (session) session.type = 'playback';

		this.ctx.resume();
		this.unlock();
	}

	// iOS keeps a freshly created context effectively silent until a sound is
	// actually started inside the user gesture. Our first real click fires later
	// (from requestAnimationFrame), so play one silent buffer now to unlock it.
	private unlock() {
		const ctx = this.ctx;
		if (!ctx || this.unlocked) return;
		const source = ctx.createBufferSource();
		source.buffer = ctx.createBuffer(1, 1, 22050);
		source.connect(ctx.destination);
		source.start(0);
		this.unlocked = true;
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
