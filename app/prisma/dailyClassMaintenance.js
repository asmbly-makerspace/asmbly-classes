import { prisma } from '../src/lib/postgres.js';
import { getCurrentEvents } from '../src/lib/helpers/neonHelpers.js';
import { sendMIMEmessage } from '../src/lib/server/gmailEmailFactory.js';

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

async function main() {

	const currentEvents = await getCurrentEvents();

	const remainingPrismaCalls = [];

	const getArchCategories = await prisma.asmblyArchCategory.findMany();

	const alreadyAddedCats = {};

	for (const event of currentEvents) {
        const exists = prisma.neonEventInstance.findUnique({
            where: {
                eventId: parseInt(event['Event ID'])
            }
        })

        if (exists) {
            continue;
        }

		let category = event['Event Category Name'];
		let addCategory;
		if (category && !alreadyAddedCats.category) {
			let search = { name: category };
			addCategory = await prisma.neonEventCategory.upsert({ where: search, create: search, update: {} });
			alreadyAddedCats.category = addCategory;
		} else if (category && alreadyAddedCats.category) {
			addCategory = alreadyAddedCats.category;
		} else {
            continue;
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
			case 'Electronics':
				await connectArchCat(prisma.asmblyArchCategory, 'Electronics', addCategory.id);
				break;
			case 'Textiles':
				await connectArchCat(prisma.asmblyArchCategory, 'Textiles', addCategory.id);
				break;
			case 'Orientation':
				await connectArchCat(prisma.asmblyArchCategory, 'Orientation', addCategory.id);
				break;
			case 'Private':
				await connectArchCat(prisma.asmblyArchCategory, 'Private', addCategory.id);
				break;
            default:
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
		}
		

		const eventCapacity = parseInt(event['Event Capacity']);
		const eventPrice = parseFloat(event['Event Admission Fee']);
		const summary = event['Event Summary'];
		const eventName = event['Event Name'].split(' w/ ')[0];
		const startDateTime = event['Event Start Date'] + 'T' + event['Event Start Time'] + 'Z';
		const endDateTime = event['Event End Date'] + 'T' + event['Event End Time'] + 'Z';

		let data = {
			capacity: eventCapacity,
			price: eventPrice,
			summary: summary,
			name: eventName
		};

		const search = {
			uniqueEvent: data
		};

		let addEventTypeCall = prisma.neonEventType.upsert({ where: search, create: data, update: {} });

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

		const addEventInstance = prisma.neonEventInstance.create({
			data: {
				eventId: parseInt(event['Event ID']),
				attendeeCount: parseInt(event['Actual Registrants']),
				startDateTime: startDateTime,
				endDateTime: endDateTime,
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
            include: {
                eventType: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
		});

		remainingPrismaCalls.push(updateEventType, addEventInstance);

		console.log('Attempting to add ' + eventName);
	}

    if (remainingPrismaCalls.length === 0) {
        console.log(`No events to add today (${new Date().toLocaleDateString()}).`);
        return;
    }

	let results = await prisma.$transaction(remainingPrismaCalls);

    const eventTypesAddedToday = new Set();

    for (let result of results) {
        console.log('Successfully added: ' +  result.name + ' on ' + result.startDateTime);
        eventTypesAddedToday.add(result.eventType.id);
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
                id: true,
                include: {
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

    if (eventTypesToEmail.request.length === 0) {
        console.log(`No events to email today (${new Date().toLocaleDateString()}).`);
        console.log(`Finished adding events for today (${new Date().toLocaleDateString()}).`);
        return;
    }

    const requestersToEmail = [];
    const requestsToFulfill = [];

    for (const eventType of eventTypesToEmail) {
        const requesterEmail = eventType.request.requester.email;
        const requesterFirstName = eventType.request.requester.firstName;

        requestersToEmail.push({
            email: requesterEmail,
            firstName: requesterFirstName,
            eventType: eventType.name,
            eventTypeId: eventType.id,
        })

        requestsToFulfill.push(eventType.request.id);
    }

    const emailsToSend = [];

    for (const requester of requestersToEmail) {
        emailBody = `
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

    await Promise.allSettled(emailsToSend, prisma.$transaction(fulfillRequests));

    console.log(`Finished adding events for today (${new Date().toLocaleDateString()}).`);
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