import { getServerInfo } from '$lib/server/game';
import type { LayoutServerLoad } from './$types';

/**
 * Load function for the page.
 */
export const load: LayoutServerLoad = async (event) => {
	return { server: await getServerInfo(event.params.serverSlug) };
};
