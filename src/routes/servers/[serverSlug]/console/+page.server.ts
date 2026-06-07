import type { Actions } from './$types';
import { startServer, stopServer, writeServerInput, updateServer } from '$lib/server/minecraft';
import { fail } from '@sveltejs/kit';

export const actions = {
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
	},

	update: async ({ params }) => {
		const slug = params.serverSlug;
		try {
			await updateServer(slug);
			return { success: true };
		} catch (e: any) {
			console.error('Update server failed:', e);
			return fail(500, { error: e.message || 'Failed to update server version.' });
		}
	}
} satisfies Actions;
