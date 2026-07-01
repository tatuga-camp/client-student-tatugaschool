import { Language } from "../../interfaces";

export const navbarLanguageData = {
  classNo: (l: Language) => (l === "th" ? "เลขที่" : "Class No."),
  helpCenter: (l: Language) =>
    l === "th" ? "ศูนย์ช่วยเหลือ" : "Help Center",
  whatsNew: (l: Language) => (l === "th" ? "อัปเดตล่าสุด" : "What's New"),
  logoutButton: (l: Language) => (l === "th" ? "ออกจากระบบ" : "Logout"),
  submittedLabel: (count: number, total: number, pct: number, l: Language) =>
    l === "th"
      ? `ส่งแล้ว ${count}/${total} (${pct}%)`
      : `${count}/${total} submitted (${pct}%)`,
  submittedCountLabel: (count: number, total: number, l: Language) =>
    l === "th" ? `ส่งแล้ว ${count} / ${total}` : `${count} / ${total} submitted`,
} as const;
