import { lucia } from 'lucia';
import { sveltekit } from 'lucia/middleware';
import { prisma as client } from '$lib/postgres.js';
import { prisma } from '@lucia-auth/adapter-prisma';
import { dev } from '$app/environment'; 

export const auth = lucia({
    env: dev ? 'DEV' : 'PROD',
    middleware: sveltekit(),
    adapter: prisma(client),

    getUserAttributes: (data) => {
        return {
            neonId: data.neon_id
        }
    }
})
