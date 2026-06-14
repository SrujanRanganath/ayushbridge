import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import AyurvedicEnrichment from '../models/AyurvedicEnrichment.js';

const router = Router();

router.get('/:conditionName', async (req: AuthRequest, res: Response) => {
  const { conditionName } = req.params;

  try {
    const results = await AyurvedicEnrichment.find(
      { $text: { $search: conditionName } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(1)
      .lean();

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No enrichment data found' });
    }

    const doc: any = results[0];

    return res.status(200).json({
      disease: doc.disease,
      doshas: doc.doshas,
      ayurvedicHerbs: doc.ayurvedicHerbs,
      formulation: doc.formulation,
      symptoms: doc.symptoms,
      dietRecommendations: doc.dietRecommendations,
      yogaTherapy: doc.yogaTherapy,
      prognosis: doc.prognosis,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
