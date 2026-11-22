// src/config/wilayas.js
//
// The 58 official Algerian wilayas. Delivery destination only — DELIVERY IS
// FREE everywhere, there is no per-wilaya fee here or anywhere else in the
// order flow. `active` lets ops temporarily stop serving a wilaya without a
// code change.

export const WILAYAS = [
  { code: "01", name_ar: "أدرار", active: true },
  { code: "02", name_ar: "الشلف", active: true },
  { code: "03", name_ar: "الأغواط", active: true },
  { code: "04", name_ar: "أم البواقي", active: true },
  { code: "05", name_ar: "باتنة", active: true },
  { code: "06", name_ar: "بجاية", active: true },
  { code: "07", name_ar: "بسكرة", active: true },
  { code: "08", name_ar: "بشار", active: true },
  { code: "09", name_ar: "البليدة", active: true },
  { code: "10", name_ar: "البويرة", active: true },
  { code: "11", name_ar: "تمنراست", active: true },
  { code: "12", name_ar: "تبسة", active: true },
  { code: "13", name_ar: "تلمسان", active: true },
  { code: "14", name_ar: "تيارت", active: true },
  { code: "15", name_ar: "تيزي وزو", active: true },
  { code: "16", name_ar: "الجزائر", active: true },
  { code: "17", name_ar: "الجلفة", active: true },
  { code: "18", name_ar: "جيجل", active: true },
  { code: "19", name_ar: "سطيف", active: true },
  { code: "20", name_ar: "سعيدة", active: true },
  { code: "21", name_ar: "سكيكدة", active: true },
  { code: "22", name_ar: "سيدي بلعباس", active: true },
  { code: "23", name_ar: "عنابة", active: true },
  { code: "24", name_ar: "قالمة", active: true },
  { code: "25", name_ar: "قسنطينة", active: true },
  { code: "26", name_ar: "المدية", active: true },
  { code: "27", name_ar: "مستغانم", active: true },
  { code: "28", name_ar: "المسيلة", active: true },
  { code: "29", name_ar: "معسكر", active: true },
  { code: "30", name_ar: "ورقلة", active: true },
  { code: "31", name_ar: "وهران", active: true },
  { code: "32", name_ar: "البيض", active: true },
  { code: "33", name_ar: "إليزي", active: true },
  { code: "34", name_ar: "برج بوعريريج", active: true },
  { code: "35", name_ar: "بومرداس", active: true },
  { code: "36", name_ar: "الطارف", active: true },
  { code: "37", name_ar: "تندوف", active: true },
  { code: "38", name_ar: "تيسمسيلت", active: true },
  { code: "39", name_ar: "الوادي", active: true },
  { code: "40", name_ar: "خنشلة", active: true },
  { code: "41", name_ar: "سوق أهراس", active: true },
  { code: "42", name_ar: "تيبازة", active: true },
  { code: "43", name_ar: "ميلة", active: true },
  { code: "44", name_ar: "عين الدفلى", active: true },
  { code: "45", name_ar: "النعامة", active: true },
  { code: "46", name_ar: "عين تموشنت", active: true },
  { code: "47", name_ar: "غرداية", active: true },
  { code: "48", name_ar: "غليزان", active: true },
  { code: "49", name_ar: "تيميمون", active: true },
  { code: "50", name_ar: "برج باجي مختار", active: true },
  { code: "51", name_ar: "أولاد جلال", active: true },
  { code: "52", name_ar: "بني عباس", active: true },
  { code: "53", name_ar: "عين صالح", active: true },
  { code: "54", name_ar: "عين قزام", active: true },
  { code: "55", name_ar: "تقرت", active: true },
  { code: "56", name_ar: "جانت", active: true },
  { code: "57", name_ar: "المغير", active: true },
  { code: "58", name_ar: "المنيعة", active: true },
];

export function getActiveWilayas() {
  return WILAYAS.filter((w) => w.active !== false);
}

export function getWilayaByCode(code) {
  return WILAYAS.find((w) => w.code === String(code)) || null;
}
