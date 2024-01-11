import { superValidate } from 'sveltekit-superforms/server';
import { newsletterSchema } from '$lib/zodSchemas/schema.js';

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
    const newsletterSignupForm = await superValidate(newsletterSchema);

	return { newsletterSignupForm };
}
