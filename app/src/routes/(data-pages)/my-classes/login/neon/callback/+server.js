import { createSession, setSessionTokenCookie } from "$lib/server/auth";
import { CLIENT_SECRET as clientSecret, CLIENT_ID as clientId, REDIRECT_URI as redirectUri } from "$lib/server/secrets";
import { prisma } from "$lib/postgres.js";

class NeonError extends Error {
	constructor(message) {
		super(message);
		this.name = "NeonError";

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, NeonError);
		}
	}
}

async function getOrCreateUser(neonId) {
	const user = await prisma.user.upsert({
		where: {
			neon_id: neonId
		},
		update: {},
		create: {
			neon_id: neonId
		}
	});
	return user;
}

async function getNeonAccessToken(code) {
	const response = await fetch(
		"https://app.neoncrm.com/np/oauth/token",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: `code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&grant_type=authorization_code`
		}
	)
	if (!response.ok) {
		throw new NeonError("Invalid response from Neon");
	}

	const tokens = await response.json();
	if (!tokens.access_token) {
		throw new NeonError("Invalid tokens from Neon");
	}

	return parseInt(tokens.access_token);
}


export const GET = async ({ url, cookies, locals }) => {
	const storedState = cookies.get("neon_oauth_state");
	const state = url.searchParams.get("state");
	const code = url.searchParams.get("code");
	const error = url.searchParams.get("error");

	if (error == 'invalid_request') {
		return new Response(JSON.stringify({
			error: "You may be logged in as a Neon system user. Please log out of your current session and try again with your constituent account."
		}), {
			status: 400,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}
	// validate state
	if (!storedState || !state || storedState !== state || !code) {
		return new Response(null, {
			status: 400
		});
	}
	try {
        const accessToken = await getNeonAccessToken(code);

		const user = await getOrCreateUser(accessToken);

		const session = await createSession(user.id);
		const sessionExpiresAt = new Date(session.createdAt.getTime() + (60 * 60 * 24 * 1000)); // 1 day from now
		setSessionTokenCookie(cookies, session.token, sessionExpiresAt);
	} catch (e) {
		console.error(e);
		if (e instanceof NeonError) {
			return new Response(null, {
				status: 400
			});
		}
		return new Response(null, {
			status: 500
		});
	}
	return new Response(null, {
		status: 303,
		headers: {
			Location: "/my-classes"
		}
	});
};