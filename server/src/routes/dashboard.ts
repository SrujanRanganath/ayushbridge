import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import ICD11Mapping from '../models/ICD11Mapping.js';
import FHIRBundle from '../models/FHIRBundle.js';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [mappings, totalMappings, bundles, totalBundles] = await Promise.all([
      ICD11Mapping.find().sort({ cachedAt: -1 }).skip(skip).limit(limit).lean(),
      ICD11Mapping.countDocuments(),
      FHIRBundle.find().sort({ generatedAt: -1 }).skip(skip).limit(limit).lean(),
      FHIRBundle.countDocuments(),
    ]);

    return res.status(200).json({
      mappings: {
        data: mappings,
        total: totalMappings,
        page,
        pages: Math.ceil(totalMappings / limit),
      },
      bundles: {
        data: bundles.map(b => ({
          id: b._id,
          patientId: b.patientId,
          namasteCode: b.namasteCode,
          icd11Code: b.icd11Code,
          generatedAt: b.generatedAt,
        })),
        total: totalBundles,
        page,
        pages: Math.ceil(totalBundles / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Dashboard fetch failed' });
  }
});

export default router;