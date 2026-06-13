import { Router, Request, Response } from 'express';
import { z } from 'zod';
import NAMASTECode from '../models/NAMASTECode.js';

const router = Router();

const searchQuerySchema = z.object({
  q: z
    .string({ required_error: 'Query parameter q is required' })
    .min(2, 'Query must be at least 2 characters'),
});

router.get('/', async (req: Request, res: Response) => {
  const parsed = searchQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? 'Invalid query parameter';
    return res.status(400).json({ error: message });
  }

  const { q } = parsed.data;

  try {
    const results = await NAMASTECode.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10)
      .select('code name category description')
      .lean();

    const formatted = results.map((doc: any) => ({
      code: doc.code,
      name: doc.name,
      category: doc.category,
      description: doc.description,
      score: doc.score,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
