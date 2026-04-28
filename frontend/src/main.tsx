import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { seedCustomers, seedReservations, seedRedDiamonds } from './db/seed'

if (import.meta.env.DEV) {
  const w = window as unknown as Record<string, unknown>
  w.seedCustomers = seedCustomers
  w.seedReservations = seedReservations
  w.seedRedDiamonds = seedRedDiamonds
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
