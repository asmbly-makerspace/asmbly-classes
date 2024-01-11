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
        return new Response(error(400));
    }

    if (apiKey !== INTERNAL_API_KEY) {
        return new Response(error(401, 'Unauthorized'));
    }

    const eventId = parseInt(result.data.eventId);
    const registrantId = parseInt(result.data.registrantAccountId);

    const eventInstanceIncrementCall = prisma.NeonEventInstance.update({
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
            requester: true
        }
    })


    const registrantCall = getIndividualAccount(registrantId);

    let [_, registrant] = await Promise.all([prisma.$transaction([eventInstanceIncrementCall]), registrantCall]);

    const email = registrant.individualAccount.primaryContact.email1;
    
    const eventRequester = await prisma.NeonEventRequester.findUnique({
        where: {
            email: email
        }
    })

    if (eventRequester) {
        await prisma.NeonEventInstance.update({
            where: {
                eventId: eventId
            },
            data: {
                requester: {
                    disconnect: [{
                        id: eventRequester.id
                    }]
                }
            }
        })
    }
    return new Response(json({ success: true}));
}