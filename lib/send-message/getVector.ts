export default function getEmbedding(text: string) {
  if (!text || typeof text !== "string") {
    throw new Error("Text must be a non-empty string");
  }

  const tokens = tokenize(text);
  const uniqueWords = Array.from(new Set(tokens));

  // Create a frequency vector (bag-of-words)
  const vector = uniqueWords.map((word) => countOccurrences(word, tokens));

  return vector;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, "") // Remove punctuation
    .split(/\s+/) // Split by whitespace
    .filter(Boolean); // Remove empty strings
}

function countOccurrences(word: string, wordArray: string[]): number {
  return wordArray.filter((w) => w === word).length;
}
