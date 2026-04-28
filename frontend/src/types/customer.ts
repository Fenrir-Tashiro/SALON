export interface TherapistNote {
  id: string;
  date: string;           // ISO string
  characteristics: string; // 顧客の特徴・好み
  avoidAreas: string;     // 触れてほしくない箇所
  memo: string;           // 自由メモ
}

export interface Customer {
  _id: string;
  _rev?: string;
  type: 'customer';

  // 基本情報
  lastNameJa: string;     // 姓（漢字）
  firstNameJa: string;    // 名（漢字）
  lastNameKana: string;     // 姓（カナ）
  firstNameKana: string;   // 名（カナ）
  middleNameKana?: string; // ミドルネーム（カナ）
  lastNameEn: string;      // Last name
  firstNameEn: string;     // First name
  middleNameEn?: string;   // Middle name
  dateOfBirth: string;    // YYYY-MM-DD
  gender: 'male' | 'female' | 'other';
  nationality: string;

  // 船内情報
  cabinNumber: string;
  cardKeyId: string;      // fetched from external API later, editable for now

  // 健康・スパ
  allergies: string;
  healthNotes: string;

  // セラピストメモ（追記式）
  therapistNotes: TherapistNote[];

  // 写真
  photos?: { filename: string; data: string; type: string }[];

  // システム
  createdAt: string;
  updatedAt: string;
}
