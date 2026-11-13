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
  studentNotFoundBody: (l: Language) =>
    t(
      l,
      "This student may have been removed from the class. Ask your teacher, or sign in again.",
      "นักเรียนคนนี้อาจถูกลบออกจากห้องเรียนแล้ว ลองสอบถามคุณครู หรือเข้าสู่ระบบอีกครั้ง",
    ),
  sessionEndedTitle: (l: Language) =>
    t(l, "Please sign in again", "กรุณาเข้าสู่ระบบอีกครั้ง"),
  sessionEndedBody: (l: Language) =>
    t(
      l,
      "Your sign-in has ended. Pick your name again to keep going.",
      "การเข้าสู่ระบบสิ้นสุดแล้ว เลือกชื่อของคุณอีกครั้งเพื่อใช้งานต่อ",
    ),
  signInAgain: (l: Language) => t(l, "Sign in again", "เข้าสู่ระบบอีกครั้ง"),
  studentLoadFailedTitle: (l: Language) =>
    t(l, "Couldn't load your account", "โหลดข้อมูลของคุณไม่สำเร็จ"),
  /** Browser tab title until the subject's own title loads. */
  subjectTitleFallback: (l: Language) => t(l, "Subject", "รายวิชา"),
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
  thisWeek: (l: Language) => t(l, "This week", "สัปดาห์นี้"),
  doneOf: (l: Language, done: number, total: number) =>
    t(l, `${done} / ${total} done`, `เสร็จ ${done} / ${total}`),
  nothingDue: (l: Language) =>
    t(l, "Nothing due this week", "สัปดาห์นี้ไม่มีงานที่ต้องส่ง"),
  assignmentsLeft: (l: Language, n: number) =>
    t(
      l,
      `${n} ${n === 1 ? "assignment" : "assignments"} left`,
      `เหลืองาน ${n} ชิ้น`,
    ),
  loadError: (l: Language) =>
    t(
      l,
      "Couldn't load your work. Try again soon.",
      "โหลดงานไม่สำเร็จ ลองใหม่อีกครั้ง",
    ),
  loadFailed: (l: Language) =>
    t(
      l,
      "Couldn't load this. Check your connection and try again.",
      "โหลดไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง",
    ),
  allDone: (l: Language) => t(l, "All done. Nice work!", "ทำครบแล้ว เก่งมาก!"),
  openAssignment: (l: Language, title: string) =>
    t(l, `Open ${title}`, `เปิด ${title}`),
  dueOn: (l: Language, when: string) => t(l, `Due ${when}`, `ส่ง ${when}`),
  overdue: (l: Language) => t(l, "Overdue", "เลยกำหนด"),
  noDueDate: (l: Language) => t(l, "No due date", "ไม่มีกำหนดส่ง"),
  greeting: (l: Language, period: DayPeriod, firstName: string) => {
    const th = l === "th";
    switch (period) {
      case "morning":
        return th ? `อรุณสวัสดิ์ ${firstName}!` : `Good morning, ${firstName}!`;
      case "noon":
        return th
          ? "เที่ยงแล้ว กินข้าวหรือยัง?"
          : "Lunch time! Have you eaten?";
      case "afternoon":
        return th
          ? `บ่ายนี้สู้ ๆ นะ ${firstName}!`
          : `Keep going this afternoon, ${firstName}!`;
      case "night":
        return th ? "ทำการบ้านก่อนนอนนะ" : "Finish your homework before bed";
    }
  },
};
