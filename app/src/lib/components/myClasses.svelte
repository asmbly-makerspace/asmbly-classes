<script>
    import MyClassCard from '$lib/components/myClassCard.svelte';

    export let user;
    export let userClasses;
</script>


<div id="main" class="flex flex-col items-center justify-start pb-8 lg:min-h-[calc(100dvh-4rem)]">
    <h1
        class="font-asmbly text-accent all-under pb-2 pt-8 text-center text-2xl font-light lg:pb-6 lg:text-4xl"
    >
        My Classes
    </h1>
    {#if userClasses && userClasses.length > 0}
        {#each userClasses as userClass}
            <MyClassCard userClass={userClass} />
        {/each}
    {:else}
        <p>You have no registered classes.</p>
    {/if}
</div>