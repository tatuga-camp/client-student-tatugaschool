import { Language } from "../../interfaces";

export const navbarLanguageData = {
  classNo: (l: Language) => (l === "th" ? "เลขที่" : "Class No."),
  helpCenter: (l: Language) =>
    l === "th" ? "ศูนย์ช่วยเหลือ" : "Help Center",
  whatsNew: (l: Language) => (l === "th" ? "อัปเดตล่าสุด" : "What's New"),
  logoutButton: (l: Language) => (l === "th" ? "ออกจากระบบ" : "Logout"),
} as const;
