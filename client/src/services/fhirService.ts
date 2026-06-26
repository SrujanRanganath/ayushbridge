import axios from 'axios';

export interface GenerateBundleInput {
  patientId: string;
  namasteCode: string;
  icd11Code: string;
  icd11Title: string;
  conditionName: string;
}

export async function generateFHIRBundle(input: GenerateBundleInput): Promise<any> {
  const resp = await axios.post('http://localhost:5000/api/v1/fhir/bundle', input);
  return resp.data;
}

export default { generateFHIRBundle };
