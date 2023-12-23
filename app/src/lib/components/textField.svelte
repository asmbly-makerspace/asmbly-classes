<script>   
    import { formFieldProxy } from 'sveltekit-superforms/client';
    
    let _class = ""
 
    export {_class as class}
    export let placeholder=""
    export let label = undefined
    export let field
    export let form

    const { value, errors, constraints } = formFieldProxy(form, field);
</script>

{#if label !== undefined}
    <label class="label" for={field}>{label}</label>
{/if}
<div class="control">
    <input 
        class={"input "+ _class} 
        name={field} 
        aria-invalid={$errors ? 'true' : undefined}  
        placeholder={placeholder}
        bind:value={$value}  
        {...$constraints}  
        {...$$restProps}
    />    
</div>
{#if $errors}
    <p class="help is-danger">{$errors}</p>
{/if}

<style>
    .is-danger {
        color: red;
    }
</style>