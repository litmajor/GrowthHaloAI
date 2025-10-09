
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      common: {
        welcome: 'Welcome to Growth Halo',
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
      },
      navigation: {
        dashboard: 'Dashboard',
        chat: 'Chat with Bliss',
        journal: 'Journal',
        compass: 'Values Compass',
        analytics: 'Analytics',
        community: 'Community',
        settings: 'Settings',
      },
      phases: {
        expansion: 'Expansion',
        contraction: 'Contraction',
        renewal: 'Renewal',
      },
    },
  },
  es: {
    translation: {
      common: {
        welcome: 'Bienvenido a Growth Halo',
        loading: 'Cargando...',
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        close: 'Cerrar',
      },
      navigation: {
        dashboard: 'Panel',
        chat: 'Chat con Bliss',
        journal: 'Diario',
        compass: 'Brújula de Valores',
        analytics: 'Análisis',
        community: 'Comunidad',
        settings: 'Configuración',
      },
      phases: {
        expansion: 'Expansión',
        contraction: 'Contracción',
        renewal: 'Renovación',
      },
    },
  },
  ar: {
    translation: {
      common: {
        welcome: 'مرحباً بك في Growth Halo',
        loading: 'جاري التحميل...',
        save: 'حفظ',
        cancel: 'إلغاء',
        delete: 'حذف',
        edit: 'تعديل',
        close: 'إغلاق',
      },
      navigation: {
        dashboard: 'لوحة التحكم',
        chat: 'الدردشة مع Bliss',
        journal: 'اليوميات',
        compass: 'بوصلة القيم',
        analytics: 'التحليلات',
        community: 'المجتمع',
        settings: 'الإعدادات',
      },
      phases: {
        expansion: 'التوسع',
        contraction: 'الانكماش',
        renewal: 'التجديد',
      },
    },
  },
};

// RTL languages
const rtlLanguages = ['ar', 'he', 'fa', 'ur'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Set document direction based on language
i18n.on('languageChanged', (lng) => {
  const dir = rtlLanguages.includes(lng) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

export const isRTL = () => rtlLanguages.includes(i18n.language);

export default i18n;
