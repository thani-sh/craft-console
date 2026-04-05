import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import decompress from 'decompress';
import path from 'path';
import { promises as fs } from 'fs';

export const actions = {
	upload: async ({ request }) => {
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file || file.size === 0) {
			return fail(400, { error: 'Please upload a valid zip file.' });
		}

		if (!file.name.endsWith('.zip')) {
			return fail(400, { error: 'Must be a .zip file.' });
		}

		try {
			const arrayBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			const serverDir = path.join(process.cwd(), 'data', 'servers', 'default');
			
			// Optional: delete existing files to prevent conflicts
			await fs.rm(serverDir, { recursive: true, force: true }).catch(() => {});
			await fs.mkdir(serverDir, { recursive: true });

			// Decompress to the destination
			await decompress(buffer, serverDir);

			// Automatically redirect to the server's console after extraction
		} catch (e: any) {
			console.error(e);
			return fail(500, { error: 'Failed to extract the server zip.' });
		}

		redirect(303, '/servers/default/console');
	}
} satisfies Actions;
