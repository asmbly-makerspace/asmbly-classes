import { dev } from "$app/environment";
import { generateState } from "arctic";
import { CLIENT_ID as clientId, REDIRECT_URI as redirectUri } from "$lib/server/secrets";

const createOAuth2AuthorizationUrl = (state) => {
	const url = new URL("https://asmbly.app.neoncrm.com/np/oauth/auth");
	url.searchParams.set("client_id", clientId);
	url.searchParams.set("redirect_uri", redirectUri);
	url.searchParams.set("state", state);
	url.searchParams.set("response_type", "code");

	return url.toString();
}

export const GET = async ({ cookies }) => {
	const state = generateState();
    const url = createOAuth2AuthorizationUrl(state);
	// store state
	cookies.set("neon_oauth_state", state, {
		httpOnly: true,
		secure: !dev,
		path: "/my-classes",
		maxAge: 60 * 10,
		sameSite: "lax"
	});
	return new Response(null, {
		status: 303,
		headers: {
			Location: url.toString()
		}
	});
};