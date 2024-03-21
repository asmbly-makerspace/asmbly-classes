<script>
	import Fuse from 'fuse.js';
	import autoAnimate from '@formkit/auto-animate';
	import { DateTime } from 'luxon';

	/** @type {import('./$types').PageData} */
	export let data;

	let searchTerm = '';
	let classList = data.classJson;

	const classImages = import.meta.glob('$lib/images/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp}', {
		eager: true,
		query: {
			enhanced: true
		}
	});

	function getClassImage(className, category) {
		const result = classImages['/src/lib/images/' + className.replace(/\s+/g, '_') + '.jpg'];

		if (typeof result === 'undefined' || result === null) {
			switch (category) {
				case 'Orientation':
				case 'Miscellaneous':
					return classImages['/src/lib/images/classDefault.jpg'].default;
				case 'Woodworking':
					return classImages['/src/lib/images/woodworkingDefault.jpg'].default;
				case 'Metalworking':
					return classImages['/src/lib/images/metalworkingDefault.jpg'].default;
				case 'Laser Cutting':
					return classImages['/src/lib/images/lasersDefault.jpg'].default;
				case '3D Printing':
					return classImages['/src/lib/images/3dprintingDefault.jpg'].default;
				case 'Textiles':
					return classImages['/src/lib/images/textilesDefault.jpg'].default;
				case 'Electronics':
					return classImages['/src/lib/images/electronicsDefault.jpg'].default;
				default:
					return classImages['/src/lib/images/classDefault.jpg'].default;
			}
		}
		return result.default;
	}

	$: archCategories = new Map([
		['Orientation', false],
		['Woodworking', false],
		['Metalworking', false],
		['Laser Cutting', false],
		['3D Printing', false],
		['Textiles', false],
		['Electronics', false],
		['Miscellaneous', false]
	]);

	function filterByCategory(classList, categoryMap) {
		let allFalse = true;
		let newClassList = [];
		for (const [key, value] of categoryMap) {
			if (value) {
				const filtered = classList.filter((i) => i.category === key);
				filtered.forEach((i) => newClassList.push(i));
				allFalse = false;
			}
		}
		newClassList = newClassList;
		if (allFalse) {
			return classList;
		} else {
			return newClassList;
		}
	}

	function filterBySearch(classList, searchTerm) {
		if (searchTerm !== '') {
			const options = {
				keys: ['name'],
				threshold: 0.5
			};
			const fuse = new Fuse(classList, options);
			const result = fuse.search(searchTerm);

			const finalClassList = result.map((i) => i.item);
			return finalClassList;
		} else {
			return classList;
		}
	}

	const svgs = {
		Orientation: [
			'm122.16,77.71V0H0v44.44h20.85C9.16,51.21,1.05,63.5.1,77.71h-.1v5.59h.1c1.38,20.74,18.01,37.37,38.75,38.75v.1h5.59v-.1c14.22-.95,26.5-9.06,33.27-20.75v20.85h83.3v-44.44h-38.86Zm-5.59,0h-33.27v-33.27h33.27v33.27ZM44.44,44.44h33.27v33.27h-33.27v-33.27ZM83.3,5.59h33.27v33.27h-33.27V5.59Zm-38.86,0h33.27v33.27h-33.27V5.59Zm-38.86,0h33.27v33.27H5.59V5.59Zm33.27,38.96v33.16H5.69c1.36-17.66,15.5-31.81,33.16-33.16ZM5.69,83.3h33.16v33.16c-17.66-1.36-31.81-15.5-33.16-33.16Zm38.75,33.16v-33.16h33.16c-1.36,17.66-15.5,31.81-33.16,33.16Zm72.13.11h-33.27v-33.27h33.27v33.27Zm38.86,0h-33.27v-33.27h33.27v33.27Z'
		],
		Woodworking: [
			'm0,0v193.44h193.44V0H0Zm51.49,23.14h118.81v96.45c-23.1-52.93-64.23-86.24-118.81-96.45Zm106.81,147.17h-26.2c-4.79-57.18-50.68-99.4-108.97-100.3v-25.67c83.61,1.92,127.71,63.52,135.17,125.96ZM23.14,119.55v-26.25c45.51,2.4,77.73,31.46,85.42,77h-26.01c-6.31-30.61-28.17-49.28-59.4-50.76Zm35.26,50.76H23.14v-27.3c21.41,1.46,31.01,14.58,35.26,27.3Z'
		],
		Metalworking: [
			'm0,0v194.99h195.73V0H0Zm171.23,170.55h-106.34v-61.19h28.82v-24.44h-53.32v85.62h-15.89V24.44h146.73v146.11Z',
			'm109.83,115.31c4.78,1.97,10.05,1.97,14.83,0,.01,0,.02-.01.04-.02l31.07-12.82c4.46-1.84,4.46-8.14,0-9.98l-31.11-12.84h0c-4.78-1.97-10.04-1.97-14.82,0-4.78,1.97-8.5,5.68-10.48,10.44-1.98,4.76-1.98,10.01,0,14.77,1.98,4.76,5.7,8.47,10.48,10.44Z'
		],
		'Laser Cutting': [
			'm0,0v193.81h193.82V0H0Zm84.95,71.65l-17.8-17.8-16.91,16.92,17.79,17.8h-25.21v23.92h25.21l-17.65,17.65,16.92,16.92,17.65-17.65v24.96h23.92v-24.96l17.92,17.92,16.91-16.92-17.91-17.92h25.25v-23.92h-25.25l18.06-18.06-16.92-16.91-18.06,18.06V23.92h61.02v145.97H23.92V23.92h61.02v47.72Z'
		],
		'3D Printing': [
			'm0,0v194.82h194.82V0H0Zm25.11,52.48v-27.37h48.75l-48.75,27.37Zm144.6,28.14v89.09h-60.23v-53.32l60.23-35.77Zm-50.61-55.51h50.61v30.01l-50.61-30.01Zm-22.26,15.94l44.8,26.82-44.8,26.82-48.11-26.82,48.11-26.82Zm-12.47,75.43v53.24H25.11v-86.46l59.27,33.23Z'
		],
		Textiles: [
			'm0,0v193.23h193.23V0H0Zm24.11,56.66V24.11h34.09v32.56H24.11Zm0,55.8v-31.69h34.09v31.69H24.11Zm0,56.66v-32.56h34.09v32.56H24.11Zm58.2-112.46V24.11h31.7v32.56h-31.7Zm0,55.8v-31.69h31.7v31.69h-31.7Zm0,56.66v-32.56h31.7v32.56h-31.7Zm55.8-112.46V24.11h31.02v32.56h-31.02Zm0,55.8v-31.69h31.02v31.69h-31.02Zm0,56.66v-32.56h31.02v32.56h-31.02Z'
		],
		Electronics: [
			'm0,0v193.32h193.32V0H0Zm169.35,51.11h-74.72c-4.74-11.54-16.08-19.7-29.31-19.7-17.47,0-31.68,14.21-31.68,31.68s14.21,31.69,31.68,31.69c13.23,0,24.58-8.16,29.31-19.7h74.72v94.27h-66.61v-10.48l12.36-12.36c4.23,2.1,8.98,3.31,14.01,3.31,17.47,0,31.68-14.21,31.68-31.68s-14.21-31.69-31.68-31.69-31.68,14.21-31.68,31.69c0,3.63.65,7.11,1.78,10.37l-20.44,20.44v20.41H23.97V23.97h145.38v27.14Zm-96.32,11.99c0,4.26-3.46,7.71-7.71,7.71s-7.71-3.46-7.71-7.71,3.46-7.71,7.71-7.71,7.71,3.46,7.71,7.71Zm48.37,55.04c0-4.26,3.46-7.71,7.71-7.71s7.71,3.46,7.71,7.71-3.46,7.71-7.71,7.71-7.71-3.46-7.71-7.71Z'
		],
		Miscellaneous: [
			'm122.16,77.71V0H0v44.44h20.85C9.16,51.21,1.05,63.5.1,77.71h-.1v5.59h.1c1.38,20.74,18.01,37.37,38.75,38.75v.1h5.59v-.1c14.22-.95,26.5-9.06,33.27-20.75v20.85h83.3v-44.44h-38.86Zm-5.59,0h-33.27v-33.27h33.27v33.27ZM44.44,44.44h33.27v33.27h-33.27v-33.27ZM83.3,5.59h33.27v33.27h-33.27V5.59Zm-38.86,0h33.27v33.27h-33.27V5.59Zm-38.86,0h33.27v33.27H5.59V5.59Zm33.27,38.96v33.16H5.69c1.36-17.66,15.5-31.81,33.16-33.16ZM5.69,83.3h33.16v33.16c-17.66-1.36-31.81-15.5-33.16-33.16Zm38.75,33.16v-33.16h33.16c-1.36,17.66-15.5,31.81-33.16,33.16Zm72.13.11h-33.27v-33.27h33.27v33.27Zm38.86,0h-33.27v-33.27h33.27v33.27Z'
		]
	};

	function generateBackgroundColor(category, alwaysChecked = false) {
		const baseColorVariants = {
			Orientation: 'bg-base-300 group-hover:bg-asmbly',
			Woodworking: 'bg-base-300 group-hover:bg-woodwork',
			Metalworking: 'bg-base-300 group-hover:bg-metalwork',
			'Laser Cutting': 'bg-base-300 group-hover:bg-lasers',
			'3D Printing': 'bg-base-300 group-hover:bg-3dprinting',
			Textiles: 'bg-base-300 group-hover:bg-textiles',
			Electronics: 'bg-base-300 group-hover:bg-electronics',
			Miscellaneous: 'bg-base-300 group-hover:bg-primary'
		};

		const checkedColorVariants = {
			Orientation: 'group-hover:bg-asmbly bg-asmbly',
			Woodworking: 'group-hover:bg-woodwork bg-woodwork',
			Metalworking: 'group-hover:bg-metalwork bg-metalwork',
			'Laser Cutting': 'group-hover:bg-lasers bg-lasers',
			'3D Printing': 'group-hover:bg-3dprinting bg-3dprinting',
			Textiles: 'group-hover:bg-textiles bg-textiles',
			Electronics: 'group-hover:bg-electronics bg-electronics',
			Miscellaneous: 'group-hover:bg-primary bg-primary'
		};

		if (archCategories.get(category) || alwaysChecked) {
			return checkedColorVariants[category];
		} else {
			return baseColorVariants[category];
		}
	}

	function generateFillColor(category, alwaysChecked = false) {
		const baseColorVariants = {
			Orientation:
				'fill-neutral group-hover:fill-asmbly-hover stroke-neutral group-hover:stroke-asmbly-hover',
			Woodworking: 'fill-neutral group-hover:fill-woodwork-hover',
			Metalworking: 'fill-neutral group-hover:fill-metalwork-hover',
			'Laser Cutting': 'fill-neutral group-hover:fill-lasers-hover',
			'3D Printing': 'fill-neutral group-hover:fill-3dprinting-hover',
			Textiles: 'fill-neutral group-hover:fill-textiles-hover',
			Electronics: 'fill-neutral group-hover:fill-electronics-hover',
			Miscellaneous:
				'fill-neutral group-hover:fill-asmbly-hover stroke-neutral group-hover:stroke-asmbly-hover'
		};

		const checkedColorVariants = {
			Orientation:
				'group-hover:fill-asmbly-hover fill-asmbly-hover stroke-asmbly-hover group-hover:stroke-asmbly-hover',
			Woodworking: 'group-hover:fill-woodwork-hover fill-woodwork-hover',
			Metalworking: 'group-hover:fill-metalwork-hover fill-metalwork-hover',
			'Laser Cutting': 'group-hover:fill-lasers-hover fill-lasers-hover',
			'3D Printing': 'group-hover:fill-3dprinting-hover fill-3dprinting-hover',
			Textiles: 'group-hover:fill-textiles-hover fill-textiles-hover',
			Electronics: 'group-hover:fill-electronics-hover fill-electronics-hover',
			Miscellaneous:
				'group-hover:fill-asmbly-hover fill-asmbly-hover stroke-asmbly-hover group-hover:stroke-asmbly-hover'
		};

		const alwaysCheckedVariants = {
			Orientation: 'stroke-accent',
			Woodworking: 'fill-woodwork',
			Metalworking: 'fill-metalwork',
			'Laser Cutting': 'fill-lasers',
			'3D Printing': 'fill-3dprinting',
			Textiles: 'fill-textiles',
			Electronics: 'fill-electronics',
			Miscellaneous: 'stroke-accent'
		};

		if (archCategories.get(category) && !alwaysChecked) {
			return checkedColorVariants[category];
		} else if (alwaysChecked) {
			return alwaysCheckedVariants[category];
		} else {
			return baseColorVariants[category];
		}
	}

	function toggleArchCategory(category) {
		archCategories.set(category, !archCategories.get(category));
		archCategories = archCategories;
	}

	function sortByName(classList) {
		classList.sort((a, b) => {
			const aName = a.name.toLowerCase();
			const bName = b.name.toLowerCase();
			if (aName < bName) {
				return -1;
			} else if (aName > bName) {
				return 1;
			} else {
				return 0;
			}
		});
		return classList;
	}

	function sortByDate(classList) {
		classList.sort((a, b) => {
			if (DateTime.fromJSDate(a.classInstances[0].startDateTime) < DateTime.local({zone: 'America/Chicago'})) {
				return 1;
			} else if (DateTime.fromJSDate(b.classInstances[0].startDateTime) < DateTime.local({zone: 'America/Chicago'})) {
				return -1;
			}
			let sortedClassA = a.classInstances.sort((c1, c2) => {
				if (c1.startDateTime < c2.startDateTime) {
					return -1;
				} else if (c1.startDateTime > c2.startDateTime) {
					return 1;
				} else {
					return 0;
				}
			});
			let sortedClassB = b.classInstances.sort((c1, c2) => {
				if (c1.startDateTime < c2.startDateTime) {
					return -1;
				} else if (c1.startDateTime > c2.startDateTime) {
					return 1;
				} else {
					return 0;
				}
			});
			if (sortedClassA[0].startDateTime < sortedClassB[0].startDateTime) {
				return -1;
			} else if (sortedClassA[0].startDateTime > sortedClassB[0].startDateTime) {
				return 1;
			} else {
				return 0;
			}
		});
		return classList;
	}

	function sortByPrice(classList) {
		classList.sort((a, b) => {
			if (a.classInstances[0].price < b.classInstances[0].price) {
				return -1;
			} else if (a.classInstances[0].price > b.classInstances[0].price) {
				return 1;
			} else {
				return 0;
			}
		});
		return classList;
	}

	function sortBy(classList, sortByKeyword) {
		if (sortByKeyword === 'Date') {
			if (sortOrderKeyword === 'Asc') {
				return sortByDate(classList);
			} else {
				return sortByDate(classList).reverse();
			}
		} else if (sortByKeyword === 'Name') {
			if (sortOrderKeyword === 'Asc') {
				return sortByName(classList);
			} else {
				return sortByName(classList).reverse();
			}
		} else if (sortByKeyword === 'Price') {
			if (sortOrderKeyword === 'Asc') {
				return sortByPrice(classList);
			} else {
				return sortByPrice(classList).reverse();
			}
		}
	}

	function sortClickHandler(keyword) {
		sortByKeyword = keyword;
		document.getElementById('sortDropdown').removeAttribute('open');
	}

	function sortOrderHandler() {
		if (sortOrderKeyword === 'Asc') {
			sortOrderKeyword = 'Desc';
		} else {
			sortOrderKeyword = 'Asc';
		}
	}

	function clearSearch() {
		searchTerm = '';
	}

	let sortByKeyword = 'Date';
	let sortOrderKeyword = 'Asc';

	$: sortContent = 'Sort by: ' + sortByKeyword;
	$: sortOrderContent = 'Order: ' + sortOrderKeyword;

	$: sortedClassList = sortBy(classList, sortByKeyword, sortOrderKeyword);

	$: finalClassList = filterBySearch(filterByCategory(sortedClassList, archCategories), searchTerm);
</script>

<svelte:head>
	<title>Asmbly | Classes</title>
	<meta name="description" content="View and sign up for classes at Asmbly." />
	<meta name="keywords" content="classes, asmbly, woodworking, metalworking, woodshop, CNC, laser, sewing, textiles, electronics, 3d, printing" />
</svelte:head>

<div class="drawer flex justify-center lg:drawer-open lg:min-h-[calc(100dvh-10rem)] 2xl:min-h-[calc(100dvh-20rem)]">
	<input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content order-2">
		<!-- Page content here -->
		<div class="mt-4 flex justify-start">
			<div class="grid place-content-start lg:max-w-4xl" use:autoAnimate>
				<div class="grid grid-rows-2 lg:flex lg:items-center lg:justify-start">
					<div
						class="relative row-start-1 flex w-full flex-1 px-2 text-neutral focus-within:text-neutral lg:max-w-sm"
					>
						<span class="absolute inset-y-0 left-0 flex items-center pl-2">
							<button type="submit" class="focus:shadow-outline p-1 focus:outline-none">
								<svg
									fill="none"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									viewBox="0 0 24 24"
									class="h-6 w-6"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg
								>
							</button>
						</span>
						<input
							type="search"
							name="q"
							class="my-2 w-full bg-base-300 py-2 pl-10 text-sm text-neutral placeholder:italic placeholder:text-neutral focus:bg-secondary focus:text-secondary-content focus:outline-none"
							placeholder="Search by class name..."
							autocomplete="off"
							bind:value={searchTerm}
						/>
					</div>
					<div class="row-start-2 flex justify-center">
						<details id="sortDropdown" class="dropdown">
							<summary class="btn btn-ghost rounded-none lg:ml-2"
								>{sortContent}
								<svg
									fill="none"
									viewBox="0 0 20 20"
									class="h-4 w-4 transform transition-transform duration-200"
									><path
										class="fill-base-content"
										fill-rule="evenodd"
										d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
										clip-rule="evenodd"
									/></svg
								>
							</summary>
							<ul
								class="menu dropdown-content z-[1] w-40 rounded-none bg-base-100 p-2 shadow-xl"
							>
								<li><button class="rounded-none" on:click={() => sortClickHandler('Date')}>Date</button></li>
								<li><button class="rounded-none" on:click={() => sortClickHandler('Name')}>Name</button></li>
								<li>
									<button class="rounded-none" on:click={() => sortClickHandler('Price')}>Price</button>
								</li>
							</ul>
						</details>
						<div>
							<button on:click={() => sortOrderHandler()} class="btn btn-ghost rounded-none lg:ml-2"
								>{sortOrderContent}
								<svg
									fill="none"
									viewBox="0 0 20 20"
									class="h-4 w-4 transform transition-transform duration-200"
									><path
										class="fill-base-content"
										fill-rule="evenodd"
										d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
										clip-rule="evenodd"
									/></svg
								>
							</button>
						</div>
					</div>
				</div>
				<div class="divider mx-2 mt-0 lg:hidden" />
				<div class="mx-2 mb-4 flex justify-center">
					<label
						for="my-drawer-2"
						class="btn btn-primary drawer-button btn-block flex rounded-none lg:hidden"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 -960 960 960"
							class="inline-block h-6 w-6 fill-primary-content stroke-current"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M400-240v-80h160v80H400ZM240-440v-80h480v80H240ZM120-640v-80h720v80H120Z"
							/></svg
						>
						<span class="">Show Filters</span>
					</label>
				</div>
				{#each finalClassList as event}
					<div class="card mx-2 mb-4 rounded-none bg-base-100 shadow-xl lg:card-side lg:max-h-80">
						<figure class="w-full lg:w-4/5">
							<enhanced:img
								class="h-full"
								src={getClassImage(event.name, event.category)}
								alt="{event.name} image"
							/>
						</figure>
						<div class="card-body w-full">
							<div class="flex justify-between">
								<h2 class="font-asmbly text-accent card-title font-light">{event.name}</h2>
								<div class="grid h-8 w-8 place-items-center">
									<svg
										fill="none"
										stroke-linecap="round"
										stroke-linejoin="round"
										viewBox={event.category === 'Miscellaneous' || event.category === 'Orientation'
											? '-7.5 0 175 100'
											: '0 0 195 195'}
										class="h-6 w-6"
									>
										{#each svgs[event.category] as svgPath}
											<path
												stroke-width={event.category === 'Miscellaneous' ||
												event.category === 'Orientation'
													? '6'
													: '2.5'}
												class={generateFillColor(event.category, true)}
												d={svgPath}
											/>
										{/each}
									</svg>
								</div>
							</div>
							<p class="text-lg">Next Class: <b>
								{event.classInstances[0].startDateTime.toLocaleString('en-US', {dateStyle: "short", timeStyle: "short"})}
							</b></p>
							{#if event.classInstances[0].summary}
							<p class="text-md">
								{event.classInstances[0].summary.length > 200
									? event.classInstances[0].summary.substring(0, 200) + '...'
									: event.classInstances[0].summary}
							</p>
							{:else}
							<p class="text-md">No summary available</p>
							{/if}
							<div class="card-actions content-center justify-end">
								<p>Price: {event.classInstances[0].price === 0 ? 'Free' : '$' + event.classInstances[0].price + '.00'}</p>
								<a class="btn btn-primary rounded-none" href="/event/{event.typeId}">Learn More</a>
							</div>
						</div>
					</div>
				{/each}
				{#if finalClassList.length === 0}
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
								<button on:click={() => clearSearch()} class="btn btn-primary rounded-none"
									>Clear Search</button
								>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
	<div class="drawer-side order-1 h-full md:max-h-max lg:ml-2 lg:mt-2 lg:pl-2 lg:pt-2">
		<label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay" />
		<ul
			class="min-h-full md:min-h-max w-64 overflow-y-auto bg-base-200 p-4 text-base-content lg:bg-transparent xl:w-80"
		>
			<!-- Sidebar content here -->
			<h2 class="pl-2 font-asmbly font-light">Filter by Category</h2>
			<li class="divider" />
			{#each [...archCategories.keys()] as category}
				<li>
					<div class="form-control mr-2">
						<label class="group label cursor-pointer">
							<div class="flex items-center gap-4">
								<div
									class="grid place-items-center {generateBackgroundColor(
										category
									)} h-8 w-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.10)] group-hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
								>
									<svg
										fill="none"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width={category === 'Miscellaneous' || category === 'Orientation'
											? '5'
											: '2.5'}
										viewBox={category === 'Miscellaneous' || category === 'Orientation'
											? '-7.5 0 175 100'
											: '0 0 195 195'}
										class="h-4 w-4"
									>
										{#each svgs[category] as svgPath}
											<path
												stroke-width={category === 'Miscellaneous' || category === 'Orientation'
													? '8'
													: '2.5'}
												class={generateFillColor(category)}
												d={svgPath}
											/>
										{/each}
									</svg>
								</div>
								<span class="label-text group-hover:text-base-content/60">{category}</span>
							</div>
							<input
								on:change={() => toggleArchCategory(category)}
								type="checkbox"
								checked=""
								class="checkbox rounded-none"
								name={category}
							/>
						</label>
					</div>
				</li>
			{/each}
		</ul>
	</div>
</div>
