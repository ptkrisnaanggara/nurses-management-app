import { useTranslation } from 'react-i18next';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from './features/auth/AuthContext';

export function App() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  return (
    <div>
      <header>
        <h1>{t('app.title')}</h1>
        <nav>
          <Link to="/facilities">{t('facilities.title')}</Link>
          {user && (
            <span>
              {' '}
              · {user.email} ({user.role}){' '}
              <button type="button" onClick={logout}>
                {t('auth.logout')}
              </button>
            </span>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
