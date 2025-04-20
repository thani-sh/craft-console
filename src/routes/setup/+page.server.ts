import { GameServer } from '$lib/server/game';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

/**
 * Actions for the page.
 */
export const actions: Actions = {
	/**
	 * Uploads the Minecraft server zip file.
	 */
	upload: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		const file = Object.fromEntries(await event.request.formData()).file as File;
		if (!file) {
			fail(400);
		}
		// Note: this can take a while, maybe show a progress bar?
		const name = file.name.slice(0, file.name.length - 4);
		await GameServer.setup(name, file);
		return redirect(302, '/');
	}
};
