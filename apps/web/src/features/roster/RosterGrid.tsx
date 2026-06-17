import { ShiftType } from '@nurses/shared';
import { Nurse } from '../nurses/api';
import { RosterAssignment } from './api';

const SHIFT_CODE: Record<ShiftType, string> = {
  [ShiftType.PAGI]: 'P',
  [ShiftType.SIANG]: 'S',
  [ShiftType.MALAM]: 'M',
  [ShiftType.LIBUR]: 'L',
};

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Read-only monthly grid: rows = nurses, columns = days, cells = shift code. */
export function RosterGrid({
  year,
  month,
  nurses,
  assignments,
}: {
  year: number;
  month: number;
  nurses: Nurse[];
  assignments: RosterAssignment[];
}) {
  const days = daysInMonth(year, month);
  const byKey = new Map<string, ShiftType>();
  for (const a of assignments) byKey.set(`${a.nurseId}|${a.date}`, a.shiftType);

  const dayList = Array.from({ length: days }, (_, i) => i + 1);
  const mm = String(month).padStart(2, '0');

  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Perawat</th>
            {dayList.map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nurses.map((nurse) => (
            <tr key={nurse.id}>
              <td>{nurse.fullName}</td>
              {dayList.map((d) => {
                const dd = String(d).padStart(2, '0');
                const shift = byKey.get(`${nurse.id}|${year}-${mm}-${dd}`);
                return (
                  <td key={d} data-shift={shift ?? ''}>
                    {shift ? SHIFT_CODE[shift] : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
