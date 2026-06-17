import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useFacilities } from './useFacilities';

export function FacilitiesPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useFacilities();

  if (isLoading) return <p>{t('common.loading')}</p>;
  if (isError) return <p role="alert">{t('common.error')}</p>;

  return (
    <section>
      <h1>{t('facilities.title')}</h1>
      {data && data.length === 0 ? (
        <p>{t('facilities.empty')}</p>
      ) : (
        <ul>
          {data?.map((facility) => (
            <li key={facility.id}>
              <Link to={`/nurses?facilityId=${facility.id}`}>
                {facility.name}
              </Link>
              {facility.city ? ` — ${facility.city}` : ''}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
