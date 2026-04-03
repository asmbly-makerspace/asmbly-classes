import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockFetch } from '$tests/helpers/apiMocker.js';

// Mock objects
let mockApiCall;

// Mock the apiCall module
vi.mock('$lib/server/apiCall.js', () => ({
	get apiCall() {
		return mockApiCall;
	}
}));

// Mock secrets
vi.mock('$lib/server/secrets', () => ({
	NEON_API_KEY: 'test-neon-api-key',
	NEON_API_USER: 'test-neon-user'
}));

// Import after mocks
const { getIndividualAccount, getCurrentEvents, getUserRegistrations, postEventSearch } = await import('./neonHelpers.js');

describe('neonHelpers', () => {
	beforeEach(() => {
		mockApiCall = vi.fn();
		vi.clearAllMocks();
	});

	describe('getIndividualAccount', () => {
		it('fetches individual account by Neon ID', async () => {
			const neonId = 12345;
			const mockResponse = {
				individualAccount: {
					accountId: neonId,
					primaryContact: {
						email1: 'test@example.com',
						firstName: 'John',
						lastName: 'Doe'
					}
				}
			};

			mockApiCall.mockResolvedValue(mockResponse);

			const result = await getIndividualAccount(neonId);

			expect(mockApiCall).toHaveBeenCalledTimes(1);
			expect(mockApiCall).toHaveBeenCalledWith(
				'GET',
				`https://api.neoncrm.com/v2/accounts/${neonId}`,
				null,
				expect.objectContaining({
					'Content-Type': 'application/json',
					Authorization: expect.stringContaining('Basic')
				})
			);
			expect(result).toEqual(mockResponse);
		});

		it('uses correct authorization header format', async () => {
			const neonId = 12345;
			mockApiCall.mockResolvedValue({});

			await getIndividualAccount(neonId);

			const authHeader = mockApiCall.mock.calls[0][3].Authorization;
			expect(authHeader).toMatch(/^Basic /);

			// Decode and verify it contains the credentials
			const base64Part = authHeader.replace('Basic ', '');
			const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');
			expect(decoded).toBe('test-neon-user:test-neon-api-key');
		});

		it('handles API errors gracefully', async () => {
			const neonId = 12345;
			mockApiCall.mockRejectedValue(new Error('API Error'));

			await expect(getIndividualAccount(neonId)).rejects.toThrow('API Error');
		});
	});

	describe('getUserRegistrations', () => {
		it('fetches user registrations by Neon ID', async () => {
			const neonId = 12345;
			const mockResponse = {
				eventRegistrations: [
					{
						eventId: 789,
						registrationDate: '2026-01-15',
						tickets: [{ attendees: [{ registrationStatus: 'SUCCEEDED' }] }]
					}
				]
			};

			mockApiCall.mockResolvedValue(mockResponse);

			const result = await getUserRegistrations(neonId);

			expect(mockApiCall).toHaveBeenCalledWith(
				'GET',
				`https://api.neoncrm.com/v2/accounts/${neonId}/eventRegistrations`,
				{ pageSize: 100 },
				expect.objectContaining({
					'Content-Type': 'application/json',
					Authorization: expect.stringContaining('Basic')
				})
			);
			expect(result).toEqual(mockResponse);
		});

		it('uses pageSize parameter correctly', async () => {
			const neonId = 12345;
			mockApiCall.mockResolvedValue({ eventRegistrations: [] });

			await getUserRegistrations(neonId);

			const params = mockApiCall.mock.calls[0][2];
			expect(params.pageSize).toBe(100);
		});
	});

	describe('postEventSearch', () => {
		it('yields paginated search results', async () => {
			const searchFields = [
				{ field: 'Event Name', operator: 'EQUAL', value: 'Test Event' }
			];
			const outputFields = ['Event Name', 'Event ID'];

			// Mock responses for pagination
			const page0Response = {
				searchResults: [{ 'Event Name': 'Test Event 1', 'Event ID': 1 }],
				pagination: { currentPage: 0, totalPages: 2, pageSize: 200 }
			};
			const page1Response = {
				searchResults: [{ 'Event Name': 'Test Event 2', 'Event ID': 2 }],
				pagination: { currentPage: 1, totalPages: 2, pageSize: 200 }
			};
			const page2Response = {
				searchResults: [],
				pagination: { currentPage: 2, totalPages: 2, pageSize: 200 }
			};

			mockApiCall
				.mockResolvedValueOnce(page0Response)
				.mockResolvedValueOnce(page1Response)
				.mockResolvedValueOnce(page2Response);

			const generator = postEventSearch(searchFields, outputFields);
			const results = [];

			// Manually control iteration to avoid infinite loop
			let iteration = 0;
			for await (const result of generator) {
				results.push(result);
				iteration++;
				// Break after consuming the mocked responses
				if (iteration >= 3) break;
			}

			// Should get 3 pages (0, 1, and break on 2)
			expect(results.length).toBe(3);
			expect(results[0].searchResults[0]['Event ID']).toBe(1);
			expect(results[1].searchResults[0]['Event ID']).toBe(2);

			// Verify API calls
			expect(mockApiCall).toHaveBeenCalledTimes(3);

			// Check first call
			const firstCallData = mockApiCall.mock.calls[0][2];
			expect(firstCallData.searchFields).toEqual(searchFields);
			expect(firstCallData.outputFields).toEqual(outputFields);
			expect(firstCallData.pagination.currentPage).toBe(0);
			expect(firstCallData.pagination.pageSize).toBe(200);
		});

		it('increments page number with each call', async () => {
			const searchFields = [];
			const outputFields = [];

			mockApiCall
				.mockResolvedValueOnce({
					searchResults: [],
					pagination: { currentPage: 0, totalPages: 3, pageSize: 200 }
				})
				.mockResolvedValueOnce({
					searchResults: [],
					pagination: { currentPage: 1, totalPages: 3, pageSize: 200 }
				})
				.mockResolvedValueOnce({
					searchResults: [],
					pagination: { currentPage: 2, totalPages: 3, pageSize: 200 }
				})
				.mockResolvedValueOnce({
					searchResults: [],
					pagination: { currentPage: 3, totalPages: 3, pageSize: 200 }
				});

			const generator = postEventSearch(searchFields, outputFields);
			const results = [];

			// Limit iterations to match mocked responses
			let iteration = 0;
			for await (const result of generator) {
				results.push(result);
				iteration++;
				if (iteration >= 4) break;
			}

			// Check page numbers
			expect(mockApiCall.mock.calls[0][2].pagination.currentPage).toBe(0);
			expect(mockApiCall.mock.calls[1][2].pagination.currentPage).toBe(1);
			expect(mockApiCall.mock.calls[2][2].pagination.currentPage).toBe(2);
		});
	});

	describe('getCurrentEvents', () => {
		it('fetches current and future events', async () => {
			const mockSearchResponse = {
				searchResults: [
					{
						'Event Name': 'Future Event',
						'Event ID': 123,
						'Event Start Date': '2026-03-01',
						'Event Capacity': 10,
						'Registrants': 5,
						'Event Registration Attendee Count': 5
					}
				],
				pagination: { currentPage: 0, totalPages: 1, pageSize: 200 }
			};

			// Use mockResolvedValueOnce twice - once for data, once for the break check
			mockApiCall
				.mockResolvedValueOnce(mockSearchResponse)
				.mockResolvedValueOnce({
					searchResults: [],
					pagination: { currentPage: 1, totalPages: 1, pageSize: 200 }
				});

			const result = await getCurrentEvents();

			// Verify search fields include date filter
			const searchCall = mockApiCall.mock.calls[0];
			const searchFields = searchCall[2].searchFields;

			expect(searchFields).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						field: 'Event End Date',
						operator: 'GREATER_AND_EQUAL'
					}),
					expect.objectContaining({
						field: 'Event Archived',
						operator: 'EQUAL',
						value: 'No'
					})
				])
			);

			expect(result).toHaveLength(1);
			expect(result[0]['Event Name']).toBe('Future Event');
			expect(result[0]['Actual Registrants']).toBe(5); // Number when counts match
		});

		it('fetches actual attendee count when mismatch detected', async () => {
			const mockSearchResponse = {
				searchResults: [
					{
						'Event Name': 'Test Event',
						'Event ID': 456,
						'Registrants': 10,
						'Event Registration Attendee Count': 8 // Mismatch
					}
				],
				pagination: { currentPage: 0, totalPages: 1, pageSize: 200 }
			};

			const mockRegistrationsResponse = {
				eventRegistrations: [
					{
						tickets: [
							{
								attendees: [
									{ registrationStatus: 'SUCCEEDED' },
									{ registrationStatus: 'SUCCEEDED' }
								]
							}
						]
					},
					{
						tickets: [
							{
								attendees: [
									{ registrationStatus: 'SUCCEEDED' }
								]
							}
						]
					}
				]
			};

			mockApiCall
				.mockResolvedValueOnce(mockSearchResponse)
				.mockResolvedValueOnce(mockRegistrationsResponse)
				.mockResolvedValueOnce({
					searchResults: [],
					pagination: { currentPage: 1, totalPages: 1, pageSize: 200 }
				});

			const result = await getCurrentEvents();

			// Should have called getActualAttendees (3 calls total: search page 0, getActualAttendees, search page 1 break)
			expect(mockApiCall).toHaveBeenCalledTimes(3);
			expect(mockApiCall.mock.calls[1][0]).toBe('GET');
			expect(mockApiCall.mock.calls[1][1]).toContain('/events/456/eventRegistrations');

			expect(result[0]['Actual Registrants']).toBe('3');
		});

		it('uses Registrants when counts match', async () => {
			const mockSearchResponse = {
				searchResults: [
					{
						'Event Name': 'Test Event',
						'Event ID': 789,
						'Registrants': 5,
						'Event Registration Attendee Count': 5 // Match
					}
				],
				pagination: { currentPage: 0, totalPages: 1, pageSize: 200 }
			};

			mockApiCall
				.mockResolvedValueOnce(mockSearchResponse)
				.mockResolvedValueOnce({
					searchResults: [],
					pagination: { currentPage: 1, totalPages: 1, pageSize: 200 }
				});

			const result = await getCurrentEvents();

			// Should NOT call getActualAttendees (only 2 calls: search page 0, search page 1 break)
			expect(mockApiCall).toHaveBeenCalledTimes(2);
			expect(result[0]['Actual Registrants']).toBe(5); // Number when counts match
		});

		it('handles empty event list', async () => {
			mockApiCall
				.mockResolvedValueOnce({
					searchResults: [],
					pagination: { currentPage: 0, totalPages: 1, pageSize: 200 }
				})
				.mockResolvedValueOnce({
					searchResults: [],
					pagination: { currentPage: 1, totalPages: 1, pageSize: 200 }
				});

			const result = await getCurrentEvents();

			expect(result).toEqual([]);
		});

		it('counts only SUCCEEDED registrations', async () => {
			const mockSearchResponse = {
				searchResults: [
					{
						'Event ID': 999,
						'Registrants': 5,
						'Event Registration Attendee Count': 3
					}
				],
				pagination: { currentPage: 0, totalPages: 1, pageSize: 200 }
			};

			const mockRegistrationsResponse = {
				eventRegistrations: [
					{
						tickets: [
							{
								attendees: [
									{ registrationStatus: 'SUCCEEDED' },
									{ registrationStatus: 'CANCELED' },
									{ registrationStatus: 'SUCCEEDED' }
								]
							}
						]
					}
				]
			};

			mockApiCall
				.mockResolvedValueOnce(mockSearchResponse)
				.mockResolvedValueOnce(mockRegistrationsResponse)
				.mockResolvedValueOnce({
					searchResults: [],
					pagination: { currentPage: 1, totalPages: 1, pageSize: 200 }
				});

			const result = await getCurrentEvents();

			// Should count only SUCCEEDED (2 out of 3)
			expect(result[0]['Actual Registrants']).toBe('2');
		});

		it('counts SUCCEEDED across multiple registrations', async () => {
			const mockSearchResponse = {
				searchResults: [
					{
						'Event ID': 888,
						'Registrants': 10,
						'Event Registration Attendee Count': 5
					}
				],
				pagination: { currentPage: 0, totalPages: 1, pageSize: 200 }
			};

			const mockRegistrationsResponse = {
				eventRegistrations: [
					{
						tickets: [
							{
								attendees: [
									{ registrationStatus: 'SUCCEEDED' },
									{ registrationStatus: 'SUCCEEDED' }
								]
							}
						]
					},
					{
						tickets: [
							{
								attendees: [
									{ registrationStatus: 'CANCELED' }
								]
							}
						]
					},
					{
						tickets: [
							{
								attendees: [
									{ registrationStatus: 'SUCCEEDED' },
									{ registrationStatus: 'REFUNDED' },
									{ registrationStatus: 'SUCCEEDED' }
								]
							}
						]
					}
				]
			};

			mockApiCall
				.mockResolvedValueOnce(mockSearchResponse)
				.mockResolvedValueOnce(mockRegistrationsResponse)
				.mockResolvedValueOnce({
					searchResults: [],
					pagination: { currentPage: 1, totalPages: 1, pageSize: 200 }
				});

			const result = await getCurrentEvents();

			// 2 + 0 + 2 = 4 SUCCEEDED
			expect(result[0]['Actual Registrants']).toBe('4');
		});

		it('handles all CANCELED registrations', async () => {
			const mockSearchResponse = {
				searchResults: [
					{
						'Event ID': 777,
						'Registrants': 3,
						'Event Registration Attendee Count': 0
					}
				],
				pagination: { currentPage: 0, totalPages: 1, pageSize: 200 }
			};

			const mockRegistrationsResponse = {
				eventRegistrations: [
					{
						tickets: [
							{
								attendees: [
									{ registrationStatus: 'CANCELED' },
									{ registrationStatus: 'REFUNDED' }
								]
							}
						]
					}
				]
			};

			mockApiCall
				.mockResolvedValueOnce(mockSearchResponse)
				.mockResolvedValueOnce(mockRegistrationsResponse)
				.mockResolvedValueOnce({
					searchResults: [],
					pagination: { currentPage: 1, totalPages: 1, pageSize: 200 }
				});

			const result = await getCurrentEvents();

			expect(result[0]['Actual Registrants']).toBe('0');
		});

		it('handles all SUCCEEDED registrations', async () => {
			const mockSearchResponse = {
				searchResults: [
					{
						'Event ID': 666,
						'Registrants': 5,
						'Event Registration Attendee Count': 3
					}
				],
				pagination: { currentPage: 0, totalPages: 1, pageSize: 200 }
			};

			const mockRegistrationsResponse = {
				eventRegistrations: [
					{
						tickets: [
							{
								attendees: [
									{ registrationStatus: 'SUCCEEDED' },
									{ registrationStatus: 'SUCCEEDED' },
									{ registrationStatus: 'SUCCEEDED' }
								]
							}
						]
					}
				]
			};

			mockApiCall
				.mockResolvedValueOnce(mockSearchResponse)
				.mockResolvedValueOnce(mockRegistrationsResponse)
				.mockResolvedValueOnce({
					searchResults: [],
					pagination: { currentPage: 1, totalPages: 1, pageSize: 200 }
				});

			const result = await getCurrentEvents();

			expect(result[0]['Actual Registrants']).toBe('3');
		});

		it('handles single attendee registrations with different statuses', async () => {
			const mockSearchResponse = {
				searchResults: [
					{
						'Event ID': 555,
						'Registrants': 4,
						'Event Registration Attendee Count': 2
					}
				],
				pagination: { currentPage: 0, totalPages: 1, pageSize: 200 }
			};

			const mockRegistrationsResponse = {
				eventRegistrations: [
					{ tickets: [{ attendees: [{ registrationStatus: 'SUCCEEDED' }] }] },
					{ tickets: [{ attendees: [{ registrationStatus: 'CANCELED' }] }] },
					{ tickets: [{ attendees: [{ registrationStatus: 'SUCCEEDED' }] }] },
					{ tickets: [{ attendees: [{ registrationStatus: 'REFUNDED' }] }] }
				]
			};

			mockApiCall
				.mockResolvedValueOnce(mockSearchResponse)
				.mockResolvedValueOnce(mockRegistrationsResponse)
				.mockResolvedValueOnce({
					searchResults: [],
					pagination: { currentPage: 1, totalPages: 1, pageSize: 200 }
				});

			const result = await getCurrentEvents();

			expect(result[0]['Actual Registrants']).toBe('2');
		});

		it('handles null event registrations', async () => {
			const mockSearchResponse = {
				searchResults: [
					{
						'Event ID': 111,
						'Registrants': 5,
						'Event Registration Attendee Count': 0
					}
				],
				pagination: { currentPage: 0, totalPages: 1, pageSize: 200 }
			};

			mockApiCall
				.mockResolvedValueOnce(mockSearchResponse)
				.mockResolvedValueOnce({ eventRegistrations: null })
				.mockResolvedValueOnce({
					searchResults: [],
					pagination: { currentPage: 1, totalPages: 1, pageSize: 200 }
				});

			const result = await getCurrentEvents();

			expect(result[0]['Actual Registrants']).toBe('0');
		});
	});
});


















