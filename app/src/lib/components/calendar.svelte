<script>
	import { DateTime } from 'luxon';
	export let selectedDate = DateTime.now()
	export let toUrl = () => {}
	export let highlightedDates = []

	$: currentDate = selectedDate || DateTime.now()

	$: daysInMonth = Array(new Date(currentDate.year, currentDate.month, 0).getDate()).keys()

	$: blankDaysInMonth = Array(new Date(currentDate.year, currentDate.month - 1, 1).getDay()).keys()

	function prevMonth() {
		currentDate = currentDate.minus({ months: 1 });
	}

	function nextMonth() {
		currentDate = currentDate.plus({ months: 1 });
	}

	function isHighlightedDate(day) {
		const toCheck = DateTime.local(currentDate.year, currentDate.month, day + 1)
		return highlightedDates.some(d => d.hasSame(toCheck, 'day'))
	}

	function dayToUrl(day) {
		const dayDate = DateTime.local(currentDate.year, currentDate.month, day + 1)
		return toUrl(dayDate)
	}

</script>

<div class="flex items-center justify-between px-4">
	<button
		aria-label="calendar backward"
		class="text-base-content hover:text-base-content focus:text-base-content"
		on:click={prevMonth}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="icon icon-tabler icon-tabler-chevron-left"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<polyline points="15 6 9 12 15 18" />
		</svg>
	</button>
	<span class="font-bold text-base-content focus:outline-none text-lg"
		>{new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
			currentDate
		)}</span
	>
	<button
		aria-label="calendar forward"
		class="text-base-content hover:text-base-content focus:text-base-content"
		on:click={nextMonth}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="icon icon-tabler icon-tabler-chevron-right"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<polyline points="9 6 15 12 9 18" />
		</svg>
	</button>
</div>
<div class="flex items-center justify-between overflow-x-auto pt-12">
	<div class="grid grid-cols-7 gap-2 p-2 lg:gap-4">
		<div class="h-10 w-10 text-center font-light">S</div>
		<div class="h-10 w-10 text-center font-light">M</div>
		<div class="h-10 w-10 text-center font-light">T</div>
		<div class="h-10 w-10 text-center font-light">W</div>
		<div class="h-10 w-10 text-center font-light">T</div>
		<div class="h-10 w-10 text-center font-light">F</div>
		<div class="h-10 w-10 text-center font-light">S</div>
		{#each daysInMonth as day}
			{#if day === 0}
				{#each blankDaysInMonth as _}
					<div class="empty aspect-square h-full w-full" />
				{/each}
			{/if}
			{#if isHighlightedDate(day)}
				<div class="flex aspect-square h-full w-full flex-row items-center justify-center">
					<div
						class="flex aspect-square h-full w-full cursor-pointer items-center justify-center rounded-full"
					>
						<a
							href={dayToUrl(day)}
							class="{selectedDate.hasSame(
								DateTime.local(currentDate.year, currentDate.month, day + 1),
								'day'
							)
								? 'bg-primary text-primary-content'
								: 'border-primary border-solid border-2 text-base-content '}
								hover:bg-primary hover:text-primary-content
								flex h-full w-full items-center justify-center rounded-full font-medium"
							>{day + 1}</a
						>
					</div>
				</div>
			{:else}
				<div class="aspect-square h-full w-full p-2 text-center">
					{day + 1}
				</div>
			{/if}
		{/each}
	</div>
</div>
