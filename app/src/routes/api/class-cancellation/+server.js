import { prisma } from '$lib/postgres.js';
import { json, error } from '@sveltejs/kit';
import { sendMIMEmessage } from '$lib/server/gmailEmailFactory';
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

    const baseRegLinkCall = prisma.neonBaseRegLink.findFirst({
        select: {
            url: true
        }
    });

    let eventInstanceDecrement, baseRegLink;
    try {
        [eventInstanceDecrement, baseRegLink, eventInstanceCancellee] = await prisma.$transaction([eventInstanceDecrementCall, baseRegLinkCall, eventInstanceCancellee]);
        console.log(`Decrementing seat count for ${eventInstanceDecrement.eventType.name} on ${DateTime.fromJSDate(eventInstanceDecrement.startDateTime).setZone('America/Chicago').toLocaleString(DateTime.DATETIME_MED)}`);
    } catch (e) {
        console.error(e);
        return error(500, 'Database error');
    }

    if (eventInstanceDecrement.requests.length > 0) {

        const startDateTime = DateTime.fromJSDate(eventInstanceDecrement.startDateTime).setZone('America/Chicago').toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);

        const emailList = [];
        const requestsFulfilled = [];

        for (const request of eventInstanceDecrement.requests) {
            const email = request.requester.email;

            const emailBody = `
            <div>
            <p>Hi ${request.requester.firstName},</p>
            <p>A seat has opened up in ${eventInstanceDecrement.eventType.name} on ${startDateTime}.</p>
            <p>If you are interested in attending, please use <a href="${baseRegLink.url}${eventId}">this link</a> to register through Neon.</p>
            <p>As a reminder, seats are first come first served.</p>
            <p><b>Please note:</b> If someone else has already registered and taken the open seat, Neon will still allow you to "register" and join Neon's waitlist system without
            paying for the class. This means that you are not a confirmed student, and you will not be able to join this session. If Neon collects your registration fee and you 
            receive an event registration confirmation email, you are a confirmed student.</p>
            <p>If you have any questions, feel free to reply to this email.</p>
            <p>Best, <br>Asmbly Education Team</p>
            </div>
            `

            const response = sendMIMEmessage({
                from: 'Asmbly Education Team <notification@asmbly.org>',
                to: email,
                replyTo: 'membership@asmbly.org',
                subject: `Open seat in ${eventInstanceDecrement.eventType.name} at Asmbly`,
                html: emailBody
            })

            emailList.push(response);

            requestsFulfilled.push(request.id);

            console.log(`Sending waitlist seat opening email to ${email} for ${eventInstanceDecrement.eventType.name} on ${startDateTime}`);
        }

        const sentEmails = await Promise.allSettled(emailList);

        if (sentEmails.some(email => email.status === 'rejected')) {
            console.error(`Error sending email: ${email.reason}`);
        }

        if (sentEmails.some(email => email.status === 'fulfilled')) {
            await prisma.neonEventInstanceRequest.updateMany({
                where: {
                    id: {
                        in: [...requestsFulfilled]
                    }
                },
                data: {
                    fulfilled: true
                }
            })
        }
    }

	return json({ updated: true }, { status: 200 });

}