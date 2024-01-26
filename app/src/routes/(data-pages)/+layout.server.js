import { prisma } from '$lib/postgres.js';
import { DateTime } from 'luxon';

export const prerender = false;

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
	const eventTypesCall = prisma.neonEventType.findMany({
		include: {
			category: {
				include: {
					archCategories: true
				}
			},
			instances: {
				where: {
					startDateTime: {
						gte: DateTime.local({
							zone: 'America/Chicago'
						})
					},
					category: {
						isNot: {
							name: 'Private'
						}
					}
				},
				orderBy: {
					startDateTime: 'asc'
				},
				take: 1,
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
		const instanceCategory = event.category.find((cat) => cat.archCategories.name !== 'Private');
		if (!instanceCategory) {
			continue;
		}
		classCategories.add(instanceCategory.archCategories.name);
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
				instanceContext.price = instance.price;
				instanceContext.summary = instance.summary;
				classInstances.push(instanceContext);
			}
		} else {
			const noCurrentInstances = await prisma.neonEventInstance.findMany({
				where: {
					eventTypeId: event.id
				},
				orderBy: {
					startDateTime: 'desc'
				},
				take: 1,
				include: {
					teacher: {
						select: {
							name: true
						}
					}
				}
			});

			if (noCurrentInstances.length > 0) {
				for (const instance of noCurrentInstances) {
					let instanceContext = {};
					instanceContext.eventId = instance.eventId;
					instanceContext.attendees = instance.attendeeCount;
					instanceContext.teacher = instance.teacher.name;
					instanceContext.startDateTime = instance.startDateTime;
					instanceContext.endDateTime = instance.endDateTime;
					instanceContext.price = instance.price;
					instanceContext.summary = instance.summary;
					classInstances.push(instanceContext);
				}
			}
		}
		
		classContext.classInstances = classInstances;
		classContext.name = event.name;
		classContext.category = instanceCategory.archCategories.name;
		classContext.typeId = event.id;

		if (!classContext.name.split(' ').includes('Private') && !classContext.name.split(' ').includes('Checkout') && classContext.category !== 'Private') {
			classJson.push(classContext);
		}
	}

	return { classJson, classCategories, baseRegLink };
}
