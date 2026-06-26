export interface TerminologyItem {
  id: string;
  ayushTerm: string;
  system: 'Ayurveda' | 'Unani' | 'Siddha' | 'Homeopathy' | 'Yoga & Naturopathy';
  englishTranslation: string;
  icd11Code: string;
  status: 'Mapped' | 'Pending' | 'Review';
}

export interface MappingJob {
  id: string;
  sourceSystem: string;
  sourceTerm: string;
  targetSystem: string;
  targetCode: string;
  confidence: number;
  dateCreated: string;
}

export interface BundleMetadata {
  id: string;
  type: string;
  resourceCount: number;
  systemOrigin: string;
  timestamp: string;
  status: 'Valid' | 'Invalid' | 'Unverified';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface NAMASTECode {
  code: string;
  name: string;
  category: string;
  description: string;
  score?: number;
}


