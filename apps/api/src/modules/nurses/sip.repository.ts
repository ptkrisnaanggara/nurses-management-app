import { SipLicense } from './entities/sip-license.entity';

export interface SipRepository {
  create(data: Partial<SipLicense>): Promise<SipLicense>;
  findByNurse(nurseId: string): Promise<SipLicense[]>;
  countByNurse(nurseId: string): Promise<number>;
}

export const SIP_REPOSITORY = Symbol('SIP_REPOSITORY');
