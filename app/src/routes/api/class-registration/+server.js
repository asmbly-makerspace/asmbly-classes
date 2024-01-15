import { prisma } from '$lib/postgres.js';
import { json, error } from '@sveltejs/kit';
import { getIndividualAccount } from '$lib/helpers/neonHelpers.js'
import { INTERNAL_API_KEY} from '$lib/server/secrets';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {

    const result = await request.json();

    let apiKey;
    try {
        apiKey = result.customParameters.apiKey;
    } catch (e) {
        return error(400, 'API key not found');
    }

    if (apiKey !== INTERNAL_API_KEY) {
        return error(401, 'Unauthorized');
    }

    const eventId = parseInt(result.data.eventId);
    const registrantId = parseInt(result.data.registrantAccountId);

    const eventInstanceIncrement = await prisma.neonEventInstance.update({
        where: {
            eventId: eventId
        },
        data: {
            attendeeCount: {
                increment: 1
            }
        },
        include: {
            eventType: {
                select: {
                    name: true
                }
            },
            requests: {
                where: {
                    fulfilled: false
                },
                select: {
                    requester: true
                }
            }
        }
    })

    if (eventInstanceIncrement.requests.length === 0) {
        return json({ success: true}, { status: 200 });
    }

    const registrant = await getIndividualAccount(registrantId);

    const email = registrant.individualAccount.primaryContact.email1;

    const eventRequester = eventInstanceIncrement.requests.find((request) => {
        return request.requester.email === email
    })

    if (typeof eventRequester !== 'undefined') {
        await prisma.neonEventInstanceRequest.update({
            where: {
                eventInstanceRequest: {
                    eventId: eventId,
                    requesterId: eventRequester.id
                }
            },
            data: {
                fulfilled: true
            }
        })
    }
    return json({ success: true}, { status: 200 });
}