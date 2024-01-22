import { auth } from "$lib/server/lucia.js";
import { OAuthRequestError, validateOAuth2AuthorizationCode } from "@lucia-auth/oauth";
import { CLIENT_SECRET as clientSecret, CLIENT_ID as clientId } from "$lib/server/secrets";

async function getExistingUser(userId) {
    const key = await auth.useKey("neon", userId, null);
    const user = await auth.getUser(key.userId);
    return user;
}


export const GET = async ({ url, cookies, locals }) => {
	const storedState = cookies.get("neon_oauth_state");
	const state = url.searchParams.get("state");
	const code = url.searchParams.get("code");
	// validate state
	if (!storedState || !state || storedState !== state || !code) {
		return new Response(null, {
			status: 400
		});
	}
	try {
        const tokens = await validateOAuth2AuthorizationCode(
            code,
            "https://app.neoncrm.com/np/oauth/token",
            {
                clientId: clientId,
                clientPassword: {
                    clientSecret: clientSecret,
                    authenticateWith: "client_secret"
                }
            }
        )

		const getUser = async () => {
			const existingUser = await getExistingUser(tokens.access_token);
			if (existingUser) return existingUser;
			const user = await auth.createUser({
                key: {
                    providerId: "neon",
                    providerUserId: tokens.access_token,
                    password: null
                },
				attributes: {
					neonId: tokens.access_token
				}
			});
			return user;
		};

		const user = await getUser();
		const session = await auth.createSession({
			userId: user.userId,
			attributes: {}
		});
		locals.auth.setSession(session);
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/my-classes"
			}
		});
	} catch (e) {
		if (e instanceof OAuthRequestError) {
			// invalid code
			return new Response(null, {
				status: 400
			});
		}
		return new Response(null, {
			status: 500
		});
	}
};