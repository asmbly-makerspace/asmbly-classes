import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').PageServerLoad} */
export async function load ({ locals }) {
	if (locals.session !== null && locals.user !== null) {
		return redirect(303, "/my-classes");
	}
	return {};
};