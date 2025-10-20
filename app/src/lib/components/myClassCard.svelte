<script context="module">
    import AsmblyIcon from '$lib/components/asmblyIcon.svelte';

    function getClassImage(eventName, category, classImages) {
		let result = classImages['/src/lib/images/' + eventName.replace(/\s+/g, '_') + '.jpg'];

		if (typeof result === 'undefined' || result === null) {
			switch (category) {
				case 'Laser Cutting':
					result = classImages['/src/lib/images/lasersDefault.jpg'];
					break;
				default:
					const imgPath = category.replace(' ', '').toLowerCase()
					result = classImages[`/src/lib/images/${imgPath}Default.jpg`]
			}
		}
		if (typeof result === 'undefined' || result === null) {
			result = classImages['/src/lib/images/classDefault.jpg'];
		}

		return result.default;
	}

    const classImages = import.meta.glob('$lib/images/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp}', {
		eager: true,
		query: {
			enhanced: true
		}
	});
</script>

<script>
    export let userClass;
</script>

{#if userClass}
<div class="card mx-2 mb-4 rounded-none bg-base-100 shadow-xl lg:card-side lg:max-h-72 lg:max-w-4xl">
	<figure class="w-full lg:w-4/5 lg:flex">
		<enhanced:img
			class="object-cover h-full lg:w-auto lg-flex-shrink-0 lg:object-center"
			src={getClassImage(userClass.eventType.name, userClass.eventType.category[0].archCategories.name, classImages)}
			alt="{userClass.eventType.name} image"
		/>
	</figure>
	<div class="card-body w-full">
		<div class="flex justify-between">
			<h2 class="font-asmbly text-accent card-title font-light">{userClass.eventType.name}</h2>
			<div class="grid h-8 w-8 place-items-center">
				<AsmblyIcon category={userClass.eventType.category[0].archCategories.name} alwaysChecked={true} />
			</div>
		</div>
		<p class="text-md">Date: {userClass.startDateTime.toLocaleString('en-US', {dateStyle: "short", timeStyle: "short"})}</p>
		<div class="card-actions content-center float-right">
			<a class="btn btn-primary rounded-none" aria-label="Cancel registration for {userClass.eventType.name}">Cancel Registration</a>
		</div>
	</div>
</div>
{/if}