import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs';

export const GET: RequestHandler = async ({ params }) => {
	const { serverSlug } = params;
	const propsPath = path.join(process.cwd(), 'data', 'servers', serverSlug, 'server.properties');

	if (!fs.existsSync(propsPath)) {
		throw error(404, 'server.properties not found');
	}

	const content = fs.readFileSync(propsPath);

	return new Response(content, {
		headers: {
			'Content-Type': 'text/plain',
			'Content-Disposition': 'attachment; filename="server.properties"',
			'Cache-Control': 'no-cache, no-store, must-revalidate'
		}
	});
};
