import IndustryPartner from '../models/IndustryPartner.js';

/**
 * GET /api/industry-partners
 * List all industry partners
 */
export async function getIndustryPartners(_req, res, next) {
  try {
    const partners = await IndustryPartner.find({}).populate('userId', 'name email phone');
    return res.status(200).json({
      success: true,
      count: partners.length,
      industryPartners: partners
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/industry-partners
 * Role: admin
 * Create an industry partner profile
 */
export async function createIndustryPartner(req, res, next) {
  try {
    const { userId, name, type, sectorFocus, contactEmail } = req.body;

    if (!userId || !name) {
      return res.status(400).json({
        success: false,
        message: 'userId and name are required'
      });
    }

    const partner = new IndustryPartner({
      userId,
      name: name.trim(),
      type: type || 'startup',
      sectorFocus: Array.isArray(sectorFocus) ? sectorFocus : [],
      contactEmail: contactEmail ? contactEmail.trim().toLowerCase() : ''
    });

    await partner.save();

    return res.status(201).json({
      success: true,
      industryPartner: partner
    });
  } catch (error) {
    next(error);
  }
}
