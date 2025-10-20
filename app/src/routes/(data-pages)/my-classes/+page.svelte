<script>
	import MyClassCard from '$lib/components/myClassCard.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
</script>

<svelte:head>
	<title>Asmbly | My Classes</title>
	<meta name="description" content="View and update your class registrations at Asmbly." />
	<meta name="keywords" content="classes, asmbly" />
</svelte:head>

<div id="main" class="flex flex-col items-center justify-start pb-8 lg:min-h-[calc(100dvh-4rem)]">
    <h1
        class="font-asmbly text-accent all-under pb-2 pt-8 text-center text-2xl font-light lg:pb-6 lg:text-4xl"
    >
        My Classes
    </h1>
    {#if data.userClasses && data.userClasses.length > 0}
        {#each data.userClasses as userClass}
            <MyClassCard {userClass} />
        {/each}
    {:else}
        <p>You have no registered classes.</p>
    {/if}
</div>