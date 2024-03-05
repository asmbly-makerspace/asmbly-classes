<script>
    const randomId = Math.random().toString(36).substring(2, 15)
    export let fieldId = randomId;

    function collapseFaq() {
        let faqs = document.getElementsByTagName('input');
        for (const faq of faqs) {
            if (faq.checked && faq.id !== fieldId) {
                faq.checked = false
            }
        }
    }
</script>

<div class="collapse collapse-plus bg-base-200 my-2 rounded-none">
    <input id={fieldId} type="checkbox" name="classFAQ" class="peer" on:click={() => collapseFaq()}/>
    <slot name="collpase-title"/>
    <slot name="content"/>
</div>