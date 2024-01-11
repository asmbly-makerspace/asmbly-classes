import { fail, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms/server';
import { schema, privateRequestSchema } from '$lib/zodSchemas/schema.js';
import { prisma } from '$lib/postgres.js';
import { sendMIMEmessage } from '$lib/server/gmailEmailFactory.js';
import { DateTime } from 'luxon';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, setHeaders }) {
	// Server API:
	const privateRequestForm = await superValidate(privateRequestSchema, {
		id: 'privateRequestForm'
	});
	const notificationForm = await superValidate(schema, {
		id: 'notificationForm'
	});
	const onDemandRequestForm = await superValidate(schema, {
		id: 'onDemandRequestForm'
	});
	const fullClassRequestForm = await superValidate(schema, {
		id: 'fullClassRequestForm'
	});

	const slug = params.eventTypeId;

	setHeaders({
        'cache-control': 'max-age=300',
    })

	// Unless you throw, always return { form } in load and form actions.
	return { privateRequestForm, notificationForm, onDemandRequestForm, fullClassRequestForm, slug };
}

/** @type {import('./$types').Actions} */
export const actions = {
	privateRequest: async ({ request }) => {
		const formData = await request.formData();
		const privateRequestForm = await superValidate(formData, privateRequestSchema);

		if (!privateRequestForm.valid) {
			return fail(400, { privateRequestForm });
		}

		// Send an email to the requester and classes@asmbly.org with the form data
		const email = privateRequestForm.data.email;
		const firstName = privateRequestForm.data.firstName;
		const lastName = privateRequestForm.data.lastName;
		const sessionType = privateRequestForm.data.sessionType;
		const sessionTypeLower = sessionType.toLowerCase();
		const classTypeId = parseInt(formData.get('classTypeId'));

		const classType = await prisma.NeonEventType.findUnique({
			where: {
				id: classTypeId
			}
		})

		const requesterBody = `
		<div>
		<p>Hi ${firstName},</p>
		<p>Thank you for submitting your ${sessionTypeLower} class request at Asmbly!</p>
		<p>We'll be in touch within a week (usually sooner) to provide more details and schedule your class. If it has been longer than a week, feel free to reply to this email.</p>
		<p>The details of your request can be found below:</p>
		<table style="border-spacing: 10px">
			<tr><td>Name: ${firstName} ${lastName}</td></tr>
			<tr><td>Session Type: ${sessionType}</td></tr>
			<tr><td>Class: ${classType.name}</td></tr>
		</table>
		<p>Best,
		<br>Asmbly Education Team</p>
		</div>
		`

		const asmblyBody = `
		<div>
		<p>We've received a new ${sessionTypeLower} class request with the details below:</p>
		<table style="border-spacing: 10px">
			<tr><td>Name: ${firstName} ${lastName}</td></tr>
			<tr><td>Email: ${email}</td></tr>
			<tr><td>Session Type: ${sessionType}</td></tr>
			<tr><td>Class: ${classType.name}</td></tr>
		</table>
		<p>Asmbly AdminBot</p>
		</div>
		`

		const asmblyResponse = sendMIMEmessage({
			from: 'Asmbly AdminBot <notification@asmbly.org>',
			to: 'classes@asmbly.org',
			replyTo: email,
			subject: `${sessionType} class request - ${firstName} ${lastName}`,
			html: asmblyBody
		})

		const requesterResponse = sendMIMEmessage({
			from: 'Asmbly Education Team <notification@asmbly.org>',
			to: email,
			replyTo: 'classes@asmbly.org',
			subject: `${sessionType} class request`,
			html: requesterBody,
		})

		await Promise.all([asmblyResponse, requesterResponse]);

		return message(privateRequestForm, {
			text: `You have successfully submitted a ${sessionTypeLower} class request. Check your email for confirmation.`
		});
	},

	fullClassRequest: async ({ request }) => {
		const formData = await request.formData();
		const fullClassRequestForm = await superValidate(formData, schema, {
			id: 'fullClassRequestForm'
		});

		if (!fullClassRequestForm.valid) {
			return fail(400, { fullClassRequestForm });
		}

		// Send an email confirmation to the requester and add them to the waitlist for the class instance in the DB.
		const email = fullClassRequestForm.data.email;
		const firstName = fullClassRequestForm.data.firstName;
		const lastName = fullClassRequestForm.data.lastName;
		const eventId = parseInt(formData.get('eventId'));

		const classInstance = await prisma.NeonEventInstance.findUnique({
			where: {
				eventId: eventId
			},
			include: {
				eventType: true
			}
		})

		const startDateTime = DateTime.fromJSDate(classInstance.startDateTime).setZone('utc').toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);

		const requesterBody = `
		<div>
		<p>Hi ${firstName},</p>
		<p>Thank you for submitting your waitlist request for ${classInstance.eventType.name} on ${startDateTime} at Asmbly!</p>
		<p>If a seat becomes available in this particular session of ${classInstance.eventType.name}, you'll receive an email from us letting you know. That email will also include the registration link.</p>
		<p>Please note that this request will only place you on the waitlist for this particular session. If you'd like to add yourself to the waitlist for another session, please submit the form again for that session.</p>
		<p>Given the typical time constraints of filling classes from the waitlist, we do not have a priority queue for waitlist requests. An email will be simultaneously sent to all students on the waitlist.
		At that point, the first student to register will claim the open seat.
		</p>
		<p>Best,
		<br>Asmbly Education Team</p>
		</div>
		`

		const requesterCall = sendMIMEmessage({
			from: 'Asmbly Education Team <notification@asmbly.org>',
			to: email,
			replyTo: 'membership@asmbly.org',
			subject: `Waitlist request for ${classInstance.eventType.name}`,
			html: requesterBody,
		})

		const waitlistCall = prisma.NeonEventInstance.update({
			where: {
				eventId: eventId
			},
			data: {
				requester: {
					connectOrCreate: {
						where: {
							email: email
						},
						create: {
							email: email,
							firstName: firstName,
							lastName: lastName
						}
					}
				}
			},
			include: {
				requester: {
					select: {
						email: true,
						firstName: true
					}
				}
			}
		})

		let [requestResult, waitlistResult] = await Promise.all([requesterCall, prisma.$transaction([waitlistCall])]);

		return message(fullClassRequestForm, {
			text: 'You have successfully submitted this waitlist request. Check your email for confirmation.'
		});
	},

	notificationRequest: async ({ request }) => {
		const formData = await request.formData();
		const notificationForm = await superValidate(formData, schema, {
			id: 'notificationForm'
		});

		if (!notificationForm.valid) {
			return fail(400, { notificationForm });
		}

		// Send an email confirmation to the requester and add them to the notification list for the class type in the DB.
		const email = notificationForm.data.email;
		const firstName = notificationForm.data.firstName;
		const lastName = notificationForm.data.lastName;
		const classTypeId = parseInt(formData.get('classTypeId'));

		const classTypeCall = prisma.NeonEventType.findUnique({
			where: {
				id: classTypeId
			}
		})

		const requesterPrismaCall = prisma.NeonEventRequester.upsert({
			where: {
				email: email
			},
			create: {
				email: email,
				firstName: firstName,
				lastName: lastName
			},
			update: {
				firstName: firstName,
				lastName: lastName
			}
		})

		let [requester, classType] = await prisma.$transaction([requesterPrismaCall, classTypeCall]);

		const requesterBody = `
		<div>
		<p>Hi ${firstName},</p>
		<p>Thank you for submitting your notification request for ${classType.name}!</p>
		<p>When additional sessions of ${classType.name} are added to the schedule, we will send you an email to let you know.</p>
		<p>Please note that you will be removed from the notification list for this class as soon as the notification email is sent.
		You will need to submit another notification request to add yourself to the notification list again.</p>
		<p>Best,
		<br>Asmbly Education Team</p>
		</div>
		`

		const requesterCall = sendMIMEmessage({
			from: 'Asmbly Education Team <notification@asmbly.org>',
			to: email,
			replyTo: 'membership@asmbly.org',
			subject: `Notification request for ${classType.name}`,
			html: requesterBody,
		})

		const notificationCall = prisma.NeonEventTypeRequest.upsert({
			create: {
				requestType: 'NOTIFICATION',
				classType: {
					connect: {
						id: classTypeId
					}
				},
				requester: {
					connect: {
						id: requester.id
					}
				}
			},
			update: {},
			where: {
				eventTypeRequest: {
					requestType: 'NOTIFICATION',
					classTypeId: classTypeId,
					requesterId: requester.id
				}
			}
		})


		let [requestResult, notificationResult] = await Promise.allSettled([requesterCall, prisma.$transaction([notificationCall])]);
		
		return message(notificationForm, {
			text: 'You have successfully submitted a notification request. Check your email for confirmation.'
		});
	},

	onDemandRequest: async ({ request }) => {
		const formData = await request.formData();
		const onDemandRequestForm = await superValidate(formData, schema, {
			id: 'onDemandRequestForm'
		});

		if (!onDemandRequestForm.valid) {
			return fail(400, { onDemandRequestForm });
		}

		// Send an email confirmation to the requester and add them to the on-demand list for the class type in the DB.
		const email = onDemandRequestForm.data.email;
		const firstName = onDemandRequestForm.data.firstName;
		const lastName = onDemandRequestForm.data.lastName;
		const classTypeId = parseInt(formData.get('classTypeId'));

		const classTypeCall = prisma.NeonEventType.findUnique({
			where: {
				id: classTypeId
			}
		})

		const requesterPrismaCall = prisma.NeonEventRequester.upsert({
			where: {
				email: email
			},
			create: {
				email: email,
				firstName: firstName,
				lastName: lastName
			},
			update: {
				firstName: firstName,
				lastName: lastName
			}
		})

		let [requester, classType] = await prisma.$transaction([requesterPrismaCall, classTypeCall]);

		const requesterBody = `
		<div>
		<p>Hi ${firstName},</p>
		<p>Thank you for submitting your request for ${classType.name}!</p>
		<p>When we receive enough requests for this class, we will add a session to the calendar and let you know via email.</p>
		<p>Please note that it will likely take some time before we receive enough requests to make scheduling the class possible.</p>
		<p>In the meantime, we encourage you to check out our other class offerings!</p>
		<p>Best,
		<br>Asmbly Education Team</p>
		</div>
		`

		const requesterCall = sendMIMEmessage({
			from: 'Asmbly Education Team <notification@asmbly.org>',
			to: email,
			replyTo: 'membership@asmbly.org',
			subject: `Class request for ${classType.name}`,
			html: requesterBody,
		})

		const notificationCall = prisma.NeonEventTypeRequest.upsert({
			create: {
				requestType: 'ONDEMAND',
				classType: {
					connect: {
						id: classTypeId
					}
				},
				requester: {
					connect: {
						id: requester.id
					}
				}
			},
			update: {},
			where: {
				eventTypeRequest: {
					requestType: 'ONDEMAND',
					classTypeId: classTypeId,
					requesterId: requester.id
				}
			}
		})


		let [requestResult, notificationResult] = await Promise.allSettled([requesterCall, prisma.$transaction([notificationCall])]);


		return message(onDemandRequestForm, {
			text: 'You have successfully submitted a class request. Check your email for confirmation.'
		});
	}
};


