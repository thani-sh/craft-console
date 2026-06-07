import type { Actions, PageServerLoad } from './$types';
import {
	addAllowedPlayer,
	getAllowedPlayers,
	removeAllowedPlayer,
	writeServerInput
} from '$lib/server/minecraft';
import { fail } from '@sveltejs/kit';
import path from 'path';
import { promises as fs } from 'fs';

export const load: PageServerLoad = async ({ params }) => {
	const players = await getAllowedPlayers(params.serverSlug);
	return { players };
};

export const actions = {
	add: async ({ params, request }) => {
		const form = await request.formData();
		const name = form.get('name')?.toString().trim();
		const ignoresPlayerLimit = form.get('ignoresPlayerLimit') === 'on';

		if (!name) return fail(400, { error: 'Player name is required.' });
		if (!/^[A-Za-z0-9_]{3,16}$/.test(name)) {
			return fail(400, {
				error: 'Invalid player name (3–16 alphanumeric/underscore characters).'
			});
		}

		await addAllowedPlayer(params.serverSlug, { name, ignoresPlayerLimit });
		return { success: true };
	},

	remove: async ({ params, request }) => {
		const form = await request.formData();
		const name = form.get('name')?.toString().trim();
		if (!name) return fail(400, { error: 'Player name is required.' });

		await removeAllowedPlayer(params.serverSlug, name);
		return { success: true };
	},

	importAllowlist: async ({ params, request }) => {
		const form = await request.formData();
		const file = form.get('allowlistFile') as File;

		if (!file || file.size === 0) {
			return fail(400, { error: 'Please select a valid file to import.' });
		}

		try {
			const text = await file.text();
			const parsed = JSON.parse(text);

			if (!Array.isArray(parsed)) {
				return fail(400, { error: 'Allowlist must be a JSON array of players.' });
			}

			for (const player of parsed) {
				if (typeof player !== 'object' || !player || typeof player.name !== 'string') {
					return fail(400, {
						error: 'Each player in the allowlist must contain a "name" string.'
					});
				}
			}

			const slug = params.serverSlug;
			const allowlistPath = path.join(process.cwd(), 'data', 'servers', slug, 'allowlist.json');

			// Save the file
			await fs.writeFile(allowlistPath, JSON.stringify(parsed, null, 2), 'utf8');

			// If server is running, hot-reload the allowlist
			writeServerInput(slug, 'allowlist reload');
		} catch (e) {
			console.error('Failed to import allowlist:', e);
			return fail(400, {
				error:
					'Failed to import allowlist.json. Ensure the file contains a valid JSON array of player objects.'
			});
		}

		return { success: true };
	}
} satisfies Actions;
