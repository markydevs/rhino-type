import { faker } from "@faker-js/faker";

export function generateWords(count) {
	const theWords = faker.word.words(50).split(" "); // Split the string into an array of words
	theWords.sort(() => Math.random() - 0.5); // Shuffle the array

	return Array.from({ length: count }, () => {
		const index = Math.floor(Math.random() * theWords.length); // Get random index
		return theWords[index];
	});
}
