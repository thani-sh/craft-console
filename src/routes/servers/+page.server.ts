import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import path from 'path';
import fs from 'fs';
import { getServerConfig, getServerStatus } from '$lib/server/minecraft';
import type { MinecraftServer } from '$lib/types';

export const load: PageServerLoad = async () => {
	const serversDir = path.join(process.cwd(), 'data', 'servers');
	
	let serverSlugs: string[] = [];
	try {
		serverSlugs = fs.readdirSync(serversDir);
	} catch (e) {
		// Directory doesn't exist yet
	}

	if (serverSlugs.length === 0) {
		redirect(302, '/setup');
	}
	
	const servers: MinecraftServer[] = [];
	for (const slug of serverSlugs) {
		if (!fs.statSync(path.join(serversDir, slug)).isDirectory()) continue;
		const config = await getServerConfig(slug);
		const status = getServerStatus(slug);
		
		servers.push({
			slug,
			version: '1.0.0',
			status,
			config
		});
	}

	return { servers };
};
