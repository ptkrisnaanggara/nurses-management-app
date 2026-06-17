import { EmploymentClass, PkLevel } from '@nurses/shared';
import { apiClient } from '../../lib/api-client';

export interface Nurse {
  id: string;
  facilityId: string;
  fullName: string;
  gender: 'M' | 'F';
  birthDate: string;
  employmentClass: EmploymentClass;
  pkLevel: PkLevel | null;
  skpCredits: number;
  weeklyContractHours: number;
}

export interface ComplianceAlert {
  code: string;
  severity: 'WARNING' | 'CRITICAL';
  message: string;
}

export async function fetchNurses(facilityId: string): Promise<Nurse[]> {
  const { data } = await apiClient.get<Nurse[]>('/nurses', {
    params: { facilityId },
  });
  return data;
}

export async function fetchCompliance(
  nurseId: string,
): Promise<ComplianceAlert[]> {
  const { data } = await apiClient.get<ComplianceAlert[]>(
    `/nurses/${nurseId}/compliance`,
  );
  return data;
}
