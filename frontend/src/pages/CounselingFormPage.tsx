import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getReservation } from '../db/reservations'
import {
  createCounseling,
  getCounselingByReservationId,
  updateCounseling,
} from '../db/counseling'
import type { CounselingRecord, FatigueLevel, PhysicalCondition, PressureLevel } from '../types/counseling'
import type { Reservation } from '../types/reservation'

// ── Signature pad ──────────────────────────────────────────────────────────────

function SignaturePad({
  canvasRef,
  onClear,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement>
  onClear: () => void
}) {
  const { t } = useTranslation()
  const drawing = useRef(false)

  function getPos(
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): { x: number; y: number } {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  function beginDraw(
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) {
    if ('touches' in e) e.preventDefault()
    drawing.current = true
    const ctx = canvasRef.current!.getContext('2d')!
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function draw(
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) {
    if (!drawing.current) return
    if ('touches' in e) e.preventDefault()
    const ctx = canvasRef.current!.getContext('2d')!
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  function endDraw() {
    drawing.current = false
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white">
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="w-full touch-none"
          style={{ height: '150px' }}
          onMouseDown={beginDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={beginDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
      <button
        type="button"
        onClick={onClear}
        className="self-start rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 min-h-[44px]"
      >
        {t('counseling.clearSignature')}
      </button>
    </div>
  )
}

// ── Section wrapper ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
        <h2 className="text-base font-semibold text-gray-700">{title}</h2>
      </div>
      <div className="space-y-5 px-5 py-4">{children}</div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-1 text-sm font-medium text-gray-600">{children}</p>
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function CounselingFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const canvasRef = useRef<HTMLCanvasElement>(null!)

  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [existing, setExisting] = useState<CounselingRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [concernedAreas, setConcernedAreas] = useState('')
  const [fatigueLevel, setFatigueLevel] = useState<FatigueLevel>(3)
  const [stiffnessState, setStiffnessState] = useState('')
  const [pressureLevel, setPressureLevel] = useState<PressureLevel>('medium')
  const [focusAreas, setFocusAreas] = useState('')
  const [bodyTemperature, setBodyTemperature] = useState('')
  const [bloodPressure, setBloodPressure] = useState('')
  const [physicalCondition, setPhysicalCondition] = useState<PhysicalCondition>('normal')
  const [skinType, setSkinType] = useState('')
  const [skinConcerns, setSkinConcerns] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')

  useEffect(() => {
    if (!id) return
    Promise.all([
      getReservation(id),
      getCounselingByReservationId(id),
    ]).then(([res, counseling]) => {
      setReservation(res)
      if (counseling) {
        setExisting(counseling)
        setConcernedAreas(counseling.concernedAreas)
        setFatigueLevel(counseling.fatigueLevel)
        setStiffnessState(counseling.stiffnessState)
        setPressureLevel(counseling.pressureLevel)
        setFocusAreas(counseling.focusAreas)
        setBodyTemperature(counseling.bodyTemperature)
        setBloodPressure(counseling.bloodPressure)
        setPhysicalCondition(counseling.physicalCondition)
        setSkinType(counseling.skinType)
        setSkinConcerns(counseling.skinConcerns)
        setAdditionalNotes(counseling.additionalNotes)
        // Restore signature
        if (counseling.customerSignature && canvasRef.current) {
          const img = new Image()
          img.onload = () => {
            const ctx = canvasRef.current?.getContext('2d')
            if (ctx) ctx.drawImage(img, 0, 0)
          }
          img.src = counseling.customerSignature
        }
      }
    }).finally(() => setLoading(false))
  }, [id])

  function clearSignature() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  async function handleSave() {
    if (!reservation) return
    setSaving(true)
    try {
      const canvas = canvasRef.current
      const customerSignature = canvas ? canvas.toDataURL('image/png') : ''

      const data = {
        type: 'counseling' as const,
        reservationId: reservation._id,
        customerId: reservation.customerId,
        concernedAreas,
        fatigueLevel,
        stiffnessState,
        pressureLevel,
        focusAreas,
        bodyTemperature,
        bloodPressure,
        physicalCondition,
        skinType,
        skinConcerns,
        additionalNotes,
        customerSignature,
      }

      if (existing) {
        await updateCounseling({ ...existing, ...data })
      } else {
        await createCounseling(data)
      }
      navigate(`/reservations/${reservation._id}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-gray-400">{t('common.loading')}</p>
      </main>
    )
  }

  const fatigueLevels: FatigueLevel[] = [1, 2, 3, 4, 5]
  const pressureOptions: { value: PressureLevel; label: string }[] = [
    { value: 'light', label: t('counseling.pressureLight') },
    { value: 'medium', label: t('counseling.pressureMedium') },
    { value: 'firm', label: t('counseling.pressureFirm') },
  ]
  const conditionOptions: { value: PhysicalCondition; label: string }[] = [
    { value: 'good', label: t('counseling.conditionGood') },
    { value: 'normal', label: t('counseling.conditionNormal') },
    { value: 'poor', label: t('counseling.conditionPoor') },
  ]

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
        <div className="w-20" />
      </div>

      {/* Reservation context */}
      {reservation && (
        <div className="border-b border-gray-100 bg-primary-50 px-6 py-3">
          <p className="text-sm font-medium text-primary-700">
            {reservation.customerName} — {reservation.date} {reservation.startTime}
          </p>
        </div>
      )}

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-5 p-6 pb-10">

          {/* 身体状態 */}
          <Section title={t('counseling.bodyCondition')}>
            <div>
              <Label>{t('counseling.concernedAreas')}</Label>
              <textarea
                value={concernedAreas}
                onChange={(e) => setConcernedAreas(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <div>
              <Label>{t('counseling.fatigueLevel')}</Label>
              <div className="flex gap-2">
                {fatigueLevels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFatigueLevel(level)}
                    className={[
                      'flex-1 min-h-[56px] rounded-xl text-lg font-bold transition-colors',
                      fatigueLevel === level
                        ? 'bg-primary-600 text-white shadow'
                        : 'border-2 border-gray-200 bg-white text-gray-600 hover:border-primary-300',
                    ].join(' ')}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {t('counseling.fatigueLabel', { level: fatigueLevel })}
              </p>
            </div>

            <div>
              <Label>{t('counseling.stiffnessState')}</Label>
              <textarea
                value={stiffnessState}
                onChange={(e) => setStiffnessState(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </Section>

          {/* ご希望 */}
          <Section title={t('counseling.preferences')}>
            <div>
              <Label>{t('counseling.pressureLevel')}</Label>
              <div className="flex gap-3">
                {pressureOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPressureLevel(opt.value)}
                    className={[
                      'flex-1 min-h-[56px] rounded-xl text-base font-bold transition-colors',
                      pressureLevel === opt.value
                        ? 'bg-primary-600 text-white shadow'
                        : 'border-2 border-gray-200 bg-white text-gray-600 hover:border-primary-300',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>{t('counseling.focusAreas')}</Label>
              <textarea
                value={focusAreas}
                onChange={(e) => setFocusAreas(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </Section>

          {/* 体調確認 */}
          <Section title={t('counseling.healthCheck')}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('counseling.bodyTemperature')}</Label>
                <input
                  type="text"
                  value={bodyTemperature}
                  onChange={(e) => setBodyTemperature(e.target.value)}
                  placeholder="36.5"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <Label>{t('counseling.bloodPressure')}</Label>
                <input
                  type="text"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  placeholder="120/80"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>

            <div>
              <Label>{t('counseling.physicalCondition')}</Label>
              <div className="flex gap-3">
                {conditionOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPhysicalCondition(opt.value)}
                    className={[
                      'flex-1 min-h-[56px] rounded-xl text-base font-bold transition-colors',
                      physicalCondition === opt.value
                        ? 'bg-primary-600 text-white shadow'
                        : 'border-2 border-gray-200 bg-white text-gray-600 hover:border-primary-300',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* 肌の状態 */}
          <Section title={t('counseling.skinCondition')}>
            <div>
              <Label>{t('counseling.skinType')}</Label>
              <input
                type="text"
                value={skinType}
                onChange={(e) => setSkinType(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <div>
              <Label>{t('counseling.skinConcerns')}</Label>
              <textarea
                value={skinConcerns}
                onChange={(e) => setSkinConcerns(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </Section>

          {/* その他・備考 */}
          <Section title={t('counseling.additionalNotes')}>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </Section>

          {/* お客様サイン */}
          <Section title={t('counseling.customerSignature')}>
            <SignaturePad canvasRef={canvasRef} onClear={clearSignature} />
          </Section>

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="min-h-[56px] w-full rounded-xl bg-primary-600 px-6 py-3 text-lg font-bold text-white shadow hover:bg-primary-700 active:bg-primary-800 disabled:opacity-50"
          >
            {saving ? t('common.loading') : t('counseling.save')}
          </button>
        </div>
      </div>
    </main>
  )
}
