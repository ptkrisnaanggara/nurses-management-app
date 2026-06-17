/**
 * Domain enums shared across the API and the web client.
 * Keep these free of any framework-specific imports.
 */

/** Application roles for RBAC. */
export enum UserRole {
  ADMIN = 'ADMIN',
  NURSING_MANAGER = 'NURSING_MANAGER',
  HEAD_NURSE = 'HEAD_NURSE',
  STAFF_NURSE = 'STAFF_NURSE',
  HRD = 'HRD',
}

/** Employment class — drives leave entitlements (PNS/ASN vs private/contract). */
export enum EmploymentClass {
  PNS = 'PNS',
  CONTRACT = 'CONTRACT',
}

/** Standard Indonesian 3-shift system. */
export enum ShiftType {
  PAGI = 'PAGI',
  SIANG = 'SIANG',
  MALAM = 'MALAM',
  LIBUR = 'LIBUR',
}

/** Clinical career ladder (Perawat Klinis), Permenkes 40/2017. */
export enum PkLevel {
  PK_I = 'PK_I',
  PK_II = 'PK_II',
  PK_III = 'PK_III',
  PK_IV = 'PK_IV',
  PK_V = 'PK_V',
}

/** Work-week scheme per UU 6/2023 Pasal 77. */
export enum WorkWeekScheme {
  SIX_DAY = 'SIX_DAY', // 7h/day, 6 days
  FIVE_DAY = 'FIVE_DAY', // 8h/day, 5 days
}

/** Where a rule applies; resolved by precedence (most specific wins). */
export enum RuleScope {
  GLOBAL = 'GLOBAL',
  FACILITY = 'FACILITY',
  WARD = 'WARD',
  EMPLOYMENT_CLASS = 'EMPLOYMENT_CLASS',
  ROLE = 'ROLE',
  INDIVIDUAL = 'INDIVIDUAL',
}

/** HARD rules cannot be violated; SOFT rules are weighted preferences. */
export enum RuleType {
  HARD = 'HARD',
  SOFT = 'SOFT',
}

export enum RuleCategory {
  WORKING_HOURS = 'WORKING_HOURS',
  REST = 'REST',
  OVERTIME = 'OVERTIME',
  NIGHT_WORK = 'NIGHT_WORK',
  GENDER_PROTECTION = 'GENDER_PROTECTION',
  COMPETENCY = 'COMPETENCY',
  STAFFING = 'STAFFING',
  LEAVE = 'LEAVE',
  FAIRNESS = 'FAIRNESS',
  FATIGUE = 'FATIGUE',
}

/** Leave / absence types (statutory + operational). */
export enum LeaveType {
  CUTI_TAHUNAN = 'CUTI_TAHUNAN',
  CUTI_SAKIT = 'CUTI_SAKIT',
  CUTI_MELAHIRKAN = 'CUTI_MELAHIRKAN',
  CUTI_KEGUGURAN = 'CUTI_KEGUGURAN',
  CUTI_HAID = 'CUTI_HAID',
  CUTI_BESAR = 'CUTI_BESAR',
  CUTI_PENTING = 'CUTI_PENTING',
  CUTI_BERSAMA = 'CUTI_BERSAMA',
  CUTI_DILUAR_TANGGUNGAN = 'CUTI_DILUAR_TANGGUNGAN',
  IZIN = 'IZIN',
}

export enum RosterStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  LOCKED = 'LOCKED',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

/** Patient dependency level for Douglas staffing calculation. */
export enum CareLevel {
  MINIMAL = 'MINIMAL',
  PARTIAL = 'PARTIAL',
  TOTAL = 'TOTAL',
}

export enum WardType {
  ICU = 'ICU',
  IGD = 'IGD',
  RAWAT_INAP = 'RAWAT_INAP',
  RAWAT_JALAN = 'RAWAT_JALAN',
  KEBIDANAN = 'KEBIDANAN',
  ANAK = 'ANAK',
  BEDAH = 'BEDAH',
}
