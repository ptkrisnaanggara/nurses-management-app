import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { useWards } from './useWards';

export function WardsPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const facilityId = params.get('facilityId');
  const { data, isLoading, isError } = useWards(facilityId);

  if (!facilityId) return <p>{t('nurses.selectFacility')}</p>;
  if (isLoading) return <p>{t('common.loading')}</p>;
  if (isError) return <p role="alert">{t('common.error')}</p>;

  return (
    <section>
      <h1>{t('wards.title')}</h1>
      {data && data.length === 0 ? (
        <p>{t('wards.empty')}</p>
      ) : (
        <ul>
          {data?.map((ward) => (
            <li key={ward.id}>
              <Link
                to={`/roster?facilityId=${facilityId}&wardId=${ward.id}`}
              >
                {ward.name}
              </Link>{' '}
              — {ward.type} · {t('wards.demand')}: {ward.shiftDemand.pagi}/
              {ward.shiftDemand.siang}/{ward.shiftDemand.malam}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
