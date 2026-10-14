import { prisma } from '$lib/postgres.js';
import { json, error } from '@sveltejs/kit';
import { notifyWaitlist } from '$lib/server/waitlist';
import { DateTime } from 'luxon';
import { INTERNAL_API_KEY } from '$lib/server/secrets';

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

    const status = result.data.tickets[0].attendees[0].registrationStatus;

    if (status !== 'CANCELED' && status !== 'REFUNDED') {
        return json({ updated: false }, { status: 200 });
    }

    const eventId = parseInt(result.data.eventId);
    const neonId = parseInt(result.data.registrantAccountId);

    console.log(`Event registration canceled with status ${status}: Event ID: ${eventId} - Neon ID: ${neonId}`);

    const eventToUpdate = await prisma.neonEventInstance.findUnique({
        where: {
            eventId: eventId
        },
        include: {
            cancellees: {
                where: {
                    neonId: neonId
                }
            }
        }
    });

    let eventInstanceCancellee;
    if (eventToUpdate.cancellees.length > 0) {
        console.log(`Registrant (Neon ID: ${neonId}) has already cancelled. Will not decrement.`);
        return json({ updated: false }, { status: 200 });
    } else {
        eventInstanceCancellee = prisma.neonEventInstanceCancellee.upsert({
            where: {
                neonId: neonId
            },
            update: {
                eventInstanceCancellations: {
                    connect: {
                        eventId: eventId
                    }
                }
            },
            create: {
                neonId: neonId,
                eventInstanceCancellations: {
                    connect: {
                        eventId: eventId
                    }
                }
            }
        });
    }

    const eventInstanceDecrementCall = prisma.neonEventInstance.update({
        where: {
            eventId: eventId
        },
        data: {
            attendeeCount: {
                decrement: 1
            }
        },
        include: {
            eventType: {
                select: {
                    name: true
                }
            }
        }
    })

    let eventInstanceDecrement;
    try {
        [eventInstanceDecrement, eventInstanceCancellee] = await prisma.$transaction([eventInstanceDecrementCall, eventInstanceCancellee]);
        console.log(`Decrementing seat count for ${eventInstanceDecrement.eventType.name} on ${DateTime.fromJSDate(eventInstanceDecrement.startDateTime).setZone('America/Chicago').toLocaleString(DateTime.DATETIME_MED)}`);
    } catch (e) {
        console.error(e);
        return error(500, 'Database error');
    }

    await notifyWaitlist(eventId);

	return json({ updated: true }, { status: 200 });

}