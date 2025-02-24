/**
 * Generate a random string of a given length.
 */
export function randomString(length = 10) {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += characters.charAt(randomInt(characters.length));
	}
	return result;
}

/**
 * Generate a random integer between two numbers.
 */
export function randomInt(max: number) {
	return Math.floor(Math.random() * (max + 1));
}
