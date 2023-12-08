import { prisma } from '$lib/db.server';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const eventTypes = await prisma.NeonEventType.findMany({
		where: {
			category: {
				none: {
					name : "Private"
				}
			}
		},
		include: {
			category: {
				include: {
					archCategories: true,
				}
			}
		}
	});

	let classJson = [];
	let classCategories = new Set();

	for (const event of eventTypes) {
		classCategories.add(event.category[0].archCategories.name);
		let classContext = {};
		const instances = await prisma.NeonEventInstance.findMany({
			where: {
				eventType: {
					is: {
						name : {
							equals: event.name
						}
					}
				}
			},
			include: {
				teacher: true,
				eventType: true
			}
		})
		let classInstances = [];
		for (const instance of instances) {
			let instanceContext = {};
			instanceContext.eventId = instance.eventId;
			instanceContext.attendees = instance.attendeeCount;
			instanceContext.teacher = instance.teacher.name;
			instanceContext.startDateTime = instance.startDateTime;
			instanceContext.endDateTime = instance.endDateTime;
			classInstances.push(instanceContext);
		}
		classContext.classInstances = classInstances;
		classContext.name = event.name;
		classContext.summary = event.summary;
		classContext.price = event.price;
		classContext.capacity = event.capacity;
		classContext.category = event.category[0].archCategories.name;
		classContext.typeId = event.id;
		classJson.push(classContext);
	}

	const data = {
		classJson: classJson,
		classCategories: classCategories
	}

	return data;
}