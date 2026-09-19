import type { InstalledAddon } from '$lib/server/addons';
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import Page from './+page.svelte';
import type { PageProps } from './$types';

const sharedUuid = '0f1a3b6c-0000-4000-8000-000000000001';

function addon(folder: string): InstalledAddon {
	return {
		type: 'behavior',
		folder,
		uuid: sharedUuid,
		name: 'Safe Villages',
		version: [1, 0, 0],
		versionLabel: '1.0.0',
		hasScripts: false
	};
}

// The page reads the addon list, the invalid list and the server status. The rest of
// the generated data shape belongs to the layout, so it is not spelled out here.
const data = {
	addons: [addon('Safe Villages'), addon('Safe Villages (2)')],
	invalid: [],
	server: { status: 'idle' }
} as unknown as PageProps['data'];

describe('Addons page', () => {
	it('lists both folders when two of them hold the same pack uuid', async () => {
		// The uuid identifies the pack, not the row. A second folder carrying the same
		// uuid is exactly what an admin has to be able to see and delete, but keying the
		// rows by uuid alone made Svelte throw each_key_duplicate and the page never
		// rendered at all.
		const { container } = render(Page, { props: { data, form: null } as unknown as PageProps });
		await tick();

		expect(container.textContent).toContain('Safe Villages');
		expect(container.textContent).toContain('Safe Villages (2)');
	});
});
