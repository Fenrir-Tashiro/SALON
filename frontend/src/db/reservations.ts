import { getDB } from './index'
import type { Reservation, ReservationStatus } from '../types/reservation'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export async function getAllReservations(): Promise<Reservation[]> {
  const db = await getDB()
  return db.getAll('reservations')
}

export async function getReservationsByDate(date: string): Promise<Reservation[]> {
  const all = await getAllReservations()
  return all
    .filter((r) => r.date === date)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

export async function getReservation(id: string): Promise<Reservation> {
  const db = await getDB()
  const doc = await db.get('reservations', id)
  if (!doc) throw new Error(`Reservation not found: ${id}`)
  return doc
}

export async function createReservation(
  data: Omit<Reservation, '_id' | 'createdAt' | 'updatedAt'>
): Promise<Reservation> {
  const db = await getDB()
  const now = new Date().toISOString()
  const reservation: Reservation = {
    ...data,
    _id: `reservation_${generateId()}`,
    createdAt: now,
    updatedAt: now,
  }
  await db.put('reservations', reservation)
  return reservation
}

export async function updateReservation(r: Reservation): Promise<Reservation> {
  const db = await getDB()
  const updated: Reservation = { ...r, updatedAt: new Date().toISOString() }
  await db.put('reservations', updated)
  return updated
}

export async function deleteReservation(r: Reservation): Promise<void> {
  const db = await getDB()
  await db.delete('reservations', r._id)
}

export async function updateStatus(
  id: string,
  status: ReservationStatus
): Promise<Reservation> {
  const reservation = await getReservation(id)
  return updateReservation({ ...reservation, status })
}

export async function getReservationsByCustomerId(customerId: string): Promise<Reservation[]> {
  const all = await getAllReservations()
  return all
    .filter((r) => r.customerId === customerId)
    .sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date)
      return b.startTime.localeCompare(a.startTime)
    })
}
