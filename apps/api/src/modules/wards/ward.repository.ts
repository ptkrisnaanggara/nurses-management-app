import { Ward } from './entities/ward.entity';

export interface WardRepository {
  create(data: Partial<Ward>): Promise<Ward>;
  findByFacility(facilityId: string): Promise<Ward[]>;
  findById(id: string): Promise<Ward | null>;
  update(id: string, data: Partial<Ward>): Promise<Ward | null>;
  remove(id: string): Promise<boolean>;
}

export const WARD_REPOSITORY = Symbol('WARD_REPOSITORY');
