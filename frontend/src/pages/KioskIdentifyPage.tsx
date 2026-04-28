import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getAllCustomers } from '../db/customers'
import { getReservationsByCustomerId } from '../db/reservations'
import type { Customer } from '../types/customer'
import LanguageSwitcher from '../components/LanguageSwitcher'

function toLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

type SearchState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'not_found' }
  | { kind: 'no_reservation'; customer: Customer }
  | { kind: 'multiple' }
  | { kind: 'done' }

export default function KioskIdentifyPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [lastName, setLastName] = useState('')
  const [dob, setDob] = useState('')
  const [state, setState] = useState<SearchState>({ kind: 'idle' })

  const today = toLocalDateString(new Date())

  const handleSearch = async () => {
    if (!lastName.trim() || !dob) return
    setState({ kind: 'loading' })

    try {
      const customers = await getAllCustomers()
      const q = lastName.trim().toLowerCase()

      const matched = customers.filter((c) => {
        if (c.dateOfBirth !== dob) return false
        return (
          (c.lastNameJa + c.firstNameJa).toLowerCase().includes(q) ||
          (c.lastNameKana + c.firstNameKana + (c.middleNameKana ?? '')).toLowerCase().includes(q) ||
          (c.lastNameEn + ' ' + c.firstNameEn).toLowerCase().includes(q)
        )
      })

      if (matched.length === 0) {
        setState({ kind: 'not_found' })
        return
      }

      if (matched.length > 1) {
        setState({ kind: 'multiple' })
        return
      }

      const customer = matched[0]
      const reservations = await getReservationsByCustomerId(customer._id)
      const todayRes = reservations
        .filter((r) => r.date === today && r.status !== 'cancelled')
        .sort((a, b) => a.startTime.localeCompare(b.startTime))

      if (todayRes.length === 0) {
        setState({ kind: 'no_reservation', customer })
        return
      }

      setState({ kind: 'done' })
      navigate(`/customer/${todayRes[0]._id}/counseling`)
    } catch {
      setState({ kind: 'not_found' })
    }
  }

  const isLoading = state.kind === 'loading'
  const canSubmit = lastName.trim().length > 0 && dob.length > 0 && !isLoading

  const needsStaff =
    state.kind === 'not_found' ||
    state.kind === 'multiple' ||
    state.kind === 'no_reservation'

  const touchStartX = useRef<number>(0)
  const mouseStartX = useRef<number | null>(null)
  const SWIPE_THRESHOLD = 80

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (Math.abs(e.changedTouches[0].clientX - touchStartX.current) > SWIPE_THRESHOLD) {
      navigate('/')
    }
  }
  function handleMouseDown(e: React.MouseEvent) {
    mouseStartX.current = e.clientX
  }
  function handleMouseUp(e: React.MouseEvent) {
    if (mouseStartX.current === null) return
    const delta = e.clientX - mouseStartX.current
    mouseStartX.current = null
    if (Math.abs(delta) > SWIPE_THRESHOLD) navigate('/')
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between bg-primary-700 px-6 py-4">
        <button
          onClick={() => navigate('/kiosk')}
          className="flex min-h-[44px] items-center gap-1 rounded-lg px-3 py-2 text-base text-white/80 hover:text-white"
        >
          ← {t('common.back')}
        </button>
        <p className="text-base font-bold tracking-widest text-white">SALON &amp; SPA</p>
        <LanguageSwitcher />
      </div>

      {/* Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <div className="w-full max-w-md">
          <h1 className="mb-8 text-center text-2xl font-bold text-gray-800">
            {t('kiosk.identifyTitle')}
          </h1>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-gray-600">
              {t('kiosk.lastNameLabel')}
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); setState({ kind: 'idle' }) }}
              placeholder={t('kiosk.lastNamePlaceholder')}
              className="w-full rounded-xl border border-gray-300 bg-white px-5 py-4 text-xl shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          <div className="mb-8">
            <label className="mb-2 block text-sm font-semibold text-gray-600">
              {t('kiosk.dobLabel')}
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => { setDob(e.target.value); setState({ kind: 'idle' }) }}
              className="w-full rounded-xl border border-gray-300 bg-white px-5 py-4 text-xl shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={!canSubmit}
            className="min-h-[60px] w-full rounded-xl bg-primary-600 px-6 py-4 text-xl font-bold text-white shadow-lg hover:bg-primary-700 active:bg-primary-800 disabled:opacity-50"
          >
            {isLoading ? t('common.loading') : t('kiosk.searchButton')}
          </button>

          {/* Result: staff needed — swipe left/right to exit kiosk */}
          {needsStaff && (
            <div
              className="mt-6 select-none rounded-xl border border-amber-200 bg-amber-50 p-5 text-center"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
            >
              {state.kind === 'no_reservation' ? (
                <>
                  <p className="text-base font-bold text-amber-800">{t('kiosk.noReservation')}</p>
                  <p className="mt-1 text-sm text-amber-600">{t('kiosk.staffHelp')}</p>
                </>
              ) : (
                <p className="text-base font-bold text-amber-800">{t('kiosk.staffDisambiguate')}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
