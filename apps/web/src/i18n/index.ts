import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { id } from './locales/id';

/** Bahasa Indonesia is the default locale; English can be added later. */
void i18n.use(initReactI18next).init({
  resources: { id: { translation: id } },
  lng: 'id',
  fallbackLng: 'id',
  interpolation: { escapeValue: false },
});

export default i18n;
