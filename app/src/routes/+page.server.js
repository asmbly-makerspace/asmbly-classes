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
			category: true
		}
	});

	let classJson = [];
	let classNames = [];
	let classCategories = new Set();

	for (const event of eventTypes) {
		classCategories.add(event.category[0].name);
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
		classContext.category = event.category[0].name;
		classJson.push(classContext);
		classNames.push(event.name);
	}

	const data = {
		classJson: classJson,
		classNames: classNames,
		classCategories: classCategories
	}

	return data;
}