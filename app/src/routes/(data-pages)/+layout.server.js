import { prisma } from '$lib/postgres.js';
import { DateTime } from 'luxon';
import NeonEventType from '$lib/models/neonEventType.js'

export const prerender = false;

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
	const eventTypesCall = prisma.neonEventType.findMany({
		where: {
			visible: true	
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
					},
					category: {
						select: {
							archCategories: true
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

		if (event.instances.length == 0) {
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
					},
					category: {
						select: {
							archCategories: true
						}
					}
				}
			});

			if (noCurrentInstances.length > 0) {
				eventModel.addInstances(...noCurrentInstances)
			}
		} 

		if (eventModel.category) {
			classCategories.add(eventModel.category)
			classJson.push(eventModel.toJson())
		}
	}

	const classCategoriesSorted = [...classCategories].sort((a,b) => {
		if (a === 'Orientation') return -1
		if (b === 'Orientation') return 1
		return a.localeCompare(b)
	})

	return { classJson, classCategories: classCategoriesSorted, baseRegLink };
}
