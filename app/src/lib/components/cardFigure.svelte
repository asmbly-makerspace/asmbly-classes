<script>
    let _class = "";

    export { _class as class };
</script>

<div class="overflow-hidden flex justify-center lg:justify-end lg:w-3/5 xl:w-4/5 lg:h-full">
    <figure class={"lg:flex-shrink-0 min-w-full " + _class}>
        <slot />
    </figure>
</div>