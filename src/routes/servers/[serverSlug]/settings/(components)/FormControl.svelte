<script lang="ts" generics="T extends FormControlDef">
	import { Input, Select } from '$lib/client/ui';
	import type {
		BooleanFormControlDef,
		EnumFormControlDef,
		FormControlDef,
		NumberFormControlDef,
		TextFormControlDef
	} from '$lib/client/form';

	interface Props {
		def: T;
		onchange?: (newValue: string | number | boolean) => void;
		value?: string | number | boolean;
	}

	let { def, value, onchange }: Props = $props();
</script>

{#snippet textFormControl(def: TextFormControlDef, value: string)}
	<Input
		type="text"
		id={def.name}
		label={def.label}
		description={def.description}
		required={def.required}
		placeholder={def.default}
		{value}
		{onchange}
	/>
{/snippet}

{#snippet enumFormControl(def: EnumFormControlDef, value: string)}
	<Select
		id={def.name}
		label={def.label}
		description={def.description}
		required={def.required}
		options={def.options.map(String)}
		{value}
		{onchange}
	/>
{/snippet}

{#snippet numberFormControl(def: NumberFormControlDef, value: number)}
	<Input
		type="number"
		id={def.name}
		label={def.label}
		description={def.description}
		required={def.required}
		min={def.min}
		max={def.max}
		step={def.integer ? 1 : 0.01}
		placeholder={String(def.default ?? '')}
		{value}
		{onchange}
	/>
{/snippet}

{#snippet booleanFormControl(def: BooleanFormControlDef, value: boolean)}
	<Select
		id={def.name}
		label={def.label}
		description={def.description}
		required={def.required}
		options={['true', 'false']}
		value={value ? 'true' : 'false'}
		onchange={(v) => onchange?.(v === 'true')}
	/>
{/snippet}

{#if def.type === 'boolean'}
	{@render booleanFormControl(def, value as boolean)}
{:else if def.type === 'enum'}
	{@render enumFormControl(def, value as string)}
{:else if def.type === 'number'}
	{@render numberFormControl(def, value as number)}
{:else}
	{@render textFormControl(def, value as string)}
{/if}
