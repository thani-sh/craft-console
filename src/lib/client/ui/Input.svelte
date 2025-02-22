<script lang="ts">
	import { randomString } from '$lib/client/utils';

	interface Props {
		accept?: string;
		className?: string;
		disabled?: boolean;
		id?: string;
		label?: string;
		max?: number;
		min?: number;
		onchange?: (newValue: string) => void;
		placeholder?: string;
		required?: boolean;
		type?: 'text' | 'number' | 'email' | 'password' | 'file';
		value?: string;
	}

	let {
		accept,
		className = '',
		disabled,
		id = randomString(),
		label,
		max,
		min,
		onchange,
		placeholder,
		required,
		type = 'text',
		value = ''
	}: Props = $props();
</script>

<div class="flex w-full flex-col {className}">
	{#if label}
		<label for={id} class="mb-4 block text-3xl font-bold text-white" class:opacity-50={disabled}>
			{label}
		</label>
	{/if}
	<div class="flex flex-row items-center gap-8">
		<input
			{id}
			name={id}
			{type}
			{value}
			{placeholder}
			{disabled}
			{required}
			{min}
			{max}
			{accept}
			oninput={(e) => onchange?.((e.target as HTMLInputElement).value)}
			class="relative block w-full border-4 border-gray-700 bg-gray-800 p-6 pl-4 text-3xl font-bold text-white shadow-inner outline-none invalid:border-red-500 focus:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
		/>
	</div>
</div>

<style>
	input::file-selector-button {
		width: 0;
	}
</style>
