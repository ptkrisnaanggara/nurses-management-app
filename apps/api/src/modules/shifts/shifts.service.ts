import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DEFAULT_SHIFT_HOURS, ShiftType } from '@nurses/shared';
import {
  CreateShiftDefinitionDto,
  UpdateShiftDefinitionDto,
} from './dto/shift-definition.dto';
import { ShiftDefinition } from './entities/shift-definition.entity';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(ShiftDefinition)
    private readonly repo: Repository<ShiftDefinition>,
  ) {}

  create(dto: CreateShiftDefinitionDto): Promise<ShiftDefinition> {
    return this.repo.save(this.repo.create(dto));
  }

  findByFacility(facilityId: string): Promise<ShiftDefinition[]> {
    return this.repo.find({ where: { facilityId }, order: { startTime: 'ASC' } });
  }

  async update(
    id: string,
    dto: UpdateShiftDefinitionDto,
  ): Promise<ShiftDefinition> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Shift ${id} not found`);
    Object.assign(existing, dto);
    return this.repo.save(existing);
  }

  /**
   * Facility shift hours keyed by shift type, with the national defaults
   * (PRD §3.7) overlaid by any active facility-specific definitions.
   */
  async hoursMap(
    facilityId: string,
  ): Promise<Partial<Record<ShiftType, { start: string; end: string }>>> {
    const map: Partial<Record<ShiftType, { start: string; end: string }>> = {
      [ShiftType.PAGI]: DEFAULT_SHIFT_HOURS[ShiftType.PAGI],
      [ShiftType.SIANG]: DEFAULT_SHIFT_HOURS[ShiftType.SIANG],
      [ShiftType.MALAM]: DEFAULT_SHIFT_HOURS[ShiftType.MALAM],
    };
    for (const def of await this.findByFacility(facilityId)) {
      if (def.active) map[def.shiftType] = { start: def.startTime, end: def.endTime };
    }
    return map;
  }

  /** Seed the default 3-shift hours (Pagi/Siang/Malam) for a facility. */
  async seedDefaults(facilityId: string): Promise<ShiftDefinition[]> {
    const types = [ShiftType.PAGI, ShiftType.SIANG, ShiftType.MALAM] as const;
    const created: ShiftDefinition[] = [];
    for (const shiftType of types) {
      const exists = await this.repo.findOne({
        where: { facilityId, shiftType },
      });
      if (exists) continue;
      const hours = DEFAULT_SHIFT_HOURS[shiftType];
      created.push(
        await this.repo.save(
          this.repo.create({
            facilityId,
            shiftType,
            startTime: hours.start,
            endTime: hours.end,
          }),
        ),
      );
    }
    return created;
  }
}
