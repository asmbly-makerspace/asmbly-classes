<script>
	import NeonEventType from '$lib/models/neonEventType.js'
	import NeonEventInstance from '$lib/models/neonEventInstance.js'
	import AsmblyIcon from '$lib/components/asmblyIcon.svelte'
	import Fuse from 'fuse.js';
	import { DateTime } from 'luxon';

	export let classJson = []
	export let filters = {}
	export let categoryMap = new Map()

	const classImages = import.meta.glob('$lib/images/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp}', {
		eager: true,
		query: {
			enhanced: true
		}
	});

	const classTypeList = classJson.map(c => new NeonEventType(c));

	function filterClasses(classList, categoryMap, filters) {

		// check for category filters
		const categories = []
		for (const [k,v] of categoryMap) {
			if (v) categories.push({category: `=${k}`})
		}

		// initialize query and keys
		let query = {$and: []};
		let keys = []

		// generate query based on what's available
		if (filters.searchTerm) {
			query.$and.push({name: filters.searchTerm})
			keys.push('name')
		}
		if (categories.length) {
			query.$and.push({$or: categories})
			keys.push('category')
		}

		let result
		// query or return all
		if (keys.length) {
			const fuse = new Fuse(classList, {
				useExtendedSearch: true,
				includeScore: true,
				threshold: 0.25,
				keys,
			})
			result = fuse.search(query).map(i => i.item)
		} else {
			result = classList
		}

		// hide full or past
		if (!filters.showAll) {
			const now = DateTime.local({zone: 'America/Chicago'})
			result = result.filter(r => r.isAvailable(filters.groupByClass))
		}

		// sort
		return result.sort((a,b) => a.compare(b, filters.sortBy, filters.sortAsc))
	}

	$: allClassList = classTypeList.map(t => t.instanceList(filters.groupByClass)).flat()

	$: filteredClassList = filterClasses(allClassList, categoryMap, filters);
</script>

{#each filteredClassList as event}
	<div class="card mx-2 mb-4 rounded-none bg-base-100 shadow-xl lg:card-side lg:max-h-80">
		<figure class="w-full lg:w-4/5">
			<enhanced:img
				class="object-cover h-full"
				src={event.getClassImage(classImages)}
				alt="{event.name} image"
			/>
		</figure>

		<div class="card-body w-full">
			<div class="flex justify-between">
				<h2 class="font-asmbly text-accent card-title font-light">{event.name}</h2>
				<div class="grid h-8 w-8 place-items-center">
					<AsmblyIcon category={event.category} alwaysChecked={true} />
				</div>
			</div>
			<p class="text-lg">{#if filters.groupByClass} Next Class: {/if} <b>
				{event.startDateTime.toLocaleString('en-US', {dateStyle: "short", timeStyle: "short"})}
			</b></p>
			{#if event.summary}
			<p class="text-md">
				{event.summary.length > 200
					? event.summary.substring(0, 200) + '...'
					: event.summary}
			</p>
			{:else}
			<p class="text-md">No summary available</p>
			{/if}
			<div class="card-actions content-center justify-end">
				<p>Price: {event.price === 0 ? 'Free' : '$' + event.price + '.00'}</p>
				<a class="btn btn-primary rounded-none" href="/event/{event.typeId}?eventId={event.eventId}">Learn More</a>
			</div>
		</div>
	</div>
{/each}
{#if filteredClassList.length === 0}
	<div
		class="card mx-2 mb-4 rounded-none bg-base-100 shadow-xl lg:card-side lg:mr-64 lg:max-h-64"
	>
		<figure class="h-64 w-full lg:w-4/5">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 -960 960 960"
				class="h-full w-full fill-base-content"
				><path
					d="M480-420q-68 0-123.5 38.5T276-280h408q-25-63-80.5-101.5T480-420Zm-168-60 44-42 42 42 42-42-42-42 42-44-42-42-42 42-44-42-42 42 42 44-42 42 42 42Zm250 0 42-42 44 42 42-42-42-42 42-44-42-42-44 42-42-42-42 42 42 44-42 42 42 42ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"
				/></svg
			>
		</figure>
		<div class="card-body w-full">
			<h2 class="font-asmbly text-accent card-title font-light">Sorry, no results found</h2>
			<p class="text-md">
				We couldn't find any classes that match your search. Try adjusting your filters or
				checking your spelling.
			</p>
			<div class="card-actions content-center justify-end">
				<button on:click={() => filters.searchTerm = ''} class="btn btn-primary rounded-none"
					>Clear Search</button
				>
			</div>
		</div>
	</div>
{/if}
