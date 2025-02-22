<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button, HTabs } from '$lib/client/ui';
	import { LogOut } from 'lucide-svelte';
	import type { LayoutProps } from './$types';
	import playerImage from './(assets)/player.png';
	import serverImage from './(assets)/server.png';
	import worldImage from './(assets)/world.png';

	let { data, children }: LayoutProps = $props();

	const base = `/servers/${data.server.slug}`;
	const tabs = [
		{ id: 'worlds', label: 'Worlds', href: `${base}`, imageSrc: worldImage },
		{ id: 'players', label: 'Players', href: `${base}/players`, imageSrc: playerImage },
		{ id: 'configs', label: 'Configs', href: `${base}/configs`, imageSrc: serverImage }
	].map((tab) => ({
		...tab,
		onclick: () => goto(tab.href)
	}));

	const selectedTab = $derived(tabs.find((tab) => tab.href === page.url.pathname) ?? undefined);
</script>

<div class="flex h-screen w-full flex-col p-8">
	<header class="flex flex-row">
		<HTabs {tabs} selected={selectedTab?.id} />

		<form method="post" action="/auth?/logout" use:enhance class="ml-8">
			<Button icon={LogOut} className="py-5"></Button>
		</form>
	</header>

	<section class="mt-8">
		{@render children()}
	</section>
</div>
