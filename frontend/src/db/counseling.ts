import { getDB } from './index'
import type { CounselingRecord } from '../types/counseling'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export async function getCounselingByReservationId(
  reservationId: string
): Promise<CounselingRecord | null> {
  const db = await getDB()
  const all = await db.getAll('counseling')
  return all.find((c) => c.reservationId === reservationId) ?? null
}

export async function createCounseling(
  data: Omit<CounselingRecord, '_id' | 'createdAt' | 'updatedAt'>
): Promise<CounselingRecord> {
  const db = await getDB()
  const now = new Date().toISOString()
  const record: CounselingRecord = {
    ...data,
    _id: `counseling_${generateId()}`,
    createdAt: now,
    updatedAt: now,
  }
  await db.put('counseling', record)
  return record
}

export async function updateCounseling(
  record: CounselingRecord
): Promise<CounselingRecord> {
  const db = await getDB()
  const updated: CounselingRecord = {
    ...record,
    updatedAt: new Date().toISOString(),
  }
  await db.put('counseling', updated)
  return updated
}

export async function getCounselingMapForCustomer(
  customerId: string
): Promise<Map<string, CounselingRecord>> {
  const db = await getDB()
  const all = await db.getAll('counseling')
  const records = all.filter((c) => c.customerId === customerId)
  return new Map(records.map((c) => [c.reservationId, c]))
}
