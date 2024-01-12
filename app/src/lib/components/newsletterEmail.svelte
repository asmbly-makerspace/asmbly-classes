<script>
	import { formFieldProxy } from 'sveltekit-superforms/client';
	import autoAnimate from '@formkit/auto-animate';

	let _class = '';

	export { _class as class };
	export let placeholder = 'placeholder';
	export let label = undefined;
	export let field;
	export let form;

	const { value, errors, constraints } = formFieldProxy(form, field);

	const randomId = Math.random().toString(36).substring(2, 15)
</script>

<div class="control relative " use:autoAnimate>
	<input
		class={'peer transition-all input h-20 placeholder-shown:h-14 bg-secondary text-secondary-content rounded-none placeholder-transparent focus:outline-none focus:h-20 ' +
			_class}
		autocomplete="email"
		name={field}
		aria-invalid={$errors ? 'true' : undefined}
		id={field + randomId}
		{placeholder}
		bind:value={$value}
		{...$constraints}
		{...$$restProps}
	/>
	{#if label !== undefined}
		<label
			class="label cursor-text absolute -top-1 left-3 text-xs text-secondary-content/90 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-secondary-content/75 peer-focus:-top-1 peer-focus:text-xs peer-focus:text-secondary-content/90"
			for={field + randomId}>{label}</label
		>
	{/if}
	{#if $errors}
		<p class="help ml-4 mt-1 text-error text-sm">{$errors}</p>
	{/if}
</div>

<style>
</style>
