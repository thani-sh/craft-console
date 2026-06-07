import type { LayoutServerLoad } from './$types';
import {
	getServerConfig,
	getServerStatus,
	getServerVersionInfo,
	getLatestVersionInfo
} from '$lib/server/minecraft';
import { error } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs';

export const load: LayoutServerLoad = async ({ params }) => {
	const slug = params.serverSlug;
	const serverDir = path.join(process.cwd(), 'data', 'servers', slug);

	if (!fs.existsSync(serverDir)) {
		error(404, 'Server not found');
	}

	const config = await getServerConfig(slug);
	const status = getServerStatus(slug);

	const versionInfo = await getServerVersionInfo(slug);
	const latestInfo = await getLatestVersionInfo(versionInfo.downloadType || 'serverBedrockLinux');
	const latestVersion = latestInfo ? latestInfo.version : 'unknown';
	const updateAvailable = latestInfo ? latestInfo.version !== versionInfo.version : false;

	return {
		server: {
			slug,
			version: versionInfo.version,
			latestVersion,
			updateAvailable,
			status,
			config
		}
	};
};
