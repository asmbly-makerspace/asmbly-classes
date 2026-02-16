/**
 * Test helper utilities for mocking API calls
 * Following the pattern from NeonIntegrations repo - mock only network, not business logic
 */

/**
 * Creates a mock fetch function that can be used to mock network requests
 * @param {Map<string, {response: any, status: number}>} mockResponses - Map of URL patterns to mock responses
 * @returns {Function} Mock fetch function
 */
export function createMockFetch(mockResponses = new Map()) {
	const calls = [];

	const mockFetch = async (url, options = {}) => {
		const call = {
			url,
			method: options.method || 'GET',
			body: options.body ? JSON.parse(options.body) : null,
			headers: options.headers || {}
		};
		calls.push(call);

		// Find matching mock response
		for (const [pattern, mockData] of mockResponses.entries()) {
			if (url.includes(pattern) || url.match(new RegExp(pattern))) {
				const response = {
					ok: mockData.status >= 200 && mockData.status < 300,
					status: mockData.status || 200,
					json: async () => mockData.response,
					text: async () => JSON.stringify(mockData.response)
				};
				return response;
			}
		}

		// Default response if no mock found
		return {
			ok: false,
			status: 404,
			json: async () => ({ error: 'Not found' }),
			text: async () => 'Not found'
		};
	};

	mockFetch.calls = calls;
	mockFetch.addMock = (pattern, response, status = 200) => {
		mockResponses.set(pattern, { response, status });
	};

	return mockFetch;
}

/**
 * Helper to assert the history of API calls
 * @param {Array} calls - Array of calls made
 * @param {Array<{method: string, url: string}>} expected - Expected calls
 */
export function assertCallHistory(calls, expected) {
	if (calls.length !== expected.length) {
		throw new Error(
			`Expected ${expected.length} calls but got ${calls.length}\n` +
			`Expected: ${JSON.stringify(expected, null, 2)}\n` +
			`Got: ${JSON.stringify(calls.map(c => ({ method: c.method, url: c.url })), null, 2)}`
		);
	}

	for (let i = 0; i < expected.length; i++) {
		const actualCall = calls[i];
		const expectedCall = expected[i];

		if (actualCall.method !== expectedCall.method) {
			throw new Error(
				`Call ${i}: Expected method ${expectedCall.method} but got ${actualCall.method}`
			);
		}

		// Check if URL matches (can be exact or pattern)
		const urlMatches = actualCall.url === expectedCall.url ||
			actualCall.url.includes(expectedCall.url) ||
			actualCall.url.match(new RegExp(expectedCall.url));

		if (!urlMatches) {
			throw new Error(
				`Call ${i}: Expected URL matching ${expectedCall.url} but got ${actualCall.url}`
			);
		}
	}
}

/**
 * Creates a mock Neon API account response
 */
export class NeonAccountMock {
	constructor(accountId, options = {}) {
		this.accountId = accountId;
		this.firstName = options.firstName || 'Test';
		this.lastName = options.lastName || 'User';
		this.email = options.email || `test${accountId}@example.com`;
		this.primaryContact = {
			email1: this.email,
			firstName: this.firstName,
			lastName: this.lastName
		};
	}

	toNeonResponse() {
		return {
			individualAccount: {
				accountId: this.accountId,
				primaryContact: this.primaryContact
			}
		};
	}
}

/**
 * Creates a mock webhook request from Neon
 */
export class NeonWebhookMock {
	constructor(eventId, registrantAccountId, options = {}) {
		this.eventId = eventId;
		this.registrantAccountId = registrantAccountId;
		this.status = options.status || 'SUCCEEDED';
		this.apiKey = options.apiKey || 'test-api-key';
	}

	toRequest() {
		return {
			customParameters: {
				apiKey: this.apiKey
			},
			data: {
				eventId: this.eventId.toString(),
				registrantAccountId: this.registrantAccountId.toString(),
				tickets: [
					{
						attendees: [
							{
								registrationStatus: this.status
							}
						]
					}
				]
			}
		};
	}
}

/**
 * Helper to create mock Prisma client for testing
 * This is a minimal implementation - extend as needed
 */
export function createMockPrisma() {
	const data = {
		neonEventInstance: new Map(),
		neonEventType: new Map(),
		neonEventInstanceRequest: new Map(),
		neonEventInstanceCancellee: new Map(),
		neonBaseRegLink: new Map(),
		neonEventRequester: new Map(),
		neonEventTypeRequest: new Map()
	};

	const prisma = {
		// Existing neonEventInstance methods
		neonEventInstance: {
			findUnique: async ({ where, include }) => {
				const instance = data.neonEventInstance.get(where.eventId);
				if (!instance) return null;

				const result = { ...instance };

				if (include?.eventType) {
					result.eventType = data.neonEventType.get(instance.eventTypeId);
				}

				if (include?.requests) {
					result.requests = Array.from(data.neonEventInstanceRequest.values())
						.filter(r => r.eventId === where.eventId);
					if (include.requests.where?.fulfilled !== undefined) {
						result.requests = result.requests.filter(
							r => r.fulfilled === include.requests.where.fulfilled
						);
					}
				}

				if (include?.cancellees) {
					result.cancellees = Array.from(data.neonEventInstanceCancellee.values())
						.filter(c => c.eventInstanceCancellations?.some(e => e.eventId === where.eventId));
					if (include.cancellees.where?.neonId !== undefined) {
						result.cancellees = result.cancellees.filter(
							c => c.neonId === include.cancellees.where.neonId
						);
					}
				}

				return result;
			},
			findFirst: async ({ where, orderBy, include }) => {
				const instances = Array.from(data.neonEventInstance.values())
					.filter(instance => {
						if (where?.eventTypeId && instance.eventTypeId !== where.eventTypeId) {
							return false;
						}
						if (where?.category?.isNot?.name && instance.category?.name === where.category.isNot.name) {
							return false;
						}
						return true;
					});

				if (instances.length === 0) return null;

				// Sort by orderBy if provided
				if (orderBy?.startDateTime === 'asc') {
					instances.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
				}

				const instance = instances[0];
				const result = { ...instance };

				if (include?.teacher) {
					result.teacher = instance.teacher || null;
				}
				if (include?.category) {
					result.category = instance.category || null;
				}

				return result;
			},
			update: async ({ where, data: updateData, include }) => {
				const instance = data.neonEventInstance.get(where.eventId);
				if (!instance) throw new Error('Event instance not found');

				if (updateData.attendeeCount?.increment) {
					instance.attendeeCount += updateData.attendeeCount.increment;
				}
				if (updateData.attendeeCount?.decrement) {
					instance.attendeeCount -= updateData.attendeeCount.decrement;
				}

				const result = { ...instance };

				if (include?.eventType) {
					result.eventType = data.neonEventType.get(instance.eventTypeId);
				}

				if (include?.requests) {
					result.requests = Array.from(data.neonEventInstanceRequest.values())
						.filter(r => r.eventId === where.eventId);
					if (include.requests.where?.fulfilled !== undefined) {
						result.requests = result.requests.filter(
							r => r.fulfilled === include.requests.where.fulfilled
						);
					}
				}

				return result;
			}
		},
		// Existing and extended neonEventType methods
		neonEventType: {
			findUnique: async ({ where, include }) => {
				const eventType = data.neonEventType.get(where.id);
				if (!eventType) return null;

				const result = { ...eventType };

				if (include?.category) {
					result.category = eventType.category || null;
				}

				if (include?.instances) {
					let instances = eventType.instances || [];

					// Apply where filters
					if (include.instances.where) {
						instances = instances.filter(inst => {
							if (include.instances.where.startDateTime?.gte) {
								if (new Date(inst.startDateTime) < new Date(include.instances.where.startDateTime.gte)) {
									return false;
								}
							}
							if (include.instances.where.category?.isNot?.name) {
								if (inst.category?.name === include.instances.where.category.isNot.name) {
									return false;
								}
							}
							return true;
						});
					}

					// Apply orderBy
					if (include.instances.orderBy?.startDateTime === 'asc') {
						instances.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
					}

					result.instances = instances;
				}

				return result;
			}
		},
		// NeonEventType alias (capitalized)
		get NeonEventType() {
			return this.neonEventType;
		},
		// Existing neonEventInstanceRequest methods
		neonEventInstanceRequest: {
			update: async ({ where, data: updateData }) => {
				const key = `${where.eventInstanceRequest.eventId}-${where.eventInstanceRequest.requesterId}`;
				const request = Array.from(data.neonEventInstanceRequest.values())
					.find(r => r.eventId === where.eventInstanceRequest.eventId &&
					           r.requesterId === where.eventInstanceRequest.requesterId);

				if (!request) throw new Error('Request not found');

				Object.assign(request, updateData);
				return request;
			},
			updateMany: async ({ where, data: updateData }) => {
				let count = 0;
				for (const request of data.neonEventInstanceRequest.values()) {
					if (where.id?.in?.includes(request.id)) {
						Object.assign(request, updateData);
						count++;
					}
				}
				return { count };
			},
			upsert: async ({ where, create, update }) => {
				const existing = Array.from(data.neonEventInstanceRequest.values())
					.find(r =>
						r.eventId === where.eventInstanceRequest.eventId &&
						r.requesterId === where.eventInstanceRequest.requesterId
					);

				if (existing) {
					Object.assign(existing, update);
					return existing;
				} else {
					const newRequest = {
						eventId: create.eventInstance?.connect?.eventId,
						requesterId: create.requester?.connect?.id,
						fulfilled: false,
						createdAt: new Date(),
						...create
					};
					const id = newRequest.requesterId || Math.random();
					data.neonEventInstanceRequest.set(id, newRequest);
					return newRequest;
				}
			}
		},
		// NeonEventInstanceRequest alias (capitalized)
		get NeonEventInstanceRequest() {
			return this.neonEventInstanceRequest;
		},
		// Existing neonEventInstanceCancellee methods
		neonEventInstanceCancellee: {
			upsert: async ({ where, create, update }) => {
				let cancellee = Array.from(data.neonEventInstanceCancellee.values())
					.find(c => c.neonId === where.neonId);

				if (cancellee) {
					// Update
					if (update.eventInstanceCancellations?.connect) {
						if (!cancellee.eventInstanceCancellations) {
							cancellee.eventInstanceCancellations = [];
						}
						cancellee.eventInstanceCancellations.push(update.eventInstanceCancellations.connect);
					}
				} else {
					// Create
					cancellee = {
						neonId: create.neonId,
						eventInstanceCancellations: create.eventInstanceCancellations?.connect
							? [create.eventInstanceCancellations.connect]
							: []
					};
					data.neonEventInstanceCancellee.set(where.neonId, cancellee);
				}

				return cancellee;
			}
		},
		// Existing neonBaseRegLink methods
		neonBaseRegLink: {
			findFirst: async (options = {}) => {
				const { select } = options;
				const link = Array.from(data.neonBaseRegLink.values())[0];
				if (!link) return null;
				return select ? { url: link.url } : link;
			}
		},
		// NeonBaseRegLink alias (capitalized)
		get NeonBaseRegLink() {
			return this.neonBaseRegLink;
		},
		// NeonEventInstance alias (capitalized)
		get NeonEventInstance() {
			return this.neonEventInstance;
		},
		// New neonEventRequester methods
		neonEventRequester: {
			upsert: async ({ where, create, update }) => {
				let requester = Array.from(data.neonEventRequester.values())
					.find(r => r.email === where.email);

				if (requester) {
					Object.assign(requester, update);
				} else {
					requester = { id: Math.floor(Math.random() * 10000), ...create };
					data.neonEventRequester.set(requester.id, requester);
				}

				return requester;
			}
		},
		// NeonEventRequester alias (capitalized)
		get NeonEventRequester() {
			return this.neonEventRequester;
		},
		// New neonEventTypeRequest methods
		neonEventTypeRequest: {
			upsert: async ({ where, create, update }) => {
				const existing = Array.from(data.neonEventTypeRequest.values())
					.find(r =>
						r.requestType === where.eventTypeRequest.requestType &&
						r.classTypeId === where.eventTypeRequest.classTypeId &&
						r.requesterId === where.eventTypeRequest.requesterId
					);

				if (existing) {
					Object.assign(existing, update);
					return existing;
				} else {
					const newRequest = {
						id: Math.floor(Math.random() * 10000),
						requestType: create.requestType,
						classTypeId: create.classType?.connect?.id,
						requesterId: create.requester?.connect?.id,
						fulfilled: false,
						createdAt: new Date(),
						...create
					};
					data.neonEventTypeRequest.set(newRequest.id, newRequest);
					return newRequest;
				}
			}
		},
		// NeonEventTypeRequest alias (capitalized)
		get NeonEventTypeRequest() {
			return this.neonEventTypeRequest;
		},
		$transaction: async (operations) => {
			const results = [];
			for (const op of operations) {
				results.push(await op);
			}
			return results;
		},
		// Helper methods for test setup
		_setData: (table, key, value) => {
			data[table].set(key, value);
		},
		_getData: (table, key) => {
			return data[table].get(key);
		},
		_clearData: () => {
			for (const table in data) {
				data[table].clear();
			}
		}
	};

	return prisma;
}

