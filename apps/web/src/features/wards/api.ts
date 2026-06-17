import { PkLevel, WardType } from '@nurses/shared';
import { apiClient } from '../../lib/api-client';

export interface Ward {
  id: string;
  facilityId: string;
  name: string;
  type: WardType;
  bedCount: number;
  shiftDemand: { pagi: number; siang: number; malam: number };
  minPkLevelOnShift: PkLevel | null;
}

export async function fetchWards(facilityId: string): Promise<Ward[]> {
  const { data } = await apiClient.get<Ward[]>('/wards', {
    params: { facilityId },
  });
  return data;
}
