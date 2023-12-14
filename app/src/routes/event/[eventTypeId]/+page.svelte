<script>
  /** @type {import('./$types').PageData} */
  export let data;
  import { DateTime } from 'luxon';

  const { classJson } = data;
  const classType = classJson.filter( i => i.typeId == data.slug )[0];

  const classInstances = classType.classInstances;
  const classDates = classInstances.map( i => DateTime.fromJSDate(i.startDateTime));

	let currentDate = DateTime.now();
  let date = classDates.sort((a, b) => a - b)[0];

  $: classOnDate = classInstances.filter( i => DateTime.fromJSDate(i.startDateTime).hasSame(date, "day"))[0];

	function getDaysInMonth(year, month) {
		return new Date(year, month + 1, 0).getDate();
	}

	function getFirstDayOfMonth(year, month) {
		return new Date(year, month, 1).getDay();
	}

	function isHighlightedDate(date) {
    return classDates.some((highlightedDate) =>
      highlightedDate.hasSame(date, "day")
    );
  }

  function prevMonth() {
    currentDate = currentDate.minus({ months: 1 });
  }

  function nextMonth() {
    currentDate = currentDate.plus({ months: 1 });
  }
</script>

<div class="container mx-auto flex flex-col items-center justify-center pb-8">
  <h1 class="text-center text-xl pt-8 pb-4 lg:pb-6">{classType.name}</h1>
	<div class="card lg:card-side w-full max-w-6xl shadow-lg flex justify-center mt-4">
		<div class="md:p-8 p-5 rounded">
			<div class="px-4 flex items-center justify-between">
        <button
						aria-label="calendar backward"
						class="focus:text-base-content hover:text-base-content text-base-content"
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
				<span tabindex="0" class="focus:outline-none font-bold text-base-content"
					>{new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
						currentDate
					)}</span
				>
        <button
          aria-label="calendar forward"
          class="focus:text-base-content hover:text-base-content text-base-content"
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
			<div class="flex items-center justify-between pt-12 overflow-x-auto">
        <div class="grid grid-cols-7 lg:gap-4 gap-2 p-2">
          <div class="text-center font-light">S</div>
          <div class="text-center font-light">M</div>
          <div class="text-center font-light">T</div>
          <div class="text-center font-light">W</div>
          <div class="text-center font-light">T</div>
          <div class="text-center font-light">F</div>
          <div class="text-center font-light">S</div>
          {#each Array(getDaysInMonth(currentDate.year, currentDate.month -1)).keys() as day}
            {#if day === 0}
              {#each Array(getFirstDayOfMonth(currentDate.year, currentDate.month -1)).keys() as _}
                <div class="empty bg-base-100" />
              {/each}
            {/if}
            {#if isHighlightedDate(DateTime.local(currentDate.year, currentDate.month, day + 1))}
            <div class="w-full h-full flex flex-row justify-center">
              <div class="flex items-center justify-center w-full rounded-full cursor-pointer">
                <a
                  on:click={() => {
                    date = DateTime.local(currentDate.year, currentDate.month, day + 1);
                  }}
                  class="focus:bg-primary focus:text-primary-content hover:bg-base-300 text-base-content w-full h-full flex items-center justify-center font-medium bg-base-200 rounded-full"
                  >{day + 1}</a
                >
              </div>
            </div>
            {:else}
            <div class="text-center p-2">
              {day + 1}
            </div>
            {/if}
          {/each}
        </div>
			</div>
		</div>
    <div class="divider mx-6 lg:divider-horizontal lg:my-8 lg:mx-0"></div>
		<div class="flex flex-col md:py-8 py-5 md:px-8 px-5"> 
			<div class="px-4">
        <h2 class="font-semibold text-lg pb-4">{date.toFormat("cccc', 'LLLL d")}</h2>
        <div class="flex justify-between w-72 lg:w-96">
          <div class="pb-4 lg:pb-0 border-base-300">
            <p class="text-sm font-light leading-3">{DateTime.fromJSDate(classOnDate.startDateTime).setZone("utc").toLocaleString(DateTime.TIME_SIMPLE)} - {DateTime.fromJSDate(classOnDate.endDateTime).setZone("utc").toLocaleString(DateTime.TIME_SIMPLE)}</p>
            <p class="text-sm pt-2 leading-4 leading-none">Teacher: {classOnDate.teacher}</p>
            <p class="text-sm pt-2 leading-4 leading-none">
              <!-- Capacity: {event.capacity} -->
              Capacity: {classType.capacity}
            </p>
            <p class="text-sm pt-2 leading-4 leading-none">Attendees: {classOnDate.attendees}</p>
            <p class="text-sm pt-2 leading-4 leading-none">Price: {classType.price === 0 ? "Free" : "$" + classType.price + ".00"}</p>
            {#if classOnDate.attendees === classType.capacity}
            <p class="text-sm pt-2 leading-4 leading-none w-36 lg:w-52"><span class="text-error">Note:</span> Class is full. You may still register to add yourself to the waitlist, but payment will not be collected.</p>
            {/if}
          </div>
          <div class="flex justify-end items-center pb-4 lg:pb-0">
            <a class="btn btn-primary" href="{data.baseRegLink.url + classOnDate.eventId}" target="_blank">Register</a>
          </div>
        </div>
			</div>
      <div class="divider"></div>
      <div class="px-4 max-w-md">
        <h2 class="font-semibold text-lg pb-4">Description</h2>
        <p class="text-sm">{classType.summary}</p>
      </div>
      {#if classType.category !== "Orientation"}
      <div class="flex justify-between px-4 pt-4 max-w-md">
        <button class="btn btn-primary" onclick="privateAndCheckout.showModal()">Request a Private or Checkout Session</button>
        <dialog id="privateAndCheckout" class="modal">
          <div class="modal-box">
            <form method="dialog">
              <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 class="font-bold text-lg">Hello!</h3>
            <p class="py-4">Press ESC key or click on ✕ button to close</p>
          </div>
          <form method="dialog" class="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
      {/if}
      <div class="flex justify-between p-4 max-w-md">
        <button class="text-sm font-light"onclick="classNotify.showModal()">Notify me when more sessions are added</button>
        <dialog id="classNotify" class="modal">
          <div class="modal-box">
            <form method="dialog">
              <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 class="font-bold text-lg">Hello!</h3>
            <p class="py-4">Press ESC key or click on ✕ button to close</p>
          </div>
          <form method="dialog" class="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
		</div>
	</div>
</div>
