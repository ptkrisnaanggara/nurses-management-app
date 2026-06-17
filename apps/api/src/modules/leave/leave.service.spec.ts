import { BadRequestException } from '@nestjs/common';
import { LeaveType, RequestStatus } from '@nurses/shared';
import { Repository } from 'typeorm';
import { LeaveService } from './leave.service';
import { LeaveRequest } from './entities/leave-request.entity';

// Minimal in-memory stand-in for the TypeORM repository.
function fakeRepo() {
  const store: LeaveRequest[] = [];
  return {
    create: (d: Partial<LeaveRequest>) => ({ id: 'l1', ...d }) as LeaveRequest,
    save: async (e: LeaveRequest) => {
      store.push(e);
      return e;
    },
    find: async () => store,
    findOne: async () => store[0] ?? null,
  } as unknown as Repository<LeaveRequest>;
}

describe('LeaveService', () => {
  let service: LeaveService;

  beforeEach(() => {
    service = new LeaveService(fakeRepo());
  });

  it('creates a pending leave request', async () => {
    const req = await service.create({
      nurseId: 'n1',
      type: LeaveType.CUTI_TAHUNAN,
      startDate: '2026-07-21',
      endDate: '2026-07-23',
    });
    expect(req.status).toBe(RequestStatus.PENDING);
  });

  it('rejects an end date before the start date', async () => {
    await expect(
      service.create({
        nurseId: 'n1',
        type: LeaveType.CUTI_TAHUNAN,
        startDate: '2026-07-23',
        endDate: '2026-07-21',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('caps cuti haid at 2 days (Pasal 81)', async () => {
    await expect(
      service.create({
        nurseId: 'n1',
        type: LeaveType.CUTI_HAID,
        startDate: '2026-07-21',
        endDate: '2026-07-24',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
