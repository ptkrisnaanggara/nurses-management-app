import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useNurseCompliance, useNurses } from './useNurses';

function ComplianceBadges({ nurseId }: { nurseId: string }) {
  const { data } = useNurseCompliance(nurseId);
  if (!data || data.length === 0) return null;
  return (
    <ul>
      {data.map((a) => (
        <li key={a.code} data-severity={a.severity}>
          [{a.severity}] {a.message}
        </li>
      ))}
    </ul>
  );
}

export function NursesPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const facilityId = params.get('facilityId');
  const { data, isLoading, isError } = useNurses(facilityId);
  const [openId, setOpenId] = useState<string | null>(null);

  if (!facilityId) return <p>{t('nurses.selectFacility')}</p>;
  if (isLoading) return <p>{t('common.loading')}</p>;
  if (isError) return <p role="alert">{t('common.error')}</p>;

  return (
    <section>
      <h1>{t('nurses.title')}</h1>
      {data && data.length === 0 ? (
        <p>{t('nurses.empty')}</p>
      ) : (
        <ul>
          {data?.map((nurse) => (
            <li key={nurse.id}>
              <button type="button" onClick={() => setOpenId(nurse.id)}>
                {nurse.fullName}
              </button>{' '}
              — {nurse.pkLevel ?? '—'} · {nurse.employmentClass}
              {openId === nurse.id && <ComplianceBadges nurseId={nurse.id} />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
