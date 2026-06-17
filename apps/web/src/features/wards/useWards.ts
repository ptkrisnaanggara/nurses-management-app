import { useQuery } from '@tanstack/react-query';
import { fetchWards } from './api';

export function useWards(facilityId: string | null) {
  return useQuery({
    queryKey: ['wards', facilityId],
    queryFn: () => fetchWards(facilityId as string),
    enabled: Boolean(facilityId),
  });
}
