import { useTranslation } from 'react-i18next'
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
} from 'react-router-dom'
import './i18n'
import LanguageSwitcher from './components/LanguageSwitcher'
import TodayPage from './pages/TodayPage'
import CustomerDetailPage from './pages/CustomerDetailPage'
import CustomerFormPage from './pages/CustomerFormPage'
import CustomersPage from './pages/CustomersPage'
import ReservationsPage from './pages/ReservationsPage'
import ReservationDetailPage from './pages/ReservationDetailPage'
import ReservationFormPage from './pages/ReservationFormPage'
import CounselingFormPage from './pages/CounselingFormPage'
import CounselingViewPage from './pages/CounselingViewPage'
import CustomerCounselingPage from './pages/CustomerCounselingPage'
import HandoffPage from './pages/HandoffPage'
import KioskPage from './pages/KioskPage'
import KioskIdentifyPage from './pages/KioskIdentifyPage'

function AppShell() {
  const { t } = useTranslation()

  const navItems = [
    { to: '/', label: t('nav.today'), end: true },
    { to: '/customers', label: t('nav.customers') },
    { to: '/reservations', label: t('nav.reservations') },
  ]

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Top navigation bar */}
      <header className="flex items-center justify-between bg-primary-700 px-6 py-3 shadow-md">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-lg font-bold tracking-wide text-white active:opacity-70">
            SALON &amp; SPA
          </Link>
        </div>

        <nav className="flex gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white text-primary-700'
                    : 'text-primary-100 hover:bg-primary-600',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <LanguageSwitcher />
      </header>

      {/* Page content */}
      <div className="flex flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/new" element={<CustomerFormPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/customers/:id/edit" element={<CustomerFormPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/reservations/new" element={<ReservationFormPage />} />
          <Route path="/reservations/:id" element={<ReservationDetailPage />} />
          <Route path="/reservations/:id/edit" element={<ReservationFormPage />} />
          <Route path="/reservations/:id/counseling" element={<CounselingFormPage />} />
          <Route path="/reservations/:id/counseling/view" element={<CounselingViewPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* No-nav routes — customer-facing, full screen */}
        <Route path="/customer/:id/counseling" element={<CustomerCounselingPage />} />
        <Route path="/handoff/:id" element={<HandoffPage />} />
        <Route path="/kiosk" element={<KioskPage />} />
        <Route path="/kiosk/identify" element={<KioskIdentifyPage />} />
        {/* Therapist shell — all other routes */}
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  )
}
