export interface CityDefinition {
  id: string;
  name: string;
  urduName: string;
  province: "Federal" | "Punjab" | "Sindh" | "KPK" | "Balochistan" | "AJK" | "Gilgit-Baltistan";
  defaultMarlaSqft: number;
  isActive: boolean;
}

export const PAKISTANI_CITIES: CityDefinition[] = [
  // Major Metros & Federal
  { id: "isb", name: "Islamabad", urduName: "اسلام آباد", province: "Federal", defaultMarlaSqft: 272.25, isActive: true },
  { id: "rwp", name: "Rawalpindi", urduName: "راولپنڈی", province: "Punjab", defaultMarlaSqft: 272.25, isActive: true },
  { id: "lhr", name: "Lahore", urduName: "لاہور", province: "Punjab", defaultMarlaSqft: 250, isActive: true },
  { id: "khi", name: "Karachi", urduName: "کراچی", province: "Sindh", defaultMarlaSqft: 225, isActive: true },
  { id: "pew", name: "Peshawar", urduName: "پشاور", province: "KPK", defaultMarlaSqft: 225, isActive: true },
  { id: "qta", name: "Quetta", urduName: "کوئٹہ", province: "Balochistan", defaultMarlaSqft: 225, isActive: true },
  
  // Punjab Central & South
  { id: "fsd", name: "Faisalabad", urduName: "فیصل آباد", province: "Punjab", defaultMarlaSqft: 272.25, isActive: true },
  { id: "mux", name: "Multan", urduName: "ملتان", province: "Punjab", defaultMarlaSqft: 272.25, isActive: true },
  { id: "grw", name: "Gujranwala", urduName: "گوجرانوالہ", province: "Punjab", defaultMarlaSqft: 225, isActive: true },
  { id: "skt", name: "Sialkot", urduName: "سیالکوٹ", province: "Punjab", defaultMarlaSqft: 225, isActive: true },
  { id: "bwp", name: "Bahawalpur", urduName: "بہاولپور", province: "Punjab", defaultMarlaSqft: 272.25, isActive: true },
  { id: "sgd", name: "Sargodha", urduName: "سرگودھا", province: "Punjab", defaultMarlaSqft: 272.25, isActive: true },
  { id: "gjt", name: "Gujrat", urduName: "گجرات", province: "Punjab", defaultMarlaSqft: 225, isActive: true },
  { id: "skp", name: "Sheikhupura", urduName: "شیخوپورہ", province: "Punjab", defaultMarlaSqft: 272.25, isActive: true },
  { id: "ryk", name: "Rahim Yar Khan", urduName: "رحیم یار خان", province: "Punjab", defaultMarlaSqft: 272.25, isActive: true },
  { id: "dgk", name: "Dera Ghazi Khan", urduName: "ڈیرہ غازی خان", province: "Punjab", defaultMarlaSqft: 272.25, isActive: true },
  { id: "jhl", name: "Jhelum", urduName: "جہلم", province: "Punjab", defaultMarlaSqft: 225, isActive: true },
  { id: "ckw", name: "Chakwal", urduName: "چکوال", province: "Punjab", defaultMarlaSqft: 225, isActive: true },
  { id: "wah", name: "Wah Cantt", urduName: "واہ کینٹ", province: "Punjab", defaultMarlaSqft: 225, isActive: true },
  { id: "txl", name: "Taxila", urduName: "ٹیکسلا", province: "Punjab", defaultMarlaSqft: 225, isActive: true },
  { id: "mre", name: "Murree", urduName: "مری", province: "Punjab", defaultMarlaSqft: 225, isActive: true },

  // Sindh
  { id: "hyd", name: "Hyderabad", urduName: "حیدرآباد", province: "Sindh", defaultMarlaSqft: 225, isActive: true },
  { id: "skr", name: "Sukkur", urduName: "سکھر", province: "Sindh", defaultMarlaSqft: 225, isActive: true },

  // KPK
  { id: "atd", name: "Abbottabad", urduName: "ایبٹ آباد", province: "KPK", defaultMarlaSqft: 225, isActive: true },
  { id: "mdn", name: "Mardan", urduName: "مردان", province: "KPK", defaultMarlaSqft: 225, isActive: true },
  { id: "mng", name: "Mingora / Swat", urduName: "مینگورہ / سوات", province: "KPK", defaultMarlaSqft: 225, isActive: true },

  // AJK & Gilgit-Baltistan
  { id: "mzd", name: "Muzaffarabad", urduName: "مظفرآباد", province: "AJK", defaultMarlaSqft: 225, isActive: true },
  { id: "glt", name: "Gilgit", urduName: "گلگت", province: "Gilgit-Baltistan", defaultMarlaSqft: 225, isActive: true }
];

export const PAK_CITIES = PAKISTANI_CITIES;

