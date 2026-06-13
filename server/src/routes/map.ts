import { Router, Request, Response } from 'express';
import { z } from 'zod';
import ICD11Mapping from '../models/ICD11Mapping.js';

const router = Router();

const mapBodySchema = z.object({
  namasteCode: z.string().min(1, 'namasteCode is required'),
  conditionName: z.string().min(1, 'conditionName is required'),
});

const WHO_TOKEN_URL = 'https://icdaccessmanagement.who.int/connect/token';
const WHO_SEARCH_URL = 'https://id.who.int/icd/entity/search';

async function getWhoAccessToken(): Promise<string> {
  const clientId = process.env.WHO_CLIENT_ID;
  const clientSecret = process.env.WHO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('WHO API credentials are not configured');
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'icdapi_access',
  });

  console.log('WHO credentials:', { clientId: clientId?.slice(0, 5), hasSecret: !!clientSecret });

  const response = await fetch(WHO_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`WHO token request failed with status ${response.status}`);
  }

  const data = (await response.json()) as { access_token?: string };

  if (!data.access_token) {
    throw new Error('WHO token response missing access_token');
  }

  return data.access_token;
}

async function searchWhoIcd11(
  conditionName: string,
  accessToken: string
): Promise<{ code: string; title: string }> {
  const url = `${WHO_SEARCH_URL}?q=${encodeURIComponent(conditionName)}&useFlexisearch=true`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Accept-Language': 'en',
      'API-Version': 'v2',
    },
  });

  if (!response.ok) {
    throw new Error(`WHO search request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    destinationEntities?: Array<{ theCode?: string; title?: string }>;
  };

  console.log('WHO RESPONSE:', JSON.stringify(data, null, 2));

  const firstResult = data.destinationEntities?.[0];

  if (!firstResult?.theCode || !firstResult?.title) {
    throw new Error('WHO search returned no usable results');
  }

  return {
    code: firstResult.theCode,
    title: firstResult.title,
  };
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = mapBodySchema.safeParse(req.body);

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? 'Invalid request body';
      return res.status(400).json({ error: message });
    }

    const { namasteCode, conditionName } = parsed.data;

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

    let accessToken: string;
    try {
      accessToken = await getWhoAccessToken();
    } catch (error) {
      console.error('TOKEN ERROR:', JSON.stringify(error, null, 2));
      return res.status(503).json({ error: 'WHO API unavailable' });
    }

    let icd11Code: string;
    let icd11Title: string;
    try {
      const searchResult = await searchWhoIcd11(conditionName, accessToken);
      icd11Code = searchResult.code;
      icd11Title = searchResult.title;
    } catch (error) {
      console.error(error);
      return res.status(503).json({ error: 'WHO API unavailable' });
    }

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
      source: 'who_api',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Mapping failed' });
  }
});

export default router;
