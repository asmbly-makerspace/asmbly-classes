<script>
    import Action from './cardAction.svelte';
    import Title from './cardTitle.svelte';
    import Description from './cardDescription.svelte';
    import Figure from './cardFigure.svelte';

    let _class = "";

    export { _class as class };

</script>

<div class={"flex flex-col md:flex-row md:max-h-content " + _class }>
        <slot {Figure} {Action} {Title} {Description}/>
</div>