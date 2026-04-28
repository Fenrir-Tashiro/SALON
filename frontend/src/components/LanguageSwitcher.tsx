import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'ja', label: '日本語' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ko', label: '한국어' },
]

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value)
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="lang-select" className="text-sm text-gray-600 sr-only">
        {t('language.select')}
      </label>
      <select
        id="lang-select"
        value={i18n.language}
        onChange={handleChange}
        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  )
}
