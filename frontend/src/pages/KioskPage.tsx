import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'

export default function KioskPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showNewModal, setShowNewModal] = useState(false)
  const [showStaffHandoff, setShowStaffHandoff] = useState(false)

  const touchStartY = useRef<number>(0)
  const mouseStartY = useRef<number | null>(null)

  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (Math.abs(e.changedTouches[0].clientY - touchStartY.current) > window.innerHeight / 2) {
      navigate('/')
    }
  }
  function handleMouseDown(e: React.MouseEvent) {
    mouseStartY.current = e.clientY
  }
  function handleMouseUp(e: React.MouseEvent) {
    if (mouseStartY.current === null) return
    const delta = e.clientY - mouseStartY.current
    mouseStartY.current = null
    if (Math.abs(delta) > window.innerHeight / 2) navigate('/')
  }

  if (showStaffHandoff) {
    return (
      <div
        className="flex h-screen w-full select-none flex-col items-center justify-center bg-primary-700 px-8"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <p className="mb-10 text-2xl font-bold tracking-widest text-white/60">
          SALON &amp; SPA
        </p>
        <h1 className="text-center text-5xl font-bold text-white leading-tight">
          {t('handoff.passToTherapist')}
        </h1>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen w-full flex-col bg-primary-700">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div />
        <LanguageSwitcher />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <p className="mb-3 text-xl font-bold tracking-widest text-white/60">
          SALON &amp; SPA
        </p>
        <h1 className="mb-16 text-center text-5xl font-bold text-white leading-tight">
          {t('kiosk.welcome')}
        </h1>

        <div className="flex w-full max-w-md flex-col gap-4">
          <button
            onClick={() => navigate('/kiosk/identify')}
            className="min-h-[72px] w-full rounded-2xl bg-white px-8 py-4 text-xl font-bold text-primary-700 shadow-lg transition active:scale-[0.98]"
          >
            {t('kiosk.repeaterButton')}
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="min-h-[72px] w-full rounded-2xl border-2 border-white/40 bg-white/10 px-8 py-4 text-xl font-bold text-white transition active:scale-[0.98]"
          >
            {t('kiosk.newButton')}
          </button>
        </div>
      </div>

      {/* Staff exit — shows handoff screen, then swipe to home */}
      <button
        onClick={() => setShowStaffHandoff(true)}
        className="absolute bottom-4 right-5 text-xs text-white/20 hover:text-white/50"
      >
        STAFF
      </button>

      {/* New customer modal */}
      {showNewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-8"
          onClick={() => setShowNewModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-4 text-5xl">👋</p>
            <h2 className="mb-3 text-xl font-bold text-gray-800">
              {t('kiosk.staffHelp')}
            </h2>
            <p className="mb-7 text-base text-gray-500">{t('kiosk.newMessage')}</p>
            <button
              onClick={() => setShowNewModal(false)}
              className="min-h-[52px] w-full rounded-xl bg-primary-600 px-6 py-3 text-lg font-semibold text-white"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
