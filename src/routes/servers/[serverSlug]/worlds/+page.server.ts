import type { PageServerLoad } from './$types';
import { getAvailableWorlds } from '$lib/server/minecraft';

export const load: PageServerLoad = async ({ params }) => {
	const slug = params.serverSlug;
	const worlds = await getAvailableWorlds(slug);

	return {
		worlds
	};
};
