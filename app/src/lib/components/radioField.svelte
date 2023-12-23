<script>   
    import { formFieldProxy } from 'sveltekit-superforms/client';
    
    let _class = ""
 
    export {_class as class}
    export let field
    export let form
    export let options = ["Private", "Checkout"]
    export let noCheckouts = []
    export let className = ""

    const { value, errors, constraints } = formFieldProxy(form, field);
</script>


{#each options as option}
<div class="flex items-center my-2">    
    <input 
        class={"radio radio-primary" + _class} 
        type="radio"
        name={field}  
        value={option}
        bind:group={$value}
        disabled={noCheckouts.includes(className) && option === "Checkout"}  
        {...$constraints}  
        {...$$restProps}
    />    
    {#if options !== undefined}
    <label class="label mx-2" for={field} disabled={noCheckouts.includes(className) && option === "Checkout"}>{option}</label>
    {/if}
</div>
{#if $errors}
    <p class="help is-danger">{$errors}</p>
{/if}
{/each}


<style>

</style>