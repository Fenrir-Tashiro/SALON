import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getReservationsByDate } from '../db/reservations'
import { getAllCustomers } from '../db/customers'
import type { Reservation, ReservationStatus } from '../types/reservation'

function toLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatTodayDate(date: Date): string {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const w = weekdays[date.getDay()]
  return `${y}年${m}月${d}日（${w}）`
}

function addMinutes(time: string, minutes: number): string {
  const [h, min] = time.split(':').map(Number)
  const total = h * 60 + min + minutes
  const rh = Math.floor(total / 60) % 24
  const rm = total % 60
  return `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}`
}

const STATUS_BADGE: Record<ReservationStatus, string> = {
  booked: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

type FilterStatus = 'all' | ReservationStatus

export default function TodayPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const today = toLocalDateString(new Date())
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [cabinMap, setCabinMap] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('all')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getReservationsByDate(today),
      getAllCustomers(),
    ]).then(([res, customers]) => {
      setReservations(res)
      setCabinMap(new Map(customers.map((c) => [c._id, c.cabinNumber])))
    }).finally(() => setLoading(false))
  }, [today])

  const filterTabs: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: t('today.allStatus') },
    { key: 'booked', label: t('reservations.statusBooked') },
    { key: 'in_progress', label: t('reservations.statusInProgress') },
    { key: 'completed', label: t('reservations.statusCompleted') },
  ]

  const filtered =
    filter === 'all' ? reservations : reservations.filter((r) => r.status === filter)

  const statusLabelKey: Record<ReservationStatus, string> = {
    booked: 'reservations.statusBooked',
    in_progress: 'reservations.statusInProgress',
    completed: 'reservations.statusCompleted',
    cancelled: 'reservations.statusCancelled',
  }

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{t('today.title')}</h1>
          <p className="text-sm text-gray-500">{formatTodayDate(new Date())}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/kiosk')}
            className="min-h-[44px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 active:bg-gray-100"
          >
            {t('today.kioskMode')}
          </button>
          <button
            onClick={() => navigate('/reservations/new')}
            className="min-h-[44px] rounded-lg bg-primary-600 px-5 py-2 text-base font-semibold text-white shadow hover:bg-primary-700 active:bg-primary-800"
          >
            + {t('reservations.new')}
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 border-b border-gray-100 bg-white px-6 py-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={[
              'min-h-[44px] rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              filter === tab.key
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reservation list */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-gray-400">{t('common.loading')}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl text-gray-300">
              📅
            </div>
            <p className="text-base text-gray-400">{t('today.empty')}</p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-3">
            {filtered.map((r) => {
              const endTime = addMinutes(r.startTime, r.duration)
              return (
                <button
                  key={r._id}
                  onClick={() => navigate(`/reservations/${r._id}`)}
                  className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-primary-300 hover:shadow-md active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary-700">
                          {r.startTime}〜{endTime}
                        </span>
                      </div>
                      <p className="text-base font-semibold text-gray-800">
                        {r.serviceType}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
                        <span>{r.customerName}</span>
                        {(cabinMap.get(r.customerId) ?? r.cabinNumber) && (
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                            {t('reservations.cabinNumber')}: {cabinMap.get(r.customerId) ?? r.cabinNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {t('reservations.therapistName')}: {r.therapistName}
                      </p>
                    </div>
                    <div className="flex-shrink-0 pt-1">
                      <span
                        className={[
                          'inline-block rounded-full px-3 py-0.5 text-xs font-semibold',
                          STATUS_BADGE[r.status],
                        ].join(' ')}
                      >
                        {t(statusLabelKey[r.status])}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
