import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms/server';
import { classCancelSchema } from '$lib/zodSchemas/schema.js';
import { DateTime } from 'luxon';
import { INTERNAL_API_KEY } from '$lib/server/secrets';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	// Server API:
	const classCancelForm = await superValidate(classCancelSchema, {
		id: 'classCancelForm'
	});

    // Retrieve user's class data from the Neon API if they are logged in

	// Unless you throw, always return { form } in load and form actions.
	return { classCancelForm };
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
}