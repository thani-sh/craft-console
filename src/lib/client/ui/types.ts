import type { Icon } from 'lucide-svelte';

export interface Tab {
	id: string;
	label: string;
	disabled?: boolean;
	icon?: typeof Icon;
	imageAlt?: string;
	imageSrc?: string;
	onclick?: () => void;
}
