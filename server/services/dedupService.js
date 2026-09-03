import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';
import { cosineSimilarity } from '../utils/cosineSimilarity.js';
import { haversine } from '../utils/haversine.js';

/**
 * Check if the given complaint is a duplicate of an existing complaint.
 * Condition: Cosine similarity > 0.85 AND Haversine distance <= 5.0 km
 * @param {string|mongoose.Types.ObjectId} complaintId
 * @returns {Promise<{ isDuplicate: boolean, matchedComplaintId?: string }>}
 */
export async function checkDuplicates(complaintId) {
  try {
    const currentComplaint = await Complaint.findById(complaintId);
    if (!currentComplaint) {
      return { isDuplicate: false };
    }

    if (!currentComplaint.embedding || currentComplaint.embedding.length === 0) {
      return { isDuplicate: false };
    }

    // Find other complaints created before or around this one that are not duplicates of this one
    const candidates = await Complaint.find({
      _id: { $ne: currentComplaint._id },
      status: { $ne: 'duplicate' }
    });

    for (const candidate of candidates) {
      if (!candidate.embedding || candidate.embedding.length === 0) {
        continue;
      }

      const distanceKm = haversine(currentComplaint.location, candidate.location);
      const similarity = cosineSimilarity(currentComplaint.embedding, candidate.embedding);

      if (similarity > 0.85 && distanceKm <= 5.0) {
        currentComplaint.status = 'duplicate';
        currentComplaint.duplicateOf = candidate._id;
        await currentComplaint.save();

        // Create a notification for the citizen
        await Notification.create({
          userId: currentComplaint.submittedBy,
          message: 'Your complaint appears similar to an existing one',
          type: 'duplicate_detected',
          relatedId: candidate._id
        });

        return {
          isDuplicate: true,
          matchedComplaintId: candidate._id.toString()
        };
      }
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error('[DedupService] Error checking duplicates:', error.message);
    return { isDuplicate: false };
  }
}

export default {
  checkDuplicates
};
