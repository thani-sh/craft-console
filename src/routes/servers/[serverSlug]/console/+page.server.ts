import type { Actions } from './$types';
import { getServerLogs, startServer, stopServer, writeServerInput } from '$lib/server/minecraft';

export const actions = {
	logs: async ({ params }) => {
		const slug = params.serverSlug;
		const logs = getServerLogs(slug);
		return { logs };
	},
	
	start: async ({ params }) => {
		const slug = params.serverSlug;
		await startServer(slug);
		return { success: true };
	},

	stop: async ({ params }) => {
		const slug = params.serverSlug;
		stopServer(slug);
		return { success: true };
	},

	input: async ({ params, request }) => {
		const slug = params.serverSlug;
		const formData = await request.formData();
		const command = formData.get('command')?.toString();
		
		if (command) {
			writeServerInput(slug, command);
		}
		
		return { success: true };
	}
} satisfies Actions;
