import { Language } from "../../interfaces";
import { DayPeriod } from "../../utils/timeOfDay";

export const homeLanguage = {
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
