<script lang="ts">
	// `beforeinstallprompt` isn't in the standard TS DOM lib yet.
	type BeforeInstallPromptEvent = Event & {
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
	};

	import IosInstallHint from './IosInstallHint.svelte';

	let deferred = $state<BeforeInstallPromptEvent | null>(null);

	const standalone =
		window.matchMedia('(display-mode: standalone)').matches ||
		(navigator as Navigator & { standalone?: boolean }).standalone === true;

	// iOS Safari never fires `beforeinstallprompt`; installing is manual via the
	// Share sheet. Only real Safari supports Add to Home Screen (not Chrome/Firefox on iOS).
	const isIosSafari =
		/iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);

	// The prompt is captured very early by an inline script in app.html (see there),
	// since it can fire before this component mounts.
	const w = window as Window & { deferredInstallPrompt?: BeforeInstallPromptEvent };

	$effect(() => {
		if (w.deferredInstallPrompt) deferred = w.deferredInstallPrompt;

		const onReady = () => (deferred = w.deferredInstallPrompt ?? null);
		const onInstalled = () => {
			w.deferredInstallPrompt = undefined;
			deferred = null;
		};
		window.addEventListener('installpromptready', onReady);
		window.addEventListener('appinstalled', onInstalled);
		return () => {
			window.removeEventListener('installpromptready', onReady);
			window.removeEventListener('appinstalled', onInstalled);
		};
	});

	async function install() {
		if (!deferred) return;
		await deferred.prompt();
		await deferred.userChoice;
		w.deferredInstallPrompt = undefined;
		deferred = null; // the prompt event can only be used once
	}
</script>

{#if !standalone}
	{#if deferred}
		<button
			onclick={install}
			class="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-900"
		>
			Install app
		</button>
	{:else if isIosSafari}
		<IosInstallHint />
	{/if}
{/if}
