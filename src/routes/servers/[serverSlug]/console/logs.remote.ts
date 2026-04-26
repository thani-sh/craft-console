import { z } from 'zod';
import { query } from '$app/server';
import { getServerLogs } from '$lib/server/minecraft';

export const getLogs = query(z.string(), async (slug: string) => {
	return getServerLogs(slug);
});
