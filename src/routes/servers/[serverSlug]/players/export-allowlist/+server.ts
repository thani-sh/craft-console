import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs';

export const GET: RequestHandler = async ({ params }) => {
	const { serverSlug } = params;
	const allowlistPath = path.join(process.cwd(), 'data', 'servers', serverSlug, 'allowlist.json');

	if (!fs.existsSync(allowlistPath)) {
		throw error(404, 'allowlist.json not found');
	}

	const content = fs.readFileSync(allowlistPath);

	return new Response(content, {
		headers: {
			'Content-Type': 'application/json',
			'Content-Disposition': 'attachment; filename="allowlist.json"',
			'Cache-Control': 'no-cache, no-store, must-revalidate'
		}
	});
};
