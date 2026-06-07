import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import { ZipArchive } from 'archiver';

export const GET: RequestHandler = async ({ params }) => {
	const { serverSlug } = params;
	const serverDir = path.join(process.cwd(), 'data', 'servers', serverSlug);

	if (!fs.existsSync(serverDir)) {
		throw error(404, 'Server not found');
	}

	const passThrough = new (await import('stream')).PassThrough();
	const archive = new ZipArchive({
		zlib: { level: 9 }
	});

	archive.on('error', (err: Error) => {
		console.error('Archiver error zipping server:', err);
	});

	archive.pipe(passThrough);

	// Zip the directory contents directly
	archive.directory(serverDir, false);

	// Finalize zipping asynchronously
	archive.finalize().catch((err: Error) => {
		console.error('Finalize archive error:', err);
	});

	// Convert PassThrough Node stream to Web standard ReadableStream (casted to BodyInit)
	const webStream = Readable.toWeb(passThrough) as unknown as BodyInit;

	return new Response(webStream, {
		headers: {
			'Content-Type': 'application/zip',
			'Content-Disposition': `attachment; filename="${serverSlug}-backup.zip"`,
			'Cache-Control': 'no-cache, no-store, must-revalidate'
		}
	});
};
