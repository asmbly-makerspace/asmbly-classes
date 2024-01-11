import { prisma } from '$lib/postgres.js';

export const prerender = false;

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
	const eventTypesCall = prisma.NeonEventType.findMany({
		where: {
			category: {
				none: {
					name: 'Private'
				}
			}
		},
		include: {
			category: {
				include: {
					archCategories: true
				}
			},
			instances: {
				where: {
					startDateTime: {
						gte: new Date()
					}
				},
				include: {
					teacher: {
						select: {
							name: true
						}
					}
				}
			}
		}
	});

	const baseRegLinkCall = prisma.NeonBaseRegLink.findFirst();

	const [eventTypes, baseRegLink] = await prisma.$transaction([eventTypesCall, baseRegLinkCall]);

	const classJson = [];
	const classCategories = new Set();

	for (const event of eventTypes) {
		classCategories.add(event.category[0].archCategories.name);
		let classContext = {};
		const instances = event.instances;
		let classInstances = [];
		if (instances.length > 0) {
			for (const instance of instances) {
				let instanceContext = {};
				instanceContext.eventId = instance.eventId;
				instanceContext.attendees = instance.attendeeCount;
				instanceContext.teacher = instance.teacher.name;
				instanceContext.startDateTime = instance.startDateTime;
				instanceContext.endDateTime = instance.endDateTime;
				classInstances.push(instanceContext);
			}
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

	return { classJson, classCategories, baseRegLink };
}
