import { prisma } from '$lib/postgres.js';
import { generateRandomString } from "@oslojs/crypto/random";
import { sha256 } from "@oslojs/crypto/sha2";
import { constantTimeEqual } from "@oslojs/crypto/subtle";
import { dev } from '$app/environment'; 

function generateSecureRandomString() {
	// Human readable alphabet (a-z, 0-9 without l, o, 0, 1 to avoid confusion)
	const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";

    const random = {
        read(bytes) {
            crypto.getRandomValues(bytes);
        }
    };
    
    return generateRandomString(random, alphabet, 24);
}

async function hashSecret(secret) {
	const secretBytes = new TextEncoder().encode(secret);
	return sha256(secretBytes);
}

async function createSession(neonId) {
	const now = new Date();

	const id = generateSecureRandomString();
	const secret = generateSecureRandomString();

	const secretHash = await hashSecret(secret);

	const token = id + "." + secret;

	const session = {
		id,
		secretHash,
		createdAt: now,
		neonId,
		token
	};

    await prisma.session.create({
        data: {
            id: session.id,
            user_id: neonId,
            secret_hash: session.secretHash,
            created_at: Math.floor(session.createdAt.getTime() / 1000)
        }
    });

	return session;
}

const sessionExpiresInSeconds = 60 * 60 * 24; // 1 day

async function validateSessionToken(token) {
	const tokenParts = token.split(".");
	if (tokenParts.length !== 2) {
		return { session: null, user: null };
	}
	const sessionId = tokenParts[0];
	const sessionSecret = tokenParts[1];

	const { session, user } = await getSession(sessionId);
	if (!session || !user) {
		return { session: null, user: null };
	}

	const tokenSecretHash = await hashSecret(sessionSecret);
	const validSecret = constantTimeEqual(tokenSecretHash, session.secretHash);
	if (!validSecret) {
		return { session: null, user: null };
	}

    const returnedSession = {
        id: session.id,
        neonId: session.neonId,
        createdAt: session.createdAt
    };

	return { session: returnedSession, user: user };
}

async function getSession(sessionId) {
	const now = new Date();

    const result = await prisma.session.findUnique({
        where: {
            id: sessionId
        },
        include: {
            user: true
        }
    });

	if (!result) {
		return { session: null, user: null };
	}

	const session = {
		id: result.id,
		neonId: result.user_id,
		secretHash: result.secret_hash,
		createdAt: new Date(result.created_at * 1000)
	};

    const user = {
        id: result.user.id,
        neonId: result.user.neon_id
    };

	// Check expiration
	if (now.getTime() - session.createdAt.getTime() >= sessionExpiresInSeconds * 1000) {
		await deleteSession(sessionId);
		return { session: null, user: null };
	}

	return { session, user };
}

async function deleteSession(sessionId) {
	await prisma.session.delete({
		where: {
			id: sessionId
		}
	});
}

function setSessionTokenCookie(cookies, token, expiresAt) {
	cookies.set("session_token", token, {
		httpOnly: true,
		secure: !dev,
		path: "/my-classes",
        sameSite: "lax",
		expires: expiresAt
	});
}

export { createSession, validateSessionToken, deleteSession, setSessionTokenCookie };
