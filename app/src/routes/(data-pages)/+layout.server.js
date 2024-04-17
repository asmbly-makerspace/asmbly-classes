import { prisma } from '$lib/postgres.js';
import { DateTime } from 'luxon';
import NeonEventType from '$lib/models/neonEventType.js'

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
		const eventModel = NeonEventType.fromPrisma(event)
		if (eventModel.isPrivate) {
			continue;
		}

		classCategories.add(eventModel.category);
		if (event.instances.length > 0) {
			eventModel.addInstances(...event.instances)
		} else {
			const noCurrentInstances = await prisma.neonEventInstance.findMany({
				where: {
					eventTypeId: event.id,
					category: {
						isNot: {
							name: 'Private'
						}
					}
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
				eventModel.addInstances(...noCurrentInstances)
			}
		}

		classJson.push(eventModel.toJson());
	}

	const classCategoriesSorted = [...classCategories].sort((a,b) => {
		if (a === 'Orientation') return -1
		if (b === 'Orientation') return 1
		return a.localeCompare(b)
	})

	return { classJson, classCategories: classCategoriesSorted, baseRegLink };
}
