import { json, error } from '@sveltejs/kit';
import { notifyWaitlist } from '$lib/server/waitlist';
import { INTERNAL_API_KEY } from '$lib/server/secrets';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {

    const { apiKey, eventIds } = await request.json();

    if (!INTERNAL_API_KEY || apiKey !== INTERNAL_API_KEY) {
        return error(401, 'Unauthorized');
    }

    if (!Array.isArray(eventIds)) {
        return error(400, 'eventIds must be an array');
    }

    for (const eventId of eventIds) {
        await notifyWaitlist(parseInt(eventId));
    }

    return json({ notified: true }, { status: 200 });
}
