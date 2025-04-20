import { getServer } from '$lib/server/game';
import type { LayoutServerLoad } from './$types';

/**
 * Load function for the page.
 */
export const load: LayoutServerLoad = async (event) => {
	return { server: await getServer(event.params.serverSlug).getInfo() };
};
