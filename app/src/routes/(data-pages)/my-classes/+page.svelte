<script>
	import MyClasses from '$lib/components/myClasses.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
</script>

<svelte:head>
	<title>Asmbly | My Classes</title>
	<meta name="description" content="View and update your class registrations at Asmbly." />
	<meta name="keywords" content="classes, asmbly" />
</svelte:head>

<MyClasses user={data.user} userClasses={data.userClasses} />