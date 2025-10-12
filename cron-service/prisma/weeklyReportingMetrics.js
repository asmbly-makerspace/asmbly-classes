/*
Generate weekly reporting metrics for class requests - on demand, event type notifications,
and waitlist requests. Sends an email to classes@ with the results.
*/

import { prisma } from './prismaClient.js';
import { sendMIMEmessage } from './gmailEmailFactory.js';
import { DateTime } from 'luxon';

/**
 * Generates weekly metrics based on the given array of Prisma requests.
 *
 * @param {Array} prismaRequestArray - An array of class/event requests from the database.
 * @return {Array} An array of weekly metrics.
 * @throws {Error} Throws an error if no requests are found or if the request type is invalid.
 */
function generateWeeklyMetrics(prismaRequestArray) {
    if (prismaRequestArray.length === 0) {
        throw new Error('No requests found');
    }

    const requestType = typeof prismaRequestArray[0].requestType === 'undefined' ? 'waitlist' : 'notification';

    if (requestType === 'waitlist') {
        const weeklyMetrics = [];
        for (const request of prismaRequestArray) {
            const classType = request.eventInstance.eventType.name;
            const requesterName = request.requester.firstName + ' ' + request.requester.lastName;
            const requesterEmail = request.requester.email;

            weeklyMetrics.push({
                classType: classType,
                requesterName: requesterName,
                requesterEmail: requesterEmail
            })
        }

        return weeklyMetrics
    } else if (requestType === 'notification') {
        const weeklyMetrics = [];

        for (const request of prismaRequestArray) {
            const classType = request.classType.name;
            const requestType = request.requestType;
            const requesterName = request.requester.firstName + ' ' + request.requester.lastName;
            const requesterEmail = request.requester.email;

            weeklyMetrics.push({
                classType: classType,
                requestType: requestType,
                requesterName: requesterName,
                requesterEmail: requesterEmail
            })
        }

        return weeklyMetrics
    } else {
        throw new Error('Invalid request type');
    }
}

/**
 * Generates and sends a weekly event request report via email.
 *
 * @return {Promise<void>} - A promise that resolves when the email is sent.
 */
async function main(config) {
    const today = DateTime.now();
    const weekStart = today.minus({ days: today.weekday - 1 });
    const weekEnd = weekStart.plus({ days: 6 });

    const weeklyEventTypeRequests = await prisma.neonEventTypeRequest.findMany({
        where: {
            createdAt: {
                gte: weekStart.toJSDate(),
                lte: weekEnd.toJSDate(),
            }
        },
        include: {
            requester: true,
            classType: true
        }
    });

    const weeklyWaitlistRequests = await prisma.neonEventInstanceRequest.findMany({
        where: {
            createdAt: {
                gte: weekStart.toJSDate(),
                lte: weekEnd.toJSDate(),
            }
        },
        include: {
            eventInstance: {
                include: {
                    eventType: true
                }
            },
            requester: true
        }
    });

    let weeklyEventTypeMetrics;
    try {
        weeklyEventTypeMetrics = generateWeeklyMetrics(weeklyEventTypeRequests)
    } catch (e) {
        if (e.message === 'No requests found') {
            weeklyEventTypeMetrics = [];
            console.log(`No event type requests found for ${weekStart.toLocaleString()} - ${weekEnd.toLocaleString()}`);
        } else {
            console.error(e);
            return
        }
    }

    let weeklyWaitlistMetrics;
    try {
        weeklyWaitlistMetrics = generateWeeklyMetrics(weeklyWaitlistRequests)
    } catch (e) {
        if (e.message === 'No requests found') {
            weeklyWaitlistMetrics = [];
            console.log(`No waitlist requests found for ${weekStart.toLocaleString()} - ${weekEnd.toLocaleString()}`);
        } else {
            console.error(e);
            return
        }
    }

    let insertedWaitlistMetrics = '';
    if (weeklyWaitlistMetrics.length > 0) {
        for (const metric of weeklyWaitlistMetrics) {
            insertedWaitlistMetrics += `<tr>
            <td style="padding: 5px 15px 5px 15px; text-align:center">${metric.classType}</td>
            <td style="padding: 5px 15px 5px 15px; text-align:center">${metric.requesterName}</td>
            <td style="padding: 5px 15px 5px 15px; text-align:center">${metric.requesterEmail}</td>
            </tr>`
        }
    }

    let insertedEventTypeNotificationMetrics = '';
    if (weeklyEventTypeMetrics.length > 0) {
        for (const metric of weeklyEventTypeMetrics) {
            if (metric.requestType === 'NOTIFICATION') {
                insertedEventTypeNotificationMetrics += `<tr>
                <td style="padding: 5px 15px 5px 15px; text-align:center">${metric.classType}</td>
                <td style="padding: 5px 15px 5px 15px; text-align:center">${metric.requesterName}</td>
                <td style="padding: 5px 15px 5px 15px; text-align:center">${metric.requesterEmail}</td>
                </tr>`
            }
        }
    }
    
    let insertedEventTypeOnDemandMetrics = '';
    if (weeklyEventTypeMetrics.length > 0) {
        for (const metric of weeklyEventTypeMetrics) {
            if (metric.requestType === 'ONDEMAND') {
                insertedEventTypeOnDemandMetrics += `<tr>
                <td style="padding: 5px 15px 5px 15px; text-align:center">${metric.classType}</td>
                <td style="padding: 5px 15px 5px 15px; text-align:center">${metric.requesterName}</td>
                <td style="padding: 5px 15px 5px 15px; text-align:center">${metric.requesterEmail}</td>
                </tr>`
            }
        }
    }

    const emailBody = `
    <html>
    <body>
        <p>This is an automated email tracking weekly event requests.</p>
        <table>
            <tr>
                <td style="text-align:center">
                    <h3>Event Instance Waitlist Requests</h3>
                </td>
            </tr>
            <tr style="width: 100%">
                <td style="text-align:center; width: 100%">
                    <table style="margin:0 auto; width: 100%">
                        <tr>
                            <th style="text-align: center; padding: 5px 15px 5px 15px; width:150px">Class Type</th>
                            <th style="text-align: center; padding: 5px 15px 5px 15px">Requester Name</th>
                            <th style="text-align: center; padding: 5px 15px 5px 15px">Requester Email</th>
                        </tr>
                        ${insertedWaitlistMetrics}
                    </table>
                </td>
            </tr>
            <tr>
                <td style="text-align:center">
                    <h3>Event Type Notification Requests</h3>
                </td>
            </tr>
            <tr style="width: 100%">
                <td style="text-align:center; width: 100%">
                    <table style="margin:0 auto; width: 100%">
                        <tr>
                            <th style="text-align: center; padding: 5px 15px 5px 15px; width:150px">Class Type</th>
                            <th style="text-align: center; padding: 5px 15px 5px 15px">Requester Name</th>
                            <th style="text-align: center; padding: 5px 15px 5px 15px">Requester Email</th>
                        </tr>
                        ${insertedEventTypeNotificationMetrics}
                    </table>
                </td>
            </tr>
            <tr>
                <td style="text-align:center">
                    <h3>On Demand Requests</h3>
                </td>
            </tr>
            <tr style="width: 100%">
                <td style="text-align:center; width: 100%">
                    <table style="margin:0 auto; width: 100%">
                        <tr>
                            <th style="text-align: center; padding: 5px 15px 5px 15px; width:150px">Class Type</th>
                            <th style="text-align: center; padding: 5px 15px 5px 15px">Requester Name</th>
                            <th style="text-align: center; padding: 5px 15px 5px 15px">Requester Email</th>
                        </tr>
                        ${insertedEventTypeOnDemandMetrics}
                    </table>
                </td>
            </tr>
        </table>
        <p>
            Thanks!<br>
            Asmbly AdminBot
        </p>
    </body>
    </html>
    `;


    const email = await sendMIMEmessage({
        from: 'Asmbly AdminBot <notification@asmbly.org>',
        to: 'classes@asmbly.org',
        subject: `Weekly Event Request Report: ${weekStart.toLocaleString()} - ${weekEnd.toLocaleString()}`,
        html: emailBody,
    }, config)

    console.log(`Sent weekly report for ${weekStart.toLocaleString()} - ${weekEnd.toLocaleString()}`);
 
}

// try {
//     main(config);
//     await prisma.$disconnect();
// } catch (e) {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
// }

export { main };