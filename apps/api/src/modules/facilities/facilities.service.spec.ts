import { NotFoundException } from '@nestjs/common';
import { WorkWeekScheme } from '@nurses/shared';
import { FacilitiesService } from './facilities.service';
import { Facility } from './entities/facility.entity';
import { FacilityRepository } from './facility.repository';

/**
 * Demonstrates testability of the SOLID layering: the service is exercised
 * against an in-memory fake of the repository port — no DB, no TypeORM.
 */
class InMemoryFacilityRepository implements FacilityRepository {
  private store = new Map<string, Facility>();
  private seq = 0;

  async create(data: Partial<Facility>): Promise<Facility> {
    const facility = {
      id: `id-${++this.seq}`,
      name: data.name ?? '',
      city: data.city ?? null,
      workWeekScheme: data.workWeekScheme ?? WorkWeekScheme.SIX_DAY,
      timeZone: data.timeZone ?? 'Asia/Jakarta',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Facility;
    this.store.set(facility.id, facility);
    return facility;
  }
  async findAll(): Promise<Facility[]> {
    return [...this.store.values()];
  }
  async findById(id: string): Promise<Facility | null> {
    return this.store.get(id) ?? null;
  }
  async update(id: string, data: Partial<Facility>): Promise<Facility | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    Object.assign(existing, data);
    return existing;
  }
  async remove(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}

describe('FacilitiesService', () => {
  let service: FacilitiesService;

  beforeEach(() => {
    service = new FacilitiesService(new InMemoryFacilityRepository());
  });

  it('creates and retrieves a facility', async () => {
    const created = await service.create({ name: 'RSUD Test' });
    const found = await service.findOne(created.id);
    expect(found.name).toBe('RSUD Test');
    expect(found.workWeekScheme).toBe(WorkWeekScheme.SIX_DAY);
  });

  it('throws NotFound for a missing facility', async () => {
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates a facility', async () => {
    const created = await service.create({ name: 'Old' });
    const updated = await service.update(created.id, { name: 'New' });
    expect(updated.name).toBe('New');
  });
});
