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
		compact: false
	}

	let sortDropdownOpen = false
</script>

<svelte:head>
	<title>Asmbly | Classes</title>
	<meta name="description" content="View and sign up for classes at Asmbly." />
	<meta name="keywords" content="classes, asmbly, woodworking, metalworking, woodshop, CNC, laser, sewing, textiles, electronics, 3d, printing" />
</svelte:head>
<div class="drawer max-lg:drawer-end justify-center items-stretch lg:drawer-open lg:min-h-[calc(100dvh-10rem)] 2xl:min-h-[calc(100dvh-20rem)]">
	<input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
	<div class="drawer-side z-10 lg:p-2 row-start-2">
		<label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay" />
		<div class="bg-base-200 w-80 min-h-full p-4">
			<label class="input input-sm input-accent w-full block flex justify-center">
			<input
			type="search"
			name="q"
			class="grow bg-transparent"
			placeholder="Search by class name..."
			autocomplete="off"
			bind:value={filters.searchTerm}
			/>
			<button type="submit" class="p-1 material-symbols-outlined">
				search
			</button>
		</label>
		<div class="divider mt-0 lg:hidden" />
			<h2 class="px-2 font-asmbly font-light divider text-lg">Sort</h2>
			<div class="px-4">
				<label class="label" >
					Sort By
						<select class="select select-sm z-10 bg-base-200 px-4 font-bold text-base hover:bg-base-300 focus:bg-base-300 border-none" bind:value={filters.sortBy}>
							<option value="Date"> Date</option>
							<option value="Name"> Name</option>
							<option value="Price"> Price</option>
						</select>
				</label>
				<label class="label cursor-pointer group">
					Sort Order
				  <div class="swap">
				  	<input type="checkbox" class="peer" bind:checked={filters.sortAsc}/>
				  	<div class="swap-on group-hover:bg-base-300 peer-focus:bg-base-300 btn btn-sm shadow-none px-2 text-base">Low to High</div>
			  	  <div class="swap-off group-hover:bg-base-300 peer-focus:bg-base-300 btn btn-sm shadow-none px-2 text-base">High to Low</div>
		  	 	</div>
				</label>
			</div>
			<h2 class="px-2 font-asmbly font-light divider text-lg">View</h2>
			<div class="px-4">
				<label class="label cursor-pointer">
					Group By Class Type
				  <input type="checkbox" bind:checked={filters.groupByClass} class="checkbox rounded-none"/>
				</label>

				<label class="label cursor-pointer">
					Show Unavailable Classes
					<input type="checkbox" bind:checked={filters.showAll} class="checkbox rounded-none"/>
				</label>
				<label class="label cursor-pointer group">
					Spacing
				  <div class="swap ">
				  	<input type="checkbox" bind:checked={filters.compact} class="peer"/>
				  	<div class="swap-on text-right group-hover:bg-base-300 peer-focus:bg-base-300 btn btn-sm shadow-none px-2 text-base">Compact</div>
			  	  <div class="swap-off text-right group-hover:bg-base-300 peer-focus:bg-base-300 btn btn-sm shadow-none px-2 text-base">Comfy</div>
		  	 	</div>
				</label>
			</div>
			<h2 class="px-2 font-asmbly font-light divider text-lg">Filter by Category</h2>
			<ul
				class="min-h-full md:min-h-max overflow-y-auto px-4 text-base-content lg:bg-transparent"
			>
				<!-- Sidebar content here -->
				{#each [...archCategories.keys()] as category}
					<li>
						<div class="form-control">
							<label class="group label cursor-pointer">
								<div class="flex items-center gap-4">
									<div
										class="grid place-items-center {generateBackgroundColor(
											category
										)} h-8 w-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.10)] group-hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
									>
									<AsmblyIcon category={category} checked={archCategories.get(category)} />
									</div>
									<span class="group-hover:text-base-content/60">{category}</span>
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
	<div class="drawer-content row-start-2">
		<!-- Page content here -->
		<div class="flex justify-start mt-2">
			<div class="grid place-content-start lg:max-w-4xl" use:autoAnimate>
				<div class="mx-2 mb-4 flex justify-center lg:hidden">
					<label
						for="my-drawer-2"
						class="btn btn-primary drawer-button btn-block flex rounded-none "
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
</div>
