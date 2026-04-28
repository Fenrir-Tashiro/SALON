import { getDB } from './index'
import type { Customer, TherapistNote } from '../types/customer'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export async function getAllCustomers(): Promise<Customer[]> {
  const db = await getDB()
  return db.getAll('customers')
}

export async function getCustomer(id: string): Promise<Customer> {
  const db = await getDB()
  const doc = await db.get('customers', id)
  if (!doc) throw new Error(`Customer not found: ${id}`)
  return doc
}

export async function createCustomer(
  data: Omit<Customer, '_id' | '_rev' | 'createdAt' | 'updatedAt'>
): Promise<Customer> {
  const db = await getDB()
  const now = new Date().toISOString()
  const customer: Customer = {
    ...data,
    _id: `customer_${generateId()}`,
    createdAt: now,
    updatedAt: now,
  }
  await db.put('customers', customer)
  return customer
}

export async function updateCustomer(customer: Customer): Promise<Customer> {
  const db = await getDB()
  const updated: Customer = { ...customer, updatedAt: new Date().toISOString() }
  await db.put('customers', updated)
  return updated
}

export async function deleteCustomer(customer: Customer): Promise<void> {
  const db = await getDB()
  await db.delete('customers', customer._id)
}

export async function addTherapistNote(
  customerId: string,
  note: Omit<TherapistNote, 'id'>
): Promise<Customer> {
  const customer = await getCustomer(customerId)
  const newNote: TherapistNote = { ...note, id: generateId() }
  return updateCustomer({
    ...customer,
    therapistNotes: [newNote, ...customer.therapistNotes],
  })
}

export async function updateTherapistNote(
  customerId: string,
  noteId: string,
  updates: Partial<Omit<TherapistNote, 'id'>>
): Promise<Customer> {
  const customer = await getCustomer(customerId)
  return updateCustomer({
    ...customer,
    therapistNotes: customer.therapistNotes.map((n) =>
      n.id === noteId ? { ...n, ...updates } : n
    ),
  })
}

export async function addPhoto(
  customerId: string,
  photoBlob: Blob,
  filename: string
): Promise<Customer> {
  const customer = await getCustomer(customerId)
  const base64 = await blobToBase64(photoBlob)
  const photos = [
    ...(customer.photos ?? []),
    { filename, data: base64, type: photoBlob.type || 'image/jpeg' },
  ]
  return updateCustomer({ ...customer, photos })
}

export async function deletePhoto(
  customerId: string,
  filename: string
): Promise<Customer> {
  const customer = await getCustomer(customerId)
  return updateCustomer({
    ...customer,
    photos: (customer.photos ?? []).filter((p) => p.filename !== filename),
  })
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
