import { dev } from "$app/environment";
import { createOAuth2AuthorizationUrl } from "@lucia-auth/oauth";
import { CLIENT_ID as clientId, REDIRECT_URI as redirectUri } from "$env/static/private";

export const GET = async ({ cookies }) => {
    const [url, state] = await createOAuth2AuthorizationUrl(
        "https://asmbly.app.neoncrm.com/np/oauth/auth",
        {
            clientId,
            scope: [],
            redirectUri
        }
    );
	// store state
	cookies.set("neon_oauth_state", state, {
		httpOnly: true,
		secure: !dev,
		path: "/my-classes",
		maxAge: 60 * 60
	});
	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString()
		}
	});
};