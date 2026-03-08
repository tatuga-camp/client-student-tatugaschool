import { Language } from "../../interfaces";

export const welcomeDataLanguage = {
  placeholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Enter you code";
      case "th":
        return "ใส่ PIN 6 หลักเข้ารายวิชา";
      default:
        return "Enter you code";
    }
  },
  button: (language: Language) => {
    switch (language) {
      case "en":
        return "ENTER";
      case "th":
        return "ยืนยัน";
      default:
        return "ENTER";
    }
  },
} as const;
