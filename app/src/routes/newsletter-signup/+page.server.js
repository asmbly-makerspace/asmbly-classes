import { apiCall } from "$lib/server/apiCall.js";
import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms/server';
import { newsletterSchema } from '$lib/zodSchemas/schema.js';

const FLO_BASE_URL = "https://api.flodesk.com/v1";
const FLO_API_KEY = process.env.FLODESK_API_KEY;

const FLO_AUTH = `${FLO_API_KEY}:`;
const FLO_SIGNATURE = Buffer.from(FLO_AUTH).toString('base64');
const FLO_HEADERS = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${FLO_SIGNATURE}`
};

async function newsletterSignupHelper(email) {
    const resourcePath = '/subscribers';
    const httpVerb = 'POST';
    const url = FLO_BASE_URL + resourcePath;

    const data = {
        "email": `${email}`
    };

    const response = await apiCall(httpVerb, url, data, FLO_HEADERS);

    return response;
}


/** @type {import('./$types').Actions} */
export const actions = {
	newsletterSignup: async ({ request }) => {
		const newsletterSignupForm = await superValidate(request, newsletterSchema);

		if (!newsletterSignupForm.valid) {
            return message(newsletterSignupForm, {
                text: 'Form validation failed. Please try again.'
            });
		}

        
        const signup = await newsletterSignupHelper(newsletterSignupForm.data.email);

        console.log('POST', newsletterSignupForm)

		return message(newsletterSignupForm, {
            text: 'Thanks! Keep an eye on your inbox for updates.'
        });
	}
};