import Complaint from '../models/Complaint.js';
import Project from '../models/Project.js';
import University from '../models/University.js';
import IndustryPartner from '../models/IndustryPartner.js';

/**
 * GET /api/analytics/summary
 * Role: admin
 */
export async function getAnalyticsSummary(_req, res, next) {
  try {
    const [complaintStats, totalUniversities, totalIndustryPartners, completedProjects] = await Promise.all([
      Complaint.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            byCategory: [
              { $group: { _id: '$category', count: { $sum: 1 } } },
              { $project: { category: '$_id', count: 1, _id: 0 } },
              { $sort: { count: -1 } }
            ],
            byStatus: [
              { $group: { _id: '$status', count: { $sum: 1 } } },
              { $project: { status: '$_id', count: 1, _id: 0 } }
            ],
            byDistrict: [
              { $group: { _id: '$district', count: { $sum: 1 } } },
              { $project: { district: '$_id', count: 1, _id: 0 } },
              { $sort: { count: -1 } }
            ]
          }
        }
      ]),
      University.countDocuments(),
      IndustryPartner.countDocuments(),
      Project.countDocuments({ status: 'completed' })
    ]);

    const facets = complaintStats[0] || {};
    const totalComplaints = facets.total?.[0]?.count || 0;
    const byCategory = facets.byCategory || [];
    const byStatus = facets.byStatus || [];
    const byDistrict = facets.byDistrict || [];

    return res.status(200).json({
      success: true,
      totalComplaints,
      byCategory,
      byStatus,
      byDistrict,
      totalUniversitiesParticipating: totalUniversities,
      totalIndustryPartnersEngaged: totalIndustryPartners,
      totalProjectsCompleted: completedProjects
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/trends
 * Role: admin
 * Returns complaint submissions by day for the last 30 days
 */
export async function getAnalyticsTrends(_req, res, next) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trends = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          date: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    return res.status(200).json({
      success: true,
      trends
    });
  } catch (error) {
    next(error);
  }
}
