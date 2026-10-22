import { Language } from "../../interfaces";

const pick = (language: Language, en: string, th: string) =>
  language === "th" ? th : en;

export const profileLanguage = {
  student: (language: Language) => pick(language, "Student", "นักเรียน"),
  number: (language: Language, n: string | number) =>
    pick(language, `No. ${n}`, `เลขที่ ${n}`),
  account: (language: Language) => pick(language, "Account", "บัญชีของฉัน"),
  onlyYou: (language: Language) =>
    pick(language, "Only you can see this", "เห็นได้เฉพาะคุณ"),
  name: (language: Language) => pick(language, "Name", "ชื่อ"),
  profilePhoto: (language: Language) =>
    pick(language, "Profile photo", "รูปโปรไฟล์"),
  password: (language: Language) => pick(language, "Password", "รหัสผ่าน"),
  change: (language: Language) => pick(language, "Change", "เปลี่ยน"),
  editName: (language: Language) => pick(language, "Edit name", "แก้ไขชื่อ"),
  changePassword: (language: Language) =>
    pick(language, "Change password", "เปลี่ยนรหัสผ่าน"),
  save: (language: Language) => pick(language, "Save", "บันทึก"),
  close: (language: Language) => pick(language, "Close", "ปิด"),
  nameRequired: (language: Language) =>
    pick(
      language,
      "Fill in title, first name and last name.",
      "กรุณากรอกคำนำหน้า ชื่อ และนามสกุล",
    ),
  passwordRequired: (language: Language) =>
    pick(language, "Enter a new password.", "กรุณากรอกรหัสผ่านใหม่"),
};
