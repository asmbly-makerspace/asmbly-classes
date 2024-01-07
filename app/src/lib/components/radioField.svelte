<script>
	import { formFieldProxy } from 'sveltekit-superforms/client';
	import { fade } from 'svelte/transition';

	let _class = '';

	export { _class as class };
	export let field;
	export let form;
	export let options = ['Private', 'Checkout'];
	export let noCheckouts = [];
	export let className = '';

	const { value, errors, constraints } = formFieldProxy(form, field);
</script>

{#each options as option}
	<div class="flex items-center">
		<input
			class={'' + _class}
			type="radio"
			name={field}
			value={option}
			bind:group={$value}
			disabled={noCheckouts.includes(className) && option === 'Checkout'}
			{...$constraints}
			{...$$restProps}
		/>
		{#if options !== undefined}
			<label
				class="label mx-2"
				for={field}
				disabled={noCheckouts.includes(className) && option === 'Checkout'}>{option}</label
			>
		{/if}
		{#if $errors}
		<p class="help ml-4 mt-1 text-error text-sm" transition:fade>{$errors}</p>
		{/if}
	</div>
{/each}

<style>
</style>
