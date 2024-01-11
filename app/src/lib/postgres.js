import { PrismaClient } from '@prisma/client';
//import { readFileSync } from 'node:fs';
//import { POSTGRES_PASS, POSTGRES_USER } from '$lib/server/secrets';
//import { POSTGRES_DB, POSTGRES_PORT } from '$env/static/private';
import { POSTGRES_USER, POSTGRES_PASS, POSTGRES_DB, POSTGRES_PORT } from '$lib/server/secrets';

//const POSTGRES_USER = readFileSync(env.POSTGRES_USER_FILE, 'utf8');
//const POSTGRES_PASS = readFileSync(env.POSTGRES_PASSWORD_FILE, 'utf8');
//const POSTGRES_DB = env.POSTGRES_DB;
//const POSTGRES_PORT = env.POSTGRES_PORT;

export const prisma = new PrismaClient({
	datasourceUrl: `postgresql://${POSTGRES_USER}:${POSTGRES_PASS}@db:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public`
});

