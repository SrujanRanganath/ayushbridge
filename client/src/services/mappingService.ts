import axios from 'axios';

export interface MappingResult {
  icdCode: string;
  icdTitle: string;
  confidence: number;
  source: string;
  conditionName?: string;
  namasteCode?: string;
}

export async function mapNAMASTECode(namasteCode: string, conditionName: string): Promise<MappingResult> {
  const resp = await axios.post('http://localhost:5000/api/v1/map', {
    namasteCode,
    conditionName,
  });
  return resp.data as MappingResult;
}

export default { mapNAMASTECode };
