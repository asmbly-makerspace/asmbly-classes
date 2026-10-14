import { prisma } from '$lib/postgres.js';
import { sendMIMEmessage } from '$lib/server/gmailEmailFactory';
import { DateTime } from 'luxon';

/**
 * Email everyone on a class session's waitlist that a seat has opened up, then mark their requests fulfilled
 * @param {number} eventId - Neon event ID of the class session
 */
export async function notifyWaitlist(eventId) {
    const eventInstanceCall = prisma.neonEventInstance.findUnique({
        where: {
            eventId: eventId
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
                    requester: true,
                    id: true
                }
            }
        }
    });

    const baseRegLinkCall = prisma.neonBaseRegLink.findFirst({
        select: {
            url: true
        }
    });

    const [eventInstance, baseRegLink] = await prisma.$transaction([eventInstanceCall, baseRegLinkCall]);

    if (!eventInstance || eventInstance.requests.length === 0) {
        return;
    }

    const startDateTime = DateTime.fromJSDate(eventInstance.startDateTime).setZone('America/Chicago').toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);

    const emailList = [];
    const requestsFulfilled = [];

    for (const request of eventInstance.requests) {
        const email = request.requester.email;

        const emailBody = `
        <div>
        <p>Hi ${request.requester.firstName},</p>
        <p>A seat has opened up in ${eventInstance.eventType.name} on ${startDateTime}.</p>
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
            subject: `Open seat in ${eventInstance.eventType.name} at Asmbly`,
            html: emailBody
        })

        emailList.push(response);

        requestsFulfilled.push(request.id);

        console.log(`Sending waitlist seat opening email to ${email} for ${eventInstance.eventType.name} on ${startDateTime}`);
    }

    // sendMIMEmessage logs and swallows send failures, so it never rejects
    await Promise.all(emailList);

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
