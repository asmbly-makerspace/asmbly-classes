import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms/server';
import { classCancelSchema } from '$lib/zodSchemas/schema.js';
import { DateTime } from 'luxon';
import { postEventSearch, getUserRegistrations } from '$lib/helpers/neonHelpers.js';
import { deleteSession } from "$lib/server/auth";

/** @type {import('./$types').PageServerLoad} */
export async function load({locals}) {
	if (locals.session === null || locals.user === null) {
		return redirect(303, "/my-classes/login");
	}

	// Server API:
	const classCancelForm = await superValidate(classCancelSchema, {
		id: 'classCancelForm'
	});

    // Retrieve user's class data from the Neon API if they are logged in
	const userRegistrations = await getUserRegistrations(locals.user.neonId);
	if (!userRegistrations) {
		return new Response(null, { status: 500 });
	}
	const events = userRegistrations.eventRegistrations.reduce((acc, registration) => {
		const registrationStatus = registration.tickets[0].attendees[0].registrationStatus;
		acc.push({eventId: registration.eventId, registrationStatus});
		return acc;
	}, []);

	const eventSearchFields = [
		{
			field: 'Event',
			operator: 'IN_RANGE',
			valueList: events.map(event => event.eventId)
		},
		{
			field: 'Event Archived',
			operator: 'EQUAL',
			value: 'No'
		}
	];

	const eventSearchOutputFields = [
		'Event Name',
		'Event Start Date',
		'Event End Date',
		'Event Start Time',
		'Event End Time',
		'Event Category Name',
		'Event Admission Fee',
		'Event ID',
	];

	let userClasses = [];

	for await (const response of postEventSearch(eventSearchFields, eventSearchOutputFields)) {
		if (response.status == 400) {
			break
		}
		if (response.pagination.currentPage < response.pagination.totalPages) {
			userClasses.push(...response.searchResults);
		} else {
			break;
		}
	}

	// Add registration status to each userClass
	userClasses.forEach(userClass => {
		userClass.registrationStatus = events.find(event => event.eventId === userClass["Event ID"])?.registrationStatus?.toLowerCase();
	});

	// Unless you throw, always return { form } in load and form actions.
	return { classCancelForm, user: locals.user, userClasses };
}

/** @type {import('./$types').Actions} */
export const actions = {
	classCancel: async ({ request }) => {
		const formData = await request.formData();
		const classCancelForm = await superValidate(formData, classCancelSchema);

		if (!classCancelForm.valid) {
			return fail(400, { classCancelForm });
		}

        // Send a refund request via the Neon API for the eventId in the form data



		return message(classCancelForm, {
			text: `You have successfully cancelled your registration for ${classCancelForm.data.className}.
            You will receive a refund within 7-10 business days.`,
		});
	},
	logout: async ({ cookies, locals }) => {
		if (locals.session === null) {
			return fail(401, { error: "You are not logged in" });
		}
		await deleteSession(locals.session.id); // invalidate session
		cookies.delete("session_token"); // remove cookie
		return redirect(303, "/my-classes/login"); // redirect to login page
	}
}