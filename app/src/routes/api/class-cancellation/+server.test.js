import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NeonWebhookMock, createMockPrisma } from '$tests/helpers/apiMocker.js';

// Create mock objects that will be used in the tests
let mockPrisma;
let mockSendMIMEmessage;

// Mock the postgres module
vi.mock('$lib/postgres.js', () => ({
	get prisma() {
		return mockPrisma;
	}
}));

// Mock secrets
vi.mock('$lib/server/secrets', () => ({
	INTERNAL_API_KEY: 'test-api-key'
}));

// Mock email sending
vi.mock('$lib/server/gmailEmailFactory', () => ({
	get sendMIMEmessage() {
		return mockSendMIMEmessage;
	}
}));

// Import after mocks are set up
const { POST } = await import('./+server.js');

describe('POST /api/class-cancellation', () => {
	beforeEach(() => {
		// Initialize mocks
		mockPrisma = createMockPrisma();
		mockSendMIMEmessage = vi.fn().mockResolvedValue({ success: true });

		// Clear mock data before each test
		mockPrisma._clearData();
		vi.clearAllMocks();
	});

	it('returns 401 when API key is missing', async () => {
		const request = {
			json: async () => ({
				customParameters: {},
				data: {}
			})
		};

		try {
			await POST({ request });
			expect.fail('Should have thrown an error');
		} catch (error) {
			expect(error.status).toBe(401);
		}
	});

	it('returns 401 when API key is invalid', async () => {
		const webhook = new NeonWebhookMock(123, 456, {
			apiKey: 'wrong-key',
			status: 'CANCELED'
		});
		const request = {
			json: async () => webhook.toRequest()
		};

		try {
			await POST({ request });
			expect.fail('Should have thrown an error');
		} catch (error) {
			expect(error.status).toBe(401);
		}
	});

	it('returns success without updating when status is not CANCELED or REFUNDED', async () => {
		const webhook = new NeonWebhookMock(123, 456, { status: 'SUCCEEDED' });
		const request = {
			json: async () => webhook.toRequest()
		};

		const response = await POST({ request });
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.updated).toBe(false);
	});

	it('decrements attendee count on cancellation', async () => {
		const eventId = 123;
		const neonId = 456;

		// Setup test data
		mockPrisma._setData('neonEventType', 1, {
			id: 1,
			name: 'Test Class',
			eventTypeId: 100
		});

		mockPrisma._setData('neonEventInstance', eventId, {
			eventId,
			eventTypeId: 1,
			attendeeCount: 5,
			capacity: 10,
			startDateTime: new Date('2026-03-01T10:00:00Z')
		});

		mockPrisma._setData('neonBaseRegLink', 'default', {
			url: 'https://example.com/register/'
		});

		const webhook = new NeonWebhookMock(eventId, neonId, { status: 'CANCELED' });
		const request = {
			json: async () => webhook.toRequest()
		};

		const response = await POST({ request });
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.updated).toBe(true);

		// Verify attendee count was decremented
		const updatedEvent = mockPrisma._getData('neonEventInstance', eventId);
		expect(updatedEvent.attendeeCount).toBe(4);
	});

	it('does not decrement if user already canceled', async () => {
		const eventId = 123;
		const neonId = 456;

		// Setup test data
		mockPrisma._setData('neonEventType', 1, {
			id: 1,
			name: 'Test Class',
			eventTypeId: 100
		});

		mockPrisma._setData('neonEventInstance', eventId, {
			eventId,
			eventTypeId: 1,
			attendeeCount: 5,
			capacity: 10,
			startDateTime: new Date('2026-03-01T10:00:00Z')
		});

		// User has already canceled
		mockPrisma._setData('neonEventInstanceCancellee', neonId, {
			neonId,
			eventInstanceCancellations: [{ eventId }]
		});

		const webhook = new NeonWebhookMock(eventId, neonId, { status: 'CANCELED' });
		const request = {
			json: async () => webhook.toRequest()
		};

		const response = await POST({ request });
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.updated).toBe(false);

		// Verify attendee count was NOT decremented
		const updatedEvent = mockPrisma._getData('neonEventInstance', eventId);
		expect(updatedEvent.attendeeCount).toBe(5);
	});

	it('sends notification emails to waitlist when seat opens', async () => {
		const eventId = 123;
		const neonId = 456;
		const requester1Id = 789;
		const requester2Id = 790;

		// Setup test data
		mockPrisma._setData('neonEventType', 1, {
			id: 1,
			name: 'Advanced Woodworking',
			eventTypeId: 100
		});

		mockPrisma._setData('neonEventInstance', eventId, {
			eventId,
			eventTypeId: 1,
			attendeeCount: 10,
			capacity: 10,
			startDateTime: new Date('2026-03-15T14:00:00Z')
		});

		mockPrisma._setData('neonEventInstanceRequest', requester1Id, {
			id: requester1Id,
			eventId,
			requesterId: requester1Id,
			fulfilled: false,
			requester: {
				id: requester1Id,
				email: 'waitlist1@example.com',
				firstName: 'Alice'
			}
		});

		mockPrisma._setData('neonEventInstanceRequest', requester2Id, {
			id: requester2Id,
			eventId,
			requesterId: requester2Id,
			fulfilled: false,
			requester: {
				id: requester2Id,
				email: 'waitlist2@example.com',
				firstName: 'Bob'
			}
		});

		mockPrisma._setData('neonBaseRegLink', 'default', {
			url: 'https://example.com/register/'
		});

		const webhook = new NeonWebhookMock(eventId, neonId, { status: 'CANCELED' });
		const request = {
			json: async () => webhook.toRequest()
		};

		const response = await POST({ request });
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.updated).toBe(true);

		// Verify emails were sent
		expect(mockSendMIMEmessage).toHaveBeenCalledTimes(2);

		// Check first email
		const firstCall = mockSendMIMEmessage.mock.calls[0][0];
		expect(firstCall.to).toBe('waitlist1@example.com');
		expect(firstCall.subject).toContain('Advanced Woodworking');
		expect(firstCall.html).toContain('Alice');
		expect(firstCall.html).toContain('https://example.com/register/123');

		// Check second email
		const secondCall = mockSendMIMEmessage.mock.calls[1][0];
		expect(secondCall.to).toBe('waitlist2@example.com');
		expect(secondCall.subject).toContain('Advanced Woodworking');
		expect(secondCall.html).toContain('Bob');

		// Verify requests were marked as fulfilled
		const request1 = mockPrisma._getData('neonEventInstanceRequest', requester1Id);
		const request2 = mockPrisma._getData('neonEventInstanceRequest', requester2Id);
		expect(request1.fulfilled).toBe(true);
		expect(request2.fulfilled).toBe(true);
	});

	it('handles refunded status same as canceled', async () => {
		const eventId = 123;
		const neonId = 456;

		// Setup test data
		mockPrisma._setData('neonEventType', 1, {
			id: 1,
			name: 'Test Class',
			eventTypeId: 100
		});

		mockPrisma._setData('neonEventInstance', eventId, {
			eventId,
			eventTypeId: 1,
			attendeeCount: 5,
			capacity: 10,
			startDateTime: new Date('2026-03-01T10:00:00Z')
		});

		mockPrisma._setData('neonBaseRegLink', 'default', {
			url: 'https://example.com/register/'
		});

		const webhook = new NeonWebhookMock(eventId, neonId, { status: 'REFUNDED' });
		const request = {
			json: async () => webhook.toRequest()
		};

		const response = await POST({ request });
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.updated).toBe(true);

		// Verify attendee count was decremented
		const updatedEvent = mockPrisma._getData('neonEventInstance', eventId);
		expect(updatedEvent.attendeeCount).toBe(4);
	});

	it('continues even if some emails fail', async () => {
		const eventId = 123;
		const neonId = 456;
		const requester1Id = 789;
		const requester2Id = 790;

		// Setup test data
		mockPrisma._setData('neonEventType', 1, {
			id: 1,
			name: 'Test Class',
			eventTypeId: 100
		});

		mockPrisma._setData('neonEventInstance', eventId, {
			eventId,
			eventTypeId: 1,
			attendeeCount: 10,
			capacity: 10,
			startDateTime: new Date('2026-03-15T14:00:00Z')
		});

		mockPrisma._setData('neonEventInstanceRequest', requester1Id, {
			id: requester1Id,
			eventId,
			requesterId: requester1Id,
			fulfilled: false,
			requester: {
				id: requester1Id,
				email: 'good@example.com',
				firstName: 'Alice'
			}
		});

		mockPrisma._setData('neonEventInstanceRequest', requester2Id, {
			id: requester2Id,
			eventId,
			requesterId: requester2Id,
			fulfilled: false,
			requester: {
				id: requester2Id,
				email: 'bad@example.com',
				firstName: 'Bob'
			}
		});

		mockPrisma._setData('neonBaseRegLink', 'default', {
			url: 'https://example.com/register/'
		});

		// Mock one email to fail - need to reinitialize the mock
		mockSendMIMEmessage = vi.fn()
			.mockResolvedValueOnce({ success: true })
			.mockRejectedValueOnce(new Error('Email failed'));

		const webhook = new NeonWebhookMock(eventId, neonId, { status: 'CANCELED' });
		const request = {
			json: async () => webhook.toRequest()
		};

		const response = await POST({ request });
		const data = await response.json();

		// Should still succeed
		expect(response.status).toBe(200);
		expect(data.updated).toBe(true);

		// Only the successful email should mark request as fulfilled
		const request1 = mockPrisma._getData('neonEventInstanceRequest', requester1Id);
		expect(request1.fulfilled).toBe(true);
	});
});





