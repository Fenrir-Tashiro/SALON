import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { createCustomer, getCustomer, updateCustomer } from '../db/customers'
import type { Customer } from '../types/customer'

type FormData = Omit<Customer, '_id' | '_rev' | 'createdAt' | 'updatedAt' | 'therapistNotes'>

const EMPTY_FORM: FormData = {
  type: 'customer',
  lastNameJa: '',
  firstNameJa: '',
  lastNameKana: '',
  firstNameKana: '',
  middleNameKana: '',
  lastNameEn: '',
  firstNameEn: '',
  middleNameEn: '',
  dateOfBirth: '',
  gender: 'other',
  nationality: '',
  cabinNumber: '',
  cardKeyId: '',
  allergies: '',
  healthNotes: '',
}

function FormField({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
    />
  )
}

function TextAreaInput({
  value,
  onChange,
  rows = 3,
}: {
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
    />
  )
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
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">{children}</div>
    </div>
  )
}

export default function CustomerFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    if (!id) return
    getCustomer(id)
      .then((c) => {
        setExistingCustomer(c)
        setForm({
          type: 'customer',
          lastNameJa: c.lastNameJa,
          firstNameJa: c.firstNameJa,
          lastNameKana: c.lastNameKana,
          firstNameKana: c.firstNameKana,
          lastNameEn: c.lastNameEn,
          firstNameEn: c.firstNameEn,
          dateOfBirth: c.dateOfBirth,
          gender: c.gender,
          nationality: c.nationality,
          cabinNumber: c.cabinNumber,
          cardKeyId: c.cardKeyId,
          allergies: c.allergies,
          healthNotes: c.healthNotes,
        })
      })
      .finally(() => setLoading(false))
  }, [id])

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validate(): boolean {
    const errs: string[] = []
    if (!form.lastNameJa.trim() && !form.lastNameEn.trim()) {
      errs.push(t('customers.validationNameRequired'))
    }
    if (!form.cabinNumber.trim()) {
      errs.push(t('customers.validationCabinRequired'))
    }
    setErrors(errs)
    return errs.length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (isEdit && existingCustomer) {
        const updated = await updateCustomer({
          ...existingCustomer,
          ...form,
        })
        navigate(`/customers/${updated._id}`)
      } else {
        const created = await createCustomer({
          ...form,
          therapistNotes: [],
        })
        navigate(`/customers/${created._id}`)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (isEdit && id) {
      navigate(`/customers/${id}`)
    } else {
      navigate('/customers')
    }
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-gray-400">{t('common.loading')}</p>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <h1 className="text-lg font-bold text-gray-800">
          {isEdit ? t('customers.editMode') : t('customers.createMode')}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            className="min-h-[44px] rounded-xl border border-gray-300 bg-white px-4 py-2 text-base text-gray-600 hover:bg-gray-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="min-h-[44px] rounded-xl bg-primary-600 px-5 py-2 text-base font-semibold text-white shadow hover:bg-primary-700 disabled:opacity-50"
          >
            {t('common.save')}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-5 p-6">
        {/* Validation errors */}
        {errors.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            {errors.map((e, i) => (
              <p key={i} className="text-sm text-red-600">
                {e}
              </p>
            ))}
          </div>
        )}

        {/* Basic info */}
        <SectionCard title={t('customers.basicInfo')}>
          {/* 姓（漢字）| 名（漢字） */}
          <FormField label={t('customers.lastNameJa')}>
            <TextInput value={form.lastNameJa} onChange={(v) => set('lastNameJa', v)} />
          </FormField>
          <FormField label={t('customers.firstNameJa')}>
            <TextInput value={form.firstNameJa} onChange={(v) => set('firstNameJa', v)} />
          </FormField>
          {/* 姓（カナ）| 名（カナ） */}
          <FormField label={t('customers.lastNameKana')}>
            <TextInput value={form.lastNameKana} onChange={(v) => set('lastNameKana', v)} />
          </FormField>
          <FormField label={t('customers.firstNameKana')}>
            <TextInput value={form.firstNameKana} onChange={(v) => set('firstNameKana', v)} />
          </FormField>
          {/* Last Name | First Name */}
          <FormField label={t('customers.lastNameEn')}>
            <TextInput value={form.lastNameEn} onChange={(v) => set('lastNameEn', v)} />
          </FormField>
          <FormField label={t('customers.firstNameEn')}>
            <TextInput value={form.firstNameEn} onChange={(v) => set('firstNameEn', v)} />
          </FormField>
          {/* Middle Name（全幅） */}
          <div className="sm:col-span-2">
            <FormField label={t('customers.middleNameEn')}>
              <TextInput value={form.middleNameEn ?? ''} onChange={(v) => set('middleNameEn', v)} />
            </FormField>
          </div>
          {/* 生年月日 | 性別 */}
          <FormField label={t('customers.dateOfBirth')}>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => set('dateOfBirth', e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </FormField>
          <FormField label={t('customers.gender')}>
            <select
              value={form.gender}
              onChange={(e) => set('gender', e.target.value as Customer['gender'])}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <option value="male">{t('customers.genderMale')}</option>
              <option value="female">{t('customers.genderFemale')}</option>
              <option value="other">{t('customers.genderOther')}</option>
            </select>
          </FormField>
          {/* 国籍（全幅） */}
          <div className="sm:col-span-2">
            <FormField label={t('customers.nationality')}>
              <TextInput value={form.nationality} onChange={(v) => set('nationality', v)} />
            </FormField>
          </div>
        </SectionCard>

        {/* Ship info */}
        <SectionCard title={t('customers.shipInfo')}>
          <FormField label={t('customers.cabinNumber')} required>
            <TextInput value={form.cabinNumber} onChange={(v) => set('cabinNumber', v)} />
          </FormField>
          <FormField label={t('customers.cardKeyId')}>
            <TextInput value={form.cardKeyId} onChange={(v) => set('cardKeyId', v)} />
            <p className="mt-1 text-xs text-gray-400">
              ※ {t('customers.cardKeyIdNote')}
            </p>
          </FormField>
        </SectionCard>

        {/* Health & Spa */}
        <SectionCard title={t('customers.healthInfo')}>
          <div className="sm:col-span-2">
            <FormField label={t('customers.allergies')}>
              <TextAreaInput value={form.allergies} onChange={(v) => set('allergies', v)} />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label={t('customers.healthNotes')}>
              <TextAreaInput value={form.healthNotes} onChange={(v) => set('healthNotes', v)} />
            </FormField>
          </div>
        </SectionCard>

        {/* Bottom action buttons */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            onClick={handleCancel}
            className="min-h-[44px] rounded-xl border border-gray-300 bg-white px-6 py-3 text-base text-gray-600 hover:bg-gray-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="min-h-[44px] rounded-xl bg-primary-600 px-8 py-3 text-base font-semibold text-white shadow hover:bg-primary-700 disabled:opacity-50"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </main>
  )
}
