import axios from 'axios';

export interface RecentMapping {
  namasteCode: string;
  namasteName?: string;
  icd11Code: string;
  icd11Title: string;
  date: string;
}

export interface RecentBundle {
  patientId: string;
  namasteCode: string;
  icd11Code: string;
  generatedDate: string;
}

export interface DashboardResponse {
  recentMappings: RecentMapping[];
  recentBundles: RecentBundle[];
}

export async function fetchDashboard(): Promise<DashboardResponse> {
  const resp = await axios.get('/api/v1/dashboard');
  return resp.data as DashboardResponse;
}

export default { fetchDashboard };
