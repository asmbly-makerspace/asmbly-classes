<script>
	const clientId = 'BoM2ra2_3TKxvlh9UIQyqRkK2Eo7eW1mUxWg2_E37C36qw4n3XYViFOxlyKEiW2h';
	const redirect_uri = '127.0.0.1:5173/my-classes';
	const encodedClientId = encodeURI(clientId);
	const encodedRedirectUri = encodeURI(redirect_uri);

</script>

<svelte:head>
	<title>Asmbly | My Classes</title>
	<meta name="description" content="View and update your class registrations at Asmbly." />
	<meta name="keywords" content="classes, asmbly" />
</svelte:head>

<div class="card-body h-[calc(100dvh-4rem)]">
	<a
		class="btn btn-primary rounded-none"
		href="https://asmbly.app.neoncrm.com/np/oauth/auth?response_type=code&client_id={encodedClientId}&redirect_uri={encodedRedirectUri}"
		>Login to Neon</a
	>
</div>
