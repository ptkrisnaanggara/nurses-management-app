import { useEffect } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createPeriod,
  generate,
  getAssignments,
  getFairness,
  getJob,
  listPeriods,
  publishPeriod,
  validatePeriod,
} from './api';

export function usePeriods(wardId: string | null) {
  return useQuery({
    queryKey: ['roster-periods', wardId],
    queryFn: () => listPeriods(wardId as string),
    enabled: Boolean(wardId),
  });
}

export function useAssignments(periodId: string | null) {
  return useQuery({
    queryKey: ['roster-assignments', periodId],
    queryFn: () => getAssignments(periodId as string),
    enabled: Boolean(periodId),
  });
}

export function useCreatePeriod(wardId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPeriod,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['roster-periods', wardId] }),
  });
}

/** Polls a generation job until it finishes, then refreshes assignments. */
export function useGenerationJob(periodId: string | null) {
  const qc = useQueryClient();
  const start = useMutation({ mutationFn: generate });

  const job = useQuery({
    queryKey: ['roster-job', start.data?.jobId],
    queryFn: () => getJob(start.data!.jobId),
    enabled: Boolean(start.data?.jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'DONE' || status === 'FAILED' ? false : 1500;
    },
  });

  const status = job.data?.status;
  useEffect(() => {
    if ((status === 'DONE' || status === 'FAILED') && periodId) {
      qc.invalidateQueries({ queryKey: ['roster-assignments', periodId] });
    }
  }, [status, periodId, qc]);

  return { start, job };
}

export function usePublish(wardId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: publishPeriod,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['roster-periods', wardId] }),
  });
}

export function useValidate() {
  return useMutation({ mutationFn: validatePeriod });
}

export function useFairness(periodId: string | null) {
  return useQuery({
    queryKey: ['roster-fairness', periodId],
    queryFn: () => getFairness(periodId as string),
    enabled: false, // fetched on demand via refetch()
  });
}
