import { Nurse } from './entities/nurse.entity';
import { SipLicense } from './entities/sip-license.entity';

export type ComplianceSeverity = 'WARNING' | 'CRITICAL';

export interface ComplianceAlert {
  code: string;
  severity: ComplianceSeverity;
  message: string;
}

/** Defaults (configurable later via the rule engine). */
export const COMPLIANCE_DEFAULTS = {
  SIP_EXPIRY_WARNING_DAYS: 90,
  SKP_REQUIRED_PER_CYCLE: 25,
};

function daysUntil(dateIso: string, now: Date): number {
  const target = new Date(`${dateIso}T00:00:00Z`).getTime();
  return Math.floor((target - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Pure compliance check — no DB/framework. Flags SIP expiry/absence and SKP
 * shortfall. Exposed standalone so it is trivially unit-testable.
 */
export function checkCompliance(
  nurse: Pick<Nurse, 'skpCredits'>,
  sips: SipLicense[],
  now = new Date(),
): ComplianceAlert[] {
  const alerts: ComplianceAlert[] = [];

  if (sips.length === 0) {
    alerts.push({
      code: 'SIP_MISSING',
      severity: 'CRITICAL',
      message: 'Nurse has no SIP on record',
    });
  } else {
    const latest = sips.reduce((a, b) => (a.expiresAt > b.expiresAt ? a : b));
    const days = daysUntil(latest.expiresAt, now);
    if (days < 0) {
      alerts.push({
        code: 'SIP_EXPIRED',
        severity: 'CRITICAL',
        message: `SIP expired ${Math.abs(days)} day(s) ago`,
      });
    } else if (days <= COMPLIANCE_DEFAULTS.SIP_EXPIRY_WARNING_DAYS) {
      alerts.push({
        code: 'SIP_EXPIRING',
        severity: 'WARNING',
        message: `SIP expires in ${days} day(s)`,
      });
    }
  }

  if (nurse.skpCredits < COMPLIANCE_DEFAULTS.SKP_REQUIRED_PER_CYCLE) {
    alerts.push({
      code: 'SKP_SHORTFALL',
      severity: 'WARNING',
      message: `SKP credits ${nurse.skpCredits}/${COMPLIANCE_DEFAULTS.SKP_REQUIRED_PER_CYCLE}`,
    });
  }

  return alerts;
}
