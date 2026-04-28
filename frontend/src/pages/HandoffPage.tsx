import { useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function HandoffPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const touchStartY = useRef<number>(0)
  const mouseStartY = useRef<number | null>(null)

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    const delta = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(delta) > window.innerHeight / 2) navigate(`/reservations/${id}`)
  }

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    mouseStartY.current = e.clientY
  }

  function handleMouseUp(e: React.MouseEvent<HTMLDivElement>) {
    if (mouseStartY.current === null) return
    const delta = e.clientY - mouseStartY.current
    mouseStartY.current = null
    if (Math.abs(delta) > window.innerHeight / 2) navigate(`/reservations/${id}`)
  }

  return (
    <div
      className="flex h-screen w-full select-none flex-col items-center justify-center bg-primary-700 px-8"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Brand */}
      <p className="mb-10 text-2xl font-bold tracking-widest text-white opacity-80">
        SALON &amp; SPA
      </p>

      {/* Thank-you message */}
      <h1 className="text-center text-5xl font-bold text-white leading-tight">
        {t('handoff.thankYou')}
      </h1>
      <p className="mt-6 text-center text-2xl font-medium text-white opacity-80">
        {t('handoff.passToTherapist')}
      </p>

    </div>
  )
}
