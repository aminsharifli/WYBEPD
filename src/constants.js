export const ORG = {
  server: 'WYBE-LSPD',
  department: 'WYBE-LSPD',
  headerTitle: 'WYBE-LSPD',
  fullName: 'Los Santos Polis Departmanı',
  subtitle: 'Los Santos Polis Departmanı',
}
export const DOC_TYPES = [
  { value: 'Olay Raporu', label: 'Olay Raporu' },
  { value: 'Gözaltı / Tutuklama Dosyası', label: 'Gözaltı / Tutuklama Dosyası' },
  { value: 'Arama Kararı', label: 'Arama Kararı' },
  { value: 'Delil Kaydı Logu', label: 'Delil Kaydı Logu' },
  { value: 'Suçlu Profili Dosyası', label: 'Suçlu Profili Dosyası' },
]
export const STATUS_OPTIONS = [
  { value: 'AÇIK', label: 'AÇIK' },
  { value: 'KAPALI', label: 'KAPALI' },
  { value: 'SORUŞTURMA SÜRÜYOR', label: 'SORUŞTURMA SÜRÜYOR' },
  { value: 'ONAY BEKLİYOR', label: 'ONAY BEKLİYOR' },
]
export const STATUS_STYLES = {
  AÇIK: { text: '#34d399', border: '#34d399', bg: 'rgba(52, 211, 153, 0.12)' },
  KAPALI: { text: '#f87171', border: '#f87171', bg: 'rgba(248, 113, 113, 0.12)' },
  'SORUŞTURMA SÜRÜYOR': { text: '#fbbf24', border: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)' },
  'ONAY BEKLİYOR': { text: '#60a5fa', border: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)' },
  'SORUN BİLDİRİLDİ': { text: '#fbbf24', border: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)' },
  REDDEDİLDİ: { text: '#f87171', border: '#f87171', bg: 'rgba(248, 113, 113, 0.12)' },
}

export const UNIT_LABELS = {
  'Air Support Unit - FTO': 'Hava Destek Birimi - FTO',
  'High Speed Unit - FTO': 'Yüksek Hız Birimi - FTO',
  'Training Division': 'Eğitim Birimi',
  'Detective Bureau - FTO': 'Dedektif Büro Amirliği - FTO',
  FTO: 'Eğitmen Birimi (FTO)',
  'S.W.A.T.': 'Özel Harekat (S.W.A.T.)',
  'K-9 Unit': 'K-9 Birimi',
}
