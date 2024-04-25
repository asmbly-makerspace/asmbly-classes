<script context="module">
	import AsmblyIcon from '$lib/components/asmblyIcon.svelte'
	import { DateTime } from 'luxon';
	const classImages = import.meta.glob('$lib/images/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp}', {
		eager: true,
		query: {
			enhanced: true
		}
	});
</script>

<script>
	export let filters = {};
	export let event;

	$: summaryLength = filters.compact ? 100 : 200;

	$: summary = event.summary ? `${event.summary.substring(0, summaryLength)}${event.summary.length > summaryLength ? '...' : ''}` : 'No summary available'
</script>

{#if event}
<div class="card mx-2 mb-4 rounded-none bg-base-100 shadow-xl lg:card-side lg:max-h-80">
	<figure class="{filters.compact ? ' lg:w-1/3' : 'w-full lg:w-4/5'}">
		<enhanced:img
			class="object-cover h-full {filters.compact ? 'hidden lg:block' : ''}"
			src={event.getClassImage(classImages)}
			alt="{event.name} image"
		/>
	</figure>
	<div class="card-body w-full {filters.compact ? 'p-4' : ''}">
		<div class="flex justify-between items-baseline flex-wrap">
			<h2 class="font-asmbly text-accent card-title font-light">{event.name}</h2>
			<div class="grid h-8 w-8 place-items-center {filters.compact ? 'order-last' : ''}">
				<AsmblyIcon category={event.category} alwaysChecked={true} />
			</div>
		</div>
		<p class="text-lg">{#if filters.groupByClass} Next Class: {/if} <b>
			{event.startDateTime.toLocaleString('en-US', {dateStyle: "short", timeStyle: "short"})}</b>&nbsp;at
						{event.startDateTime.toLocaleString(DateTime.TIME_SIMPLE)}
		</p>
		<div class="">
				<p class="text-md">{summary}</p>
				<p class="inline-block">Price: {event.price === 0 ? 'Free' : '$' + event.price + '.00'}</p>
			<div class="card-actions content-center float-right">
				<a class="btn btn-primary rounded-none" href="/event/{event.typeId}?eventId={event.eventId}" aria-label="learn more about {event.name} class">Learn More</a>
			</div>
		</div>
	</div>
</div>
{/if}
