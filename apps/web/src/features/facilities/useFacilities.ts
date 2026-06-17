import { useQuery } from '@tanstack/react-query';
import { fetchFacilities } from './api';

/** Server-state hook for the facilities list (TanStack Query). */
export function useFacilities() {
  return useQuery({
    queryKey: ['facilities'],
    queryFn: fetchFacilities,
  });
}
