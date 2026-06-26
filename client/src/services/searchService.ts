import api from './api';
import { NAMASTECode } from '../types';

/**
 * Searches the NAMASTE traditional medical terminology directory.
 * @param query Query string containing terminology keywords.
 */
export const searchNAMASTECodes = async (query: string): Promise<NAMASTECode[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  console.log(`[SearchService] Querying backend with query: "${query}"`);
  
  try {
    const response = await api.get<NAMASTECode[]>('/search', {
      params: { q: query },
    });
    console.log(`[SearchService] Search success. Found ${response.data.length} results for: "${query}"`);
    return response.data;
  } catch (error: any) {
    console.error(`[SearchService] Search request failed for "${query}":`, error.message || error);
    throw error;
  }
};
