// src/utils/aiService.js
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
/**
 * Fetches text embeddings from the Google Gemini API.
 * @param {string} text - The text to embed.
 * @returns {Promise<number[]>} - A promise that resolves to an array of embedding values.
 */
export const getEmbeddings = async (text) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text: text }] },
      }),
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
  }
  const data = await response.json();
  return data.embedding.values;   // 0.7 , 0.8
};
/**
 * Calculates the cosine similarity between two vectors.
 * @param {number[]} vecA - The first vector.
 * @param {number[]} vecB - The second vector.
 * @returns {number} - The cosine similarity score.
 */
// cosine similarity measures how two things are in direction
export const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    // dotProduct = 0+ 0.7 * 5.9;
    // dotProduct = dotProduct + vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
};



















