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
