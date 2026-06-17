import { WorkWeekScheme } from '@nurses/shared';
import { apiClient } from '../../lib/api-client';

export interface Facility {
  id: string;
  name: string;
  city: string | null;
  workWeekScheme: WorkWeekScheme;
  timeZone: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchFacilities(): Promise<Facility[]> {
  const { data } = await apiClient.get<Facility[]>('/facilities');
  return data;
}
