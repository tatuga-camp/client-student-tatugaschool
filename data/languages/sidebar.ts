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
        return "My Subjects";
      case "th":
        return "รายวิชาทั้งหมด";
      default:
        return "My Subjects";
    }
  },
  homepage: (language: Language) => {
    switch (language) {
      case "en":
        return "My Classworks";
      case "th":
        return "งานของฉัน";
      default:
        return "My Classworks";
    }
  },
  nextAssignment: (language: Language) => {
    switch (language) {
      case "en":
        return "Next Assignment";
      case "th":
        return "งานถัดไป";
      default:
        return "Next Assignment";
    }
  },
} as const;
