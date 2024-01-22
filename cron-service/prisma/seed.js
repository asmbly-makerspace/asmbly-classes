import { prisma } from '../src/lib/postgres.js';
import { getCurrentEvents } from '../src/lib/helpers/neonHelpers.js';

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

async function getOrCreate(model, where, data) {
	const record = model.upsert({
		where: where,
		update: {},
		create: data
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
	{ name: 'Electronics' },
	{ name: 'Miscellaneous' },
	{ name: 'Private' }
];

const BASE_URL = 'https://asmbly.app.neoncrm.com/event.jsp?event=';

async function main() {

	const currentEvents = await getCurrentEvents();

	const remainingPrismaCalls = [];

	const addBaseRegLinkCall = prisma.neonBaseRegLink.upsert({
		create: {
			url: BASE_URL
		},
		update: {},
		where: {
			url: BASE_URL
		}
	});

	const addArchCategoriesCall = prisma.asmblyArchCategory.createMany({
		data: archCategories,
		skipDuplicates: true
	});

	await prisma.$transaction([addArchCategoriesCall, addBaseRegLinkCall]);

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
		if (!alreadyAddedCats.category) {
			let search = { name: category };
			addCategory = await prisma.neonEventCategory.upsert({ where: search, create: search, update: {} });
			alreadyAddedCats.category = addCategory;
		} else {
			addCategory = alreadyAddedCats.category;
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

		const addEventInstance = prisma.neonEventInstance.upsert({
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
			where: {
				eventId: parseInt(event['Event ID'])
			}
		});

		remainingPrismaCalls.push(updateEventType, addEventInstance);

		console.log('Adding ' + eventName + ' to db transaction queue');
	}

	let results = await prisma.$transaction(remainingPrismaCalls);

    for (let result of results) {
        console.log('Successfully added: ' +  result.name);
    }
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