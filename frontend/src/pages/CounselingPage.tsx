import { useTranslation } from 'react-i18next'

export default function CounselingPage() {
  const { t } = useTranslation()

  return (
    <main className="flex-1 p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        {t('nav.counseling')}
      </h1>
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-400 shadow-sm">
        <p className="text-lg">カウンセリング記録 — Coming Soon</p>
        <p className="mt-2 text-sm">
          お客様のカウンセリング記録・肌分析・施術履歴をここに実装します。
        </p>
      </div>
    </main>
  )
}
