import { prisma } from '../src/lib/postgres.js';
import { getCurrentEvents } from './neonHelpers.js';
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

async function main() {

	console.log('');
	console.log(`Running daily class maintenance for ${DateTime.now().toLocaleString()}...`);
	console.log('------------------------------------------------------');
	console.log('');

	const currentEvents = await getCurrentEvents();

	const remainingPrismaCalls = [];

	const alreadyAddedCats = {};

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

		const startDateTime = event['Event Start Date'] + 'T' + event['Event Start Time'] + 'Z';
		const endDateTime = event['Event End Date'] + 'T' + event['Event End Time'] + 'Z';

		const compareStart = DateTime.fromISO(startDateTime);
		const compareEnd = DateTime.fromISO(endDateTime);

        if (typeof exists !== 'undefined' && exists !== null && compareStart.equals(DateTime.fromJSDate(exists.startDateTime)) && compareEnd.equals(DateTime.fromJSDate(exists.endDateTime)) && parseInt(event['Actual Registrants']) === exists.attendeeCount && event['Event Topic'] === exists.teacher.name) {
			console.log(`Skipping ${event['Event Name']} (same date, time, teacher, students)`);
            continue;
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
			console.log(`No teacher found for ${event['Event Name']}, defaulting to TBD`);
		}
		

		const eventCapacity = parseInt(event['Event Capacity']);
		const eventPrice = parseFloat(event['Event Admission Fee']);
		const summary = event['Event Summary'];
		const eventName = event['Event Name'].split(' w/ ')[0];
		

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

		const addEventInstance = prisma.neonEventInstance.upsert({
			where: {
				eventId: parseInt(event['Event ID'])
			},
			create: {
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
			update: {
				attendeeCount: parseInt(event['Actual Registrants']),
				startDateTime: startDateTime,
				endDateTime: endDateTime,
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
        console.log(`No events to add today (${new Date().toLocaleDateString()}).`);
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
        console.log(`No events to email today (${new Date().toLocaleDateString()}).`);
        console.log(`Finished adding events for today (${new Date().toLocaleDateString()}).`);
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