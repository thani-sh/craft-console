import type { Actions, PageServerLoad } from './$types';
import { addAllowedPlayer, getAllowedPlayers, removeAllowedPlayer } from '$lib/server/minecraft';
import { fail } from '@sveltejs/kit';

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
			return fail(400, { error: 'Invalid player name (3–16 alphanumeric/underscore characters).' });
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
	}
} satisfies Actions;
