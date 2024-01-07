import { PrismaClient } from '@prisma/client';
import * as fs from 'node:fs';

const PG_USER_FILE = process.env.POSTGRES_USER_FILE;
const PG_PASSWORD_FILE = process.env.POSTGRES_PASSWORD_FILE;
const PG_PORT = process.env.POSTGRES_PORT;
const PG_DB = process.env.POSTGRES_DB;

const PG_USER = fs.readFileSync(PG_USER_FILE, 'utf8');

const PG_PASSWORD = fs.readFileSync(PG_PASSWORD_FILE, 'utf8');

export const prisma = new PrismaClient({
	datasources: {
		db: {
			url: `postgresql://${PG_USER}:${PG_PASSWORD}@db:${PG_PORT}/${PG_DB}?schema=public`
		}
	}
});
