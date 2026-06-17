import { useTranslation } from 'react-i18next';
import { Link, Outlet } from 'react-router-dom';

export function App() {
  const { t } = useTranslation();
  return (
    <div>
      <header>
        <h1>{t('app.title')}</h1>
        <nav>
          <Link to="/facilities">{t('facilities.title')}</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
