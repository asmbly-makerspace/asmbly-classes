<script>
	import { superForm } from 'sveltekit-superforms/client';
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';

	export let data;
	export let dataType;
	export let validators;

	export const _form = superForm(data, {
		dataType: dataType,
		validators: validators,
		validationMethod: 'auto',
		customValidity: true,
		scrollToError: 'auto',
		autoFocusOnError: 'detect',
		applyAction: true,
		resetForm: true,
	});

	const {
		form,
		message,
		delayed,
		errors,
		allErrors,
		enhance,
		formId,
		constraints,
		validate,
		tainted
	} = _form;
</script>

<!-- <SuperDebug data={$form} /> -->

<form
	method="POST"
	use:enhance
    {...$$restProps}
>
    <slot
    form={_form}
    message={$message}
    errors={$errors}
    allErrors={$allErrors}
    delayed={$delayed}
    tainted={$tainted}
    />
</form>
