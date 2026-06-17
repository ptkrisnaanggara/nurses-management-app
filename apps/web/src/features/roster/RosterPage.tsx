import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useNurses } from '../nurses/useNurses';
import { PeriodValidation } from './api';
import { RosterGrid } from './RosterGrid';
import {
  useAssignments,
  useCreatePeriod,
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
