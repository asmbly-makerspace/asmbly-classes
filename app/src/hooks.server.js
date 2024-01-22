import { auth } from "$lib/server/lucia";

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// we can pass `event` because we used the SvelteKit middleware
	event.locals.auth = auth.handleRequest(event);
	return await resolve(event);
};