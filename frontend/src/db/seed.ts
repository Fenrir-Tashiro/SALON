import { createCustomer, getAllCustomers } from './customers'
import { createReservation } from './reservations'

const seedData = [
  {
    type: 'customer' as const,
    lastNameJa: '田中', firstNameJa: '美咲',
    lastNameKana: 'タナカ', firstNameKana: 'ミサキ',
    lastNameEn: 'Tanaka', firstNameEn: 'Misaki',
    dateOfBirth: '1985-03-12', gender: 'female' as const,
    nationality: '日本', cabinNumber: '502', cardKeyId: '',
    allergies: 'ラテックスアレルギー', healthNotes: '高血圧のため強圧マッサージ不可',
    therapistNotes: [],
  },
  {
    type: 'customer' as const,
    lastNameJa: '鈴木', firstNameJa: '健太',
    lastNameKana: 'スズキ', firstNameKana: 'ケンタ',
    lastNameEn: 'Suzuki', firstNameEn: 'Kenta',
    dateOfBirth: '1972-07-28', gender: 'male' as const,
    nationality: '日本', cabinNumber: '308', cardKeyId: '',
    allergies: '', healthNotes: '腰痛持ち',
    therapistNotes: [],
  },
  {
    type: 'customer' as const,
    lastNameJa: '山田', firstNameJa: '花子',
    lastNameKana: 'ヤマダ', firstNameKana: 'ハナコ',
    lastNameEn: 'Yamada', firstNameEn: 'Hanako',
    dateOfBirth: '1990-11-05', gender: 'female' as const,
    nationality: '日本', cabinNumber: '715', cardKeyId: '',
    allergies: 'エッセンシャルオイル（ラベンダー）', healthNotes: '',
    therapistNotes: [],
  },
  {
    type: 'customer' as const,
    lastNameJa: '', firstNameJa: '',
    lastNameKana: '', firstNameKana: '',
    lastNameEn: 'Smith', firstNameEn: 'Emily',
    dateOfBirth: '1988-06-15', gender: 'female' as const,
    nationality: 'USA', cabinNumber: '1024', cardKeyId: '',
    allergies: 'Nut oil allergy', healthNotes: 'Pregnant (2nd trimester) - gentle treatment only',
    therapistNotes: [],
  },
  {
    type: 'customer' as const,
    lastNameJa: '', firstNameJa: '',
    lastNameKana: '', firstNameKana: '',
    lastNameEn: 'Johnson', firstNameEn: 'Michael',
    dateOfBirth: '1965-09-22', gender: 'male' as const,
    nationality: 'UK', cabinNumber: '610', cardKeyId: '',
    allergies: '', healthNotes: 'Knee replacement surgery (right) - avoid deep pressure on right leg',
    therapistNotes: [],
  },
  {
    type: 'customer' as const,
    lastNameJa: '', firstNameJa: '',
    lastNameKana: '', firstNameKana: '',
    lastNameEn: 'Wang', firstNameEn: 'Fang',
    dateOfBirth: '1995-02-18', gender: 'female' as const,
    nationality: '中国', cabinNumber: '821', cardKeyId: '',
    allergies: '', healthNotes: '',
    therapistNotes: [],
  },
  {
    type: 'customer' as const,
    lastNameJa: '', firstNameJa: '',
    lastNameKana: '', firstNameKana: '',
    lastNameEn: 'Kim', firstNameEn: 'Jiyeon',
    dateOfBirth: '1992-12-03', gender: 'female' as const,
    nationality: '韓国', cabinNumber: '403', cardKeyId: '',
    allergies: '香料全般', healthNotes: '',
    therapistNotes: [],
  },
  {
    type: 'customer' as const,
    lastNameJa: '佐藤', firstNameJa: '誠一',
    lastNameKana: 'サトウ', firstNameKana: 'セイイチ',
    lastNameEn: 'Sato', firstNameEn: 'Seiichi',
    dateOfBirth: '1958-04-30', gender: 'male' as const,
    nationality: '日本', cabinNumber: '1205', cardKeyId: '',
    allergies: '', healthNotes: '心臓ペースメーカー使用 - 電気系施術不可',
    therapistNotes: [],
  },
  {
    type: 'customer' as const,
    lastNameJa: '', firstNameJa: '',
    lastNameKana: '', firstNameKana: '',
    lastNameEn: 'Muller', firstNameEn: 'Sophia',
    dateOfBirth: '1980-08-14', gender: 'female' as const,
    nationality: 'Germany', cabinNumber: '907', cardKeyId: '',
    allergies: 'Gluten (skin contact)', healthNotes: '',
    therapistNotes: [],
  },
  {
    type: 'customer' as const,
    lastNameJa: '中村', firstNameJa: '涼子',
    lastNameKana: 'ナカムラ', firstNameKana: 'リョウコ',
    lastNameEn: 'Nakamura', firstNameEn: 'Ryoko',
    dateOfBirth: '2001-01-25', gender: 'female' as const,
    nationality: '日本', cabinNumber: '614', cardKeyId: '',
    allergies: '', healthNotes: '',
    therapistNotes: [],
  },
]

const redDiamondsData = [
  {
    type: 'customer' as const,
    lastNameJa: '西川', firstNameJa: '周作',
    lastNameKana: 'ニシカワ', firstNameKana: 'シュウサク',
    lastNameEn: 'Nishikawa', firstNameEn: 'Shusaku',
    dateOfBirth: '1986-06-18', gender: 'male' as const,
    nationality: '日本', cabinNumber: '301', cardKeyId: '',
    allergies: '', healthNotes: '', therapistNotes: [],
  },
  {
    type: 'customer' as const,
    lastNameJa: '中島', firstNameJa: '翔哉',
    lastNameKana: 'ナカジマ', firstNameKana: 'ショウヤ',
    lastNameEn: 'Nakajima', firstNameEn: 'Shoya',
    dateOfBirth: '1994-08-23', gender: 'male' as const,
    nationality: '日本', cabinNumber: '412', cardKeyId: '',
    allergies: '', healthNotes: '', therapistNotes: [],
  },
  {
    type: 'customer' as const,
    lastNameJa: '渡邊', firstNameJa: '凌磨',
    lastNameKana: 'ワタナベ', firstNameKana: 'リョウマ',
    lastNameEn: 'Watanabe', firstNameEn: 'Ryoma',
    dateOfBirth: '1996-10-02', gender: 'male' as const,
    nationality: '日本', cabinNumber: '527', cardKeyId: '',
    allergies: '', healthNotes: '', therapistNotes: [],
  },
  {
    type: 'customer' as const,
    lastNameJa: '関根', firstNameJa: '貴大',
    lastNameKana: 'セキネ', firstNameKana: 'タカヒロ',
    lastNameEn: 'Sekine', firstNameEn: 'Takahiro',
    dateOfBirth: '1995-04-19', gender: 'male' as const,
    nationality: '日本', cabinNumber: '618', cardKeyId: '',
    allergies: '', healthNotes: '', therapistNotes: [],
  },
  {
    type: 'customer' as const,
    lastNameJa: '安部', firstNameJa: '裕葵',
    lastNameKana: 'アベ', firstNameKana: 'ユウキ',
    lastNameEn: 'Abe', firstNameEn: 'Yuki',
    dateOfBirth: '1999-01-28', gender: 'male' as const,
    nationality: '日本', cabinNumber: '703', cardKeyId: '',
    allergies: '', healthNotes: '', therapistNotes: [],
  },
  {
    type: 'customer' as const,
    lastNameJa: '', firstNameJa: '',
    lastNameKana: 'ボザ', firstNameKana: 'ダニーロ',
    lastNameEn: 'Boza', firstNameEn: 'Danilo',
    dateOfBirth: '1998-05-06', gender: 'male' as const,
    nationality: 'ブラジル', cabinNumber: '834', cardKeyId: '',
    allergies: '', healthNotes: '', therapistNotes: [],
  },
  {
    type: 'customer' as const,
    lastNameJa: '', firstNameJa: '',
    lastNameKana: 'グスタフソン', firstNameKana: 'サミュエル',
    lastNameEn: 'Gustafsson', firstNameEn: 'Samuel',
    dateOfBirth: '1995-01-11', gender: 'male' as const,
    nationality: 'スウェーデン', cabinNumber: '915', cardKeyId: '',
    allergies: '', healthNotes: '', therapistNotes: [],
  },
  {
    type: 'customer' as const,
    lastNameJa: '石原', firstNameJa: '広教',
    lastNameKana: 'イシハラ', firstNameKana: 'ヒロノリ',
    lastNameEn: 'Ishihara', firstNameEn: 'Hironori',
    dateOfBirth: '1999-02-26', gender: 'male' as const,
    nationality: '日本', cabinNumber: '1022', cardKeyId: '',
    allergies: '', healthNotes: '', therapistNotes: [],
  },
  {
    type: 'customer' as const,
    lastNameJa: '松尾', firstNameJa: '佑介',
    lastNameKana: 'マツオ', firstNameKana: 'ユウスケ',
    lastNameEn: 'Matsuo', firstNameEn: 'Yusuke',
    dateOfBirth: '1997-07-23', gender: 'male' as const,
    nationality: '日本', cabinNumber: '1115', cardKeyId: '',
    allergies: '', healthNotes: '', therapistNotes: [],
  },
  {
    type: 'customer' as const,
    lastNameJa: '', firstNameJa: '',
    lastNameKana: 'サヴィオ', firstNameKana: 'マテウス',
    lastNameEn: 'Savio', firstNameEn: 'Matheus',
    dateOfBirth: '1997-04-15', gender: 'male' as const,
    nationality: 'ブラジル', cabinNumber: '1208', cardKeyId: '',
    allergies: '', healthNotes: '', therapistNotes: [],
  },
]

export async function seedRedDiamonds(): Promise<void> {
  let count = 0
  for (const data of redDiamondsData) {
    try {
      await createCustomer(data)
      count++
    } catch (e) {
      console.error('登録失敗:', data.lastNameJa || data.lastNameEn, e)
    }
  }
  console.log(`✅ 浦和レッドダイヤモンズ選手 ${count}件 を登録しました`)
  window.location.reload()
}

export async function seedCustomers(): Promise<void> {
  for (const data of seedData) {
    await createCustomer(data)
  }
  console.log('✅ 10件の顧客テストデータを登録しました')
}

export async function seedReservations(): Promise<void> {
  const customers = await getAllCustomers()
  if (customers.length === 0) {
    console.warn('⚠️ 先に seedCustomers() を実行してください')
    return
  }

  const today = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

  function buildName(c: typeof customers[0]) {
    const ja = `${c.lastNameJa} ${c.firstNameJa}`.trim()
    const en = `${c.lastNameEn} ${c.firstNameEn}`.trim()
    return [ja, en].filter(Boolean).join(' / ')
  }

  const slots = [
    { time: '09:00', service: 'ボディトリートメント', duration: 90, therapist: '山本 えりか', room: '101', status: 'completed' as const },
    { time: '10:30', service: 'フェイシャル', duration: 60, therapist: '鈴木 あかね', room: '102', status: 'completed' as const },
    { time: '11:00', service: 'アロマセラピー', duration: 60, therapist: '田村 ゆい', room: '103', status: 'in_progress' as const },
    { time: '13:00', service: 'ホットストーン', duration: 90, therapist: '山本 えりか', room: '101', status: 'booked' as const },
    { time: '14:00', service: 'フットリフレクソロジー', duration: 60, therapist: '鈴木 あかね', room: '102', status: 'booked' as const },
    { time: '15:30', service: 'スペシャルパッケージ', duration: 120, therapist: '田村 ゆい', room: '103', status: 'booked' as const },
    { time: '16:00', service: 'フェイシャル', duration: 60, therapist: '山本 えりか', room: '104', status: 'booked' as const },
    { time: '17:00', service: 'ボディトリートメント', duration: 60, therapist: '鈴木 あかね', room: '102', status: 'booked' as const },
  ]

  for (let i = 0; i < slots.length; i++) {
    const customer = customers[i % customers.length]
    const slot = slots[i]
    await createReservation({
      type: 'reservation',
      customerId: customer._id,
      customerName: buildName(customer),
      cabinNumber: customer.cabinNumber,
      serviceType: slot.service,
      duration: slot.duration,
      therapistName: slot.therapist,
      date: dateStr,
      startTime: slot.time,
      roomNumber: slot.room,
      status: slot.status,
      notes: '',
    })
  }
  console.log(`✅ ${slots.length}件の予約テストデータを登録しました（${dateStr}）`)
}
