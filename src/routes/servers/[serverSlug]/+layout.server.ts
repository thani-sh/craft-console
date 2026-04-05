import type { LayoutServerLoad } from './$types';
import { getServerConfig, getServerStatus } from '$lib/server/minecraft';
import { error } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs';

export const load: LayoutServerLoad = async ({ params }) => {
	const slug = params.serverSlug;
	const serverDir = path.join(process.cwd(), 'data', 'servers', slug);
	
	if (!fs.existsSync(serverDir)) {
		error(404, 'Server not found');
	}

	const config = await getServerConfig(slug);
	const status = getServerStatus(slug);

	return {
		server: {
			slug,
			version: '1.0.0', // Bedrock doesn't strictly have a programmatically queryable version easily
			status,
			config
		}
	};
};
