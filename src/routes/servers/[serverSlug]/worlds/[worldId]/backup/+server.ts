import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import { ZipArchive } from 'archiver';

export const GET: RequestHandler = async ({ params }) => {
	const { serverSlug, worldId } = params;
	const worldDir = path.join(process.cwd(), 'data', 'servers', serverSlug, 'worlds', worldId);

	if (!fs.existsSync(worldDir)) {
		throw error(404, 'World not found');
	}

	const passThrough = new (await import('stream')).PassThrough();
	const archive = new ZipArchive({
		zlib: { level: 9 }
	});

	archive.on('error', (err: Error) => {
		console.error(`Archiver error zipping world ${worldId}:`, err);
	});

	archive.pipe(passThrough);

	// Zip the specific world directory contents directly
	archive.directory(worldDir, false);

	// Finalize zipping asynchronously
	archive.finalize().catch((err: Error) => {
		console.error('Finalize archive error:', err);
	});

	// Convert PassThrough Node stream to Web standard ReadableStream (casted to BodyInit)
	const webStream = Readable.toWeb(passThrough) as unknown as BodyInit;

	return new Response(webStream, {
		headers: {
			'Content-Type': 'application/zip',
			'Content-Disposition': `attachment; filename="${worldId}-backup.zip"`,
			'Cache-Control': 'no-cache, no-store, must-revalidate'
		}
	});
};
