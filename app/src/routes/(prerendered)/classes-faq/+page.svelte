<script>
	import FAQField from '$lib/components/classFAQField.svelte';
</script>

<svelte:head>
	<title>Asmbly | Classes FAQ</title>
	<meta name="description" content="Frequently asked questions related to classes at Asmbly." />
	<meta name="keywords" content="faq, classes, asmbly" />
</svelte:head>

<div class="flex flex-col items-center justify-center mx-4 pb-8 lg:min-h-[calc(100dvh-4rem)]">
	<h1
		class="font-asmbly font-light text-accent text-4xl pt-8 text-center all-under"
	>
		Frequently Asked Questions
	</h1>
	<div class="max-w-3xl mt-8">

		<h2 class="font-asmbly font-light mt-4 lg:mt-10 mb-8 lg:mb-10 text-2xl text-accent uppercase">Regular Classes</h2>

		<FAQField>
			<div slot="collpase-title" class="collapse-title text-lg font-medium peer-checked:bg-asmbly peer-checked:text-secondary">
				Do I have to be an Asmbly member to take classes?
			</div>
			<div slot="content" class="collapse-content peer-checked:border-b peer-checked:border-x peer-checked:border-asmbly peer-checked:bg-base-100">
				<p class="mt-3">
					No, we don't require an Asmbly membership to take classes. The only requirement is a
					free Neon account. If you don't already have a Neon account, you can sign up for one <a
						href="https://asmbly.org/signup"
						class="underline"
						target="_blank">here</a
					>.
				</p>
			</div>
		</FAQField>
		<FAQField>
			<div slot="collpase-title" class="collapse-title text-lg font-medium peer-checked:bg-asmbly peer-checked:text-secondary">
				Is there a member discount for classes?
			</div>
			<div slot="content" class="collapse-content peer-checked:border-b peer-checked:border-x peer-checked:border-asmbly peer-checked:bg-base-100">
				<p class="mt-3">No, not at this time.</p>
			</div>
		</FAQField>
		<FAQField>
			<div slot="collpase-title" class="collapse-title text-lg font-medium peer-checked:bg-asmbly peer-checked:text-secondary">
				What is your class refund policy?
			</div>
			<div slot="content" class="collapse-content peer-checked:border-b peer-checked:border-x peer-checked:border-asmbly peer-checked:bg-base-100">
				<p class="my-3">Class registrations may be fully refunded at least 48 hours in advance of the class start time.  
					If it is within 48 hours of the class start time, registrations are nonrefundable. To initiate a refund,
					send us an email at <a class="underline" href="mailto:membership@asmbly.org">membership@asmbly.org</a>. If it is within 48 hours of the 
					class start time, it will not be possible to initiate a refund.
				</p>
				<p class="mt-3">
					If you intend to reschedule for a future session of the class, we ask that you please email us at
					<a class="underline" href="mailto:membership@asmbly.org">membership@asmbly.org</a> with your requested reschedule 
					instead of requesting a refund. We will take care of the reschedule on your behalf. This method saves us 
					transaction fees. The same 48 hour policy applies to class reschedules, and in both cases we will 
					abide by the time your email was sent.
				</p>
			</div>
		</FAQField>
		<FAQField>
			<div slot="collpase-title" class="collapse-title text-lg font-medium peer-checked:bg-asmbly peer-checked:text-secondary">
				When will you add more classes to the calendar?
			</div>
			<div slot="content" class="collapse-content peer-checked:border-b peer-checked:border-x peer-checked:border-asmbly peer-checked:bg-base-100">
				<p class="mt-3">
					We try to keep the class calendar updated as far into the future as possible. However,
					schedules vary and we don't add new classes on any particular day. Be sure to sign up
					for notifications if you'd like to know ASAP when more sessions are added for a class.
					To sign up, go to the details page for that class, then click "Notify me when additional
					sessions are added."
				</p>
			</div>
		</FAQField>
		<FAQField>
			<div slot="collpase-title" class="collapse-title text-lg font-medium peer-checked:bg-asmbly peer-checked:text-secondary">
				Can my child take classes at Asmbly?
			</div>
			<div slot="content" class="collapse-content peer-checked:border-b peer-checked:border-x peer-checked:border-asmbly peer-checked:bg-base-100">
				<p class="my-3">
					Minors are allowed to take classes at Asmbly as long as they are 13+ and accompanied by a parent/guardian.
					Both the parent/guardian and child must be registered for the class separately, meaning you will both need Neon accounts, 
					and you will both pay the registration fee for the class.
				</p>
				<p class="my-3">
					In addition, you will need to sign a separate <a class="underline" href="https://asmbly.org/guest-waiver-minor" target="_blank">liability waiver</a> for your minor.
				</p>
				<p class="mt-3">
					Because membership is restricted to adults 18+, minors will not be able to join Asmbly as members. This means that minors will
					not be able to use Asmbly equipment after class.
				</p>
			</div>
		</FAQField>

		<h2 class="font-asmbly font-light mb-8 lg:mb-10 mt-12 lg:mt-20 text-2xl text-accent uppercase">Private and Checkout Classes</h2>

		<FAQField>
			<div slot="collpase-title" class="collapse-title text-lg font-medium peer-checked:bg-asmbly peer-checked:text-secondary">
				How much does a private class cost?
			</div>
			<div slot="content" class="collapse-content peer-checked:border-b peer-checked:border-x peer-checked:border-asmbly peer-checked:bg-base-100">
				<p class="my-3">
					The price of a private class will vary depending on the class and the number of
					attendees. The per-person fee will be the lesser of 2.5x the regular group class rate or
					the full-class fee divided by the number of attendees.
				</p>

				<p class="underline">Example:</p>
				<p class="my-3">
					MIG Welding typically costs $100 per attendee with a maximum of 4 attendees, making the
					full-class fee $400. For a private class, the cost would be:
				</p>
				<ul class="list-disc list-inside mt-3">
					<li>1 student – $250</li>
					<li>2 students – $200/ea.</li>
					<li>3 students – $135/ea.</li>
					<li>4 students – $100/ea.</li>
				</ul>
			</div>
		</FAQField>

		<FAQField>
			<div slot="collpase-title" class="collapse-title text-lg font-medium peer-checked:bg-asmbly peer-checked:text-secondary">
				How much do checkout classes cost?
			</div>
			<div slot="content" class="collapse-content peer-checked:border-b peer-checked:border-x peer-checked:border-asmbly peer-checked:bg-base-100">
				<p class="mt-3">
					The price of a checkout class will vary depending on the class. Once you request a
					checkout class, we will email you to let you know the fee and connect you with the
					instructor.
				</p>
			</div>
		</FAQField>

		<FAQField>
			<div slot="collpase-title" class="collapse-title text-lg font-medium peer-checked:bg-asmbly peer-checked:text-secondary">
				Why do some classes not have a checkout option?
			</div>
			<div slot="content" class="collapse-content peer-checked:border-b peer-checked:border-x peer-checked:border-asmbly peer-checked:bg-base-100">
				<p class="my-3">While most classes have a checkout option, some classes do not. We do not offer checkouts on basic 
					shop safety classes (Woodshop Safety and Metal Shop Safety) to ensure that all new members are aware of
					Asmbly-specific safety practices, and ensure that everyone has been trained to the same baseline.
				</p>

				<p class="mt-3">Likewise, we do not offer checkouts on some of our particularly high-value machinery (e.g. CNCs and lasers),
						regardless of experience.
				</p>
			</div>
		</FAQField>

		<FAQField>
			<div slot="collpase-title" class="collapse-title text-lg font-medium peer-checked:bg-asmbly peer-checked:text-secondary">
				How do checkout classes work?
			</div>
			<div slot="content" class="collapse-content peer-checked:border-b peer-checked:border-x peer-checked:border-asmbly peer-checked:bg-base-100">
				<p class="my-3">You will be asked to perform a task that a user with intermediate experience should be able to complete without help, 
					while being supervised by an instructor. The instructor will also cover Asmbly-specific policies and procedures related to the tool. 
					If you are successful, you will be granted access to the tool. If you are not successful, you will be asked to take the intro course on that tool. 
				</p>

				<p class="mt-3"><b class="text-error">NOTE:</b> If you fail the checkout, you <b class="text-error">WILL NOT</b> be refunded, 
					nor will we apply the fee to the corresponding intro class. 
					Keep this in mind when deciding between requesting a checkout and taking the usual intro class. 
				</p>
			</div>
		</FAQField>

		<h2 class="font-asmbly font-light mb-8 lg:mb-10 mt-12 lg:mt-20 text-2xl text-accent uppercase">Teaching</h2>

		<FAQField>
			<div slot="collpase-title" class="collapse-title text-lg font-medium peer-checked:bg-asmbly peer-checked:text-secondary">
				I'm interested in teaching a class. Who should I contact?
			</div>
			<div slot="content" class="collapse-content peer-checked:border-b peer-checked:border-x peer-checked:border-asmbly peer-checked:bg-base-100">
				<p class="my-3">Send us an email at <a class="underline" href="mailto:classes@asmbly.org">classes@asmbly.org</a> with your 
					background, teaching experience, and the class(es) you'd like to teach, and we will get back to you.</p>
				<p class="mt-3">
					Please note that prior teaching experience is not required but you will need experience in the subject matter.  
					If you have a suggestion for a class we do not offer please reach out to the above contact with your ideas.
				</p>
			</div>
		</FAQField>
		<FAQField>
			<div slot="collpase-title" class="collapse-title text-lg font-medium peer-checked:bg-asmbly peer-checked:text-secondary">
				How much are teachers paid?
			</div>
			<div slot="content" class="collapse-content peer-checked:border-b peer-checked:border-x peer-checked:border-asmbly peer-checked:bg-base-100">
				<p class="mt-3">
					There are a number of factors that determine how much teachers are paid for a class. Please read through
					the <a class="underline" href="https://wiki.asmbly.org/index.php/Teaching_at_Asmbly">Teaching at Asmbly</a> wiki page to learn more.
				</p>
			</div>
		</FAQField>
		<FAQField>
			<div slot="collpase-title" class="collapse-title text-lg font-medium peer-checked:bg-asmbly peer-checked:text-secondary">
				I'm interested in offering a Mentor Series class. Who should I contact?
			</div>
			<div slot="content" class="collapse-content peer-checked:border-b peer-checked:border-x peer-checked:border-asmbly peer-checked:bg-base-100">
				<p class="my-3">Send us an email at <a class="underline" href="mailto:classes@asmbly.org">classes@asmbly.org</a> with your 
					background, teaching experience, and the class(es) you'd like to teach, and we will get back to you.
				</p>
				<p class="mt-3"> 
					Please note that we will expect a higher level of experience in the subject matter than we would normally expect
					for a regular class.
				</p>
			</div>
		</FAQField>
	</div>
</div>

<style>
</style>