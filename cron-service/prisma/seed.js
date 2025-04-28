import { prisma } from './prismaClient.js';
import { getCurrentEvents } from './neonHelpers.js';
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

const archCategories = [
	{ name: 'Orientation' },
	{ name: 'Woodworking' },
	{ name: 'Metalworking' },
	{ name: 'Laser Cutting' },
	{ name: '3D Printing' },
	{ name: 'Textiles' },
	{ name: 'Ceramics' },
	{ name: 'Electronics' },
	{ name: 'Miscellaneous' },
	{ name: 'Private' }
];

const BASE_URL = 'https://asmbly.app.neoncrm.com/event.jsp?event=';

async function main() {

	console.log('');
	console.log(`Seeding database on ${DateTime.now().toLocaleString()}...`);
	console.log('------------------------------------------------------');
	console.log('');

	await prisma.asmblyArchCategory.createMany({
		data: archCategories,
		skipDuplicates: true
	});

	await prisma.neonBaseRegLink.upsert({
		create: {
			url: BASE_URL
		},
		update: {},
		where: {
			url: BASE_URL
		}
	});

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

		const startDateTimeString = event['Event Start Date'] + 'T' + event['Event Start Time'];
		const endDateTimeString = event['Event End Date'] + 'T' + event['Event End Time'];

		const startDateTime = DateTime.fromISO(startDateTimeString, { zone: 'America/Chicago' }).toJSDate();
		const endDateTime = DateTime.fromISO(endDateTimeString, { zone: 'America/Chicago' }).toJSDate();

        if (typeof exists !== 'undefined' && exists !== null && DateTime.fromJSDate(startDateTime).equals(DateTime.fromJSDate(exists.startDateTime)) && DateTime.fromJSDate(endDateTime).equals(DateTime.fromJSDate(exists.endDateTime)) && parseInt(event['Actual Registrants']) === exists.attendeeCount && event['Event Topic'] === exists.teacher.name) {
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

	console.log(`Finished seeding database (${new Date().toLocaleDateString()}).`);
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