import { Language } from "../../interfaces";

export const sidebarDataLanguage = {
  profile: (language: Language) => {
    switch (language) {
      case "en":
        return "Profile";
      case "th":
        return "โปรไฟล์";
      default:
        return "Profile";
    }
  },
  subject: (language: Language) => {
    switch (language) {
      case "en":
        return "Subject";
      case "th":
        return "รายวิชา";
      default:
        return "Subject";
    }
  },
  homepage: (language: Language) => {
    switch (language) {
      case "en":
        return "Homepage";
      case "th":
        return "หน้าหลัก";
      default:
        return "Homepage";
    }
  },
} as const;
