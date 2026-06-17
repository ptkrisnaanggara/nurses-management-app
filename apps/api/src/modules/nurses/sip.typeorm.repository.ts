import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SipLicense } from './entities/sip-license.entity';
import { SipRepository } from './sip.repository';

@Injectable()
export class SipTypeOrmRepository implements SipRepository {
  constructor(
    @InjectRepository(SipLicense)
    private readonly repo: Repository<SipLicense>,
  ) {}

  create(data: Partial<SipLicense>): Promise<SipLicense> {
    return this.repo.save(this.repo.create(data));
  }

  findByNurse(nurseId: string): Promise<SipLicense[]> {
    return this.repo.find({ where: { nurseId }, order: { expiresAt: 'DESC' } });
  }

  countByNurse(nurseId: string): Promise<number> {
    return this.repo.count({ where: { nurseId } });
  }
}
