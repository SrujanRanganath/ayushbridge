import { Router, Request, Response } from 'express';
import { z } from 'zod';
import ICD11Mapping from '../models/ICD11Mapping.js';
import ICD11Code from '../models/ICD11Code.js';
import NAMASTECode from '../models/NAMASTECode.js';

const router = Router();

const mapBodySchema = z.object({
  namasteCode: z.string().min(1, 'namasteCode is required'),
  conditionName: z.string().min(1, 'conditionName is required'),
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = mapBodySchema.safeParse(req.body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Invalid request body';
      return res.status(400).json({ error: message });
    }

    const { namasteCode, conditionName } = parsed.data;

    // Check cache first
    const cached = await ICD11Mapping.findOne({ namasteCode }).lean();
    if (cached) {
      return res.status(200).json({
        namasteCode: cached.namasteCode,
        icd11Code: cached.icd11Code,
        icd11Title: cached.icd11Title,
        confidence: cached.confidence,
        source: 'cache',
      });
    }

    // Search local ICD-11 database
    const results = await ICD11Code.find(
      { $text: { $search: conditionName } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(1)
      .lean();

    if (!results.length || !results[0].code) {
      return res.status(404).json({ error: 'No ICD-11 match found' });
    }

    const best = results[0] as any;
    const icd11Code = best.code;
    const icd11Title = best.title;

    // Save to cache
    await ICD11Mapping.create({
      namasteCode,
      icd11Code,
      icd11Title,
      confidence: 0.85,
    });

    return res.status(200).json({
      namasteCode,
      icd11Code,
      icd11Title,
      confidence: 0.85,
      source: 'local_db',
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Mapping failed' });
  }
});

export default router;