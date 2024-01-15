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

<div class="control relative mt-10" use:autoAnimate>
	<input
		class={'peer input h-10 rounded-none border-0 border-b-2 border-base-300 placeholder-transparent focus:border-primary focus:outline-none autofill:shadow-[inset_0_0_0px_1000px_rgb(43,44,107,0.3)] ' +
			_class}
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
			class="label cursor-text absolute -top-7 left-3 text-sm text-base-content/90 transition-all peer-placeholder-shown:top-0 peer-placeholder-shown:text-base peer-placeholder-shown:text-base-content/75 peer-focus:-top-7 peer-focus:text-sm peer-focus:text-base-content/90"
			for={field + randomId}>{label}</label
		>
	{/if}
	{#if $errors}
		<p class="help ml-4 mt-1 text-error text-sm">{$errors}</p>
	{/if}
</div>

<style>
</style>
