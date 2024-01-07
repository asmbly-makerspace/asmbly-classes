import { prisma } from '$lib/db.server';
import { getCurrentEvents } from '$lib/server/neonHelpers.server';

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
	const record = await model.upsert({
		where: where,
		update: {},
		create: data
	});
	return record;
}

const currentEvents = await getCurrentEvents();

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

const deleteCategories = prisma.NeonEventCategory.deleteMany({});
const deleteTeachers = prisma.NeonEventTeacher.deleteMany({});
const deleteLink = prisma.NeonBaseRegLink.deleteMany({});
const deleteEvents = prisma.NeonEventInstance.deleteMany({});
const deleteTypes = prisma.NeonEventType.deleteMany({});
const deleteArchCategories = prisma.AsmblyArchCategory.deleteMany({});

await prisma.$transaction([
	deleteEvents,
	deleteCategories,
	deleteTeachers,
	deleteLink,
	deleteTypes,
	deleteArchCategories
]);

const addBaseRegLink = await prisma.NeonBaseRegLink.create({
	data: {
		url: BASE_URL
	}
});

const addArchCategories = await prisma.AsmblyArchCategory.createMany({
	data: archCategories
});

let addEvent;

for (const event of currentEvents) {
	let category = event['Event Category Name'];
	let search = { name: category };
	let addCategory = await getOrCreate(prisma.NeonEventCategory, search, search);

	switch (category) {
		case 'Woodworking':
		case 'CNC Router':
		case 'Woodshop Safety':
			await connectArchCat(prisma.AsmblyArchCategory, 'Woodworking', addCategory.id);
			break;
		case 'Laser Cutting':
			await connectArchCat(prisma.AsmblyArchCategory, 'Laser Cutting', addCategory.id);
			break;
		case 'Miscellaneous':
			await connectArchCat(prisma.AsmblyArchCategory, 'Miscellaneous', addCategory.id);
			break;
		case '_3D Printing':
			await connectArchCat(prisma.AsmblyArchCategory, '3D Printing', addCategory.id);
			break;
		case 'Metalworking':
			await connectArchCat(prisma.AsmblyArchCategory, 'Metalworking', addCategory.id);
			break;
		case 'Electronics':
			await connectArchCat(prisma.AsmblyArchCategory, 'Electronics', addCategory.id);
			break;
		case 'Textiles':
			await connectArchCat(prisma.AsmblyArchCategory, 'Textiles', addCategory.id);
			break;
		case 'Orientation':
			await connectArchCat(prisma.AsmblyArchCategory, 'Orientation', addCategory.id);
			break;
		case 'Private':
			await connectArchCat(prisma.AsmblyArchCategory, 'Private', addCategory.id);
			break;
	}

	let teacher = event['Event Topic'];
	search = { name: teacher };
	let addTeacher = await getOrCreate(prisma.NeonEventTeacher, search, search);

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

	search = {
		uniqueEvent: data
	};

	let addEventType = await getOrCreate(prisma.NeonEventType, search, data);

	const updateEventType = await prisma.NeonEventType.update({
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

	addEvent = await prisma.NeonEventInstance.create({
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
		}
	});

	console.log('Successfully added ' + eventName);
}
