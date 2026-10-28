import { Language } from "../../interfaces";
import { DayPeriod } from "../../utils/timeOfDay";

const t = (l: Language, en: string, th: string) => (l === "th" ? th : en);

export const homeLanguage = {
  tabClasswork: (l: Language) => t(l, "Classwork", "งานในชั้น"),
  tabProgress: (l: Language) => t(l, "Progress", "ผลการเรียน"),
  tabHome: (l: Language) => t(l, "Home", "หน้าหลัก"),
  tabSubjects: (l: Language) => t(l, "Subjects", "รายวิชา"),
  tabMe: (l: Language) => t(l, "Me", "ฉัน"),
  tabBar: (l: Language) => t(l, "Subject tabs", "แท็บของวิชา"),
  studentNotFound: (l: Language) => t(l, "Student not found", "ไม่พบนักเรียน"),
  back: (l: Language) => t(l, "Back", "ย้อนกลับ"),
  paneError: (l: Language) =>
    t(l, "Something went wrong on this page", "หน้านี้เกิดข้อผิดพลาด"),
  retry: (l: Language) => t(l, "Try again", "ลองอีกครั้ง"),
  switchSubject: (l: Language) => t(l, "Switch subject", "เปลี่ยนวิชา"),
  currentSubject: (l: Language) => t(l, "Current", "วิชาปัจจุบัน"),
  seeAllSubjects: (l: Language) => t(l, "See all subjects", "ดูวิชาทั้งหมด"),
  unread: (l: Language, n: number) => t(l, `${n} unread`, `ยังไม่อ่าน ${n}`),
  pushOnTitle: (l: Language) =>
    t(l, "Notifications are on", "เปิดการแจ้งเตือนแล้ว"),
  pushOnBody: (l: Language) =>
    t(
      l,
      "You'll hear when your teacher posts something new.",
      "เมื่อคุณครูโพสต์อะไรใหม่ เราจะแจ้งให้ทราบ",
    ),
  pushUnsupported: (l: Language) =>
    t(
      l,
      "This browser can't show notifications.",
      "เบราว์เซอร์นี้แสดงการแจ้งเตือนไม่ได้",
    ),
  done: (l: Language) => t(l, "Done", "เสร็จแล้ว"),
  greeting: (l: Language, period: DayPeriod, firstName: string) => {
    const th = l === "th";
    switch (period) {
      case "morning":
        return th ? `อรุณสวัสดิ์ ${firstName}!` : `Good morning, ${firstName}!`;
      case "noon":
        return th ? "เที่ยงแล้ว กินข้าวหรือยัง?" : "Lunch time! Have you eaten?";
      case "afternoon":
        return th
          ? `บ่ายนี้สู้ ๆ นะ ${firstName}!`
          : `Keep going this afternoon, ${firstName}!`;
      case "night":
        return th
          ? "ทำการบ้านก่อนนอนนะ"
          : "Finish your homework before bed";
    }
  },
};
