import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Holiday } from './entities/holiday.entity';
import { HolidayDto } from './dto/holiday.dto';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(Holiday) private readonly repo: Repository<Holiday>,
  ) {}

  findByYear(year: number): Promise<Holiday[]> {
    return this.repo.find({
      where: { date: Between(`${year}-01-01`, `${year}-12-31`) },
      order: { date: 'ASC' },
    });
  }

  /** Upsert a batch of holidays by date (idempotent re-import). */
  async import(holidays: HolidayDto[]): Promise<number> {
    for (const h of holidays) {
      const existing = await this.repo.findOne({ where: { date: h.date } });
      if (existing) {
        Object.assign(existing, h);
        await this.repo.save(existing);
      } else {
        await this.repo.save(this.repo.create(h));
      }
    }
    return holidays.length;
  }

  async isHoliday(date: string): Promise<boolean> {
    return (await this.repo.count({ where: { date } })) > 0;
  }
}
