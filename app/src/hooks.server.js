import { validateSessionToken, setSessionTokenCookie } from "$lib/server/auth";

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const token = event.cookies.get("session_token") ?? null;
	if (token === null) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await validateSessionToken(token);
	
	if (session === null) {
		event.cookies.delete("session_token");
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	event.locals.session = session;
	event.locals.user = user;
	return resolve(event);
};