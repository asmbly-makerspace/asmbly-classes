<script>
    const randomId = Math.random().toString(36).substring(2, 15)
    export let fieldId = randomId;

    function scrollIntoView(id) {
	    document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
	}
</script>

<div class="collapse join-item collapse-arrow border border-base-300">
    <input id={fieldId} type="checkbox" name="my-accordion-4" on:input={() => scrollIntoView(fieldId)}/>
    <slot name="collpase-title" />
    <slot name="content" />
</div>