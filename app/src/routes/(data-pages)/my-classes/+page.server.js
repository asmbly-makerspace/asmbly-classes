import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms/server';
import { classCancelSchema } from '$lib/zodSchemas/schema.js';
import { DateTime } from 'luxon';
import { getUserRegistrations } from '$lib/helpers/neonHelpers.js';
import { deleteSession } from "$lib/server/auth";
import { prisma } from '$lib/postgres.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({locals}) {
	try {
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

		const userClasses = await prisma.neonEventInstance.findMany({
			where: {
				eventId: {
					in: events.map(event => parseInt(event.eventId))
				},
			},
			include: {
				eventType: {
					include: {
						category: {
							include: {
								archCategories: true
							}
						}
					}
				}
			}
		});

		if (!userClasses || userClasses.length === 0) {
			return { classCancelForm, user: locals.user, userClasses: null };
		}

		// Add registration status to each userClass
		userClasses.forEach(userClass => {
			userClass.registrationStatus = events.find(event => event.eventId === userClass.eventId)?.registrationStatus?.toLowerCase();
		});

		// Unless you throw, always return { form } in load and form actions.
		return { classCancelForm, user: locals.user, userClasses };
	} catch (e) {
		console.error(e);
		throw error(500, { message: "An unexpected error occurred while loading your classes" });
	}
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