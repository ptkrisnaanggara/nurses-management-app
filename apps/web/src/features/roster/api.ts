import { RosterStatus, ShiftType } from '@nurses/shared';
import { apiClient } from '../../lib/api-client';

export interface RosterPeriod {
  id: string;
  facilityId: string;
  wardId: string;
  year: number;
  month: number;
  status: RosterStatus;
  publishedAt: string | null;
}

export interface RosterAssignment {
  id: string;
  nurseId: string;
  date: string;
  shiftType: ShiftType;
}

export interface GenerationJob {
  jobId: string;
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
  createdCount?: number;
  unfilledCount?: number;
  error?: string;
}

export interface RuleViolation {
  ruleName: string;
  message: string;
  legalReference?: string;
}

export interface PeriodValidation {
  allowed: boolean;
  hardViolations: number;
  results: {
    assignmentId: string;
    result: { allowed: boolean; violations: RuleViolation[]; softScore: number };
  }[];
}

export async function listPeriods(wardId: string): Promise<RosterPeriod[]> {
  const { data } = await apiClient.get<RosterPeriod[]>('/roster/periods', {
    params: { wardId },
  });
  return data;
}

export async function createPeriod(input: {
  facilityId: string;
  wardId: string;
  year: number;
  month: number;
}): Promise<RosterPeriod> {
  const { data } = await apiClient.post<RosterPeriod>('/roster/periods', input);
  return data;
}

export async function getAssignments(
  periodId: string,
): Promise<RosterAssignment[]> {
  const { data } = await apiClient.get<RosterAssignment[]>(
    `/roster/periods/${periodId}/assignments`,
  );
  return data;
}

export async function generate(periodId: string): Promise<{ jobId: string }> {
  const { data } = await apiClient.post<{ jobId: string }>(
    `/roster/periods/${periodId}/generate`,
  );
  return data;
}

export async function getJob(jobId: string): Promise<GenerationJob> {
  const { data } = await apiClient.get<GenerationJob>(`/roster/jobs/${jobId}`);
  return data;
}

export async function validatePeriod(
  periodId: string,
): Promise<PeriodValidation> {
  const { data } = await apiClient.get<PeriodValidation>(
    `/roster/periods/${periodId}/validate`,
  );
  return data;
}

export async function publishPeriod(periodId: string): Promise<RosterPeriod> {
  const { data } = await apiClient.post<RosterPeriod>(
    `/roster/periods/${periodId}/publish`,
  );
  return data;
}
