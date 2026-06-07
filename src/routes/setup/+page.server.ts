import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import decompress from 'decompress';
import path from 'path';
import { promises as fs } from 'fs';

interface MinecraftDownloadLink {
	downloadType: string;
	downloadUrl: string;
}

export const load: PageServerLoad = async () => {
	try {
		const res = await fetch(
			'https://net-secondary.web.minecraft-services.net/api/v1.0/download/links'
		);
		if (!res.ok) {
			throw new Error(`Failed to fetch links: ${res.statusText}`);
		}
		const data = await res.json();
		const links = (data?.result?.links || []) as MinecraftDownloadLink[];

		const options = links
			.filter(
				(link) =>
					link.downloadType === 'serverBedrockLinux' ||
					link.downloadType === 'serverBedrockPreviewLinux'
			)
			.map((link) => {
				const isStable = link.downloadType === 'serverBedrockLinux';
				const label = isStable ? 'Stable' : 'Preview';
				const match = link.downloadUrl.match(/bedrock-server-([\d.]+)\.zip/);
				const version = match ? match[1] : 'unknown';
				return {
					downloadType: link.downloadType,
					downloadUrl: link.downloadUrl,
					label,
					version
				};
			});

		return { options };
	} catch (e) {
		console.error('Error loading server links:', e);
		return {
			options: [],
			error: 'Failed to retrieve available server versions. Please check your internet connection.'
		};
	}
};

export const actions = {
	download: async ({ request }) => {
		const formData = await request.formData();
		const downloadUrl = formData.get('downloadUrl') as string;
		const eulaAccepted = formData.get('eula') === 'on';

		if (!eulaAccepted) {
			return fail(400, {
				error: 'You must accept the Minecraft EULA and Privacy Policy to proceed.'
			});
		}

		if (!downloadUrl) {
			return fail(400, { error: 'Please select a server version.' });
		}

		try {
			const res = await fetch(downloadUrl);
			if (!res.ok) {
				return fail(500, { error: `Failed to download server zip: ${res.statusText}` });
			}

			const arrayBuffer = await res.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			const serverDir = path.join(process.cwd(), 'data', 'servers', 'default');

			// Delete existing files to prevent conflicts
			await fs.rm(serverDir, { recursive: true, force: true }).catch(() => {});
			await fs.mkdir(serverDir, { recursive: true });

			// Decompress to the destination
			await decompress(buffer, serverDir);
		} catch (e) {
			console.error(e);
			return fail(500, { error: 'Failed to download or extract the server zip.' });
		}

		redirect(303, '/servers/default/console');
	}
} satisfies Actions;
