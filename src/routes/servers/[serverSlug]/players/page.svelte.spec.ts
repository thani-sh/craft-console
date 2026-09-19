import { render } from '@testing-library/svelte';
import { promises as fs } from 'fs';
import path from 'path';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Page from './+page.svelte';
import { load } from './+page.server';
import type { PageProps } from './$types';

const slug = 'test-players-page';
const serverDir = path.join(process.cwd(), 'data', 'servers', slug);
const allowlistPath = path.join(serverDir, 'allowlist.json');

type LoadEvent = Parameters<typeof load>[0];

describe('Players page', () => {
	beforeEach(async () => {
		await fs.mkdir(serverDir, { recursive: true });
	});

	afterEach(async () => {
		await fs.rm(serverDir, { recursive: true, force: true }).catch(() => {});
	});

	it('renders when the allowlist repeats a player name', async () => {
		// add/remove treat a name case-insensitively as the player's identity, but the
		// import action accepts any array, so a real allowlist.json can hold the same
		// name twice. Keying the rows by name alone made Svelte throw
		// each_key_duplicate and the page never rendered.
		await fs.writeFile(
			allowlistPath,
			JSON.stringify([
				{ name: 'Steve', ignoresPlayerLimit: false },
				{ name: 'Steve', ignoresPlayerLimit: true }
			]),
			'utf8'
		);

		const loaded = (await load({ params: { serverSlug: slug } } as unknown as LoadEvent)) as {
			players: unknown;
		};

		const data = { players: loaded.players, server: { slug } } as unknown as PageProps['data'];
		const { container } = render(Page, { props: { data, form: null } as unknown as PageProps });
		await tick();

		expect(container.textContent).toContain('Steve');
	});
});
