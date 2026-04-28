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

function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

const STATUS_BADGE: Record<ReservationStatus, string> = {
  booked: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

function StatusBadge({ status }: { status: ReservationStatus }) {
  const { t } = useTranslation()
  const labelKey = {
    booked: 'reservations.statusBooked',
    in_progress: 'reservations.statusInProgress',
    completed: 'reservations.statusCompleted',
    cancelled: 'reservations.statusCancelled',
  }[status]

  return (
    <span
      className={[
        'inline-block rounded-full px-3 py-0.5 text-xs font-semibold',
        STATUS_BADGE[status],
      ].join(' ')}
    >
      {t(labelKey)}
    </span>
  )
}

function ReservationCard({
  reservation,
  cabinNumber,
  onClick,
}: {
  reservation: Reservation
  cabinNumber: string
  onClick: () => void
}) {
  const { t } = useTranslation()
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-primary-300 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary-700">
              {reservation.startTime}
            </span>
            <span className="text-sm text-gray-400">
              {reservation.duration}{t('reservations.min')}
            </span>
          </div>
          <p className="text-base font-semibold text-gray-800">
            {reservation.serviceType}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
            <span>{reservation.customerName}</span>
            {cabinNumber && (
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                {t('reservations.cabinNumber')}: {cabinNumber}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {t('reservations.therapistName')}: {reservation.therapistName}
          </p>
          {reservation.roomNumber && (
            <p className="text-sm text-gray-500">
              {t('reservations.roomNumber')}: {reservation.roomNumber}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 pt-1">
          <StatusBadge status={reservation.status} />
        </div>
      </div>
    </button>
  )
}

export default function ReservationsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(() => toLocalDateString(new Date()))
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [cabinMap, setCabinMap] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllCustomers().then((customers) => {
      setCabinMap(new Map(customers.map((c) => [c._id, c.cabinNumber])))
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    getReservationsByDate(currentDate)
      .then(setReservations)
      .finally(() => setLoading(false))
  }, [currentDate])

  const prevDay = () => {
    const d = new Date(currentDate + 'T00:00:00')
    d.setDate(d.getDate() - 1)
    setCurrentDate(toLocalDateString(d))
  }

  const nextDay = () => {
    const d = new Date(currentDate + 'T00:00:00')
    d.setDate(d.getDate() + 1)
    setCurrentDate(toLocalDateString(d))
  }

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">{t('reservations.title')}</h1>
        <button
          onClick={() => navigate('/reservations/new')}
          className="min-h-[44px] rounded-lg bg-primary-600 px-5 py-2 text-base font-semibold text-white shadow hover:bg-primary-700 active:bg-primary-800"
        >
          + {t('reservations.new')}
        </button>
      </div>

      {/* Date selector */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-3">
        <button
          onClick={prevDay}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-gray-200 bg-white text-xl text-gray-600 hover:bg-gray-50 active:bg-gray-100"
          aria-label="Previous day"
        >
          ‹
        </button>
        <button
          onClick={() => setCurrentDate(toLocalDateString(new Date()))}
          className="flex-1 text-center text-base font-semibold text-gray-800 py-2"
        >
          {formatDateDisplay(currentDate)}
        </button>
        <button
          onClick={nextDay}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-gray-200 bg-white text-xl text-gray-600 hover:bg-gray-50 active:bg-gray-100"
          aria-label="Next day"
        >
          ›
        </button>
      </div>

      {/* Reservation list */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-gray-400">{t('common.loading')}</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl text-gray-300">
              📅
            </div>
            <p className="text-base text-gray-400">{t('reservations.empty')}</p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-3">
            {reservations.map((r) => (
              <ReservationCard
                key={r._id}
                reservation={r}
                cabinNumber={cabinMap.get(r.customerId) ?? r.cabinNumber}
                onClick={() => navigate(`/reservations/${r._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
