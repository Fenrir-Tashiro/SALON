import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  addPhoto,
  addTherapistNote,
  deleteCustomer,
  getCustomer,
  updateTherapistNote,
} from '../db/customers'
import { getReservationsByCustomerId } from '../db/reservations'
import { getCounselingMapForCustomer } from '../db/counseling'
import type { Customer, TherapistNote } from '../types/customer'
import type { Reservation, ReservationStatus } from '../types/reservation'

// ── helpers ──────────────────────────────────────────────────────────────────

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
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="py-2">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="mt-0.5 text-base text-gray-800">{value}</p>
    </div>
  )
}

// ── Photo thumbnail ───────────────────────────────────────────────────────────

function PhotoThumb({
  data,
  filename,
  onTap,
}: {
  data: string
  filename: string
  onTap: (url: string) => void
}) {
  return (
    <button
      onClick={() => onTap(data)}
      className="h-24 w-24 overflow-hidden rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
    >
      <img src={data} alt={filename} className="h-full w-full object-cover" />
    </button>
  )
}

// ── Note row ─────────────────────────────────────────────────────────────────

function NoteRow({
  note,
  customerId,
  onUpdated,
}: {
  note: TherapistNote
  customerId: string
  onUpdated: (updated: Customer) => void
}) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [characteristics, setCharacteristics] = useState(note.characteristics)
  const [avoidAreas, setAvoidAreas] = useState(note.avoidAreas)
  const [memo, setMemo] = useState(note.memo)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const updated = await updateTherapistNote(customerId, note.id, {
      characteristics,
      avoidAreas,
      memo,
    })
    onUpdated(updated)
    setEditing(false)
    setSaving(false)
  }

  const handleCancel = () => {
    setCharacteristics(note.characteristics)
    setAvoidAreas(note.avoidAreas)
    setMemo(note.memo)
    setEditing(false)
  }

  const dateStr = (() => {
    try {
      return new Date(note.date).toLocaleDateString()
    } catch {
      return note.date
    }
  })()

  if (editing) {
    return (
      <div className="rounded-lg border border-primary-200 bg-primary-50 p-4">
        <p className="mb-3 text-xs font-medium text-gray-400">{dateStr}</p>
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              {t('customers.characteristics')}
            </label>
            <textarea
              value={characteristics}
              onChange={(e) => setCharacteristics(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              {t('customers.avoidAreas')}
            </label>
            <textarea
              value={avoidAreas}
              onChange={(e) => setAvoidAreas(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              {t('customers.memo')}
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="min-h-[44px] rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {t('common.save')}
          </button>
          <button
            onClick={handleCancel}
            className="min-h-[44px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:border-primary-200 hover:bg-primary-50"
    >
      <p className="mb-2 text-xs font-medium text-gray-400">{dateStr}</p>
      {note.characteristics && (
        <div className="mb-1">
          <span className="text-xs font-medium text-gray-500">
            {t('customers.characteristics')}:{' '}
          </span>
          <span className="text-sm text-gray-700">{note.characteristics}</span>
        </div>
      )}
      {note.avoidAreas && (
        <div className="mb-1">
          <span className="text-xs font-medium text-gray-500">
            {t('customers.avoidAreas')}:{' '}
          </span>
          <span className="text-sm text-gray-700">{note.avoidAreas}</span>
        </div>
      )}
      {note.memo && (
        <div>
          <span className="text-xs font-medium text-gray-500">
            {t('customers.memo')}:{' '}
          </span>
          <span className="text-sm text-gray-700">{note.memo}</span>
        </div>
      )}
    </button>
  )
}

// ── Add note form ─────────────────────────────────────────────────────────────

function AddNoteForm({
  customerId,
  onAdded,
  onClose,
}: {
  customerId: string
  onAdded: (updated: Customer) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [characteristics, setCharacteristics] = useState('')
  const [avoidAreas, setAvoidAreas] = useState('')
  const [memo, setMemo] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const updated = await addTherapistNote(customerId, {
      date: new Date().toISOString(),
      characteristics,
      avoidAreas,
      memo,
    })
    onAdded(updated)
    setSaving(false)
  }

  return (
    <div className="mt-4 rounded-xl border border-primary-200 bg-primary-50 p-5">
      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t('customers.characteristics')}
          </label>
          <textarea
            value={characteristics}
            onChange={(e) => setCharacteristics(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t('customers.avoidAreas')}
          </label>
          <textarea
            value={avoidAreas}
            onChange={(e) => setAvoidAreas(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t('customers.memo')}
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="min-h-[44px] rounded-lg bg-primary-600 px-5 py-2 text-base font-semibold text-white shadow disabled:opacity-50"
        >
          {t('common.save')}
        </button>
        <button
          onClick={onClose}
          className="min-h-[44px] rounded-lg border border-gray-300 bg-white px-5 py-2 text-base text-gray-600"
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CustomerDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAddNote, setShowAddNote] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [counselingMap, setCounselingMap] = useState<Map<string, boolean>>(new Map())
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) return
    getCustomer(id)
      .then(setCustomer)
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    Promise.all([
      getReservationsByCustomerId(id),
      getCounselingMapForCustomer(id),
    ]).then(([res, cm]) => {
      setReservations(res)
      setCounselingMap(new Map([...cm.keys()].map((k) => [k, true])))
    })
  }, [id])

  const handleDelete = async () => {
    if (!customer) return
    await deleteCustomer(customer)
    navigate('/customers')
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !customer) return
    const filename = `photo_${Date.now().toString(36)}_${file.name}`
    const updated = await addPhoto(customer._id, file, filename)
    setCustomer(updated)
    e.target.value = ''
  }

  const handleNoteAdded = (updated: Customer) => {
    setCustomer(updated)
    setShowAddNote(false)
  }

  const handleNoteUpdated = (updated: Customer) => {
    setCustomer(updated)
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-gray-400">{t('common.loading')}</p>
      </main>
    )
  }

  if (!customer) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Customer not found</p>
        <button
          onClick={() => navigate('/customers')}
          className="rounded-lg bg-primary-600 px-4 py-2 text-white"
        >
          {t('common.back')}
        </button>
      </main>
    )
  }

  const genderLabel = {
    male: t('customers.genderMale'),
    female: t('customers.genderFemale'),
    other: t('customers.genderOther'),
  }[customer.gender]

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex min-h-[44px] items-center gap-1 rounded-lg px-3 py-2 text-base text-primary-600 hover:bg-primary-50"
        >
          ← {t('common.back')}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/customers/${customer._id}/edit`)}
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
      <div className="mx-auto max-w-3xl space-y-5 p-6">
        {/* Name heading */}
        <div className="rounded-xl bg-primary-700 px-6 py-5 text-white shadow">
          <p className="text-2xl font-bold">
            {customer.lastNameJa}
            {customer.firstNameJa}
          </p>
          {customer.lastNameKana || customer.firstNameKana ? (
            <p className="text-base opacity-80">
              {customer.lastNameKana} {customer.firstNameKana} {customer.middleNameKana}
            </p>
          ) : null}
          <p className="mt-1 text-lg opacity-90">
            {customer.lastNameEn} {customer.firstNameEn} {customer.middleNameEn}
          </p>
          {customer.cabinNumber && (
            <p className="mt-2 inline-block rounded-md bg-white/20 px-3 py-1 text-sm">
              {t('customers.cabinNumber')}: {customer.cabinNumber}
            </p>
          )}
        </div>

        {/* Basic info */}
        <SectionCard title={t('customers.basicInfo')}>
          <div className="grid grid-cols-2 gap-x-6 divide-y divide-gray-50">
            <Field label={t('customers.lastNameJa')} value={customer.lastNameJa} />
            <Field label={t('customers.firstNameJa')} value={customer.firstNameJa} />
            <Field label={t('customers.lastNameKana')} value={customer.lastNameKana} />
            <Field label={t('customers.firstNameKana')} value={customer.firstNameKana} />
            <Field label={t('customers.middleNameKana')} value={customer.middleNameKana} />
            <Field label={t('customers.lastNameEn')} value={customer.lastNameEn} />
            <Field label={t('customers.firstNameEn')} value={customer.firstNameEn} />
            <Field label={t('customers.middleNameEn')} value={customer.middleNameEn} />
            <Field label={t('customers.dateOfBirth')} value={customer.dateOfBirth} />
            <Field label={t('customers.gender')} value={genderLabel} />
            <Field label={t('customers.nationality')} value={customer.nationality} />
          </div>
        </SectionCard>

        {/* Ship info */}
        <SectionCard title={t('customers.shipInfo')}>
          <Field label={t('customers.cabinNumber')} value={customer.cabinNumber} />
          <Field label={t('customers.cardKeyId')} value={customer.cardKeyId} />
        </SectionCard>

        {/* Health & Spa */}
        <SectionCard title={t('customers.healthInfo')}>
          <Field label={t('customers.allergies')} value={customer.allergies} />
          <Field label={t('customers.healthNotes')} value={customer.healthNotes} />
        </SectionCard>

        {/* Treatment history */}
        <SectionCard title={t('customers.treatmentHistory')}>
          {reservations.length === 0 ? (
            <p className="text-sm text-gray-400">{t('customers.noHistory')}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {reservations.map((r) => {
                const hasCounseling = counselingMap.get(r._id) ?? false
                const endTime = addMinutes(r.startTime, r.duration)
                const statusLabelKey: Record<ReservationStatus, string> = {
                  booked: 'reservations.statusBooked',
                  in_progress: 'reservations.statusInProgress',
                  completed: 'reservations.statusCompleted',
                  cancelled: 'reservations.statusCancelled',
                }
                return (
                  <button
                    key={r._id}
                    onClick={() => navigate(`/reservations/${r._id}`)}
                    className="w-full rounded-lg border border-gray-100 bg-white p-4 text-left transition hover:border-primary-200 hover:bg-primary-50 active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-medium text-gray-500">{r.date}</p>
                        <p className="text-base font-semibold text-gray-800">{r.serviceType}</p>
                        <p className="text-sm text-gray-500">
                          {r.startTime}〜{endTime}
                          <span className="mx-1.5 text-gray-300">·</span>
                          {r.duration}{t('reservations.min')}
                        </p>
                        <p className="text-xs text-gray-400">{r.therapistName}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 pt-0.5">
                        <span
                          className={[
                            'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold',
                            STATUS_BADGE[r.status],
                          ].join(' ')}
                        >
                          {t(statusLabelKey[r.status])}
                        </span>
                        {hasCounseling && (
                          <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            {t('customers.hasCounseling')}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </SectionCard>

        {/* Therapist Notes */}
        <SectionCard title={t('customers.therapistNotes')}>
          <div className="mb-4">
            {!showAddNote && (
              <button
                onClick={() => setShowAddNote(true)}
                className="flex min-h-[44px] items-center gap-1 rounded-lg border border-primary-300 bg-white px-4 py-2 text-base font-medium text-primary-600 hover:bg-primary-50"
              >
                + {t('customers.addNote')}
              </button>
            )}
            {showAddNote && (
              <AddNoteForm
                customerId={customer._id}
                onAdded={handleNoteAdded}
                onClose={() => setShowAddNote(false)}
              />
            )}
          </div>
          {customer.therapistNotes.length === 0 ? (
            <p className="text-sm text-gray-400">{t('customers.noNotes')}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {customer.therapistNotes.map((note) => (
                <NoteRow
                  key={note.id}
                  note={note}
                  customerId={customer._id}
                  onUpdated={handleNoteUpdated}
                />
              ))}
            </div>
          )}
        </SectionCard>

        {/* Photos */}
        <SectionCard title={t('customers.photos')}>
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-[44px] items-center gap-1 rounded-lg border border-primary-300 bg-white px-4 py-2 text-base font-medium text-primary-600 hover:bg-primary-50"
            >
              + {t('customers.addPhoto')}
            </button>
          </div>
          {(customer.photos ?? []).length === 0 ? (
            <p className="text-sm text-gray-400">{t('customers.noPhotos')}</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {(customer.photos ?? []).map((photo) => (
                <PhotoThumb
                  key={photo.filename}
                  data={photo.data}
                  filename={photo.filename}
                  onTap={setLightboxUrl}
                />
              ))}
            </div>
          )}
        </SectionCard>
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
              {t('customers.deleteConfirm')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl border border-gray-300 py-3 text-base text-gray-600"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-500 py-3 text-base font-semibold text-white"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white"
          >
            ✕
          </button>
          <img
            src={lightboxUrl}
            alt="photo"
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  )
}
