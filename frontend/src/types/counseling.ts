export type PressureLevel = 'light' | 'medium' | 'firm'
export type PhysicalCondition = 'good' | 'normal' | 'poor'
export type FatigueLevel = 1 | 2 | 3 | 4 | 5

export interface CounselingRecord {
  _id: string
  type: 'counseling'
  reservationId: string
  customerId: string

  // 身体状態
  concernedAreas: string
  fatigueLevel: FatigueLevel
  stiffnessState: string

  // 希望
  pressureLevel: PressureLevel
  focusAreas: string

  // 体調確認
  bodyTemperature: string
  bloodPressure: string
  physicalCondition: PhysicalCondition

  // 肌状態
  skinType: string
  skinConcerns: string

  // その他
  additionalNotes: string
  customerSignature: string // base64 data URL from canvas

  createdAt: string
  updatedAt: string
}
