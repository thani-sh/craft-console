import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';

/**
 * Validates form data.
 */
export async function validateFormData<T extends Record<string, z.ZodType>>(
	event: RequestEvent,
	schema: T
) {
	const formData = await event.request.formData();
	const data: Record<string, unknown> = {};
	for (const [key, value] of formData.entries()) {
		if (key in schema) {
			data[key] = schema[key].parse(value);
		}
	}
	return data as { [K in keyof T]: z.infer<T[K]> };
}

/**
 * Creates a slug from a file name
 */
export function slugify(name: string) {
	if (!name) return '';
	let slug = name.toLowerCase();
	slug = slug.replace(/\s+/g, '-');
	slug = slug.replace(/[^a-z0-9\-.]/g, '');
	slug = slug.replace(/^[-]+|[-]+$/g, '');
	slug = slug.replace(/-{2,}/g, '-');
	return slug;
}
