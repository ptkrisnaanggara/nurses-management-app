import { SipLicense } from './entities/sip-license.entity';
import { checkCompliance } from './nurse-compliance';

const NOW = new Date('2026-06-17T00:00:00Z');

function sip(expiresAt: string): SipLicense {
  return { expiresAt, sipNumber: 'x', workplace: 'RS' } as SipLicense;
}

describe('checkCompliance', () => {
  it('flags a missing SIP as critical', () => {
    const alerts = checkCompliance({ skpCredits: 30 }, [], NOW);
    expect(alerts.map((a) => a.code)).toContain('SIP_MISSING');
  });

  it('warns when a SIP expires within 90 days', () => {
    const alerts = checkCompliance({ skpCredits: 30 }, [sip('2026-08-01')], NOW);
    expect(alerts.find((a) => a.code === 'SIP_EXPIRING')?.severity).toBe(
      'WARNING',
    );
  });

  it('flags an expired SIP as critical', () => {
    const alerts = checkCompliance({ skpCredits: 30 }, [sip('2026-01-01')], NOW);
    expect(alerts.find((a) => a.code === 'SIP_EXPIRED')?.severity).toBe(
      'CRITICAL',
    );
  });

  it('flags an SKP shortfall', () => {
    const alerts = checkCompliance({ skpCredits: 10 }, [sip('2030-01-01')], NOW);
    expect(alerts.map((a) => a.code)).toContain('SKP_SHORTFALL');
  });

  it('returns no alerts for a fully-compliant nurse', () => {
    const alerts = checkCompliance({ skpCredits: 30 }, [sip('2030-01-01')], NOW);
    expect(alerts).toHaveLength(0);
  });
});
