import Complaint from '../models/Complaint.js';
import University from '../models/University.js';
import { getEmbedding } from './aiService.js';
import { cosineSimilarity } from '../utils/cosineSimilarity.js';

/**
 * Matches a complaint with the top 3 best-suited universities.
 * Formula: finalScore = (0.6 * categoryMatch) + (0.4 * embeddingSimilarity)
 * @param {string|mongoose.Types.ObjectId} complaintId
 * @returns {Promise<Array<{ universityId: string, score: number }>>}
 */
export async function matchUniversities(complaintId) {
  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return [];
    }

    const universities = await University.find({});
    if (!universities || universities.length === 0) {
      return [];
    }

    const scoredUniversities = [];

    for (const university of universities) {
      // If researchEmbedding is missing, generate and cache it
      if (!university.researchEmbedding || university.researchEmbedding.length === 0) {
        const textToEmbed = (university.researchKeywords && university.researchKeywords.length > 0)
          ? university.researchKeywords.join(' ')
          : `${university.name} ${university.disciplines.join(' ')}`;

        const generatedVec = await getEmbedding(textToEmbed);
        if (generatedVec && generatedVec.length > 0) {
          university.researchEmbedding = generatedVec;
          await university.save();
        }
      }

      // 1. Category match
      const categoryMatch = university.disciplines.some(
        (d) => d.toLowerCase() === (complaint.category || '').toLowerCase()
      )
        ? 1.0
        : 0.0;

      // 2. Embedding similarity
      const embeddingSimilarity = cosineSimilarity(
        complaint.embedding || [],
        university.researchEmbedding || []
      );

      // 3. Final weighted score
      const rawScore = 0.6 * categoryMatch + 0.4 * Math.max(0, embeddingSimilarity);
      const score = Number(rawScore.toFixed(4));

      scoredUniversities.push({
        universityId: university._id,
        score
      });
    }

    // Sort descending by score and pick top 3
    scoredUniversities.sort((a, b) => b.score - a.score);
    const top3 = scoredUniversities.slice(0, 3);

    complaint.suggestedUniversities = top3;
    await complaint.save();

    return top3;
  } catch (error) {
    console.error('[MatchingService] Error matching universities:', error.message);
    return [];
  }
}

export default {
  matchUniversities
};
