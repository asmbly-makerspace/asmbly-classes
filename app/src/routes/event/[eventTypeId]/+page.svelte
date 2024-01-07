<script>
	import { page } from '$app/stores';

	/** @type {import('./$types').PageData} */
	export let data;
	import { DateTime } from 'luxon';

	import SuperForm from '$lib/components/classRequestForm.svelte';
	import TextField from '$lib/components/textField.svelte';
	import RadioField from '$lib/components/radioField.svelte';
	import { schema, privateRequestSchema } from '$lib/zodSchemas/schema.js';

	const noCheckouts = ['Beginner CNC Router', 'Big Lasers Class', 'Small Lasers Class', 'Woodshop Safety', 'Metal Shop Safety'];

	const { classJson } = data;
	const classType = classJson.filter((i) => i.typeId == data.slug)[0];

	const classInstances = classType.classInstances;

	let classDates = [];
	if (classInstances.length > 0) {
		classDates = classInstances.map((i) => DateTime.fromJSDate(i.startDateTime));
	} 
	
	let currentDate = DateTime.now();

	let date;
	if (classDates.length > 0) {
		date = classDates.sort((a, b) => a - b)[0];
	}

	$: classOnDate = classInstances.filter((i) =>
		DateTime.fromJSDate(i.startDateTime).hasSame(date, 'day')
	)[0];

	function getDaysInMonth(year, month) {
		return new Date(year, month + 1, 0).getDate();
	}

	function getFirstDayOfMonth(year, month) {
		return new Date(year, month, 1).getDay();
	}

	function isHighlightedDate(date) {
		return classDates.some((highlightedDate) => highlightedDate.hasSame(date, 'day'));
	}

	function prevMonth() {
		currentDate = currentDate.minus({ months: 1 });
	}

	function nextMonth() {
		currentDate = currentDate.plus({ months: 1 });
	}

</script>

<div id="main" class="container mx-auto flex flex-col items-center justify-center pb-8">
	<h1
		class="font-asmbly text-accent pb-2 pt-8 text-center text-3xl all-under lg:pb-6"
	>
		{classType.name}
	</h1>
	<div class="card mt-2 flex w-full max-w-6xl justify-center rounded-none shadow-lg lg:card-side">
		<div class="rounded p-5 md:p-8">
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
				<span tabindex="0" class="font-bold text-base-content focus:outline-none"
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
					{#each Array(getDaysInMonth(currentDate.year, currentDate.month - 1)).keys() as day}
						{#if day === 0}
							{#each Array(getFirstDayOfMonth(currentDate.year, currentDate.month - 1)).keys() as _}
								<div class="empty aspect-square h-full w-full bg-base-100" />
							{/each}
						{/if}
						{#if isHighlightedDate(DateTime.local(currentDate.year, currentDate.month, day + 1))}
							<div class="flex aspect-square h-full w-full flex-row items-center justify-center">
								<div
									class="flex aspect-square h-full w-full cursor-pointer items-center justify-center rounded-full"
								>
									<a
										on:click={() => {
											date = DateTime.local(currentDate.year, currentDate.month, day + 1);
										}}
										class="{date.hasSame(
											DateTime.local(currentDate.year, currentDate.month, day + 1),
											'day'
										)
											? 'bg-primary text-primary-content hover:bg-primary'
											: 'bg-base-200 text-base-content hover:bg-base-300'} flex h-full w-full items-center justify-center rounded-full font-medium"
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
		</div>
		<div class="divider mx-6 lg:divider-horizontal lg:mx-0 lg:my-8" />
		<div class="flex flex-col px-5 py-5 md:px-8 md:py-8">
			{#if classInstances.length > 0}
			<div class="px-4">
				<h2 class="pb-4 text-lg font-semibold">{date.toFormat("cccc', 'LLLL d")}</h2>
				<div class="flex w-72 justify-between lg:w-96">
					<div class="border-base-300 pb-4 lg:pb-0">
						<p class="text-sm font-light leading-3">
							{DateTime.fromJSDate(classOnDate.startDateTime)
								.setZone('utc')
								.toLocaleString(DateTime.TIME_SIMPLE)} - {DateTime.fromJSDate(
								classOnDate.endDateTime
							)
								.setZone('utc')
								.toLocaleString(DateTime.TIME_SIMPLE)}
						</p>
						<p class="pt-2 text-sm leading-4 leading-none">Teacher: {classOnDate.teacher}</p>
						<p class="pt-2 text-sm leading-4 leading-none">
							Capacity: {classType.capacity}
						</p>
						<p class="pt-2 text-sm leading-4 leading-none">Attendees: {classOnDate.attendees}</p>
						<p class="pt-2 text-sm leading-4 leading-none">
							Price: {classType.price === 0 ? 'Free' : '$' + classType.price + '.00'}
						</p>
						{#if classOnDate.attendees === classType.capacity}
							<p class="mb-2 w-36 py-2 text-sm leading-4 leading-none lg:w-52">
								<span class="text-error">Note:</span> Class is full.
							</p>
							<button
								class="btn btn-primary rounded-none"
								onclick="fullClassNotification.showModal()"
								>Notify me if a seat becomes available</button
							>
							<dialog id="fullClassNotification" class="modal">
								<div class="modal-box rounded-none">
									<form method="dialog">
										<button
											class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2 rounded-none"
											>✕</button
										>
									</form>
									<!-- Modal content -->

									<div class="prose">
										<h2 class="font-asmbly">Notify me</h2>
										<p>
											Sign up below to receive an email if a seat opens up in this session of the
											class.
										</p>
									</div>

									<SuperForm
										action="?/fullClassRequest"
										data={data?.fullClassRequestForm}
										dataType="form"
										invalidateAll={false}
										validators={schema}
										eventId={classOnDate.eventId}
										let:form
										let:message
										let:delayed
									>
										{#if message}
											<div
												class="status {message.status >= 400 ? 'text-error' : ''} {message.status <
													300 || !message.status
													? 'text-success'
													: ''}"
											>
												{message.text}
											</div>
										{/if}
										<TextField
											type="text"
											{form}
											field="firstName"
											label="First Name"
											class="w-full"
										/>
										<TextField
											type="text"
											{form}
											field="lastName"
											label="Last Name"
											class="w-full"
										/>
										<TextField
											type="email"
											{form}
											field="email"
											label="Email"
											class="mb-4 w-full"
										/>

										<p class="flex">
											<button class="btn btn-primary mb-2 mt-4 rounded-none mr-2" type="submit"
												>Submit</button
											>
											{#if delayed}
											<span class="loading loading-spinner loading-md "></span>
											{/if}
										</p>
									</SuperForm>

									<!-- End Modal content -->
								</div>
								<form method="dialog" class="modal-backdrop">
									<button>close</button>
								</form>
							</dialog>
						{/if}
					</div>
					<div class="flex items-center justify-end pb-4 lg:pb-0">
						{#if classOnDate.attendees < classType.capacity}
							<a
								class="btn btn-primary rounded-none"
								href={data.baseRegLink.url + classOnDate.eventId}
								target="_blank">Register</a
							>
						{/if}
					</div>
				</div>
			</div>
			{:else}
			<div class="px-4">
				<h2 class="pb-4 text-lg font-semibold">No sessions currently scheduled</h2>
				<div class="flex w-72 justify-between lg:w-96">
					<div class="border-base-300 pb-4 lg:pb-0">
						<p class="text-sm font-light leading-3">
							We do not currently have any sessions of this class scheduled. If you'd like to request this class,
							please use the form below to let us know. We will schedule a session once we have enough interest in the class.
						</p>
						<button
							class="btn btn-primary rounded-none mt-2"
							onclick="onDemandRequest.showModal()"
							>Request this class</button
						>
						<dialog id="onDemandRequest" class="modal">
							<div class="modal-box rounded-none">
								<form method="dialog">
									<button
										class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2 rounded-none"
										>✕</button
									>
								</form>
								<!-- Modal content -->

								<div class="prose">
									<h2 class="font-asmbly">Class Request</h2>
									<p>
										Sign up below to request this class and receive an email when a session is scheduled.
									</p>
								</div>

								<SuperForm
									action="?/onDemandRequest"
									data={data?.onDemandRequestForm}
									dataType="form"
									invalidateAll={false}
									validators={schema}
									classTypeId={data.slug}
									let:form
									let:message
									let:delayed
								>
									{#if message}
										<div
											class="status {message.status >= 400 ? 'text-error' : ''} {message.status <
												300 || !message.status
												? 'text-success'
												: ''}"
										>
											{message.text}
										</div>
									{/if}
									<TextField
										type="text"
										{form}
										field="firstName"
										label="First Name"
										class="w-full"
									/>
									<TextField
										type="text"
										{form}
										field="lastName"
										label="Last Name"
										class="w-full"
									/>
									<TextField
										type="email"
										{form}
										field="email"
										label="Email"
										class="mb-4 w-full"
									/>

									<p class="flex">
										<button class="btn btn-primary mb-2 mt-4 rounded-none mr-2" type="submit"
											>Submit</button
										>
										{#if delayed}
										<span class="loading loading-spinner loading-md "></span>
										{/if}
									</p>
								</SuperForm>

								<!-- End Modal content -->
							</div>
							<form method="dialog" class="modal-backdrop">
								<button>close</button>
							</form>
						</dialog>

					</div>
				</div>
			</div>
			{/if}
			<div class="ml-4 divider" />
			<div class="max-w-md px-4">
				<h2 class="pb-4 text-lg font-semibold">Description</h2>
				<p class="text-sm">{classType.summary}</p>
			</div>
			{#if classType.category !== 'Orientation' && classInstances.length > 0}
				<div class="flex max-w-md justify-between px-4 pt-4">
					<button class="btn btn-primary rounded-none" onclick="privateAndCheckout.showModal()"
						>Request a Private or Checkout Session</button
					>
					<dialog id="privateAndCheckout" class="modal">
						<div class="modal-box rounded-none">
							<form method="dialog">
								<button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2 rounded-none"
									>✕</button
								>
							</form>
							<!-- Modal content -->

							<div class="prose">
								<h2 class="font-asmbly">Private/Checkout Class Request</h2>
								<p>
									Sign up below to request a private or checkout session. Note that we do not offer
									checkout sessions for all classes. This will be indicated by a disabled "Checkout"
									option. More info about private and checkout classes can be found in our <a
										href="/classes-faq">Classes FAQ</a
									>.
								</p>
							</div>

							<SuperForm
								action="?/privateRequest"
								data={data?.privateRequestForm}
								dataType="form"
								invalidateAll={false}
								validators={privateRequestSchema}
								classTypeId={data.slug}
								let:form
								let:message
								let:delayed
							>
								{#if message}
									<div
										class="status {message.status >= 400 ? 'text-error' : ''} {message.status <
											300 || !message.status
											? 'text-success'
											: ''}"
									>
										{message.text}
									</div>
								{/if}
								<TextField type="text" {form} field="firstName" label="First Name" class="w-full" />
								<TextField type="text" {form} field="lastName" label="Last Name" class="w-full" />
								<TextField type="email" {form} field="email" label="Email" class="mb-4 w-full" />

								<RadioField
									{form}
									field="sessionType"
									options={['Private', 'Checkout']}
									class="my-4 ml-2 radio radio-accent"
									{noCheckouts}
									className={classType.name}
								/>

								<p class="flex">
									<button class="btn btn-primary mb-2 mt-4 rounded-none mr-2" type="submit"
										>Submit</button
									>
									{#if delayed}
									<span class="loading loading-spinner loading-md "></span>
									{/if}
								</p>
							</SuperForm>

							<!-- End Modal content -->
						</div>
						<form method="dialog" class="modal-backdrop">
							<button>close</button>
						</form>
					</dialog>
				</div>
			{/if}
			{#if classInstances.length > 0}
			<div class="flex max-w-md justify-between p-4">
				<button
					class="btn btn-ghost btn-sm rounded-none text-sm font-light"
					onclick="classNotify.showModal()">Notify me when additional sessions are added</button
				>
				<dialog id="classNotify" class="modal">
					<div class="modal-box rounded-none">
						<form method="dialog">
							<button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2 rounded-none"
								>✕</button
							>
						</form>
						<!-- Modal content -->

						<div class="prose">
							<h2 class="font-asmbly">Notify me</h2>
							<p>
								Sign up below to receive an email when additional sessions of this class are added
								to the calendar.
							</p>
						</div>

						<SuperForm
							action="?/notificationRequest"
							data={data?.notificationForm}
							dataType="form"
							invalidateAll={false}
							validators={schema}
							classTypeId={data.slug}
							let:form
							let:message
							let:delayed
						>
							{#if message}
							<div
								class="status {message.status >= 400 ? 'text-error' : ''} {message.status <
									300 || !message.status
									? 'text-success'
									: ''}"
							>
								{message.text}
							</div>
							{/if}
							<TextField type="text" {form} field="firstName" label="First Name" class="w-full" />
							<TextField type="text" {form} field="lastName" label="Last Name" class="w-full" />
							<TextField type="email" {form} field="email" label="Email" class="mb-4 w-full" />

							<p class="flex">
								<button class="btn btn-primary mb-2 mt-4 rounded-none mr-2" type="submit"
									>Submit</button
								>
								{#if delayed}
								<span class="loading loading-spinner loading-md "></span>
								{/if}
							</p>
						</SuperForm>

						<!-- End Modal content -->
					</div>
					<form method="dialog" class="modal-backdrop">
						<button>close</button>
					</form>
				</dialog>
			</div>
			{/if}
		</div>
	</div>
</div>

<style>
    .all-under:after {
        content: " ";
        background: linear-gradient(300deg, #292d6a, #568ac8, #00916e, #78cbc3, #f2b51b, #ed6e24, #d33e42);
        background-size: 480% 480%;
        animation: gradient-x 64s ease infinite;
        height: 5px;
        display: block;
        width: 100%;
        margin-top: 0.5rem;
		box-sizing: border-box;
        }
</style>