import { prisma } from './prismaClient.js';
import { getInfreqEvents } from './neonHelpers.js';

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

	console.log(`Seeding database with infrequent classes...`);

	const currentEvents = await getInfreqEvents();

	const remainingPrismaCalls = [];

	const alreadyAddedCats = {};

	for (const event of currentEvents) {
        const exists = await prisma.neonEventInstance.findUnique({
            where: {
                eventId: parseInt(event['id'])
            },
			include: {
				teacher: {
					select: {
						name: true
					}
				}
			}
        })

		let category = event.category.name;
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

		let teacher = event.topic.name;
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
		

		const eventCapacity = parseInt(event.maximumAttendees);
		const eventPrice = event.financialSettings.admissionFee.fee;
		const summary = event.summary;
		const eventName = event.name.split(' w/ ')[0];

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

        console.log(event.eventDates.startDate + 'T' + event.eventDates.startTime + 'Z');
        const addEventInstance = prisma.neonEventInstance.upsert({
			where: {
				eventId: parseInt(event.id)
			},
			create: {
				eventId: parseInt(event.id),
				attendeeCount: 0,
				startDateTime: event.eventDates.startDate + 'T00:00:00Z',
				endDateTime: event.eventDates.endDate + 'T00:10:00Z',
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
				attendeeCount: 0,
				startDateTime: event.eventDates.startDate + 'T00:00:00Z',
				endDateTime: event.eventDates.endDate + 'T00:10:00Z',
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

    console.log(`Finished seeding infrequent events.`);
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