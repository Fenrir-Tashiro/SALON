import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  deleteReservation,
  getReservation,
  updateStatus,
} from '../db/reservations'
import { getCustomer } from '../db/customers'
import { getCounselingByReservationId } from '../db/counseling'
import type { Reservation, ReservationStatus } from '../types/reservation'

const STATUS_BADGE: Record<ReservationStatus, string> = {
  booked: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
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

export default function ReservationDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [customerCabinNumber, setCustomerCabinNumber] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [hasCounseling, setHasCounseling] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      getReservation(id),
      getCounselingByReservationId(id),
    ]).then(([res, counseling]) => {
      setReservation(res)
      setHasCounseling(counseling !== null)
      return getCustomer(res.customerId).then((c) => setCustomerCabinNumber(c.cabinNumber)).catch(() => {})
    }).finally(() => setLoading(false))
  }, [id])

  const handleStatusChange = async (newStatus: ReservationStatus) => {
    if (!reservation) return
    setUpdatingStatus(true)
    try {
      const updated = await updateStatus(reservation._id, newStatus)
      setReservation(updated)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleDelete = async () => {
    if (!reservation) return
    await deleteReservation(reservation)
    navigate('/reservations')
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-gray-400">{t('common.loading')}</p>
      </main>
    )
  }

  if (!reservation) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Reservation not found</p>
        <button
          onClick={() => navigate('/reservations')}
          className="min-h-[44px] rounded-lg bg-primary-600 px-4 py-2 text-white"
        >
          {t('common.back')}
        </button>
      </main>
    )
  }

  const statusLabelKey = {
    booked: 'reservations.statusBooked',
    in_progress: 'reservations.statusInProgress',
    completed: 'reservations.statusCompleted',
    cancelled: 'reservations.statusCancelled',
  }[reservation.status]

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <button
          onClick={() => navigate('/reservations')}
          className="flex min-h-[44px] items-center gap-1 rounded-lg px-3 py-2 text-base text-primary-600 hover:bg-primary-50"
        >
          ← {t('common.back')}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/reservations/${reservation._id}/edit`)}
            className="min-h-[44px] rounded-lg border border-primary-300 bg-white px-4 py-2 text-base font-medium text-primary-600 hover:bg-primary-50"
          >
            {t('common.edit')}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="min-h-[44px] rounded-lg border border-red-200 bg-white px-4 py-2 text-base font-medium text-red-500 hover:bg-red-50"
          >
            {t('common.delete')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-5 p-6">
          {/* Hero card */}
          <div className="rounded-xl bg-primary-700 px-6 py-5 text-white shadow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-2xl font-bold">{reservation.startTime}</p>
                <p className="mt-1 text-lg font-semibold opacity-90">
                  {reservation.serviceType}
                </p>
                <p className="mt-1 text-base opacity-80">
                  {reservation.duration}{t('reservations.min')}
                </p>
              </div>
              <span
                className={[
                  'mt-1 flex-shrink-0 rounded-full px-3 py-1 text-sm font-semibold',
                  STATUS_BADGE[reservation.status],
                ].join(' ')}
              >
                {t(statusLabelKey)}
              </span>
            </div>
          </div>

          {/* Booking info */}
          <SectionCard title={t('reservations.bookingInfo')}>
            <Field label={t('reservations.date')} value={reservation.date} />
            <Field label={t('reservations.startTime')} value={reservation.startTime} />
            <Field
              label={t('reservations.duration')}
              value={`${reservation.duration}${t('reservations.min')}`}
            />
            <Field label={t('reservations.serviceType')} value={reservation.serviceType} />
            <Field label={t('reservations.therapistName')} value={reservation.therapistName} />
            <Field label={t('reservations.roomNumber')} value={reservation.roomNumber} />
            <Field label={t('reservations.notes')} value={reservation.notes} />
          </SectionCard>

          {/* Customer info */}
          <SectionCard title={t('reservations.customerInfo')}>
            <Field label={t('reservations.selectCustomer')} value={reservation.customerName} />
            <Field label={t('reservations.cabinNumber')} value={customerCabinNumber || reservation.cabinNumber} />
          </SectionCard>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate(`/customers/${reservation.customerId}`)}
              className="min-h-[52px] w-full rounded-xl border-2 border-primary-300 bg-white px-6 py-3 text-base font-semibold text-primary-600 hover:bg-primary-50 active:bg-primary-100"
            >
              {t('reservations.viewCustomer')}
            </button>
            <button
              onClick={() => navigate(`/customer/${reservation._id}/counseling`)}
              className="min-h-[52px] w-full rounded-xl border-2 border-primary-300 bg-white px-6 py-3 text-base font-semibold text-primary-600 hover:bg-primary-50 active:bg-primary-100"
            >
              {hasCounseling
                ? t('counseling.editCounseling')
                : t('counseling.startCounseling')}
            </button>
            {hasCounseling && (
              <button
                onClick={() => navigate(`/reservations/${reservation._id}/counseling/view`)}
                className="min-h-[44px] w-full rounded-xl border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 active:bg-gray-100"
              >
                {t('counseling.viewRecord')}
              </button>
            )}
          </div>

          {/* Status section */}
          <SectionCard title={t('reservations.status')}>
            <div className="py-3">
              <span
                className={[
                  'inline-block rounded-full px-3 py-1 text-sm font-semibold',
                  STATUS_BADGE[reservation.status],
                ].join(' ')}
              >
                {t(statusLabelKey)}
              </span>
            </div>
          </SectionCard>

          {/* Quick status buttons */}
          {reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
            <div className="flex flex-col gap-3">
              {reservation.status === 'booked' && (
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={updatingStatus}
                  className="min-h-[56px] w-full rounded-xl bg-yellow-500 px-6 py-3 text-lg font-bold text-white shadow hover:bg-yellow-600 active:bg-yellow-700 disabled:opacity-50"
                >
                  {t('reservations.startTreatment')}
                </button>
              )}
              {reservation.status === 'in_progress' && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  disabled={updatingStatus}
                  className="min-h-[56px] w-full rounded-xl bg-green-600 px-6 py-3 text-lg font-bold text-white shadow hover:bg-green-700 active:bg-green-800 disabled:opacity-50"
                >
                  {t('reservations.completeTreatment')}
                </button>
              )}
              <button
                onClick={() => handleStatusChange('cancelled')}
                disabled={updatingStatus}
                className="min-h-[56px] w-full rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-lg font-bold text-gray-600 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50"
              >
                {t('reservations.cancelReservation')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-6 text-center text-base text-gray-700">
              {t('reservations.deleteConfirm')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 min-h-[48px] rounded-xl border border-gray-300 py-3 text-base text-gray-600"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 min-h-[48px] rounded-xl bg-red-500 py-3 text-base font-semibold text-white"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
