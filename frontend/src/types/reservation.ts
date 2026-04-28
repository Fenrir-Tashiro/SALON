export type ReservationStatus = 'booked' | 'in_progress' | 'completed' | 'cancelled'

export interface Reservation {
  _id: string
  type: 'reservation'
  customerId: string
  customerName: string   // denormalized: "田中 美咲 / Tanaka Misaki"
  cabinNumber: string    // denormalized for display
  serviceType: string    // トリートメント種類
  duration: number       // 分 (30/60/90/120)
  therapistName: string
  date: string           // YYYY-MM-DD
  startTime: string      // HH:MM
  roomNumber: string
  status: ReservationStatus
  notes: string
  createdAt: string
  updatedAt: string
}
