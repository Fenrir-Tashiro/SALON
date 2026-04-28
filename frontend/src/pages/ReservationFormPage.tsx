import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getAllCustomers } from '../db/customers'
import {
  createReservation,
  getReservation,
  updateReservation,
} from '../db/reservations'
import type { Customer } from '../types/customer'
import type { Reservation, ReservationStatus } from '../types/reservation'

function toLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const SERVICE_KEYS = [
  { key: 'body', value: 'ボディトリートメント' },
  { key: 'facial', value: 'フェイシャル' },
  { key: 'aroma', value: 'アロマセラピー' },
  { key: 'hotstone', value: 'ホットストーン' },
  { key: 'foot', value: 'フットリフレクソロジー' },
  { key: 'special', value: 'スペシャルパッケージ' },
]

const DURATIONS = [30, 60, 90, 120]

interface FormState {
  customerId: string
  customerName: string
  cabinNumber: string
  serviceType: string
  duration: number
  therapistName: string
  date: string
  startTime: string
  roomNumber: string
  status: ReservationStatus
  notes: string
}

function getInitialForm(): FormState {
  return {
    customerId: '',
    customerName: '',
    cabinNumber: '',
    serviceType: '',
    status: 'booked' as ReservationStatus,
    duration: 60,
    therapistName: '',
    date: toLocalDateString(new Date()),
    startTime: '',
    roomNumber: '',
    notes: '',
  }
}

function buildCustomerLabel(c: Customer): string {
  const ja = `${c.lastNameJa}${c.firstNameJa}`.trim()
  const en = `${c.lastNameEn} ${c.firstNameEn}`.trim()
  const parts = [ja, en].filter(Boolean).join(' / ')
  return c.cabinNumber ? `${parts} — ${c.cabinNumber}` : parts
}

function buildCustomerName(c: Customer): string {
  const ja = `${c.lastNameJa} ${c.firstNameJa}`.trim()
  const en = `${c.lastNameEn} ${c.firstNameEn}`.trim()
  return [ja, en].filter(Boolean).join(' / ')
}

export default function ReservationFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<FormState>(getInitialForm())
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [existingReservation, setExistingReservation] = useState<Reservation | null>(null)

  // Load customers
  useEffect(() => {
    getAllCustomers().then(setCustomers)
  }, [])

  // Load existing reservation for edit mode
  useEffect(() => {
    if (!isEdit || !id) return
    getReservation(id)
      .then((r) => {
        setExistingReservation(r)
        setForm({
          customerId: r.customerId,
          customerName: r.customerName,
          cabinNumber: r.cabinNumber,
          serviceType: r.serviceType,
          duration: r.duration,
          therapistName: r.therapistName,
          date: r.date,
          startTime: r.startTime,
          roomNumber: r.roomNumber,
          status: r.status,
          notes: r.notes,
        })
        setCustomerSearch(r.customerName)
      })
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const filteredCustomers = customers.filter((c) => {
    const q = customerSearch.toLowerCase()
    const label = buildCustomerLabel(c).toLowerCase()
    return label.includes(q)
  })

  const handleSelectCustomer = (c: Customer) => {
    const name = buildCustomerName(c)
    setForm((prev) => ({
      ...prev,
      customerId: c._id,
      customerName: name,
      cabinNumber: c.cabinNumber ?? '',
    }))
    setCustomerSearch(buildCustomerLabel(c))
    setShowCustomerDropdown(false)
    setErrors((prev) => ({ ...prev, customerId: undefined }))
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {}
    if (!form.customerId) newErrors.customerId = 'required'
    if (!form.serviceType) newErrors.serviceType = 'required'
    if (!form.therapistName.trim()) newErrors.therapistName = 'required'
    if (!form.date) newErrors.date = 'required'
    if (!form.startTime) newErrors.startTime = 'required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (isEdit && existingReservation) {
        await updateReservation({
          ...existingReservation,
          customerId: form.customerId,
          customerName: form.customerName,
          cabinNumber: form.cabinNumber,
          serviceType: form.serviceType,
          duration: form.duration,
          therapistName: form.therapistName,
          date: form.date,
          startTime: form.startTime,
          roomNumber: form.roomNumber,
          status: form.status,
          notes: form.notes,
        })
        navigate(`/reservations/${existingReservation._id}`)
      } else {
        const r = await createReservation({
          type: 'reservation',
          customerId: form.customerId,
          customerName: form.customerName,
          cabinNumber: form.cabinNumber,
          serviceType: form.serviceType,
          duration: form.duration,
          therapistName: form.therapistName,
          date: form.date,
          startTime: form.startTime,
          roomNumber: form.roomNumber,
          status: 'booked',
          notes: form.notes,
        })
        navigate(`/reservations/${r._id}`)
      }
    } finally {
      setSaving(false)
    }
  }

  const errorClass =
    'border-red-400 focus:border-red-400 focus:ring-red-200'
  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200'

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-gray-400">{t('common.loading')}</p>
      </main>
    )
  }

  const pageTitle = isEdit ? t('reservations.editMode') : t('reservations.createMode')

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <button
          onClick={() => navigate(isEdit && id ? `/reservations/${id}` : '/reservations')}
          className="flex min-h-[44px] items-center gap-1 rounded-lg px-3 py-2 text-base text-primary-600 hover:bg-primary-50"
        >
          ← {t('common.back')}
        </button>
        <h1 className="text-lg font-bold text-gray-800">{pageTitle}</h1>
        <div className="w-20" />
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-5 p-6">

          {/* Customer select */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('reservations.selectCustomer')}
              <span className="ml-1 text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value)
                  setShowCustomerDropdown(true)
                  if (!e.target.value) {
                    setForm((prev) => ({
                      ...prev,
                      customerId: '',
                      customerName: '',
                      cabinNumber: '',
                    }))
                  }
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                placeholder={t('reservations.selectCustomer')}
                className={[
                  inputClass,
                  errors.customerId ? errorClass : '',
                ].join(' ')}
              />
              {showCustomerDropdown && filteredCustomers.length > 0 && (
                <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {filteredCustomers.map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleSelectCustomer(c)
                      }}
                      className="w-full px-4 py-3 text-left text-base hover:bg-primary-50 active:bg-primary-100"
                    >
                      {buildCustomerLabel(c)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.customerId && (
              <p className="mt-1 text-xs text-red-500">
                {t('reservations.selectCustomer')}
              </p>
            )}
            <button
              type="button"
              onClick={() => setShowCustomerDropdown(false)}
              className="sr-only"
              tabIndex={-1}
            >
              close
            </button>
          </div>

          {/* Service type */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('reservations.serviceType')}
              <span className="ml-1 text-red-500">*</span>
            </label>
            <select
              value={form.serviceType}
              onChange={(e) => set('serviceType', e.target.value)}
              className={[
                inputClass,
                'appearance-none bg-white',
                errors.serviceType ? errorClass : '',
              ].join(' ')}
            >
              <option value="">—</option>
              {SERVICE_KEYS.map((s) => (
                <option key={s.key} value={t(`reservations.services.${s.key}`)}>
                  {t(`reservations.services.${s.key}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('reservations.duration')}
            </label>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => set('duration', d)}
                  className={[
                    'flex-1 min-h-[48px] rounded-lg border text-base font-medium transition',
                    form.duration === d
                      ? 'border-primary-500 bg-primary-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {d}{t('reservations.min')}
                </button>
              ))}
            </div>
          </div>

          {/* Therapist name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('reservations.therapistName')}
              <span className="ml-1 text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.therapistName}
              onChange={(e) => set('therapistName', e.target.value)}
              className={[inputClass, errors.therapistName ? errorClass : ''].join(' ')}
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('reservations.date')}
              <span className="ml-1 text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              className={[inputClass, errors.date ? errorClass : ''].join(' ')}
            />
          </div>

          {/* Start time */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('reservations.startTime')}
              <span className="ml-1 text-red-500">*</span>
            </label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => set('startTime', e.target.value)}
              className={[inputClass, errors.startTime ? errorClass : ''].join(' ')}
            />
          </div>

          {/* Room number */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('reservations.roomNumber')}
            </label>
            <input
              type="text"
              value={form.roomNumber}
              onChange={(e) => set('roomNumber', e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Status (edit only) */}
          {isEdit && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('reservations.status')}
              </label>
              <div className="flex flex-wrap gap-2">
                {(['booked', 'in_progress', 'completed', 'cancelled'] as ReservationStatus[]).map((s) => {
                  const labels: Record<ReservationStatus, string> = {
                    booked: t('reservations.statusBooked'),
                    in_progress: t('reservations.statusInProgress'),
                    completed: t('reservations.statusCompleted'),
                    cancelled: t('reservations.statusCancelled'),
                  }
                  const colors: Record<ReservationStatus, string> = {
                    booked: 'bg-blue-100 text-blue-700 border-blue-300',
                    in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                    completed: 'bg-green-100 text-green-700 border-green-300',
                    cancelled: 'bg-gray-100 text-gray-600 border-gray-300',
                  }
                  const activeColors: Record<ReservationStatus, string> = {
                    booked: 'bg-blue-600 text-white border-blue-600',
                    in_progress: 'bg-yellow-500 text-white border-yellow-500',
                    completed: 'bg-green-600 text-white border-green-600',
                    cancelled: 'bg-gray-500 text-white border-gray-500',
                  }
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set('status', s)}
                      className={[
                        'min-h-[44px] rounded-lg border px-4 py-2 text-sm font-semibold transition-colors',
                        form.status === s ? activeColors[s] : colors[s],
                      ].join(' ')}
                    >
                      {labels[s]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('reservations.notes')}
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={4}
              className={inputClass}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-8">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 min-h-[56px] rounded-xl bg-primary-600 px-6 py-3 text-lg font-bold text-white shadow hover:bg-primary-700 active:bg-primary-800 disabled:opacity-50"
            >
              {t('common.save')}
            </button>
            <button
              type="button"
              onClick={() =>
                navigate(isEdit && id ? `/reservations/${id}` : '/reservations')
              }
              className="flex-1 min-h-[56px] rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-lg font-bold text-gray-600 hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
