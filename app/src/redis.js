import { env } from '$env/dynamic/private';
import { createClient } from 'redis';

export const redisClient = createClient({
    url: env.REDIS_URL
})

await redisClient.connect()