import { auth } from "$lib/server/lucia";
import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').PageServerLoad} */
export async function load ({ locals }) {
	const session = await locals.auth.validate();
	if (session) throw redirect(302, "/my-classes");
	return {};
};