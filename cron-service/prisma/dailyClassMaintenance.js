import { prisma } from './prismaClient.js';
import { getCurrentEvents, getInactiveEvents } from './neonHelpers.js';
import { sendMIMEmessage } from './gmailEmailFactory.js';
import { DateTime } from 'luxon';

async function connectArchCat(model, archCatName, catId) {
	const record = await model.update({
		where: {
			name: archCatName
		},
		data: {
			baseCategories: {
				connect: {
					id: catId
				}
			}
		}
	});
	return record;
}

async function notifyWaitlistOfOpenSeats(eventIds) {
	if (eventIds.length === 0) {
		return;
	}

	const eventInstancesCall = prisma.neonEventInstance.findMany({
		where: {
			eventId: {
				in: eventIds
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

	const [eventInstances, baseRegLink] = await prisma.$transaction([eventInstancesCall, baseRegLinkCall]);

	const emailsToSend = [];
	const requestsToFulfill = [];

	for (const eventInstance of eventInstances) {
		const startDateTime = DateTime.fromJSDate(eventInstance.startDateTime).setZone('America/Chicago').toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);

		for (const request of eventInstance.requests) {
			const emailBody = `
            <div>
            <p>Hi ${request.requester.firstName},</p>
            <p>More seats have opened up in ${eventInstance.eventType.name} on ${startDateTime}.</p>
            <p>If you are interested in attending, please use <a href="${baseRegLink.url}${eventInstance.eventId}">this link</a> to register through Neon.</p>
            <p>As a reminder, seats are first come first served.</p>
            <p><b>Please note:</b> If the open seats have already been taken, Neon will still allow you to "register" and join Neon's waitlist system without
            paying for the class. This means that you are not a confirmed student, and you will not be able to join this session. If Neon collects your registration fee and you
            receive an event registration confirmation email, you are a confirmed student.</p>
            <p>If you have any questions, feel free to reply to this email.</p>
            <p>Best, <br>Asmbly Education Team</p>
            </div>
            `

			const email = sendMIMEmessage({
				from: 'Asmbly Education Team <notification@asmbly.org>',
				to: request.requester.email,
				replyTo: 'membership@asmbly.org',
				subject: `Open seats in ${eventInstance.eventType.name} at Asmbly`,
				html: emailBody
			});

			emailsToSend.push(email);
			requestsToFulfill.push(request.id);

			console.log(`Sending waitlist seat opening email to ${request.requester.email} for ${eventInstance.eventType.name} on ${startDateTime}`);
		}
	}

	if (requestsToFulfill.length === 0) {
		return;
	}

	await Promise.all(emailsToSend);

	await prisma.neonEventInstanceRequest.updateMany({
		where: {
			id: {
				in: requestsToFulfill
			}
		},
		data: {
			fulfilled: true
		}
	});
}

async function main() {

	console.log('');
	console.log(`Running class maintenance for ${DateTime.now().toLocaleString(DateTime.DATETIME_SHORT)}...`);
	console.log('------------------------------------------------------');
	console.log('');

	const currentEvents = await getCurrentEvents();
	const inactiveEventIds = await getInactiveEvents();

	console.log(`Found inactive events: ${inactiveEventIds}.`);

	const remainingPrismaCalls = [];

	const alreadyAddedCats = {};

	const capacityIncreasedEventIds = [];

	const currentInactiveEvents = await prisma.neonEventInstance.findMany({
		where: {
			eventId: {
				in: inactiveEventIds
			}
		},
		select: {
			eventId: true
		}
	});

	if (currentInactiveEvents.length > 0) {
		const eventsToDelete = [];
		for (const event of currentInactiveEvents) {
			eventsToDelete.push(event['eventId']);
		}
		 const result = await prisma.neonEventInstance.deleteMany({
			where: {
				eventId: {
					in: eventsToDelete
				}
			}
		});

		console.log(`Deleted ${result.count} inactive events from database.`);
	}

	const typeDeletetion = await prisma.neonEventType.deleteMany({
		where: {
			instances: {
				none: {}
			}
		}
	});

	if (typeDeletetion.count > 0) {
		console.log(`Deleted ${typeDeletetion.count} event type(s) from database.`);
	}

	for (const event of currentEvents) {
        const exists = await prisma.neonEventInstance.findUnique({
            where: {
                eventId: parseInt(event['Event ID'])
            },
			include: {
				teacher: {
					select: {
						name: true
					}
				}
			}
        })

		const startDateTimeString = event['Event Start Date'] + 'T' + (event['Event Start Time'] ? event['Event Start Time'] : '00:00:00');
		const endDateTimeString = event['Event End Date'] + 'T' + (event['Event End Time'] ? event['Event End Time'] : '00:00:00');

		const startDateTime = DateTime.fromISO(startDateTimeString, { zone: 'America/Chicago' }).toJSDate();
		const endDateTime = DateTime.fromISO(endDateTimeString, { zone: 'America/Chicago' }).toJSDate();
		const eventCapacity = parseInt(event['Event Capacity']) || 0;

		const eventAlreadyUpToDate = typeof exists !== 'undefined' && exists !== null
			&& DateTime.fromJSDate(startDateTime).equals(DateTime.fromJSDate(exists.startDateTime))
			&& DateTime.fromJSDate(endDateTime).equals(DateTime.fromJSDate(exists.endDateTime))
			&& parseInt(event['Actual Registrants']) === exists.attendeeCount
			&& event['Event Topic'] === exists.teacher.name
			&& eventCapacity === exists.capacity;

        if (eventAlreadyUpToDate) {
            continue;
        }

		const seatsOpenedByCapacityIncrease = typeof exists !== 'undefined' && exists !== null
			&& eventCapacity > exists.capacity
			&& parseInt(event['Actual Registrants']) < eventCapacity;

		if (seatsOpenedByCapacityIncrease) {
			capacityIncreasedEventIds.push(parseInt(event['Event ID']));
		}

		let category = event['Event Category Name'];
		let addCategory;
		if (typeof category !== 'undefined' && category != null && (typeof alreadyAddedCats[category] === 'undefined' || alreadyAddedCats[category] == null)) {
			let search = { name: category };
			addCategory = await prisma.neonEventCategory.upsert({ where: search, create: search, update: {} });
			alreadyAddedCats[category] = addCategory;
			console.log(`Adding category ${addCategory.name}`);
		} else if (typeof category !== 'undefined' && category != null && (typeof alreadyAddedCats[category] !== 'undefined' && alreadyAddedCats[category] != null)) {
			addCategory = alreadyAddedCats[category];
			console.log(`Using existing category ${addCategory.name}`);
		} else {
			addCategory = await prisma.neonEventCategory.findUnique({ where: { name: 'Miscellaneous' } });
			console.log(`No category found for ${event['Event Name']}, defaulting to Miscellaneous`);
		}
		
		switch (category) {
			case 'Woodworking':
			case 'CNC Router':
			case 'Woodshop Safety':
				await connectArchCat(prisma.asmblyArchCategory, 'Woodworking', addCategory.id);
				break;
			case 'Laser Cutting':
				await connectArchCat(prisma.asmblyArchCategory, 'Laser Cutting', addCategory.id);
				break;
			case 'Miscellaneous':
				await connectArchCat(prisma.asmblyArchCategory, 'Miscellaneous', addCategory.id);
				break;
			case '_3D Printing':
				await connectArchCat(prisma.asmblyArchCategory, '3D Printing', addCategory.id);
				break;
			case 'Metalworking':
				await connectArchCat(prisma.asmblyArchCategory, 'Metalworking', addCategory.id);
				break;
			case 'Machining':
				await connectArchCat(prisma.asmblyArchCategory, 'Metalworking', addCategory.id);
				break;
			case 'Electronics':
				await connectArchCat(prisma.asmblyArchCategory, 'Electronics', addCategory.id);
				break;
			case 'Textiles':
				await connectArchCat(prisma.asmblyArchCategory, 'Textiles', addCategory.id);
				break;
			case 'Ceramics':
				await connectArchCat(prisma.asmblyArchCategory, 'Ceramics', addCategory.id);
				break;
			case 'Orientation':
				await connectArchCat(prisma.asmblyArchCategory, 'Orientation', addCategory.id);
				break;
			case 'Private':
				await connectArchCat(prisma.asmblyArchCategory, 'Private', addCategory.id);
				break;
            default:
				await connectArchCat(prisma.asmblyArchCategory, 'Miscellaneous', addCategory.id);
                break;
		}

		let teacher = event['Event Topic'];
		let addTeacherCall;
		if (teacher !== null) {
			const search = { name: teacher };
			addTeacherCall = prisma.neonEventTeacher.upsert({ where: search, create: search, update: {} });
		} else {
			addTeacherCall = prisma.neonEventTeacher.upsert({
				where: {
					name: 'TBD'
				},
				update: {},
				create: {
					name: 'TBD'
				}
			})
			console.log(`No teacher found for ${event['Event Name']}, defaulting to TBD`);
		}
		

		const eventPrice = parseFloat(event['Event Admission Fee']);
		const summary = event['Event Summary'];
		const eventName = event['Event Name'].split(' w/ ')[0].trim();

		const search = {
			name: eventName
		};

		let addEventTypeCall = prisma.neonEventType.upsert({ where: search, create: search, update: {} });

		const [addTeacher, addEventType] = await prisma.$transaction([addTeacherCall, addEventTypeCall]);

		const updateEventType = prisma.neonEventType.update({
			where: {
				id: addEventType.id
			},
			data: {
				teacher: {
					connect: {
						id: addTeacher.id
					}
				},
				category: {
					connect: {
						id: addCategory.id
					}
				}
			}
		});

		const addEventInstance = prisma.neonEventInstance.upsert({
			where: {
				eventId: parseInt(event['Event ID'])
			},
			create: {
				eventId: parseInt(event['Event ID']),
				attendeeCount: parseInt(event['Actual Registrants']),
				startDateTime: startDateTime,
				endDateTime: endDateTime,
				price: eventPrice,
				capacity: eventCapacity,
				summary: summary,
				eventType: {
					connect: {
						id: addEventType.id
					}
				},
				teacher: {
					connect: {
						id: addTeacher.id
					}
				},
				category: {
					connect: {
						id: addCategory.id
					}
				}
			},
			update: {
				attendeeCount: parseInt(event['Actual Registrants']),
				startDateTime: startDateTime,
				endDateTime: endDateTime,
				price: eventPrice,
				capacity: eventCapacity,
				summary: summary,
				teacher: {
					connect: {
						id: addTeacher.id
					}
				},
				category: {
					connect: {
						id: addCategory.id
					}
				}
			},
			include: {
				eventType: {
					select: {
						name: true
					}
				}
			}
		});

		remainingPrismaCalls.push(updateEventType, addEventInstance);

		console.log('Adding ' + eventName + ' to the queue...');
	}

    if (remainingPrismaCalls.length === 0) {
        console.log(`No events to add for (${new Date().toLocaleDateString()}).`);
        return;
    }

	let results;
	try {
		results = await prisma.$transaction(remainingPrismaCalls);
	} catch (e) {
		console.log(`Error adding events to the database:`);
		console.error(e);
		return
	}

	try {
		await notifyWaitlistOfOpenSeats(capacityIncreasedEventIds);
	} catch (e) {
		console.log(`Error notifying waitlist of open seats:`);
		console.error(e);
	}

    const eventTypesAddedToday = new Set();

    for (let result of results) {
		if (result.eventId != null) {
			console.log('Successfully added/updated: ' +  result.eventType.name + ' on ' + result.startDateTime);
        	eventTypesAddedToday.add(result.eventTypeId);
		}
    }

    const eventTypesToEmail = await prisma.neonEventType.findMany({
        where: {
            id: {
                in: [...eventTypesAddedToday]
            }
        },
        include: {
            request: {
                where: {
                    fulfilled: false
                },
                select: {
					id: true,
					requester: {
						select: {
							email: true,
							firstName: true
						}
					}
				}
            }
        }
    })

    if (eventTypesToEmail.length === 0) {
        console.log(`No events to email for (${new Date().toLocaleDateString()}).`);
        console.log(`Finished adding events for (${new Date().toLocaleDateString()}).`);
        return;
    }

    const requestersToEmail = [];
    const requestsToFulfill = [];

    for (const eventType of eventTypesToEmail) {
		for (const request of eventType.request) {
			const requesterEmail = request.requester.email;
			const requesterFirstName = request.requester.firstName;

			requestersToEmail.push({
				email: requesterEmail,
				firstName: requesterFirstName,
				eventType: eventType.name,
				eventTypeId: eventType.id,
			})

			requestsToFulfill.push(request.id);
		}
        
    }

    const emailsToSend = [];

    for (const requester of requestersToEmail) {
        const emailBody = `
            <p>Hi ${requester.firstName},</p>
            <p>You previously requested that we notify you when we add additional sessions of ${requester.eventType} to the schedule.</p>
            <p>We're happy to let you know that we've added more!</p>
            <p>You can find the updated schedule for your requested class <a href="https://classes.asmbly.org/event/${requester.eventTypeId}">here</a>.</p>
            <p>As a reminder, we are removing you from the notification list for this class. If you would like to be added back to the notification list, please resubmit the notification request form.</p>
            <p>If you have any questions, just reply to this email!</p>
            <p>Best,<br>Asmbly Education Team</p>
        `

        const email = sendMIMEmessage({
			from: 'Asmbly Education Team <notification@asmbly.org>',
			to: requester.email,
			replyTo: 'membership@asmbly.org',
			subject: `${requester.eventType} notification request`,
			html: emailBody,
		})

        emailsToSend.push(email);
    }

    const fulfillRequests = prisma.neonEventTypeRequest.updateMany({
        where: {
            id: {
                in: [...requestsToFulfill]
            }
        },
        data: {
            fulfilled: true
        }
    })

	try {
    	await Promise.all(emailsToSend, prisma.$transaction([fulfillRequests]));
	} catch (e) {
		console.log(`Error sending emails:`);
		console.error(e);
	}

    console.log(`Finished adding events for (${new Date().toLocaleDateString()}).`);
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })