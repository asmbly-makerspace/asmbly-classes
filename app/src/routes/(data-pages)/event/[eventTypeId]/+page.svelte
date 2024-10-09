<script>
	/** @type {import('./$types').PageData} */
	export let data;

	import { DateTime } from 'luxon';
	import { page } from '$app/stores';

	import NeonEventType from '$lib/models/neonEventType.js'
	import SuperForm from '$lib/components/classRequestForm.svelte';
	import TextField from '$lib/components/textField.svelte';
	import RadioField from '$lib/components/radioField.svelte';
	import Calendar from '$lib/components/calendar.svelte'
	import { schema, privateRequestSchema } from '$lib/zodSchemas/schema.js';
	import { afterNavigate } from '$app/navigation';
	import { tick } from 'svelte';

	afterNavigate(async (nav) => {
		if (nav.type === 'link') {
			await tick();
			window.scrollTo(0, 0);
		}
	});

	const noCheckouts = ['Beginner CNC Router', 'Big Lasers Class', 'Small Lasers Class', 'Woodshop Safety', 'Metal Shop Safety'];

	$: classType = new NeonEventType(data.classJson);

	$: classInstanceId = $page.url.searchParams.get('eventId')

	$: classInstance = (classInstanceId && classType.classInstances.find(i => i.eventId == classInstanceId)) || classType.classInstances[0]

	$: date = classInstance.startDateTime >= DateTime.local({zone: 'America/Chicago'}) ? classInstance.startDateTime : DateTime.local({zone: 'America/Chicago'})

	$: classDates = classType.classInstances.map(i => i.startDateTime);

	function classDayUrl(day) {
		const classOnDay = classType.classInstances.find(i => i.startDateTime.hasSame(day, 'day'))
		return `?eventId=${classOnDay.eventId}`
	}
</script>

<svelte:head>
	<title>Asmbly | {classType.name}</title>
	<meta name="description" content="View the schedule and register for a {classType.name}{classType.name.split(' ').pop() === 'Class' ? '' : ' class'} at Asmbly." />
	<meta name="keywords" content="classes, asmbly" />
</svelte:head>



<div id="main" class="flex flex-col items-center justify-start pb-8 lg:min-h-[calc(100dvh-4rem)]">
	<h1
		class="font-asmbly font-light text-accent pb-2 pt-8 text-center text-2xl lg:text-4xl all-under lg:pb-6"
	>
		{classType.name}
	</h1>
	<div class="drawer mt-2 flex lg:w-full max-w-6xl justify-center rounded-none shadow-lg max-lg:drawer-end lg:drawer-open lg:min-h-[540px]">
		<input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
		<div class="drawer-side lg:h-auto z-10">
			<label for="my-drawer-2" aria-label="close calendar" class="drawer-overlay" />
			<div class="flex">
				<div class="bg-base-100">
					<Calendar selectedDate={date} classInstances={classType.classInstances}/>
				</div>
				<div class="lg:divider lg:divider-horizontal lg:mx-0 lg:my-8" />
			</div>
		</div>
		<div class="drawer-content flex flex-col px-5 py-5 md:px-8 md:py-8">
			<div class="fixed right-4 top-40 lg:hidden">
					<label
						for="my-drawer-2"
						class="btn btn-primary drawer-button btn-circle drop-shadow-lg"
					>
					<span class="material-symbols-outlined">calendar_month</span>
					</label>
			</div>
			<div class="max-w-md px-4">
				<div>
					<h2 class="pb-4 text-lg font-semibold">Description</h2>
					<p class="xs:prose-sm lg:prose-md">{classInstance.summary || classType.summary || 'No description available.'}</p>
				</div>
				<div class="divider" />
				<div class="flex justify-between text-md leading-none">
					<p>
						<span class="font-semibold">Price:</span> {classInstance.price === 0 ? 'Free' : '$' + classInstance.price + '.00'}
					</p>
					<p>
						<span class="font-semibold">Capacity:</span> {classInstance.capacity}
					</p>
				</div>
				<div class="divider" />
				{#if classType.anyCurrent}
				<div class="lg:max-h-64 overflow-auto scroll-smooth">
					{#each classType.classInstances as instance}
					{#if instance.startDateTime.hasSame(date, 'day')}
					<div class="py-4" id="{instance.eventId}">
						{#if instance.endDateTime.hasSame(instance.startDateTime, 'day')}
						<h2 class="mb-4 text-lg"><span class="font-semibold">{instance.startDateTime.toFormat("cccc', 'LLLL d")}</span><span class="font-light"> &nbsp;from
							{instance.startDateTime.toLocaleString(DateTime.TIME_SIMPLE)} - {instance.endDateTime.toLocaleString(DateTime.TIME_SIMPLE)}
						</span></h2>
						{:else}
						<h2 class="mb-2 text-lg">
							<span class="font-semibold">{instance.startDateTime.toFormat("LLLL d")}</span>
							<span class="font-light">&nbsp;at {instance.startDateTime.toLocaleString(DateTime.TIME_SIMPLE)} - </span>
							<span class="font-semibold">{instance.endDateTime.toFormat("LLLL d")}</span>
							<span class="font-light">&nbsp;at {instance.endDateTime.toLocaleString(DateTime.TIME_SIMPLE)}</span>
						</h2>
						<p class="pb-3"><span class="font-bold text-lasers">Note:</span> This class is held over two sessions. Detailed times can be seen during registration.</p>
						{/if}
						<div class="flex justify-between">
							<div class="border-base-300 pb-4 lg:pb-0">
								<p class="text-md leading-none"><span class="font-bold">Teacher:</span> {instance.teacher}</p>
								<p class="pt-2 text-md leading-none"><span class="font-bold">Attendees:</span> <span class:text-lasers={instance.attendees === instance.capacity}>{instance.attendees}</span></p>
							</div>
							<div class="flex items-center justify-end pb-4 lg:pb-0">
								{#if instance.attendees < instance.capacity}
									<a
										class="btn btn-primary rounded-none"
										href={data.baseRegLink.url + instance.eventId}
										target="_blank">Register</a
									>
								{:else if instance.attendees === instance.capacity}
								<div class="flex flex-col items-center justify-center">
									<button
										class="btn btn-primary rounded-none"
										on:click={() => document.getElementById('fullClassNotification').showModal()}
										>Join the Waitlist</button
									>
									<dialog id="fullClassNotification" class="modal">
										<div class="modal-box rounded-none">

												<button
													class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2 rounded-none"
													on:click={() => document.getElementById('fullClassNotification').close()}
													>✕</button
												>

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
												eventId={instance.eventId}
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
													autocomplete="email"
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
							</div>
						</div>
					</div>
					{/if}
					{/each}
				</div>
				{:else}
				<h2 class="pb-4 text-lg font-semibold">No sessions currently scheduled</h2>
				<div class="flex w-72 justify-between lg:w-96">
					<div class="border-base-300 pb-4 lg:pb-0">
						<p class="xs:prose-sm lg:prose-md">
							We do not currently have any sessions of this class scheduled. If you'd like to request this class,
							please use the form below to let us know. We will schedule a session once we have enough interest in the class.
						</p>
						<button
							class="btn btn-primary rounded-none mt-4"
							on:click={() => document.getElementById('onDemandRequest').showModal()}
							>Request this class</button
						>
						<dialog id="onDemandRequest" class="modal">
							<div class="modal-box rounded-none">
								
									<button
										class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2 rounded-none"
										on:click={() => document.getElementById('onDemandRequest').close()}
										>✕</button
									>
								
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
									classTypeId={$page.params.eventTypeId}
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
										autocomplete="email"
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
				{/if}
			</div>
			{#if classType.category !== 'Orientation' && classType.classInstances[0].startDateTime > DateTime.local({zone: 'America/Chicago'})}
			<div class="flex max-w-md justify-between px-4 mt-12">
				<button class="btn btn-primary rounded-none" on:click={() => document.getElementById('privateAndCheckout').showModal()}>
					Request a Private or Checkout Session</button
				>
				<dialog id="privateAndCheckout" class="modal">
					<div class="modal-box rounded-none">

							<button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2 rounded-none"
								on:click={() => document.getElementById('privateAndCheckout').close()}
								>✕</button
							>

						<!-- Modal content -->

						<div class="prose">
							<h2 class="font-asmbly">Private/Checkout Class Request</h2>
							<p>
								Sign up below to request a private or checkout session. Note that we do not offer
								checkout sessions for all classes. This will be indicated by a disabled "Checkout"
								option. More info about private and checkout classes can be found in our <a
									href="https://asmbly.org/faq/#classfaq">Classes FAQ</a
								>.
							</p>
						</div>

						<SuperForm
							action="?/privateRequest"
							data={data?.privateRequestForm}
							dataType="form"
							invalidateAll={false}
							validators={privateRequestSchema}
							classTypeId={$page.params.eventTypeId}
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
							<TextField type="email" {form} field="email" label="Email" class="mb-4 w-full" autocomplete="email" />

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
			{#if classType.classInstances[0].startDateTime > DateTime.local({zone: 'America/Chicago'})}
			<div class="flex max-w-md justify-between p-4">
				<button
					class="btn btn-outline btn-sm rounded-none text-sm font-light"
					on:click={() => document.getElementById('classNotify').showModal()}>Notify me when additional sessions are added</button
				>
				<dialog id="classNotify" class="modal">
					<div class="modal-box rounded-none">
						
						<button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2 rounded-none"
							on:click={() => document.getElementById('classNotify').close()}
							>✕</button
						>
						
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
							classTypeId={$page.params.eventTypeId}
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
							<TextField type="email" {form} field="email" label="Email" class="mb-4 w-full" autocomplete="email" />

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
</style>
