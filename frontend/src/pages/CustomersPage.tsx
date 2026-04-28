import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getAllCustomers } from '../db/customers'
import type { Customer } from '../types/customer'

export default function CustomersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchCustomers = () => {
    getAllCustomers()
      .then(setCustomers)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCustomers()
    window.addEventListener('focus', fetchCustomers)
    return () => window.removeEventListener('focus', fetchCustomers)
  }, [])

  const filtered = customers.filter((c) => {
    if (!query.trim()) return true
    const q = query.trim().toLowerCase()
    return (
      (c.lastNameJa + c.firstNameJa).toLowerCase().includes(q) ||
      (c.lastNameKana + c.firstNameKana + (c.middleNameKana ?? '')).toLowerCase().includes(q) ||
      (c.lastNameEn + ' ' + c.firstNameEn + ' ' + (c.middleNameEn ?? '')).toLowerCase().includes(q) ||
      c.cabinNumber.toLowerCase().includes(q)
    )
  })

  return (
    <main className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          {t('customers.title')}
        </h1>
        <button
          onClick={() => navigate('/customers/new')}
          className="flex min-h-[44px] items-center gap-2 rounded-lg bg-primary-600 px-5 py-2 text-base font-semibold text-white shadow transition hover:bg-primary-700 active:scale-95"
        >
          <span className="text-xl leading-none">+</span>
          {t('customers.new')}
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={t('customers.search')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
      </div>

      {/* List */}
      {loading ? (
        <p className="text-center text-gray-400">{t('common.loading')}</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-400 shadow-sm">
          <p className="text-lg">{t('customers.empty')}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((customer) => (
            <li key={customer._id}>
              <button
                onClick={() => navigate(`/customers/${customer._id}`)}
                className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-left shadow-sm transition hover:border-primary-300 hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      {customer.lastNameJa}
                      {customer.firstNameJa}
                      {(customer.lastNameJa || customer.firstNameJa) &&
                        (customer.lastNameEn || customer.firstNameEn) && (
                          <span className="mx-2 text-gray-300">|</span>
                        )}
                      <span className="text-base font-normal text-gray-600">
                        {customer.lastNameEn} {customer.firstNameEn}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {customer.nationality && (
                        <span className="mr-3">{customer.nationality}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    {customer.cabinNumber && (
                      <span className="inline-block rounded-lg bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
                        {t('customers.cabinNumber')}: {customer.cabinNumber}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
