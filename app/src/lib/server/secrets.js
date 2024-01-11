//import { readFileSync } from 'node:fs';
//import { NEON_APIKEY_FILE, NEON_USER_FILE, GMAIL_USER_FILE, GMAIL_PASS_FILE, POSTGRES_USER_FILE, POSTGRES_PASSWORD_FILE, FLODESK_KEY_FILE, INTERNAL_API_KEY_FILE } from '$env/static/private';
import { env } from '$env/dynamic/private';

export const GMAIL_USER = env.GMAIL_USER;
export const GMAIL_PASS = env.GMAIL_PASS;
export const NEON_API_KEY = env.NEON_API_KEY;
export const NEON_API_USER = env.NEON_API_USER;
export const POSTGRES_USER = env.POSTGRES_USER;
export const POSTGRES_PASS = env.POSTGRES_PASS;
export const FLO_API_KEY = env.FLO_API_KEY;
export const INTERNAL_API_KEY = env.INTERNAL_API_KEY;
export const POSTGRES_DB = env.POSTGRES_DB;
export const POSTGRES_PORT = env.POSTGRES_PORT;