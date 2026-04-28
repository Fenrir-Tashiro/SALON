import { openDB, type IDBPDatabase } from 'idb'
import type { Customer } from '../types/customer'
import type { Reservation } from '../types/reservation'
import type { CounselingRecord } from '../types/counseling'

const DB_NAME = 'salon'
const DB_VERSION = 3

export interface SalonDB {
  customers: { key: string; value: Customer }
  reservations: { key: string; value: Reservation }
  counseling: { key: string; value: CounselingRecord }
}

let _db: IDBPDatabase<SalonDB> | null = null

export async function getDB(): Promise<IDBPDatabase<SalonDB>> {
  if (_db) return _db
  _db = await openDB<SalonDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains('customers')) {
          db.createObjectStore('customers', { keyPath: '_id' })
        }
      }
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('reservations')) {
          db.createObjectStore('reservations', { keyPath: '_id' })
        }
      }
      if (oldVersion < 3) {
        if (!db.objectStoreNames.contains('counseling')) {
          db.createObjectStore('counseling', { keyPath: '_id' })
        }
      }
    },
  })
  return _db
}
