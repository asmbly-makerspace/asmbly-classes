<script>
	import autoAnimate from '@formkit/auto-animate';
	import AsmblyIcon from '$lib/components/asmblyIcon.svelte'
	import ClassList from '$lib/components/classList.svelte'

	/** @type {import('./$types').PageData} */
	export let data;

	let archCategories = new Map(
		[...data.classCategories].map(c => [c, false])
	);

	const hoverColorVariants = {
		Orientation: 'group-hover:bg-asmbly',
		Woodworking: 'group-hover:bg-woodwork',
		Metalworking: 'group-hover:bg-metalwork',
		'Laser Cutting': 'group-hover:bg-lasers',
		'3D Printing': 'group-hover:bg-3dprinting',
		Textiles: 'group-hover:bg-textiles',
		Electronics: 'group-hover:bg-electronics',
		Miscellaneous: 'group-hover:bg-primary'
	};

	const checkedColorVariants = {
		Orientation: 'bg-asmbly',
		Woodworking: 'bg-woodwork',
		Metalworking: 'bg-metalwork',
		'Laser Cutting': 'bg-lasers',
		'3D Printing': 'bg-3dprinting',
		Textiles: 'bg-textiles',
		Electronics: 'bg-electronics',
		Miscellaneous: 'bg-primary'
	};

	function generateBackgroundColor(category, alwaysChecked = false) {
		let classList = [hoverColorVariants[category]]
		if (archCategories.get(category) || alwaysChecked) {
			classList.push(checkedColorVariants[category]);
		} else {
			classList.push('bg-base-300')
		}

		return classList.join(' ')
	}

	function toggleArchCategory(category) {
		archCategories.set(category, !archCategories.get(category));
		archCategories = archCategories;
	}

	function sortClickHandler(keyword) {
		filters.sortBy = keyword;
		document.getElementById('sortDropdown').removeAttribute('open');
	}

	function sortOrderHandler() {
		filters.sortAsc = !filters.sortAsc
	}

	let filters = {
		sortBy: 'Date',
		sortAsc: true,
		groupByClass: false,
		showAll: false,
		searchTerm: '',
	}

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
									class="h-6 w-6"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
							</button>
						</span>
						<input
							type="search"
							name="q"
							class="my-2 w-full bg-base-300 py-2 pl-10 text-sm text-neutral placeholder:italic placeholder:text-neutral focus:bg-secondary focus:text-secondary-content focus:outline-none"
							placeholder="Search by class name..."
							autocomplete="off"
							bind:value={filters.searchTerm}
						/>
					</div>
					<div class="row-start-2 flex justify-center">
						<div>
							<button on:click={() => filters.groupByClass = !filters.groupByClass} class="btn btn-ghost rounded-none lg:ml-2"
								>Group By: {filters.groupByClass ? 'Class Type' : 'Date'}
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
						<details id="sortDropdown" class="dropdown">
							<summary class="btn btn-ghost rounded-none lg:ml-2"
								>Sort by: {filters.sortBy}
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
								>Order: {filters.sortAsc ? 'Asc' : 'Desc'}
								<svg
									fill="none"
									viewBox="0 0 20 20"
									class="h-4 w-4 transform transition-transform duration-200 {filters.sortAsc ? 'rotate-180' : ''}"
									><path
										class="fill-base-content"
										fill-rule="evenodd"
										d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
										clip-rule="evenodd"
									/></svg
								>
							</button>
						</div>
						<div>
							<button on:click={() => filters.showAll = !filters.showAll} class="btn btn-ghost rounded-none lg:ml-2">{filters.showAll ? 'Hide Unavailable' : 'Show Unavailable'}
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
				<ClassList classJson={data.classJson} filters={filters} categoryMap={archCategories}/>
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
								<AsmblyIcon category={category} checked={archCategories.get(category)} />
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
