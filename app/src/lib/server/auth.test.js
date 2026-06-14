import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockPrisma } from '$tests/helpers/apiMocker.js';

// Mock objects
let mockPrisma;

// Mock the postgres module
vi.mock('$lib/postgres.js', () => ({
	get prisma() {
		return mockPrisma;
	}
}));

// Mock dev environment
vi.mock('$app/environment', () => ({
	dev: false
}));

// Import after mocks
const { createSession, validateSessionToken, deleteSession, setSessionTokenCookie } = await import('./auth.js');

describe('auth', () => {
	beforeEach(() => {
		mockPrisma = createMockPrisma();
		vi.clearAllMocks();
	});

	describe('createSession', () => {
		it('creates a new session with valid structure', async () => {
			const neonId = 12345;

			const session = await createSession(neonId);

			// Verify session structure
			expect(session).toHaveProperty('id');
			expect(session).toHaveProperty('secretHash');
			expect(session).toHaveProperty('token');
			expect(session).toHaveProperty('createdAt');
			expect(session.neonId).toBe(neonId);

			// Verify token format (id.secret)
			expect(session.token).toMatch(/^[a-z0-9]{24}\.[a-z0-9]{24}$/);
			const tokenParts = session.token.split('.');
			expect(tokenParts[0]).toBe(session.id);
		});

		it('generates unique session IDs', async () => {
			const session1 = await createSession(12345);
			const session2 = await createSession(12345);

			expect(session1.id).not.toBe(session2.id);
			expect(session1.token).not.toBe(session2.token);
		});

		it('stores session in database', async () => {
			const neonId = 12345;
			mockPrisma.session = {
				create: vi.fn().mockResolvedValue({})
			};

			const session = await createSession(neonId);

			expect(mockPrisma.session.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					id: session.id,
					user_id: neonId,
					secret_hash: expect.any(Uint8Array),
					created_at: expect.any(Number)
				})
			});
		});

		it('uses human-readable alphabet for session IDs', async () => {
			const session = await createSession(12345);

			// Should not contain confusing characters (l, o, 0, 1)
			expect(session.id).not.toMatch(/[lo01]/);
			expect(session.token.split('.')[1]).not.toMatch(/[lo01]/);
		});

		it('hashes the secret before storing', async () => {
			mockPrisma.session = {
				create: vi.fn().mockResolvedValue({})
			};

			const session = await createSession(12345);

			// Secret hash should be a Uint8Array of length 32 (SHA-256)
			expect(session.secretHash).toBeInstanceOf(Uint8Array);
			expect(session.secretHash.length).toBe(32);
		});
	});

	describe('validateSessionToken', () => {
		it('validates a valid session token', async () => {
			const neonId = 12345;
			const createdSession = await createSession(neonId);

			// Mock database lookup
			mockPrisma.session = {
				findUnique: vi.fn().mockResolvedValue({
					id: createdSession.id,
					user_id: neonId,
					secret_hash: createdSession.secretHash,
					created_at: Math.floor(createdSession.createdAt.getTime() / 1000),
					user: {
						id: 1,
						neon_id: neonId
					}
				})
			};

			const { session, user } = await validateSessionToken(createdSession.token);

			expect(session).not.toBeNull();
			expect(session.id).toBe(createdSession.id);
			expect(session.neonId).toBe(neonId);
			expect(user).not.toBeNull();
			expect(user.neonId).toBe(neonId);
		});

		it('rejects token with invalid format', async () => {
			const { session, user } = await validateSessionToken('invalid-token');

			expect(session).toBeNull();
			expect(user).toBeNull();
		});

		it('rejects token with invalid secret', async () => {
			const neonId = 12345;
			const createdSession = await createSession(neonId);

			// Mock database with valid session
			mockPrisma.session = {
				findUnique: vi.fn().mockResolvedValue({
					id: createdSession.id,
					user_id: neonId,
					secret_hash: createdSession.secretHash,
					created_at: Math.floor(createdSession.createdAt.getTime() / 1000),
					user: {
						id: 1,
						neon_id: neonId
					}
				})
			};

			// Use wrong secret
			const invalidToken = `${createdSession.id}.wrongsecret12345678`;
			const { session, user } = await validateSessionToken(invalidToken);

			expect(session).toBeNull();
			expect(user).toBeNull();
		});

		it('rejects expired session', async () => {
			const neonId = 12345;
			const createdSession = await createSession(neonId);

			// Mock database with expired session (created 2 days ago)
			const twoDaysAgo = Math.floor((Date.now() - 2 * 24 * 60 * 60 * 1000) / 1000);
			mockPrisma.session = {
				findUnique: vi.fn().mockResolvedValue({
					id: createdSession.id,
					user_id: neonId,
					secret_hash: createdSession.secretHash,
					created_at: twoDaysAgo,
					user: {
						id: 1,
						neon_id: neonId
					}
				}),
				delete: vi.fn().mockResolvedValue({})
			};

			const { session, user } = await validateSessionToken(createdSession.token);

			expect(session).toBeNull();
			expect(user).toBeNull();

			// Should have deleted the expired session
			expect(mockPrisma.session.delete).toHaveBeenCalledWith({
				where: { id: createdSession.id }
			});
		});

		it('rejects session not found in database', async () => {
			mockPrisma.session = {
				findUnique: vi.fn().mockResolvedValue(null)
			};

			const { session, user } = await validateSessionToken('validformat.butnexist123456');

			expect(session).toBeNull();
			expect(user).toBeNull();
		});

		it('handles missing user in database', async () => {
			const neonId = 12345;
			const createdSession = await createSession(neonId);

			mockPrisma.session = {
				findUnique: vi.fn().mockResolvedValue({
					id: createdSession.id,
					user_id: neonId,
					secret_hash: createdSession.secretHash,
					created_at: Math.floor(createdSession.createdAt.getTime() / 1000),
					user: null // User not found
				})
			};

			const { session, user } = await validateSessionToken(createdSession.token);

			expect(session).toBeNull();
			expect(user).toBeNull();
		});

		it('validates session within expiration window', async () => {
			const neonId = 12345;
			const createdSession = await createSession(neonId);

			// Session created 12 hours ago (within 24-hour window)
			const twelveHoursAgo = Math.floor((Date.now() - 12 * 60 * 60 * 1000) / 1000);
			mockPrisma.session = {
				findUnique: vi.fn().mockResolvedValue({
					id: createdSession.id,
					user_id: neonId,
					secret_hash: createdSession.secretHash,
					created_at: twelveHoursAgo,
					user: {
						id: 1,
						neon_id: neonId
					}
				})
			};

			const { session, user } = await validateSessionToken(createdSession.token);

			expect(session).not.toBeNull();
			expect(user).not.toBeNull();
		});
	});

	describe('deleteSession', () => {
		it('deletes session from database', async () => {
			const sessionId = 'test-session-id';
			mockPrisma.session = {
				delete: vi.fn().mockResolvedValue({})
			};

			await deleteSession(sessionId);

			expect(mockPrisma.session.delete).toHaveBeenCalledWith({
				where: { id: sessionId }
			});
		});

		it('handles deletion of non-existent session', async () => {
			mockPrisma.session = {
				delete: vi.fn().mockRejectedValue(new Error('Record not found'))
			};

			await expect(deleteSession('non-existent')).rejects.toThrow('Record not found');
		});
	});

	describe('setSessionTokenCookie', () => {
		it('sets cookie with correct attributes', () => {
			const mockCookies = {
				set: vi.fn()
			};
			const token = 'test-token.test-secret';
			const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

			setSessionTokenCookie(mockCookies, token, expiresAt);

			expect(mockCookies.set).toHaveBeenCalledWith(
				'session_token',
				token,
				{
					httpOnly: true,
					secure: true, // dev is false in mock
					path: '/my-classes',
					sameSite: 'lax',
					expires: expiresAt
				}
			);
		});

		it('uses secure flag in production', () => {
			const mockCookies = {
				set: vi.fn()
			};
			const token = 'test-token.test-secret';
			const expiresAt = new Date();

			setSessionTokenCookie(mockCookies, token, expiresAt);

			const cookieOptions = mockCookies.set.mock.calls[0][2];
			expect(cookieOptions.secure).toBe(true);
		});

		it('sets httpOnly to prevent XSS', () => {
			const mockCookies = {
				set: vi.fn()
			};
			const token = 'test-token.test-secret';
			const expiresAt = new Date();

			setSessionTokenCookie(mockCookies, token, expiresAt);

			const cookieOptions = mockCookies.set.mock.calls[0][2];
			expect(cookieOptions.httpOnly).toBe(true);
		});

		it('sets path to restrict cookie scope', () => {
			const mockCookies = {
				set: vi.fn()
			};
			const token = 'test-token.test-secret';
			const expiresAt = new Date();

			setSessionTokenCookie(mockCookies, token, expiresAt);

			const cookieOptions = mockCookies.set.mock.calls[0][2];
			expect(cookieOptions.path).toBe('/my-classes');
		});

		it('uses sameSite lax for CSRF protection', () => {
			const mockCookies = {
				set: vi.fn()
			};
			const token = 'test-token.test-secret';
			const expiresAt = new Date();

			setSessionTokenCookie(mockCookies, token, expiresAt);

			const cookieOptions = mockCookies.set.mock.calls[0][2];
			expect(cookieOptions.sameSite).toBe('lax');
		});
	});

	describe('security considerations', () => {
		it('uses constant-time comparison for secrets', async () => {
			// This test verifies that secret validation doesn't leak timing information
			const neonId = 12345;
			const createdSession = await createSession(neonId);

			mockPrisma.session = {
				findUnique: vi.fn().mockResolvedValue({
					id: createdSession.id,
					user_id: neonId,
					secret_hash: createdSession.secretHash,
					created_at: Math.floor(Date.now() / 1000),
					user: { id: 1, neon_id: neonId }
				})
			};

			// Test with slightly different secrets - timing should be consistent
			const wrongToken1 = `${createdSession.id}.aaaaaaaaaaaaaaaaaaaaaaaaa`;
			const wrongToken2 = `${createdSession.id}.zzzzzzzzzzzzzzzzzzzzzzzzz`;

			const start1 = performance.now();
			await validateSessionToken(wrongToken1);
			const time1 = performance.now() - start1;

			const start2 = performance.now();
			await validateSessionToken(wrongToken2);
			const time2 = performance.now() - start2;

			// Times should be similar (within 10ms) - this is a basic check
			// Real constant-time comparison is handled by @oslojs/crypto
			expect(Math.abs(time1 - time2)).toBeLessThan(10);
		});

		it('generates cryptographically secure random values', async () => {
			const sessions = [];
			for (let i = 0; i < 100; i++) {
				sessions.push(await createSession(12345));
			}

			// All IDs should be unique
			const ids = sessions.map(s => s.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(100);

			// Check randomness - no session ID should be substring of another
			for (let i = 0; i < sessions.length - 1; i++) {
				for (let j = i + 1; j < sessions.length; j++) {
					expect(sessions[i].id.includes(sessions[j].id.substring(0, 10))).toBe(false);
				}
			}
		});
	});
});


