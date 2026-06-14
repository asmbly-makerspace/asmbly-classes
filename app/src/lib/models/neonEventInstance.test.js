import { describe, it, expect, beforeEach } from 'vitest';
import { DateTime } from 'luxon';
import NeonEventInstance from './neonEventInstance.js';

describe('NeonEventInstance', () => {
	let mockEventType;
	let mockInstance;

	beforeEach(() => {
		mockEventType = {
			category: 'Woodworking',
			name: 'Intro to Woodworking',
			typeId: 123
		};

		mockInstance = {
			eventId: 456,
			attendeeCount: 5,
			teacher: { name: 'John Doe' },
			startDateTime: new Date('2026-03-15T14:00:00Z'),
			endDateTime: new Date('2026-03-15T16:00:00Z'),
			price: 50,
			summary: 'Learn woodworking basics',
			capacity: 10
		};
	});

	describe('constructor', () => {
		it('creates instance with correct properties', () => {
			const instance = new NeonEventInstance(mockInstance, mockEventType);

			expect(instance.eventId).toBe(456);
			expect(instance.attendees).toBe(5);
			expect(instance.teacher).toBe('John Doe');
			expect(instance.price).toBe(50);
			expect(instance.summary).toBe('Learn woodworking basics');
			expect(instance.capacity).toBe(10);
			expect(instance.category).toBe('Woodworking');
			expect(instance.name).toBe('Intro to Woodworking');
			expect(instance.typeId).toBe(123);
		});

		it('converts dates to Chicago timezone', () => {
			const instance = new NeonEventInstance(mockInstance, mockEventType);

			expect(instance.startDateTime).toBeInstanceOf(DateTime);
			expect(instance.endDateTime).toBeInstanceOf(DateTime);
			expect(instance.startDateTime.zoneName).toBe('America/Chicago');
			expect(instance.endDateTime.zoneName).toBe('America/Chicago');
		});

		it('handles teacher as string', () => {
			mockInstance.teacher = 'Jane Smith';
			const instance = new NeonEventInstance(mockInstance, mockEventType);

			expect(instance.teacher).toBe('Jane Smith');
		});

		it('uses attendees property if attendeeCount not present', () => {
			delete mockInstance.attendeeCount;
			mockInstance.attendees = 8;
			const instance = new NeonEventInstance(mockInstance, mockEventType);

			expect(instance.attendees).toBe(8);
		});

		it('defaults to 0 attendees if neither property present', () => {
			delete mockInstance.attendeeCount;
			const instance = new NeonEventInstance(mockInstance, mockEventType);

			expect(instance.attendees).toBe(0);
		});

		it('marks future events as not past', () => {
			mockInstance.startDateTime = new Date('2027-01-01T10:00:00Z');
			const instance = new NeonEventInstance(mockInstance, mockEventType);

			expect(instance.isPast).toBe(false);
		});

		it('marks past events as past', () => {
			mockInstance.startDateTime = new Date('2020-01-01T10:00:00Z');
			const instance = new NeonEventInstance(mockInstance, mockEventType);

			expect(instance.isPast).toBe(true);
		});

		it('marks event as full when attendees equal capacity', () => {
			mockInstance.attendeeCount = 10;
			mockInstance.capacity = 10;
			const instance = new NeonEventInstance(mockInstance, mockEventType);

			expect(instance.isFull).toBe(true);
		});

		it('marks event as full when attendees exceed capacity', () => {
			mockInstance.attendeeCount = 12;
			mockInstance.capacity = 10;
			const instance = new NeonEventInstance(mockInstance, mockEventType);

			expect(instance.isFull).toBe(true);
		});

		it('marks event as not full when attendees less than capacity', () => {
			mockInstance.attendeeCount = 5;
			mockInstance.capacity = 10;
			const instance = new NeonEventInstance(mockInstance, mockEventType);

			expect(instance.isFull).toBe(false);
		});
	});

	describe('classUrl', () => {
		it('returns URL with eventId', () => {
			const instance = new NeonEventInstance(mockInstance, mockEventType);

			expect(instance.classUrl).toBe('?eventId=456');
		});
	});

	describe('toJson', () => {
		it('converts to JSON with JS Date objects', () => {
			const instance = new NeonEventInstance(mockInstance, mockEventType);
			const json = instance.toJson();

			expect(json.eventId).toBe(456);
			expect(json.attendees).toBe(5);
			expect(json.teacher).toBe('John Doe');
			expect(json.startDateTime).toBeInstanceOf(Date);
			expect(json.endDateTime).toBeInstanceOf(Date);
			expect(json.category).toBe('Woodworking');
		});
	});

	describe('isAvailable', () => {
		it('returns false for past events', () => {
			mockInstance.startDateTime = new Date('2020-01-01T10:00:00Z');
			const instance = new NeonEventInstance(mockInstance, mockEventType);

			expect(instance.isAvailable()).toBe(false);
		});

		it('returns true for future events', () => {
			mockInstance.startDateTime = new Date('2027-01-01T10:00:00Z');
			const instance = new NeonEventInstance(mockInstance, mockEventType);

			expect(instance.isAvailable()).toBe(true);
		});
	});

	describe('compare', () => {
		it('sorts by past vs future first (Date sort)', () => {
			const pastInstance = new NeonEventInstance({
				...mockInstance,
				eventId: 1,
				startDateTime: new Date('2020-01-01T10:00:00Z')
			}, mockEventType);

			const futureInstance = new NeonEventInstance({
				...mockInstance,
				eventId: 2,
				startDateTime: new Date('2027-01-01T10:00:00Z')
			}, mockEventType);

			expect(pastInstance.compare(futureInstance, 'Date', true)).toBeGreaterThan(0);
			expect(futureInstance.compare(pastInstance, 'Date', true)).toBeLessThan(0);
		});

		it('sorts by date within same status (Date sort)', () => {
			const earlier = new NeonEventInstance({
				...mockInstance,
				startDateTime: new Date('2027-01-01T10:00:00Z')
			}, mockEventType);

			const later = new NeonEventInstance({
				...mockInstance,
				startDateTime: new Date('2027-02-01T10:00:00Z')
			}, mockEventType);

			expect(earlier.compare(later, 'Date', true)).toBeLessThan(0);
			expect(later.compare(earlier, 'Date', true)).toBeGreaterThan(0);
		});

		it('sorts by price (Price sort)', () => {
			const cheaper = new NeonEventInstance({
				...mockInstance,
				price: 25
			}, mockEventType);

			const expensive = new NeonEventInstance({
				...mockInstance,
				price: 75
			}, mockEventType);

			expect(cheaper.compare(expensive, 'Price', true)).toBeLessThan(0);
			expect(expensive.compare(cheaper, 'Price', true)).toBeGreaterThan(0);
		});

		it('falls back to name sort when dates are similar', () => {
			const classA = new NeonEventInstance({
				...mockInstance,
				startDateTime: new Date('2027-01-01T10:00:00Z')
			}, { ...mockEventType, name: 'Advanced Class' });

			const classB = new NeonEventInstance({
				...mockInstance,
				startDateTime: new Date('2027-01-01T10:00:00Z')
			}, { ...mockEventType, name: 'Beginner Class' });

			expect(classA.compare(classB, 'Date', true)).toBeLessThan(0);
		});

		it('falls back to name sort when prices are equal', () => {
			const classA = new NeonEventInstance(mockInstance, {
				...mockEventType,
				name: 'Advanced Class'
			});

			const classB = new NeonEventInstance(mockInstance, {
				...mockEventType,
				name: 'Beginner Class'
			});

			expect(classA.compare(classB, 'Price', true)).toBeLessThan(0);
		});

		it('respects sortAscending parameter', () => {
			const earlier = new NeonEventInstance({
				...mockInstance,
				startDateTime: new Date('2027-01-01T10:00:00Z')
			}, mockEventType);

			const later = new NeonEventInstance({
				...mockInstance,
				startDateTime: new Date('2027-02-01T10:00:00Z')
			}, mockEventType);

			// Ascending
			expect(earlier.compare(later, 'Date', true)).toBeLessThan(0);
			// Descending
			expect(earlier.compare(later, 'Date', false)).toBeGreaterThan(0);
		});

		it('performs case-insensitive name comparison', () => {
			const classA = new NeonEventInstance(mockInstance, {
				...mockEventType,
				name: 'advanced class'
			});

			const classB = new NeonEventInstance(mockInstance, {
				...mockEventType,
				name: 'BEGINNER CLASS'
			});

			expect(classA.compare(classB, 'Date', true)).toBeLessThan(0);
		});
	});

	describe('getClassImage', () => {
		it('matches class name to image', () => {
			const classImages = {
				'intro-to-woodworking.jpg': { default: '/images/intro-woodworking.jpg' },
				'advanced-metalworking.jpg': { default: '/images/advanced-metal.jpg' }
			};

			const instance = new NeonEventInstance(mockInstance, mockEventType);
			const image = instance.getClassImage(classImages);

			expect(image).toBe('/images/intro-woodworking.jpg');
		});

		it('simplifies name for matching (removes spaces, special chars)', () => {
			const classImages = {
				'introtowoodworking.jpg': { default: '/images/intro.jpg' }
			};

			mockEventType.name = 'Intro to Woodworking';
			const instance = new NeonEventInstance(mockInstance, mockEventType);
			const image = instance.getClassImage(classImages);

			expect(image).toBe('/images/intro.jpg');
		});

		it('handles ampersand conversion to "and"', () => {
			const classImages = {
				'sawsandmachines.jpg': { default: '/images/saws.jpg' }
			};

			mockEventType.name = 'Saws & Machines';
			const instance = new NeonEventInstance(mockInstance, mockEventType);
			const image = instance.getClassImage(classImages);

			expect(image).toBe('/images/saws.jpg');
		});

		it('falls back to category default for Laser Cutting', () => {
			const classImages = {
				'/src/lib/images/lasersDefault.jpg': { default: '/images/laser-default.jpg' }
			};

			mockEventType.category = 'Laser Cutting';
			mockEventType.name = 'Unknown Laser Class';
			const instance = new NeonEventInstance(mockInstance, mockEventType);
			const image = instance.getClassImage(classImages);

			expect(image).toBe('/images/laser-default.jpg');
		});

		it('falls back to category default for other categories', () => {
			const classImages = {
				'/src/lib/images/woodworkingDefault.jpg': { default: '/images/wood-default.jpg' }
			};

			mockEventType.category = 'Woodworking';
			mockEventType.name = 'Unknown Wood Class';
			const instance = new NeonEventInstance(mockInstance, mockEventType);
			const image = instance.getClassImage(classImages);

			expect(image).toBe('/images/wood-default.jpg');
		});

		it('falls back to general default when category default not found', () => {
			const classImages = {
				'/src/lib/images/classDefault.jpg': { default: '/images/general-default.jpg' }
			};

			mockEventType.category = 'Rare Category';
			mockEventType.name = 'Unknown Class';
			const instance = new NeonEventInstance(mockInstance, mockEventType);
			const image = instance.getClassImage(classImages);

			expect(image).toBe('/images/general-default.jpg');
		});
	});
});

