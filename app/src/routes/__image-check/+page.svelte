<script context="module">
	const classImages = import.meta.glob('$lib/images/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp}', {
		eager: true,
		query: {
			enhanced: true
		}
	});
</script>

<script>
	const imageEntries = Object.entries(classImages)
		.map(([path, image]) => ({
			path,
			src: image.default
		}))
		.sort((left, right) => left.path.localeCompare(right.path));
</script>

<svelte:head>
	<title>Image Check</title>
</svelte:head>

<main>
	<h1>Image Check</h1>
	<p>{imageEntries.length} class images</p>

	{#each imageEntries as image}
		<enhanced:img
			data-testid="class-image"
			data-source-path={image.path}
			src={image.src}
			alt={image.path}
			loading="eager"
		/>
	{/each}
</main>
