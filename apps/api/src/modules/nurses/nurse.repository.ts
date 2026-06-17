import { Nurse } from './entities/nurse.entity';

/** Persistence port for nurses. */
export interface NurseRepository {
  create(data: Partial<Nurse>): Promise<Nurse>;
  findByFacility(facilityId: string): Promise<Nurse[]>;
  findById(id: string): Promise<Nurse | null>;
  /** Includes restricted health flags + SIP licences; for authorised callers. */
  findByIdWithSensitive(id: string): Promise<Nurse | null>;
  update(id: string, data: Partial<Nurse>): Promise<Nurse | null>;
  remove(id: string): Promise<boolean>;
  /** All nurses whose health flags are needed for scheduling (with secrets). */
  findAllWithSensitive(): Promise<Nurse[]>;
  /** Active nurses of a facility, including health flags, for scheduling. */
  findByFacilityWithSensitive(facilityId: string): Promise<Nurse[]>;
}

export const NURSE_REPOSITORY = Symbol('NURSE_REPOSITORY');
