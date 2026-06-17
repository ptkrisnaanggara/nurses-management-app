import { useQuery } from '@tanstack/react-query';
import { fetchCompliance, fetchNurses } from './api';

export function useNurses(facilityId: string | null) {
  return useQuery({
    queryKey: ['nurses', facilityId],
    queryFn: () => fetchNurses(facilityId as string),
    enabled: Boolean(facilityId),
  });
}

export function useNurseCompliance(nurseId: string | null) {
  return useQuery({
    queryKey: ['nurse-compliance', nurseId],
    queryFn: () => fetchCompliance(nurseId as string),
    enabled: Boolean(nurseId),
  });
}
