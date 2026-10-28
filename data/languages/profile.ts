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
  settings: (language: Language) => pick(language, "Settings", "ตั้งค่า"),
  submitted: (language: Language) => pick(language, "Submitted", "ส่งแล้ว"),
  submittedNoData: (language: Language) =>
    pick(language, "Submitted: no classwork yet", "ส่งแล้ว: ยังไม่มีงาน"),
  attendance: (language: Language) => pick(language, "Attendance", "เข้าเรียน"),
  careerMatch: (language: Language) =>
    pick(language, "My career match", "อาชีพที่เหมาะกับฉัน"),
  language: (language: Language) => pick(language, "Language", "ภาษา"),
  notifications: (language: Language) =>
    pick(language, "Notifications", "การแจ้งเตือน"),
  notificationsOn: (language: Language) => pick(language, "On", "เปิด"),
  notificationsOff: (language: Language) => pick(language, "Off", "ปิด"),
  notificationsBlocked: (language: Language) =>
    pick(language, "Blocked", "ถูกบล็อก"),
  notificationsUnavailable: (language: Language) =>
    pick(language, "Unavailable", "ใช้ไม่ได้"),
  logoutTitle: (language: Language) =>
    pick(language, "Log out?", "ออกจากระบบ?"),
  logoutBody: (language: Language) =>
    pick(
      language,
      "You will need to sign in again on this device.",
      "คุณต้องเข้าสู่ระบบอีกครั้งบนอุปกรณ์นี้",
    ),
  cancel: (language: Language) => pick(language, "Cancel", "ยกเลิก"),
  adjustPhoto: (language: Language) =>
    pick(language, "Adjust photo", "ปรับรูปภาพ"),
  zoom: (language: Language) => pick(language, "Zoom", "ซูม"),
  straighten: (language: Language) => pick(language, "Straighten", "ปรับแนว"),
  rotate90: (language: Language) => pick(language, "Rotate 90°", "หมุน 90°"),
  savePhoto: (language: Language) => pick(language, "Save photo", "บันทึกรูป"),
};
