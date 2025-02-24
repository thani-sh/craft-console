import 'zod-metadata/register';
import { z } from 'zod';

/**
 * FormControl type can be used to render a form control.
 */

export interface TextFormControlDef {
	type: 'text';
	name: string;
	label?: string;
	description?: string;
	required: boolean;
	default?: string;
}
export interface EnumFormControlDef {
	type: 'enum';
	name: string;
	label?: string;
	description?: string;
	options: string[];
	required: boolean;
	default?: string;
}
export interface NumberFormControlDef {
	type: 'number';
	name: string;
	label?: string;
	description?: string;
	required: boolean;
	default?: number;
	integer?: boolean;
	min?: number;
	max?: number;
}
export interface BooleanFormControlDef {
	type: 'boolean';
	name: string;
	label?: string;
	description?: string;
	required: boolean;
	default?: boolean;
}
export type FormControlDef =
	| TextFormControlDef
	| EnumFormControlDef
	| NumberFormControlDef
	| BooleanFormControlDef;

/**
 * Get the type name of a zod schema ignoring optional, default, etc.
 */
function getDefinition(
	root: z.ZodSchema
): z.ZodEnumDef | z.ZodNumberDef | z.ZodStringDef | z.ZodBooleanDef {
	let schema = root;
	while (true) {
		if (schema instanceof z.ZodOptional) {
			schema = schema._def.innerType;
		} else if (schema instanceof z.ZodDefault) {
			schema = schema._def.innerType;
		} else if (schema instanceof z.ZodEffects) {
			schema = schema._def.schema;
		} else {
			return schema._def as z.ZodEnumDef | z.ZodNumberDef | z.ZodStringDef | z.ZodBooleanDef;
		}
	}
}

/**
 * Convert a zod schema to a form control.
 */
export function formControlfromZodSchema(name: string, schema: z.ZodSchema): FormControlDef {
	const def = getDefinition(schema);
	if (def.typeName === z.ZodFirstPartyTypeKind.ZodEnum) {
		return {
			type: 'enum',
			name: name,
			label: name,
			description: schema.getMeta()?.description,
			required: !schema.isOptional(),
			options: [...def.values]
		};
	} else if (def.typeName === z.ZodFirstPartyTypeKind.ZodNumber) {
		return {
			type: 'number',
			name: name,
			label: name,
			description: schema.getMeta()?.description,
			required: !schema.isOptional(),
			integer: !!def.checks.find((c) => c.kind === 'int'),
			min: def.checks.find((c) => c.kind === 'min')?.value,
			max: def.checks.find((c) => c.kind === 'max')?.value
		};
	} else if (def.typeName === z.ZodFirstPartyTypeKind.ZodBoolean) {
		return {
			type: 'boolean',
			name: name,
			label: name,
			description: schema.getMeta()?.description,
			required: !schema.isOptional()
		};
	}
	return {
		type: 'text',
		name: name,
		label: name,
		description: schema.getMeta()?.description,
		required: !schema.isOptional()
	};
}
