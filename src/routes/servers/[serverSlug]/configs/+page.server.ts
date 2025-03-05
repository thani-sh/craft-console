import { validateFormData } from '$lib/server/utils';
import { partialMinecraftConfigSchema } from '$lib/types';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

/**
 * Actions for the page.
 */
export const actions: Actions = {
	/**
	 * Update server config
	 */
	update: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		const formData = await validateFormData(event, partialMinecraftConfigSchema);
		console.info(`Updating server config: ${formData}`);
	}
};
