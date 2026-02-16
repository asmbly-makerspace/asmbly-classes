import { describe, it, expect, beforeEach } from 'vitest';
import NeonEventType from './neonEventType.js';
import NeonEventInstance from './neonEventInstance.js';

describe('NeonEventType', () => {
	let mockEvent;

	beforeEach(() => {
		mockEvent = {
			id: 123,
			name: 'Intro to Woodworking',
			category: 'Woodworking',
			isPrivate: false
		};
	});

	describe('constructor', () => {
		it('creates event type with basic properties', () => {
			const eventType = new NeonEventType(mockEvent);

			expect(eventType.typeId).toBe(123);
			expect(eventType.name).toBe('Intro to Woodworking');
			expect(eventType.category).toBe('Woodworking');
			expect(eventType.isPrivate).toBe(false);
			expect(eventType.classInstances).toEqual([]);
			expect(eventType.sorted).toBe(false);
			expect(eventType.anyCurrent).toBe(false);
		});

		it('handles typeId vs id property', () => {
			delete mockEvent.id;
			mockEvent.typeId = 456;
			const eventType = new NeonEventType(mockEvent);

			expect(eventType.typeId).toBe(456);
		});

		it('handles null category', () => {
			mockEvent.category = null;
			const eventType = new NeonEventType(mockEvent);

			expect(eventType.category).toBeNull();
		});

		it('marks as private if name contains "Private"', () => {
			mockEvent.name = 'Private Woodworking Session';
			mockEvent.isPrivate = false;
			const eventType = new NeonEventType(mockEvent);

			expect(eventType.isPrivate).toBe(true);
		});

		it('marks as private if name contains "Checkout"', () => {
			mockEvent.name = 'Laser Cutter Checkout';
			mockEvent.isPrivate = false;
			const eventType = new NeonEventType(mockEvent);

			expect(eventType.isPrivate).toBe(true);
		});

		it('adds instances from classInstances array', () => {
			mockEvent.classInstances = [
				{
					eventId: 1,
					attendeeCount: 5,
					teacher: { name: 'John' },
					startDateTime: new Date('2027-01-01'),
					endDateTime: new Date('2027-01-01'),
					price: 50,
					capacity: 10
				}
			];

			const eventType = new NeonEventType(mockEvent);

			expect(eventType.classInstances).toHaveLength(1);
			expect(eventType.classInstances[0]).toBeInstanceOf(NeonEventInstance);
		});

		it('adds instances from instances array', () => {
			mockEvent.instances = [
				{
					eventId: 1,
					attendeeCount: 5,
					teacher: { name: 'John' },
					startDateTime: new Date('2027-01-01'),
					endDateTime: new Date('2027-01-01'),
					price: 50,
					capacity: 10
				}
			];

			const eventType = new NeonEventType(mockEvent);

			expect(eventType.classInstances).toHaveLength(1);
		});

		it('sets anyCurrent to true if any instance is not past', () => {
			mockEvent.instances = [
				{
					eventId: 1,
					attendeeCount: 5,
					teacher: { name: 'John' },
					startDateTime: new Date('2027-01-01'),
					endDateTime: new Date('2027-01-01'),
					price: 50,
					capacity: 10
				}
			];

			const eventType = new NeonEventType(mockEvent);

			expect(eventType.anyCurrent).toBe(true);
		});
	});

	describe('summary', () => {
		it('returns summary from first instance if available', () => {
			mockEvent.instances = [
				{
					eventId: 1,
					attendeeCount: 5,
					teacher: { name: 'John' },
					startDateTime: new Date('2027-01-01'),
					endDateTime: new Date('2027-01-01'),
					price: 50,
					summary: 'Learn woodworking basics',
					capacity: 10
				}
			];

			const eventType = new NeonEventType(mockEvent);

			expect(eventType.summary).toBe('Learn woodworking basics');
		});

		it('returns default message if no instances', () => {
			const eventType = new NeonEventType(mockEvent);

			expect(eventType.summary).toBe('No summary available');
		});

		it('returns default message if instance has no summary', () => {
			mockEvent.instances = [
				{
					eventId: 1,
					attendeeCount: 5,
					teacher: { name: 'John' },
					startDateTime: new Date('2027-01-01'),
					endDateTime: new Date('2027-01-01'),
					price: 50,
					capacity: 10
				}
			];

			const eventType = new NeonEventType(mockEvent);

			expect(eventType.summary).toBe('No summary available');
		});
	});

	describe('addInstances', () => {
		it('adds multiple instances', () => {
			const eventType = new NeonEventType(mockEvent);

			eventType.addInstances(
				{
					eventId: 1,
					attendeeCount: 5,
					teacher: { name: 'John' },
					startDateTime: new Date('2027-01-01'),
					endDateTime: new Date('2027-01-01'),
					price: 50,
					capacity: 10
				},
				{
					eventId: 2,
					attendeeCount: 3,
					teacher: { name: 'Jane' },
					startDateTime: new Date('2027-02-01'),
					endDateTime: new Date('2027-02-01'),
					price: 60,
					capacity: 8
				}
			);

			expect(eventType.classInstances).toHaveLength(2);
		});

		it('creates NeonEventInstance objects', () => {
			const eventType = new NeonEventType(mockEvent);

			eventType.addInstances({
				eventId: 1,
				attendeeCount: 5,
				teacher: { name: 'John' },
				startDateTime: new Date('2027-01-01'),
				endDateTime: new Date('2027-01-01'),
				price: 50,
				capacity: 10
			});

			expect(eventType.classInstances[0]).toBeInstanceOf(NeonEventInstance);
		});

		it('updates anyCurrent if instance is not past', () => {
			const eventType = new NeonEventType(mockEvent);

			eventType.addInstances({
				eventId: 1,
				attendeeCount: 5,
				teacher: { name: 'John' },
				startDateTime: new Date('2027-01-01'),
				endDateTime: new Date('2027-01-01'),
				price: 50,
				capacity: 10
			});

			expect(eventType.anyCurrent).toBe(true);
		});

		it('marks as unsorted after adding instances', () => {
			const eventType = new NeonEventType(mockEvent);
			eventType.sorted = true;

			eventType.addInstances({
				eventId: 1,
				attendeeCount: 5,
				teacher: { name: 'John' },
				startDateTime: new Date('2027-01-01'),
				endDateTime: new Date('2027-01-01'),
				price: 50,
				capacity: 10
			});

			expect(eventType.sorted).toBe(false);
		});
	});

	describe('sortInstances', () => {
		it('sorts instances by start date', () => {
			const eventType = new NeonEventType(mockEvent);

			eventType.addInstances(
				{
					eventId: 2,
					attendeeCount: 5,
					teacher: { name: 'John' },
					startDateTime: new Date('2027-02-01'),
					endDateTime: new Date('2027-02-01'),
					price: 50,
					capacity: 10
				},
				{
					eventId: 1,
					attendeeCount: 3,
					teacher: { name: 'Jane' },
					startDateTime: new Date('2027-01-01'),
					endDateTime: new Date('2027-01-01'),
					price: 60,
					capacity: 8
				}
			);

			eventType.sortInstances();

			expect(eventType.classInstances[0].eventId).toBe(1);
			expect(eventType.classInstances[1].eventId).toBe(2);
		});

		it('marks as sorted after sorting', () => {
			const eventType = new NeonEventType(mockEvent);
			eventType.addInstances({
				eventId: 1,
				attendeeCount: 5,
				teacher: { name: 'John' },
				startDateTime: new Date('2027-01-01'),
				endDateTime: new Date('2027-01-01'),
				price: 50,
				capacity: 10
			});

			eventType.sortInstances();

			expect(eventType.sorted).toBe(true);
		});
	});

	describe('soonest', () => {
		it('returns first available instance', () => {
			const eventType = new NeonEventType(mockEvent);

			eventType.addInstances(
				{
					eventId: 1,
					attendeeCount: 5,
					teacher: { name: 'John' },
					startDateTime: new Date('2020-01-01'), // Past
					endDateTime: new Date('2020-01-01'),
					price: 50,
					capacity: 10
				},
				{
					eventId: 2,
					attendeeCount: 3,
					teacher: { name: 'Jane' },
					startDateTime: new Date('2027-01-01'), // Future
					endDateTime: new Date('2027-01-01'),
					price: 60,
					capacity: 8
				}
			);

			const soonest = eventType.soonest(false);

			expect(soonest.eventId).toBe(2);
		});

		it('returns first instance when showAll is true', () => {
			const eventType = new NeonEventType(mockEvent);

			eventType.addInstances(
				{
					eventId: 1,
					attendeeCount: 5,
					teacher: { name: 'John' },
					startDateTime: new Date('2020-01-01'),
					endDateTime: new Date('2020-01-01'),
					price: 50,
					capacity: 10
				},
				{
					eventId: 2,
					attendeeCount: 3,
					teacher: { name: 'Jane' },
					startDateTime: new Date('2027-01-01'),
					endDateTime: new Date('2027-01-01'),
					price: 60,
					capacity: 8
				}
			);

			const soonest = eventType.soonest(true);

			expect(soonest.eventId).toBe(1);
		});

		it('returns first instance if all are past', () => {
			const eventType = new NeonEventType(mockEvent);

			eventType.addInstances(
				{
					eventId: 1,
					attendeeCount: 5,
					teacher: { name: 'John' },
					startDateTime: new Date('2020-01-01'),
					endDateTime: new Date('2020-01-01'),
					price: 50,
					capacity: 10
				},
				{
					eventId: 2,
					attendeeCount: 3,
					teacher: { name: 'Jane' },
					startDateTime: new Date('2021-01-01'),
					endDateTime: new Date('2021-01-01'),
					price: 60,
					capacity: 8
				}
			);

			const soonest = eventType.soonest(false);

			expect(soonest.eventId).toBe(1);
		});
	});

	describe('instanceList', () => {
		it('returns soonest when soonestOnly is true', () => {
			const eventType = new NeonEventType(mockEvent);

			eventType.addInstances(
				{
					eventId: 1,
					attendeeCount: 5,
					teacher: { name: 'John' },
					startDateTime: new Date('2027-01-01'),
					endDateTime: new Date('2027-01-01'),
					price: 50,
					capacity: 10
				},
				{
					eventId: 2,
					attendeeCount: 3,
					teacher: { name: 'Jane' },
					startDateTime: new Date('2027-02-01'),
					endDateTime: new Date('2027-02-01'),
					price: 60,
					capacity: 8
				}
			);

			const result = eventType.instanceList(true, false);

			expect(result).toBeInstanceOf(NeonEventInstance);
			expect(result.eventId).toBe(1);
		});

		it('returns all instances when soonestOnly is false', () => {
			const eventType = new NeonEventType(mockEvent);

			eventType.addInstances(
				{
					eventId: 1,
					attendeeCount: 5,
					teacher: { name: 'John' },
					startDateTime: new Date('2027-01-01'),
					endDateTime: new Date('2027-01-01'),
					price: 50,
					capacity: 10
				},
				{
					eventId: 2,
					attendeeCount: 3,
					teacher: { name: 'Jane' },
					startDateTime: new Date('2027-02-01'),
					endDateTime: new Date('2027-02-01'),
					price: 60,
					capacity: 8
				}
			);

			const result = eventType.instanceList(false, false);

			expect(result).toBeInstanceOf(Array);
			expect(result).toHaveLength(2);
		});
	});

	describe('toJson', () => {
		it('converts to JSON with instances', () => {
			const eventType = new NeonEventType(mockEvent);

			eventType.addInstances({
				eventId: 1,
				attendeeCount: 5,
				teacher: { name: 'John' },
				startDateTime: new Date('2027-01-01'),
				endDateTime: new Date('2027-01-01'),
				price: 50,
				capacity: 10
			});

			const json = eventType.toJson();

			expect(json.typeId).toBe(123);
			expect(json.name).toBe('Intro to Woodworking');
			expect(json.classInstances).toHaveLength(1);
			expect(json.classInstances[0].eventId).toBe(1);
		});
	});

	describe('fromPrisma static method', () => {
		it('creates NeonEventType from Prisma data with instances', () => {
			const prismaData = {
				id: 123,
				name: 'Woodworking Class',
				category: [
					{ archCategories: { name: 'Woodworking' } }
				],
				instances: [
					{
						eventId: 1,
						attendeeCount: 5,
						teacher: { name: 'John' },
						startDateTime: new Date('2027-01-01'),
						endDateTime: new Date('2027-01-01'),
						price: 50,
						capacity: 10,
						category: { archCategories: { name: 'Woodworking' } }
					}
				]
			};

			const eventType = NeonEventType.fromPrisma(prismaData);

			expect(eventType).toBeInstanceOf(NeonEventType);
			expect(eventType.name).toBe('Woodworking Class');
			expect(eventType.category).toBe('Woodworking');
			expect(eventType.isPrivate).toBe(false);
		});

		it('marks as private when all instances are Private category', () => {
			const prismaData = {
				id: 123,
				name: 'Private Class',
				category: [
					{ archCategories: { name: 'Private' } }
				],
				instances: [
					{
						eventId: 1,
						attendeeCount: 5,
						teacher: { name: 'John' },
						startDateTime: new Date('2027-01-01'),
						endDateTime: new Date('2027-01-01'),
						price: 50,
						capacity: 10,
						category: { archCategories: { name: 'Private' } }
					}
				]
			};

			const eventType = NeonEventType.fromPrisma(prismaData);

			expect(eventType.isPrivate).toBe(true);
			expect(eventType.category).toBeNull();
		});

		it('uses first non-Private instance category', () => {
			const prismaData = {
				id: 123,
				name: 'Mixed Class',
				category: [],
				instances: [
					{
						eventId: 1,
						attendeeCount: 5,
						teacher: { name: 'John' },
						startDateTime: new Date('2027-01-01'),
						endDateTime: new Date('2027-01-01'),
						price: 50,
						capacity: 10,
						category: { archCategories: { name: 'Private' } }
					},
					{
						eventId: 2,
						attendeeCount: 3,
						teacher: { name: 'Jane' },
						startDateTime: new Date('2027-02-01'),
						endDateTime: new Date('2027-02-01'),
						price: 60,
						capacity: 8,
						category: { archCategories: { name: 'Metalworking' } }
					}
				]
			};

			const eventType = NeonEventType.fromPrisma(prismaData);

			expect(eventType.category).toBe('Metalworking');
			expect(eventType.isPrivate).toBe(false);
		});

		it('handles empty instances array', () => {
			const prismaData = {
				id: 123,
				name: 'No Instances',
				category: [
					{ archCategories: { name: 'Woodworking' } }
				],
				instances: []
			};

			const eventType = NeonEventType.fromPrisma(prismaData);

			expect(eventType.category).toBe('Woodworking');
		});
	});

	describe('fromJson static method', () => {
		it('creates NeonEventType from JSON data', () => {
			const jsonData = {
				typeId: 123,
				name: 'JSON Class',
				category: 'Woodworking',
				isPrivate: false
			};

			const eventType = NeonEventType.fromJson(jsonData);

			expect(eventType).toBeInstanceOf(NeonEventType);
			expect(eventType.typeId).toBe(123);
			expect(eventType.name).toBe('JSON Class');
			expect(eventType.category).toBe('Woodworking');
			expect(eventType.isPrivate).toBe(false);
		});
	});
});


