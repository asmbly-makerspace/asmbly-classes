<script>
	/** @type {import('./$types').PageData} */
	export let data;
	import cnc from '$lib/images/LagunaSwift.jpg';
</script>

<div class="container mx-auto w-full lg:w-3/5">
	<div class="container mx-auto bg-base-100">
        <div class="container w-full mx-auto p-3 m-2">
            <div class="card-body">
                <div class="flex justify-end">
                    <div class="w-full max-w-xs pr-2">
                        <input type="text"
                               placeholder="Search by class name..."
                               class="input input-bordered input-primary w-full max-w-xs bg-base-100" />
                    </div>
                    <div class="w-full max-w-xs pl-2 pr-2">
                        <select class="select select-bordered select-primary w-full max-w-xs bg-base-100">
                            <option disabled selected class="text-base-300">Filter by Category</option>
                            <option>All</option>
                            {#each data.classCategories as cat }<option>{ cat }</option>{/each}
                        </select>
                    </div>
                </div>
                {#each data.classJson as event }
                    <div class="card lg:card-side bg-base-100 shadow-xl m-2 max-h-72">
                        <figure class="w-full md:w-1/2">
                            <img class="h-full" src={cnc} alt="{event.name} image" />
                        </figure>
                        <div class="card-body w-full">
                            <h2 class="card-title">{event.name}</h2>
                            	<p>Test</p>
                            	<p>Test 2</p>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>
