import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useNurses } from '../nurses/useNurses';
import { PeriodValidation } from './api';
import { RosterGrid } from './RosterGrid';
import {
  useAssignments,
  useCreatePeriod,
  useFairness,
  useGenerationJob,
  usePeriods,
  usePublish,
  useValidate,
} from './useRoster';

export function RosterPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const facilityId = params.get('facilityId');
  const wardId = params.get('wardId');

  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(7);

  const periods = usePeriods(wardId);
  const period = useMemo(
    () => periods.data?.find((p) => p.year === year && p.month === month),
    [periods.data, year, month],
  );

  const nurses = useNurses(facilityId);
  const assignments = useAssignments(period?.id ?? null);
  const createPeriod = useCreatePeriod(wardId);
  const { start: startGen, job } = useGenerationJob(period?.id ?? null);
  const publish = usePublish(wardId);
  const validate = useValidate();
  const [validation, setValidation] = useState<PeriodValidation | null>(null);
  const fairness = useFairness(period?.id ?? null);
  const nameById = useMemo(
    () => new Map((nurses.data ?? []).map((n) => [n.id, n.fullName])),
    [nurses.data],
  );

  if (!facilityId || !wardId) return <p>{t('roster.selectWard')}</p>;

  return (
    <section>
      <h1>{t('roster.title')}</h1>

      <div>
        <label>
          {t('roster.year')}
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </label>
        <label>
          {t('roster.month')}
          <input
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          />
        </label>
      </div>

      {!period ? (
        <button
          type="button"
          disabled={createPeriod.isPending}
          onClick={() =>
            createPeriod.mutate({ facilityId, wardId, year, month })
          }
        >
          {t('roster.createPeriod')}
        </button>
      ) : (
        <>
          <p>
            {t('roster.status')}: <strong>{period.status}</strong>
          </p>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              disabled={startGen.isPending || job.data?.status === 'RUNNING'}
              onClick={() => startGen.mutate(period.id)}
            >
              {t('roster.generate')}
            </button>
            <button
              type="button"
              onClick={() =>
                validate.mutate(period.id, { onSuccess: setValidation })
              }
            >
              {t('roster.validate')}
            </button>
            <button
              type="button"
              disabled={publish.isPending}
              onClick={() => publish.mutate(period.id)}
            >
              {t('roster.publish')}
            </button>
            <button type="button" onClick={() => fairness.refetch()}>
              {t('roster.fairness')}
            </button>
          </div>

          {job.data && (
            <p>
              {t('roster.job')}: {job.data.status}
              {job.data.status === 'DONE' &&
                ` — ${job.data.createdCount} ${t('roster.created')}, ${job.data.unfilledCount} ${t('roster.unfilled')}`}
            </p>
          )}

          {publish.isError && <p role="alert">{t('roster.publishBlocked')}</p>}

          {validation && (
            <p data-allowed={validation.allowed}>
              {validation.allowed
                ? t('roster.compliant')
                : `${validation.hardViolations} ${t('roster.violations')}`}
            </p>
          )}

          {fairness.data && (
            <div>
              <h2>{t('roster.fairness')}</h2>
              <p>
                {t('roster.nightSpread')}: {fairness.data.summary.nights.spread} ·{' '}
                {t('roster.weekendSpread')}: {fairness.data.summary.weekends.spread}
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Perawat</th>
                    <th>Total</th>
                    <th>Malam</th>
                    <th>Akhir pekan</th>
                    <th>Libur nasional</th>
                    <th>Jam</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(fairness.data.perNurse).map(([id, s]) => (
                    <tr key={id}>
                      <td>{nameById.get(id) ?? id}</td>
                      <td>{s.total}</td>
                      <td>{s.nights}</td>
                      <td>{s.weekends}</td>
                      <td>{s.holidays}</td>
                      <td>{s.hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {nurses.data && assignments.data && (
            <RosterGrid
              year={year}
              month={month}
              nurses={nurses.data}
              assignments={assignments.data}
            />
          )}
        </>
      )}
    </section>
  );
}
