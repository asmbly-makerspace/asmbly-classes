<script>
	import autoAnimate from '@formkit/auto-animate';
	import AsmblyIcon from '$lib/components/asmblyIcon.svelte';
	import ClassList from '$lib/components/classList.svelte';
	import { page } from '$app/stores';
	import { afterNavigate, goto } from '$app/navigation';

	/** @type {import('./$types').PageData} */
	export let data;

	let archCategoriesBase = [...data.classCategories].map((c) => [c, false]);
	const defaultFilters = {
		sortBy: 'Date',
		sortAsc: true,
		groupByClass: true,
		showAll: true,
		searchTerm: '',
		compact: false
	};

	let filters = { ...defaultFilters };
	let archCategories = new Map(archCategoriesBase);
	afterNavigate(async (nav) => {
		filters = { ...defaultFilters };
		const searchParams = nav.to.url.searchParams;
		for (const key in filters) {
			const val = searchParams.get(key);
			if (val === null) continue;
			if (key === 'sortBy') {
				if (val.match(/^(Date|Price|Name)$/)) filters[key] = val;
			} else {
				filters[key] = val === 'true';
			}
		}

		let newCategories = new Map(archCategoriesBase);
		for (const cat of searchParams.getAll('archCategories')) {
			if (newCategories.get(cat) !== undefined) {
				newCategories.set(cat, true);
			}
		}

		archCategories = newCategories;

		filters.searchTerm = searchParams.get('searchTerm') || '';
	});

	const hoverColorVariants = {
		Orientation: 'group-hover:bg-asmbly',
		Woodworking: 'group-hover:bg-woodwork',
		Metalworking: 'group-hover:bg-metalwork',
		'Laser Cutting': 'group-hover:bg-lasers',
		'3D Printing': 'group-hover:bg-3dprinting',
		Textiles: 'group-hover:bg-textiles',
		Electronics: 'group-hover:bg-electronics',
		Ceramics: 'group-hover:bg-ceramics',
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
		Ceramics: 'bg-ceramics',
		Miscellaneous: 'bg-primary'
	};

	function generateBackgroundColor(category, alwaysChecked = false) {
		let classList = [hoverColorVariants[category]];
		if (archCategories.get(category) || alwaysChecked) {
			classList.push(checkedColorVariants[category]);
		} else {
			classList.push('bg-base-300');
		}

		return classList.join(' ');
	}

	function toggleArchCategory(category) {
		const newVal = !archCategories.get(category);

		let query = new URLSearchParams($page.url.searchParams.toString());

		if (newVal) {
			query.append('archCategories', category);
		} else {
			query.delete('archCategories', category);
		}

		goto(`?${query.toString()}`);
	}

	function updateSearchParams(key, value) {
		let query = new URLSearchParams($page.url.searchParams.toString());
		if (defaultFilters[key] === value) {
			query.delete(key);
		} else {
			query.set(key, value);
		}

		goto(`?${query.toString()}`, {
			keepFocus: true
		});
	}
</script>

<svelte:head>
	<title>Asmbly | Classes</title>
	<meta name="description" content="View and sign up for classes at Asmbly." />
	<meta
		name="keywords"
		content="classes, asmbly, woodworking, metalworking, woodshop, CNC, laser, sewing, textiles, electronics, 3d, printing"
	/>
</svelte:head>
<div
	class="drawer max-lg:drawer-end lg:drawer-open items-stretch justify-center lg:min-h-[calc(100dvh-10rem)] 2xl:min-h-[calc(100dvh-20rem)]"
>
	<input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
	<div class="drawer-side z-10 row-start-2 lg:p-2">
		<label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay" />
		<div class="bg-base-200 min-h-full w-80 p-4">
			<label class="input input-sm input-accent flex w-full justify-center">
				<input
					type="search"
					name="q"
					class="grow bg-transparent"
					placeholder="Search by class name..."
					autocomplete="off"
					bind:value={filters.searchTerm}
					on:input={(evt) => updateSearchParams('searchTerm', evt.target.value)}
				/>
				<button type="submit" class="material-symbols-outlined p-1"> search </button>
			</label>
			<div class="divider mt-0 lg:hidden" />
			<h2 class="font-asmbly divider px-2 text-lg font-light">Sort</h2>
			<div class="px-4">
				<label class="label">
					Sort By
					<select
						class="select select-sm bg-base-200 hover:bg-base-300 focus:bg-base-300 z-10 border-none text-base font-bold"
						value={filters.sortBy}
						on:change={(evt) => updateSearchParams('sortBy', evt.target.value)}
					>
						<option value="Date"> Date</option>
						<option value="Name"> Name</option>
						<option value="Price"> Price</option>
					</select>
				</label>
				<label class="label group cursor-pointer">
					Sort Order
					<div class="swap">
						<input
							type="checkbox"
							class="peer"
							checked={filters.sortAsc}
							on:change={updateSearchParams('sortAsc', !filters.sortAsc)}
						/>
						<div
							class="swap-on group-hover:bg-base-300 peer-focus:bg-base-300 btn btn-sm px-2 text-base shadow-none"
						>
							Asc
						</div>
						<div
							class="swap-off group-hover:bg-base-300 peer-focus:bg-base-300 btn btn-sm px-2 text-base shadow-none"
						>
							Desc
						</div>
					</div>
				</label>
			</div>
			<h2 class="font-asmbly divider px-2 text-lg font-light">View</h2>
			<div class="px-4">
				<label class="label cursor-pointer">
					Group By Class Type
					<input
						type="checkbox"
						checked={filters.groupByClass}
						on:change={updateSearchParams('groupByClass', !filters.groupByClass)}
						class="checkbox rounded-none"
					/>
				</label>

				<label class="label cursor-pointer">
					Show Unscheduled Classes
					<input
						type="checkbox"
						checked={filters.showAll}
						on:change={updateSearchParams('showAll', !filters.showAll)}
						class="checkbox rounded-none"
					/>
				</label>
				<!-- <label class="label cursor-pointer group">
					Spacing
				  <div class="swap ">
				  	<input type="checkbox" checked={filters.compact} on:change={updateSearchParams('compact', !filters.compact)} class="peer"/>
				  	<div class="swap-on text-right group-hover:bg-base-300 peer-focus:bg-base-300 btn btn-sm shadow-none px-2 text-base">Compact</div>
			  	  <div class="swap-off text-right group-hover:bg-base-300 peer-focus:bg-base-300 btn btn-sm shadow-none px-2 text-base">Comfy</div>
		  	 	</div>
				</label> -->
			</div>
			<h2 class="font-asmbly divider px-2 text-lg font-light">Filter by Category</h2>
			<ul class="text-base-content min-h-full overflow-y-auto px-4 md:min-h-max lg:bg-transparent">
				<!-- Sidebar content here -->
				{#each [...archCategories.keys()] as category}
					<li>
						<div class="form-control">
							<label class="label group cursor-pointer">
								<div class="flex items-center gap-4">
									<div
										class="grid place-items-center {generateBackgroundColor(
											category
										)} h-8 w-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.10)] group-hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
									>
										<AsmblyIcon {category} checked={archCategories.get(category)} />
									</div>
									<span class="group-hover:text-base-content/60">{category}</span>
								</div>
								<input
									on:change={() => toggleArchCategory(category)}
									type="checkbox"
									checked={archCategories.get(category)}
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
		<div class="mt-2 flex justify-start">
			<div class="grid place-content-start lg:max-w-4xl" use:autoAnimate>
				<div class="mx-2 mb-4 flex justify-center lg:hidden">
					<label
						for="my-drawer-2"
						class="btn btn-primary drawer-button btn-block flex rounded-none"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 -960 960 960"
							class="fill-primary-content inline-block h-6 w-6 stroke-current"
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
				<ClassList classJson={data.classJson} {filters} categoryMap={archCategories} />
			</div>
		</div>
	</div>
</div>
