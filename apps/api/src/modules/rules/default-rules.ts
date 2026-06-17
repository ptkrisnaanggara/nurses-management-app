import { LABOR_DEFAULTS } from '@nurses/shared';
import { RuleCategory, RuleScope, RuleType } from '@nurses/shared';
import { Rule } from './entities/rule.entity';
import { RuleKey } from './evaluation/rule-keys';

/**
 * The seed rule set for the "Indonesia – RS Umum" profile: statutory defaults
 * from PRD §3, all GLOBAL scope. The night-work protections are locked
 * (overridable = false) because they are legal floors.
 */
export const DEFAULT_INDONESIA_RULES: Partial<Rule>[] = [
  {
    key: RuleKey.MAX_HOURS_PER_WEEK,
    name: 'Maksimum jam kerja per minggu',
    description: 'Total jam terjadwal dalam satu minggu tidak boleh melebihi batas.',
    scope: RuleScope.GLOBAL,
    type: RuleType.HARD,
    category: RuleCategory.WORKING_HOURS,
    params: { maxHoursPerWeek: LABOR_DEFAULTS.MAX_HOURS_PER_WEEK },
    legalReference: 'UU 6/2023 Pasal 77; PP 35/2021',
    overridable: true,
  },
  {
    key: RuleKey.MIN_REST_BETWEEN_SHIFTS,
    name: 'Istirahat minimum antar shift',
    description: 'Jeda minimum antara dua shift.',
    scope: RuleScope.GLOBAL,
    type: RuleType.HARD,
    category: RuleCategory.REST,
    params: { minRestHours: LABOR_DEFAULTS.MIN_REST_BETWEEN_SHIFTS_HOURS },
    legalReference: 'Praktik terbaik (11 jam)',
    overridable: true,
  },
  {
    key: RuleKey.NO_NIGHT_THEN_MORNING,
    name: 'Larangan malam lalu pagi',
    description: 'Shift pagi tepat setelah shift malam tidak diperbolehkan.',
    scope: RuleScope.GLOBAL,
    type: RuleType.HARD,
    category: RuleCategory.FATIGUE,
    params: {},
    legalReference: 'Pedoman anti-kelelahan',
    overridable: true,
  },
  {
    key: RuleKey.MAX_CONSECUTIVE_NIGHTS,
    name: 'Maksimum shift malam berturut-turut',
    scope: RuleScope.GLOBAL,
    type: RuleType.HARD,
    category: RuleCategory.FATIGUE,
    params: { maxConsecutiveNights: LABOR_DEFAULTS.MAX_CONSECUTIVE_NIGHTS },
    legalReference: 'Pedoman anti-kelelahan',
    overridable: true,
  },
  {
    key: RuleKey.UNDER_18_NO_NIGHT,
    name: 'Pekerja perempuan di bawah 18 tahun dilarang shift malam',
    scope: RuleScope.GLOBAL,
    type: RuleType.HARD,
    category: RuleCategory.GENDER_PROTECTION,
    params: {},
    legalReference: 'UU 13/2003 Pasal 76(1)',
    overridable: false,
  },
  {
    key: RuleKey.PREGNANT_NO_NIGHT,
    name: 'Pekerja hamil berisiko dilarang shift malam',
    scope: RuleScope.GLOBAL,
    type: RuleType.HARD,
    category: RuleCategory.GENDER_PROTECTION,
    params: {},
    legalReference: 'UU 13/2003 Pasal 76(2)',
    overridable: false,
  },
];
