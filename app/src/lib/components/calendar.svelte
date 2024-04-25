<script>
	import { DateTime } from 'luxon';
	export let selectedDate = DateTime.now()
	export let classInstances = []

	function getDaysInMonth(currentDate, classInstances) {
		const currentMonth = currentDate.month
		const monthDays = [...Array(currentDate.daysInMonth).keys()]

		const numPrevDays = currentDate.startOf('month').weekday
		const lastPrevDay = currentDate.minus({month: 1}).daysInMonth
		const prevDays = [...Array(numPrevDays)].map((_v, i) => lastPrevDay - numPrevDays + i)

		const numNextDays = 7 - ((currentDate.endOf('month').weekday + 1) % 7)
		const nextDays = [...Array(numNextDays).keys()]

		classInstances.forEach(c => {
			if (c.startDateTime.month === currentMonth) {
				monthDays[c.startDateTime.day - 1] = c
			} else if (c.startDateTime.month === currentMonth - 1 && c.startDateTime.day >= prevDays[0]) {
				prevDays[lastPrevDay - c.startDateTime.day] = c
			} else if (c.startDateTime.month === currentMonth + 1 && c.startDateTime.day <= numNextDays) {
				nextDays[c.startDateTime.day - 1] = c
			}
		})

		return {
			data: prevDays.concat(monthDays, nextDays),
			startIndex: prevDays.length,
			endIndex: prevDays.length + monthDays.length
		}
	}

	$: currentDate = selectedDate || DateTime.now()

	$: daysInMonth = getDaysInMonth(currentDate, classInstances)

	function prevMonth() {
		currentDate = currentDate.minus({ months: 1 });
	}

	function nextMonth() {
		currentDate = currentDate.plus({ months: 1 });
	}

</script>

<div class="rounded p-5 md:p-8 flex flex-col items-center">
	<div class="flex items-center justify-between px-4 w-full">
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
			{#each daysInMonth.data as day, index}
				{#if typeof day === "number"}
					<div class="aspect-square h-full w-full p-2 text-center
					{index < daysInMonth.startIndex || index >= daysInMonth.endIndex ? 'opacity-50' : ''}">
						{day + 1}
					</div>
				{:else}
					<div class="flex aspect-square h-full w-full flex-row items-center justify-center
					{index < daysInMonth.startIndex || index >= daysInMonth.endIndex ? 'opacity-50' : ''}">
						<div
							class="flex aspect-square h-full w-full cursor-pointer items-center justify-center rounded-full"
						>
							<a
								data-sveltekit-replacestate
								href={day.classUrl}
								class="{selectedDate.hasSame(day.startDateTime, 'day') ?
									`${day.isAvailable() ? 'bg-accent text-accent-content' : 'bg-accent/40 text-base-content'} `
									: `${day.isAvailable() ? 'border-accent' : 'border-accent/40'} border-solid border-4 text-base-content`}
									hover:bg-accent
									hover:border-accent hover:text-accent-content
									flex h-full w-full items-center justify-center rounded-full font-medium"
								>{day.startDateTime.day}</a
							>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</div>
