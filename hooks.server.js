import { redisClient } from '$lib/server/redis.js';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const { url } = event;

	if (url.pathname.startsWith('/event') || url.pathname.startsWith('/api') || url.pathname.startsWith('/newsletter-signup')) {
		const response = await resolve(event);

		return response;
	}

	// Create a unique key to store the page in the
	// cache. I'm using "rendered" to differentiate
	// entries from other data in Redis and the "v1"
	// will allow invalidating the entire cache if
	// the application code will change rendering.
	// I don't want to alter the cache
	// on every querystring parameter otherwise it
	// reduces the cache hit-rate.
	const key = `rendered:v1:${url.pathname}`;

	// ideally this is the only network request that
	// we make ... it will return an empty object if
	// the page wasn't cached or a populated object
	// containing body and headers
	let cached = await redisClient.hGetAll(key);

	if (!cached.body) {
		// if it wasn't cached, we render the pages
		const response = await resolve(event);

		// then convert it into a cachable object
		cached = Object.fromEntries(response.headers.entries());
		cached.body = await response.text();

		if (response.status === 200) {
			// and write it to the Redis cache ...
			// NOTE: although this returns a promise
			// we don't await it, so we don't delay
			// returning the response to the client
			// (the cache write is "fire and forget")
			redisClient.hSet(key, cached);
		}
	}

	// we end up here with the same object whether
	// it came from the cache or was rendered fresh
	// and we just return it as the response
	const { body, ...headers } = cached;
	return new Response(body, { headers: new Headers(headers) });
}
