// Cosine similarity helper
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

// Find similar verses from Arabic Bible
export default async function findSimilarVerses(inputEmbedding) {
  const res = await fetch("/bible_index.json");
  const data = await res.json();

  const similarities = data.map(({ book, chapter, verse, text, embedding }) => {
    const similarity = cosineSimilarity(inputEmbedding, embedding);
    return { book, chapter, verse, text, similarity };
  });

  // Sort and return top 5 full verse objects
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
}
