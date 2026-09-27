<script lang="ts" generics="T extends string | number">
	let {
		value = $bindable(),
		options
	}: {
		value: T;
		options: T[];
	} = $props();
</script>

<select
	bind:value
	class="rounded-md border border-neutral-300 px-2 py-1.5 focus:border-neutral-900 focus:outline-none"
>
	{#each options as opt (opt)}
		<option value={opt}>{opt}</option>
	{/each}
</select>
