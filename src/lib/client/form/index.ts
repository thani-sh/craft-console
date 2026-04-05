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
 * Unwrap a zod schema, stripping Optional, Default, and Pipe (preprocess) wrappers,
 * returning the innermost concrete schema instance.
 */
function unwrap(root: z.ZodType): z.ZodType {
	let schema: z.ZodType = root;
	while (true) {
		if (schema instanceof z.ZodOptional) {
			schema = schema._def.innerType as z.ZodType;
		} else if (schema instanceof z.ZodDefault) {
			schema = schema._def.innerType as z.ZodType;
		} else if (schema instanceof z.ZodPipe) {
			// z.preprocess() produces a ZodPipe; the output schema is in _def.out
			schema = schema._def.out as z.ZodType;
		} else {
			return schema;
		}
	}
}

/**
 * Get the description metadata for a schema from the global registry.
 */
function getDescription(schema: z.ZodType): string | undefined {
	return z.globalRegistry.get(schema)?.description;
}

/**
 * Convert a zod schema to a form control.
 */
export function formControlfromZodSchema(name: string, schema: z.ZodType): FormControlDef {
	const inner = unwrap(schema);
	const description = getDescription(schema);

	if (inner instanceof z.ZodEnum) {
		return {
			type: 'enum',
			name,
			label: name,
			description,
			required: !schema.isOptional(),
			options: inner.options.map((o) => o.toString())
		};
	} else if (inner instanceof z.ZodNumber) {
		return {
			type: 'number',
			name,
			label: name,
			description,
			required: !schema.isOptional(),
			integer: inner.isInt ?? false,
			min: inner.minValue ?? undefined,
			max: inner.maxValue ?? undefined
		};
	} else if (inner instanceof z.ZodBoolean) {
		return {
			type: 'boolean',
			name,
			label: name,
			description,
			required: !schema.isOptional()
		};
	}
	return {
		type: 'text',
		name,
		label: name,
		description,
		required: !schema.isOptional()
	};
}
