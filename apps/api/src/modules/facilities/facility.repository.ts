import { Facility } from './entities/facility.entity';

/**
 * Port (interface) for facility persistence. Services depend on this token,
 * not on TypeORM — Dependency Inversion. Swap the adapter for tests or a
 * different datastore without touching business logic.
 */
export interface FacilityRepository {
  create(data: Partial<Facility>): Promise<Facility>;
  findAll(): Promise<Facility[]>;
  findById(id: string): Promise<Facility | null>;
  update(id: string, data: Partial<Facility>): Promise<Facility | null>;
  remove(id: string): Promise<boolean>;
}

/** DI token for the FacilityRepository port. */
export const FACILITY_REPOSITORY = Symbol('FACILITY_REPOSITORY');
