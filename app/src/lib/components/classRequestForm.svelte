<script>
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import autoAnimate from '@formkit/auto-animate';

	export let data;
	export let dataType;
	export let invalidateAll;
	export let validators;
	export let classTypeId;
	export let eventId;

	export const _form = superForm(data, {
		dataType: dataType,
		invalidateAll: invalidateAll,
		validators: validators,
		validationMethod: 'auto',
		customValidity: true,
		scrollToError: 'auto',
		autoFocusOnError: 'detect',
		clearOnSubmit: 'errors-and-message',
		multipleSubmits: 'prevent',
		resetForm: true,
		delayMs: 300,
		onSubmit({ formData }) {
			if (classTypeId) {
				formData.set('classTypeId', classTypeId);
			}
			if (eventId) {
				formData.set('eventId', eventId);
			}
		}
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

<form method="POST" use:enhance {...$$restProps}>
	<slot
		form={_form}
		message={$message}
		errors={$errors}
		allErrors={$allErrors}
		delayed={$delayed}
		tainted={$tainted}
	/>
</form>
