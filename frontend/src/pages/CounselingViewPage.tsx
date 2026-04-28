import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getReservation } from '../db/reservations'
import { getCounselingByReservationId } from '../db/counseling'
import type { CounselingRecord } from '../types/counseling'
import type { Reservation } from '../types/reservation'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
        <h2 className="text-base font-semibold text-gray-700">{title}</h2>
      </div>
      <div className="divide-y divide-gray-50 px-5 py-2">{children}</div>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="py-3">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="mt-0.5 text-base text-gray-800">{String(value)}</p>
    </div>
  )
}

export default function CounselingViewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [counseling, setCounseling] = useState<CounselingRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      getReservation(id),
      getCounselingByReservationId(id),
    ]).then(([res, rec]) => {
      setReservation(res)
      setCounseling(rec)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-gray-400">{t('common.loading')}</p>
      </main>
    )
  }

  if (!counseling) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-gray-500">{t('counseling.title')} not found</p>
        <button
          onClick={() => navigate(`/reservations/${id}`)}
          className="min-h-[44px] rounded-lg bg-primary-600 px-4 py-2 text-white"
        >
          {t('common.back')}
        </button>
      </main>
    )
  }

  const pressureLabel: Record<string, string> = {
    light: t('counseling.pressureLight'),
    medium: t('counseling.pressureMedium'),
    firm: t('counseling.pressureFirm'),
  }

  const conditionLabel: Record<string, string> = {
    good: t('counseling.conditionGood'),
    normal: t('counseling.conditionNormal'),
    poor: t('counseling.conditionPoor'),
  }

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-gray-50">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <button
          onClick={() => navigate(`/reservations/${id}`)}
          className="flex min-h-[44px] items-center gap-1 rounded-lg px-3 py-2 text-base text-primary-600 hover:bg-primary-50"
        >
          ← {t('common.back')}
        </button>
        <h1 className="text-base font-bold text-gray-800">{t('counseling.title')}</h1>
        <button
          onClick={() => navigate(`/reservations/${id}/counseling`)}
          className="min-h-[44px] rounded-lg border border-primary-300 bg-white px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
        >
          {t('common.edit')}
        </button>
      </div>

      {/* Reservation context */}
      {reservation && (
        <div className="border-b border-gray-100 bg-primary-50 px-6 py-3">
          <p className="text-sm font-medium text-primary-700">
            {reservation.customerName} — {reservation.date} {reservation.startTime}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-5 p-6 pb-10">

          {/* 身体状態 */}
          <Section title={t('counseling.bodyCondition')}>
            <Field label={t('counseling.concernedAreas')} value={counseling.concernedAreas} />
            <Field
              label={t('counseling.fatigueLevel')}
              value={t('counseling.fatigueLabel', { level: counseling.fatigueLevel })}
            />
            <Field label={t('counseling.stiffnessState')} value={counseling.stiffnessState} />
          </Section>

          {/* ご希望 */}
          <Section title={t('counseling.preferences')}>
            <Field
              label={t('counseling.pressureLevel')}
              value={pressureLabel[counseling.pressureLevel]}
            />
            <Field label={t('counseling.focusAreas')} value={counseling.focusAreas} />
          </Section>

          {/* 体調確認 */}
          <Section title={t('counseling.healthCheck')}>
            <Field label={t('counseling.bodyTemperature')} value={counseling.bodyTemperature} />
            <Field label={t('counseling.bloodPressure')} value={counseling.bloodPressure} />
            <Field
              label={t('counseling.physicalCondition')}
              value={conditionLabel[counseling.physicalCondition]}
            />
          </Section>

          {/* 肌の状態 */}
          <Section title={t('counseling.skinCondition')}>
            <Field label={t('counseling.skinType')} value={counseling.skinType} />
            <Field label={t('counseling.skinConcerns')} value={counseling.skinConcerns} />
          </Section>

          {/* その他・備考 */}
          {counseling.additionalNotes && (
            <Section title={t('counseling.additionalNotes')}>
              <div className="py-3">
                <p className="text-base text-gray-800 whitespace-pre-wrap">
                  {counseling.additionalNotes}
                </p>
              </div>
            </Section>
          )}

          {/* お客様サイン */}
          {counseling.customerSignature && (
            <Section title={t('counseling.customerSignature')}>
              <div className="py-3">
                <img
                  src={counseling.customerSignature}
                  alt="signature"
                  className="max-w-full rounded-lg border border-gray-100"
                />
              </div>
            </Section>
          )}
        </div>
      </div>
    </main>
  )
}
