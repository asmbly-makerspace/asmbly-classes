<script>

</script>

<svelte:head>
    <title>Asmbly | My Classes Login</title>
</svelte:head>

<div class="flex flex-col items-center justify-start lg:min-h-[calc(100dvh-4rem)]">
	<h1
		class="font-asmbly font-light text-accent pt-8 text-center text-4xl all-under"
	>
		My Classes
	</h1>
	<div class="card max-w-max lg:w-96 m-4 max-h-max bg-base-100 shadow-xl mt-10 rounded-none">
		<figure class="px-16 pt-16">
			<enhanced:img src="$lib/images/NeonLogo.png" alt="Neon One Logo" class="h-auto w-full"/>
		  </figure>
		<div class="card-body items-center text-center">
		  <p>Click the button below to login to your Neon account. You will be redirected back here after login.</p>
		  <a
			  class="btn btn-primary rounded-none mt-6 w-full text-lg hover:text-secondary"
			  href="/my-classes/login/neon"
			  >Login</a
		  >
		</div>
	</div>
	<div class="mb-12 mt-6">
		<p>Don't have a Neon account yet? <a class="underline hover:text-primary" href="https://asmbly.app.neoncrm.com/forms/new-account-create" target="_blank" rel="noopener">Sign up here</a>.</p>
	</div>
</div>