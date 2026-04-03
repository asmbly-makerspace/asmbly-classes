import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockPrisma } from '$tests/helpers/apiMocker.js';

// Create mock objects
let mockPrisma;
let mockApiCall;
let mockSuperValidate;
let mockMessage;

// Mock the postgres module
vi.mock('$lib/postgres.js', () => ({
	get prisma() {
		return mockPrisma;
	}
}));

// Mock apiCall
vi.mock('$lib/server/apiCall.js', () => ({
	get apiCall() {
		return mockApiCall;
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

// Mock secrets
vi.mock('$lib/server/secrets', () => ({
	FLO_API_KEY: 'test-flo-api-key'
}));

// Import after mocks are set up
const { actions } = await import('./+page.server.js');

describe('POST /newsletter-signup', () => {
	beforeEach(() => {
		mockPrisma = createMockPrisma();
		mockApiCall = vi.fn();
		mockMessage = vi.fn((form, msg) => ({ ...form, message: msg }));

		// Default superValidate mock returns valid form
		mockSuperValidate = vi.fn(async (request, schema) => ({
			valid: true,
			data: {
				email: 'test@example.com'
			}
		}));

		vi.clearAllMocks();
	});

	it('successfully signs up newsletter subscriber', async () => {
		// Mock Flodesk API success
		mockApiCall.mockResolvedValue({ success: true });

		const request = {
			formData: async () => new FormData()
		};

		const result = await actions.newsletterSignup({ request });

		// Verify API was called with correct parameters
		expect(mockApiCall).toHaveBeenCalledTimes(1);
		expect(mockApiCall).toHaveBeenCalledWith(
			'POST',
			'https://api.flodesk.com/v1/subscribers',
			{ email: 'test@example.com' },
			expect.objectContaining({
				'Content-Type': 'application/json',
				Authorization: expect.stringContaining('Basic')
			})
		);

		// Verify success message
		expect(mockMessage).toHaveBeenCalledWith(
			expect.objectContaining({ valid: true }),
			{ text: 'Thanks! Keep an eye on your inbox for updates.' }
		);
	});

	it('returns message on form validation failure', async () => {
		// Mock invalid form
		mockSuperValidate.mockResolvedValue({
			valid: false,
			data: {},
			errors: { email: ['Invalid email'] }
		});

		const request = {
			formData: async () => new FormData()
		};

		const result = await actions.newsletterSignup({ request });

		// Verify API was not called
		expect(mockApiCall).not.toHaveBeenCalled();

		// Verify error message
		expect(mockMessage).toHaveBeenCalledWith(
			expect.objectContaining({ valid: false }),
			{ text: 'Form validation failed. Please try again.' }
		);
	});

	it('handles API call failure gracefully', async () => {
		// Mock Flodesk API failure
		mockApiCall.mockRejectedValue(new Error('API Error'));

		const request = {
			formData: async () => new FormData()
		};

		// Should throw or handle error
		await expect(actions.newsletterSignup({ request })).rejects.toThrow('API Error');
	});

	it('sends correct authorization header with API key', async () => {
		mockApiCall.mockResolvedValue({ success: true });

		const request = {
			formData: async () => new FormData()
		};

		await actions.newsletterSignup({ request });

		const authHeader = mockApiCall.mock.calls[0][3].Authorization;

		// Verify Basic auth header is properly formatted
		expect(authHeader).toMatch(/^Basic /);

		// Decode and verify it contains the API key
		const base64Part = authHeader.replace('Basic ', '');
		const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');
		expect(decoded).toContain('test-flo-api-key');
	});

	it('handles different email formats', async () => {
		mockApiCall.mockResolvedValue({ success: true });

		const emails = [
			'user@example.com',
			'user+tag@example.com',
			'user.name@subdomain.example.com'
		];

		for (const email of emails) {
			mockSuperValidate.mockResolvedValue({
				valid: true,
				data: { email }
			});

			const request = {
				formData: async () => new FormData()
			};

			await actions.newsletterSignup({ request });

			expect(mockApiCall).toHaveBeenCalledWith(
				'POST',
				expect.any(String),
				{ email },
				expect.any(Object)
			);
		}
	});
});

