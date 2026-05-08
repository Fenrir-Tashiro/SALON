import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import ja from './locales/ja.json'
import en from './locales/en.json'
import zh from './locales/zh.json'
import ko from './locales/ko.json'
import es from './locales/es.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ja: { translation: ja },
      en: { translation: en },
      zh: { translation: zh },
      ko: { translation: ko },
      es: { translation: es },
    },
    lng: 'ja',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
