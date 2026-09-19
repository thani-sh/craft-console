import type { InstalledAddon, PackReference } from '$lib/server/addons';
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import Page from './+page.svelte';
import type { PageProps } from './$types';

const packId = '0f1a3b6c-0000-4000-8000-000000000001';
const enabled: PackReference[] = [{ pack_id: packId, version: [1, 0, 0] }];

const data = {
	world: { name: 'My World' },
	server: { status: 'idle' },
	addons: { addons: [] as InstalledAddon[], invalid: [] },
	// A combined pack, enabled for this world in both pack files and deleted from the
	// server since: the same pack_id is in both lists by design.
	enabled: { behavior: enabled, resource: enabled }
} as unknown as PageProps['data'];

describe('World addons page', () => {
	it('lists a pack that is enabled in both files when neither copy is installed', async () => {
		const { container } = render(Page, { props: { data, form: null } as unknown as PageProps });
		await tick();

		expect(container.textContent).toContain('2 enabled pack(s) are not installed');
		// Both entries are shown, which keying this concatenated list by pack_id alone
		// made impossible.
		expect(container.textContent?.match(/0f1a3b6c/g)).toHaveLength(2);
	});
});
