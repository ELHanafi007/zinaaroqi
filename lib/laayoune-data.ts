export interface LaayouneNeighborhood {
  id: string;
  name: string;
  nameAr: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  description: string;
  bounds?: [[number, number], [number, number]]; // southWest, northEast
}

export const LAAYOUNE_CENTER: [number, number] = [27.1536, -13.2033];
export const LAAYOUNE_DEFAULT_ZOOM = 13;

export const LAAYOUNE_NEIGHBORHOODS: LaayouneNeighborhood[] = [
  {
    id: "al-wahda",
    name: "Al Wahda",
    nameAr: "حي الوحدة",
    center: [27.1425, -13.1895],
    zoom: 15,
    description: "Quiet residential district with family villas and modern apartment complexes.",
    bounds: [[27.1350, -13.1990], [27.1500, -13.1800]],
  },
  {
    id: "al-qods",
    name: "Al Qods",
    nameAr: "حي القدس",
    center: [27.1610, -13.2080],
    zoom: 15,
    description: "Active commercial and residential sector near avenue Makkah.",
    bounds: [[27.1530, -13.2180], [27.1690, -13.1980]],
  },
  {
    id: "hay-al-massira",
    name: "Hay Al Massira",
    nameAr: "حي المسيرة",
    center: [27.1480, -13.2150],
    zoom: 15,
    description: "Centrally positioned quarter with shops, schools, and high investment demand.",
    bounds: [[27.1410, -13.2240], [27.1550, -13.2060]],
  },
  {
    id: "25-mars",
    name: "25 Mars",
    nameAr: "حي 25 مارس",
    center: [27.1390, -13.2050],
    zoom: 15,
    description: "Growing residential quarter with commercial plots and new family homes.",
    bounds: [[27.1320, -13.2140], [27.1460, -13.1960]],
  },
  {
    id: "hay-moulay-rachid",
    name: "Hay Moulay Rachid",
    nameAr: "حي الأمير مولاي رشيد",
    center: [27.1575, -13.1950],
    zoom: 15,
    description: "Well-established neighborhood with direct access to Boulevard Smara.",
    bounds: [[27.1500, -13.2040], [27.1650, -13.1860]],
  },
  {
    id: "al-matar",
    name: "Al Matar (Airport Area)",
    nameAr: "حي المطار",
    center: [27.1450, -13.2250],
    zoom: 15,
    description: "Commercial and logistics corridor adjacent to Hassan I Airport.",
    bounds: [[27.1380, -13.2350], [27.1520, -13.2150]],
  },
  {
    id: "dcheira",
    name: "Dcheira / Industrial",
    nameAr: "منطقة الدشيرة",
    center: [27.1280, -13.1750],
    zoom: 14,
    description: "Expanding sector featuring large industrial and development plots.",
    bounds: [[27.1180, -13.1900], [27.1380, -13.1600]],
  },
  {
    id: "al-wifaq",
    name: "Al Wifaq",
    nameAr: "حي الوفاق",
    center: [27.1650, -13.1880],
    zoom: 15,
    description: "Modern urbanization zone with newly parcelled land and multi-story buildings.",
    bounds: [[27.1580, -13.1970], [27.1720, -13.1790]],
  },
];

export type LegalStatus = "mohafada_titre" | "en_cours" | "moulkia" | "non_specifie" | "unknown";

export const LEGAL_STATUSES: { id: LegalStatus; label: string; labelAr: string; badgeClass: string }[] = [
  { id: "mohafada_titre", label: "Titre Foncier (Mohafada)", labelAr: "محفظ (مطلب محفظة)", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "en_cours", label: "En cours d'immatriculation", labelAr: "في طور التحفيظ", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "moulkia", label: "Moulkia Adoulaire", labelAr: "ملكية عدلية", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "non_specifie", label: "Non spécifié / Autre", labelAr: "غير محدد", badgeClass: "bg-stone-50 text-stone-600 border-stone-200" },
  { id: "unknown", label: "Unknown / confirm", labelAr: "غير معروف / يحتاج تأكيدًا", badgeClass: "bg-slate-50 text-slate-600 border-slate-200" },
];
