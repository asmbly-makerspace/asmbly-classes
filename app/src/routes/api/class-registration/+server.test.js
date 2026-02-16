import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockFetch, assertCallHistory, NeonAccountMock, NeonWebhookMock, createMockPrisma } from '$tests/helpers/apiMocker.js';

// Create mock objects that will be used in the tests
let mockPrisma;
let mockFetch;

// Mock the postgres module
vi.mock('$lib/postgres.js', () => ({
	get prisma() {
		return mockPrisma;
	}
}));

// Mock secrets
vi.mock('$lib/server/secrets', () => ({
	INTERNAL_API_KEY: 'test-api-key',
	NEON_API_KEY: 'neon-test-key',
	NEON_API_USER: 'neon-test-user'
}));

// Mock apiCall to use our mock fetch
vi.mock('$lib/server/apiCall.js', () => ({
	get apiCall() {
		return async (method, url, data, headers) => {
			const options = {
				method,
				headers,
				body: data ? JSON.stringify(data) : undefined
			};
			const response = await mockFetch(url, options);
			return response.json();
		};
	}
}));

// Import after mocks are set up
const { POST } = await import('./+server.js');

describe('POST /api/class-registration', () => {
	beforeEach(() => {
		// Initialize mocks
		mockPrisma = createMockPrisma();
		mockFetch = createMockFetch();

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
		const webhook = new NeonWebhookMock(123, 456, { apiKey: 'wrong-key' });
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

	it('returns success without updating when registration status is not SUCCEEDED', async () => {
		const webhook = new NeonWebhookMock(123, 456, { status: 'PENDING' });
		const request = {
			json: async () => webhook.toRequest()
		};

		const response = await POST({ request });
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.updated).toBe(false);
	});

	it('increments attendee count on successful registration', async () => {
		const eventId = 123;
		const registrantId = 456;

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

		const webhook = new NeonWebhookMock(eventId, registrantId);
		const request = {
			json: async () => webhook.toRequest()
		};

		const response = await POST({ request });
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.success).toBe(true);

		// Verify attendee count was incremented
		const updatedEvent = mockPrisma._getData('neonEventInstance', eventId);
		expect(updatedEvent.attendeeCount).toBe(6);
	});

	it('fulfills request when registrant is on the waitlist', async () => {
		const eventId = 123;
		const registrantId = 456;
		const requesterId = 789;
		const registrantEmail = 'test@example.com';

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

		mockPrisma._setData('neonEventInstanceRequest', requesterId, {
			id: requesterId,
			eventId,
			requesterId,
			fulfilled: false,
			requester: {
				id: requesterId,
				email: registrantEmail,
				firstName: 'Test'
			}
		});

		// Mock the Neon API to return the registrant info
		const neonAccount = new NeonAccountMock(registrantId, { email: registrantEmail });

		// Setup mock fetch for Neon API
		mockFetch.addMock(
			`/v2/accounts/${registrantId}`,
			neonAccount.toNeonResponse(),
			200
		);

		const webhook = new NeonWebhookMock(eventId, registrantId);
		const request = {
			json: async () => webhook.toRequest()
		};

		const response = await POST({ request });
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.success).toBe(true);

		// Verify request was fulfilled
		const updatedRequest = mockPrisma._getData('neonEventInstanceRequest', requesterId);
		expect(updatedRequest.fulfilled).toBe(true);
	});

	it('does not fulfill request when registrant email does not match', async () => {
		const eventId = 123;
		const registrantId = 456;
		const requesterId = 789;

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

		mockPrisma._setData('neonEventInstanceRequest', requesterId, {
			id: requesterId,
			eventId,
			requesterId,
			fulfilled: false,
			requester: {
				id: requesterId,
				email: 'different@example.com',
				firstName: 'Different'
			}
		});

		// Mock the Neon API to return a different registrant
		const neonAccount = new NeonAccountMock(registrantId, { email: 'registrant@example.com' });

		mockFetch.addMock(
			`/v2/accounts/${registrantId}`,
			neonAccount.toNeonResponse(),
			200
		);

		const webhook = new NeonWebhookMock(eventId, registrantId);
		const request = {
			json: async () => webhook.toRequest()
		};

		const response = await POST({ request });
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.success).toBe(true);

		// Verify request was NOT fulfilled
		const updatedRequest = mockPrisma._getData('neonEventInstanceRequest', requesterId);
		expect(updatedRequest.fulfilled).toBe(false);
	});
});







