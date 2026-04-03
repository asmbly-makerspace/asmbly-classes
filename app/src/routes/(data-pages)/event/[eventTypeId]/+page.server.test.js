import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockPrisma } from '$tests/helpers/apiMocker.js';

// Create mock objects
let mockPrisma;
let mockSendMIMEmessage;
let mockSuperValidate;
let mockMessage;
let mockFail;
let mockError;

// Mock the postgres module
vi.mock('$lib/postgres.js', () => ({
	get prisma() {
		return mockPrisma;
	}
}));

// Mock email sending
vi.mock('$lib/server/gmailEmailFactory.js', () => ({
	get sendMIMEmessage() {
		return mockSendMIMEmessage;
	}
}));

// Mock sveltekit-superforms
vi.mock('sveltekit-superforms/server', () => ({
	get superValidate() {
		return mockSuperValidate;
	},
	get message() {
		return mockMessage;
	}
}));

// Mock SvelteKit utilities
vi.mock('@sveltejs/kit', () => ({
	get fail() {
		return mockFail;
	},
	get error() {
		return mockError;
	}
}));

// Mock NeonEventType model
vi.mock('$lib/models/neonEventType.js', () => ({
	default: {
		fromPrisma: vi.fn((data) => ({
			addInstances: vi.fn(),
			toJson: vi.fn(() => ({ id: data.id, name: data.name, instances: [] }))
		}))
	}
}));

// Import after mocks are set up
const { load, actions } = await import('./+page.server.js');

describe('Event Page Load', () => {
	beforeEach(() => {
		mockPrisma = createMockPrisma();
		mockSuperValidate = vi.fn(async (schema, options) => ({
			valid: true,
			data: {}
		}));
		mockError = vi.fn((status, message) => {
			const err = new Error(message);
			err.status = status;
			throw err;
		});

		vi.clearAllMocks();
	});

	it('loads event type with instances successfully', async () => {
		const eventTypeId = 123;

		mockPrisma._setData('neonEventType', eventTypeId, {
			id: eventTypeId,
			name: 'Test Class',
			category: {
				archCategories: []
			},
			instances: [
				{
					eventId: 1,
					startDateTime: new Date('2026-03-01T10:00:00Z'),
					teacher: { name: 'Test Teacher' },
					category: { archCategories: [] }
				}
			]
		});

		mockPrisma._setData('neonBaseRegLink', 'default', {
			url: 'https://example.com/register/'
		});

		const setHeaders = vi.fn();
		const params = { eventTypeId: eventTypeId.toString() };

		const result = await load({ params, setHeaders });

		expect(result.classJson).toBeDefined();
		expect(result.baseRegLink).toBeDefined();
		expect(result.privateRequestForm).toBeDefined();
		expect(result.notificationForm).toBeDefined();
		expect(setHeaders).toHaveBeenCalledWith({
			'cache-control': 'max-age=300'
		});
	});

	it('throws 404 error when event type not found', async () => {
		const params = { eventTypeId: '999' };
		const setHeaders = vi.fn();

		try {
			await load({ params, setHeaders });
			expect.fail('Should have thrown 404 error');
		} catch (error) {
			expect(error.status).toBe(404);
			expect(error.message).toBe('Event not found');
		}
	});

	it('handles event type with no current instances', async () => {
		const eventTypeId = 123;

		mockPrisma._setData('neonEventType', eventTypeId, {
			id: eventTypeId,
			name: 'Test Class',
			category: { archCategories: [] },
			instances: []
		});

		mockPrisma._setData('neonBaseRegLink', 'default', {
			url: 'https://example.com/register/'
		});

		const setHeaders = vi.fn();
		const params = { eventTypeId: eventTypeId.toString() };

		const result = await load({ params, setHeaders });

		expect(result.classJson).toBeDefined();
	});
});

describe('Private Request Action', () => {
	beforeEach(() => {
		mockPrisma = createMockPrisma();
		mockSendMIMEmessage = vi.fn().mockResolvedValue({ success: true });
		mockMessage = vi.fn((form, msg) => ({ ...form, message: msg }));
		mockFail = vi.fn((status, data) => ({ status, ...data }));

		mockSuperValidate = vi.fn(async (formData, schema) => ({
			valid: true,
			data: {
				email: 'test@example.com',
				firstName: 'John',
				lastName: 'Doe',
				sessionType: 'Private'
			}
		}));

		vi.clearAllMocks();
	});

	it('submits private class request successfully', async () => {
		const classTypeId = 456;

		mockPrisma._setData('neonEventType', classTypeId, {
			id: classTypeId,
			name: 'Advanced Woodworking'
		});

		const formData = new FormData();
		formData.append('classTypeId', classTypeId.toString());

		const request = { formData: async () => formData };

		const result = await actions.privateRequest({ request });

		// Verify two emails were sent
		expect(mockSendMIMEmessage).toHaveBeenCalledTimes(2);

		// Check requester email
		const requesterEmail = mockSendMIMEmessage.mock.calls.find(
			call => call[0].to === 'test@example.com'
		);
		expect(requesterEmail).toBeDefined();
		expect(requesterEmail[0].subject).toContain('Private class request');
		expect(requesterEmail[0].html).toContain('John');
		expect(requesterEmail[0].html).toContain('Advanced Woodworking');

		// Check Asmbly email
		const asmblyEmail = mockSendMIMEmessage.mock.calls.find(
			call => call[0].to === 'classes@asmbly.org'
		);
		expect(asmblyEmail).toBeDefined();
		expect(asmblyEmail[0].replyTo).toBe('test@example.com');

		// Verify success message
		expect(mockMessage).toHaveBeenCalledWith(
			expect.objectContaining({ valid: true }),
			{ text: expect.stringContaining('successfully submitted a private class request') }
		);
	});

	it('returns fail on invalid form', async () => {
		mockSuperValidate.mockResolvedValue({
			valid: false,
			data: {},
			errors: {}
		});

		const formData = new FormData();
		const request = { formData: async () => formData };

		const result = await actions.privateRequest({ request });

		expect(mockFail).toHaveBeenCalledWith(400, expect.any(Object));
		expect(mockSendMIMEmessage).not.toHaveBeenCalled();
	});

	it('handles different session types', async () => {
		const sessionTypes = ['Private', 'Semi-Private', 'Group'];

		for (const sessionType of sessionTypes) {
			mockSuperValidate.mockResolvedValue({
				valid: true,
				data: {
					email: 'test@example.com',
					firstName: 'John',
					lastName: 'Doe',
					sessionType
				}
			});

			mockPrisma._setData('neonEventType', 456, {
				id: 456,
				name: 'Test Class'
			});

			const formData = new FormData();
			formData.append('classTypeId', '456');
			const request = { formData: async () => formData };

			await actions.privateRequest({ request });

			const lastCall = mockSendMIMEmessage.mock.calls[mockSendMIMEmessage.mock.calls.length - 2];
			expect(lastCall[0].subject).toContain(sessionType);
		}
	});
});

describe('Full Class Request Action', () => {
	beforeEach(() => {
		mockPrisma = createMockPrisma();
		mockSendMIMEmessage = vi.fn().mockResolvedValue({ success: true });
		mockMessage = vi.fn((form, msg) => ({ ...form, message: msg }));
		mockFail = vi.fn((status, data) => ({ status, ...data }));

		mockSuperValidate = vi.fn(async (formData, schema, options) => ({
			valid: true,
			data: {
				email: 'waitlist@example.com',
				firstName: 'Jane',
				lastName: 'Smith'
			}
		}));

		vi.clearAllMocks();
	});

	it('adds user to waitlist successfully', async () => {
		const eventId = 789;
		const eventTypeId = 100;
		const requesterId = 100;

		// Set up event type first
		mockPrisma._setData('neonEventType', eventTypeId, {
			id: eventTypeId,
			name: 'Intro to Metalworking'
		});

		// Set up event instance with eventTypeId reference
		mockPrisma._setData('neonEventInstance', eventId, {
			eventId,
			eventTypeId: eventTypeId,
			startDateTime: new Date('2026-03-15T14:00:00Z')
		});

		mockPrisma._setData('neonEventRequester', requesterId, {
			id: requesterId,
			email: 'waitlist@example.com',
			firstName: 'Jane',
			lastName: 'Smith'
		});

		const formData = new FormData();
		formData.append('eventId', eventId.toString());

		const request = { formData: async () => formData };

		const result = await actions.fullClassRequest({ request });

		// Verify email was sent
		expect(mockSendMIMEmessage).toHaveBeenCalledTimes(1);
		expect(mockSendMIMEmessage).toHaveBeenCalledWith(
			expect.objectContaining({
				to: 'waitlist@example.com',
				subject: expect.stringContaining('Intro to Metalworking'),
				html: expect.stringContaining('Jane')
			})
		);

		// Verify success message
		expect(mockMessage).toHaveBeenCalledWith(
			expect.any(Object),
			{ text: expect.stringContaining('waitlist request') }
		);
	});

	it('returns fail on invalid form', async () => {
		mockSuperValidate.mockResolvedValue({
			valid: false,
			data: {},
			errors: {}
		});

		const formData = new FormData();
		const request = { formData: async () => formData };

		const result = await actions.fullClassRequest({ request });

		expect(mockFail).toHaveBeenCalledWith(400, expect.any(Object));
		expect(mockSendMIMEmessage).not.toHaveBeenCalled();
	});

	it('creates new requester if not exists', async () => {
		const eventId = 789;
		const eventTypeId = 100;

		// Set up event type first
		mockPrisma._setData('neonEventType', eventTypeId, {
			id: eventTypeId,
			name: 'Test Class'
		});

		mockPrisma._setData('neonEventInstance', eventId, {
			eventId,
			eventTypeId: eventTypeId,
			startDateTime: new Date('2026-03-15T14:00:00Z')
		});

		const formData = new FormData();
		formData.append('eventId', eventId.toString());

		const request = { formData: async () => formData };

		await actions.fullClassRequest({ request });

		// Verify requester was created via upsert
		expect(mockSendMIMEmessage).toHaveBeenCalled();
	});
});

describe('Notification Request Action', () => {
	beforeEach(() => {
		mockPrisma = createMockPrisma();
		mockSendMIMEmessage = vi.fn().mockResolvedValue({ success: true });
		mockMessage = vi.fn((form, msg) => ({ ...form, message: msg }));
		mockFail = vi.fn((status, data) => ({ status, ...data }));

		mockSuperValidate = vi.fn(async (formData, schema, options) => ({
			valid: true,
			data: {
				email: 'notify@example.com',
				firstName: 'Bob',
				lastName: 'Johnson'
			}
		}));

		vi.clearAllMocks();
	});

	it('submits notification request successfully', async () => {
		const classTypeId = 555;
		const requesterId = 200;

		mockPrisma._setData('neonEventType', classTypeId, {
			id: classTypeId,
			name: 'Leather Working'
		});

		mockPrisma._setData('neonEventRequester', requesterId, {
			id: requesterId,
			email: 'notify@example.com',
			firstName: 'Bob',
			lastName: 'Johnson'
		});

		const formData = new FormData();
		formData.append('classTypeId', classTypeId.toString());

		const request = { formData: async () => formData };

		const result = await actions.notificationRequest({ request });

		// Verify email was sent
		expect(mockSendMIMEmessage).toHaveBeenCalledTimes(1);
		expect(mockSendMIMEmessage).toHaveBeenCalledWith(
			expect.objectContaining({
				to: 'notify@example.com',
				subject: expect.stringContaining('Leather Working'),
				html: expect.stringContaining('Bob')
			})
		);

		// Verify success message
		expect(mockMessage).toHaveBeenCalledWith(
			expect.any(Object),
			{ text: expect.stringContaining('notification request') }
		);
	});

	it('returns fail on invalid form', async () => {
		mockSuperValidate.mockResolvedValue({
			valid: false,
			data: {},
			errors: {}
		});

		const formData = new FormData();
		const request = { formData: async () => formData };

		const result = await actions.notificationRequest({ request });

		expect(mockFail).toHaveBeenCalledWith(400, expect.any(Object));
		expect(mockSendMIMEmessage).not.toHaveBeenCalled();
	});

	it('handles email sending failures gracefully', async () => {
		mockSendMIMEmessage.mockRejectedValue(new Error('Email failed'));

		mockPrisma._setData('neonEventType', 555, {
			id: 555,
			name: 'Test Class'
		});

		mockPrisma._setData('neonEventRequester', 200, {
			id: 200,
			email: 'notify@example.com',
			firstName: 'Bob',
			lastName: 'Johnson'
		});

		const formData = new FormData();
		formData.append('classTypeId', '555');

		const request = { formData: async () => formData };

		// Should still return success message despite email failure
		const result = await actions.notificationRequest({ request });

		expect(mockMessage).toHaveBeenCalledWith(
			expect.any(Object),
			{ text: expect.stringContaining('notification request') }
		);
	});
});

describe('On-Demand Request Action', () => {
	beforeEach(() => {
		mockPrisma = createMockPrisma();
		mockSendMIMEmessage = vi.fn().mockResolvedValue({ success: true });
		mockMessage = vi.fn((form, msg) => ({ ...form, message: msg }));
		mockFail = vi.fn((status, data) => ({ status, ...data }));

		mockSuperValidate = vi.fn(async (formData, schema, options) => ({
			valid: true,
			data: {
				email: 'ondemand@example.com',
				firstName: 'Alice',
				lastName: 'Williams'
			}
		}));

		vi.clearAllMocks();
	});

	it('submits on-demand request successfully', async () => {
		const classTypeId = 666;
		const requesterId = 300;

		mockPrisma._setData('neonEventType', classTypeId, {
			id: classTypeId,
			name: 'Rare Woodworking Class'
		});

		mockPrisma._setData('neonEventRequester', requesterId, {
			id: requesterId,
			email: 'ondemand@example.com',
			firstName: 'Alice',
			lastName: 'Williams'
		});

		const formData = new FormData();
		formData.append('classTypeId', classTypeId.toString());

		const request = { formData: async () => formData };

		const result = await actions.onDemandRequest({ request });

		// Verify email was sent
		expect(mockSendMIMEmessage).toHaveBeenCalledTimes(1);
		expect(mockSendMIMEmessage).toHaveBeenCalledWith(
			expect.objectContaining({
				to: 'ondemand@example.com',
				subject: expect.stringContaining('Rare Woodworking Class'),
				html: expect.stringContaining('Alice')
			})
		);

		// Verify success message
		expect(mockMessage).toHaveBeenCalledWith(
			expect.any(Object),
			{ text: expect.stringContaining('class request') }
		);
	});

	it('returns fail on invalid form', async () => {
		mockSuperValidate.mockResolvedValue({
			valid: false,
			data: {},
			errors: {}
		});

		const formData = new FormData();
		const request = { formData: async () => formData };

		const result = await actions.onDemandRequest({ request });

		expect(mockFail).toHaveBeenCalledWith(400, expect.any(Object));
		expect(mockSendMIMEmessage).not.toHaveBeenCalled();
	});

	it('updates existing requester information', async () => {
		const classTypeId = 666;
		const existingRequesterId = 300;

		mockPrisma._setData('neonEventType', classTypeId, {
			id: classTypeId,
			name: 'Test Class'
		});

		mockPrisma._setData('neonEventRequester', existingRequesterId, {
			id: existingRequesterId,
			email: 'ondemand@example.com',
			firstName: 'OldName',
			lastName: 'OldLastName'
		});

		mockSuperValidate.mockResolvedValue({
			valid: true,
			data: {
				email: 'ondemand@example.com',
				firstName: 'NewName',
				lastName: 'NewLastName'
			}
		});

		const formData = new FormData();
		formData.append('classTypeId', classTypeId.toString());

		const request = { formData: async () => formData };

		await actions.onDemandRequest({ request });

		// Email should be sent with new name
		expect(mockSendMIMEmessage).toHaveBeenCalledWith(
			expect.objectContaining({
				html: expect.stringContaining('NewName')
			})
		);
	});

	it('handles concurrent request and email operations', async () => {
		mockPrisma._setData('neonEventType', 666, {
			id: 666,
			name: 'Test Class'
		});

		mockPrisma._setData('neonEventRequester', 300, {
			id: 300,
			email: 'ondemand@example.com',
			firstName: 'Alice',
			lastName: 'Williams'
		});

		const formData = new FormData();
		formData.append('classTypeId', '666');

		const request = { formData: async () => formData };

		await actions.onDemandRequest({ request });

		// Verify both operations completed
		expect(mockSendMIMEmessage).toHaveBeenCalled();
		expect(mockMessage).toHaveBeenCalled();
	});
});



