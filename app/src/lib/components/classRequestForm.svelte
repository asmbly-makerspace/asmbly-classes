<script>
    import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
    import { superForm } from 'sveltekit-superforms/client'

    export let data;
    export let dataType;
    export let invalidateAll;
    export let validators;

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
    })

    const { form, message, tainted, delayed, errors, allErrors, enhance, formId, constraints, validate } = _form

</script>

<SuperDebug data={$form} />

<form method="POST" use:enhance {...$$restProps}>
    <slot 
        form={_form} 
        message={$message} 
        errors={$errors} 
        allErrors={$allErrors}  
        delayed={$delayed}
        tainted={$tainted}
    ></slot>
</form>
