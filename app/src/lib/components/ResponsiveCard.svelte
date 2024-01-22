<script>
    import Action from './cardAction.svelte';
    import Title from './cardTitle.svelte';
    import Description from './cardDescription.svelte';
    import Figure from './cardFigure.svelte';

    let _class = "";

    export { _class as class };

</script>

<div class={"flex flex-col md:flex-row overflow-hidden lg:max-h-[500px] " + _class }>
        <slot {Figure} {Action} {Title} {Description}/>
</div>