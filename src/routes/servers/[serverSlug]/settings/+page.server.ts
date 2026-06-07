import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import path from 'path';
import { promises as fs } from 'fs';
import { parseProperties } from '$lib/server/properties';
import { minecraftServerConfigSchema } from '$lib/types/MinecraftServerConfig';

export const actions = {
	importProperties: async ({ request, params }) => {
		const { serverSlug } = params;
		const formData = await request.formData();
		const file = formData.get('propertiesFile') as File;

		if (!file || file.size === 0) {
			return fail(400, { error: 'Please select a valid file to import.' });
		}

		if (file.name !== 'server.properties') {
			return fail(400, { error: 'Uploaded file must be named "server.properties".' });
		}

		try {
			const text = await file.text();

			// Parse properties
			const parsed = parseProperties(text);

			// Validate with Zod schema
			minecraftServerConfigSchema.parse(parsed);

			const propsPath = path.join(
				process.cwd(),
				'data',
				'servers',
				serverSlug,
				'server.properties'
			);

			// Save the file
			await fs.writeFile(propsPath, text, 'utf8');
		} catch (e) {
			console.error('Failed to import properties:', e);

			// If it's a Zod validation error, construct a friendlier error message
			if (e && typeof e === 'object' && 'errors' in e && Array.isArray(e.errors)) {
				const errorList = (e.errors as { path: string[]; message: string }[])
					.map((err) => `${err.path.join('.')}: ${err.message}`)
					.join(', ');
				return fail(400, { error: `Validation error: ${errorList}` });
			}

			return fail(400, {
				error:
					'Failed to import server.properties. Ensure the file has valid Minecraft configuration properties.'
			});
		}

		return { success: true };
	}
} satisfies Actions;
