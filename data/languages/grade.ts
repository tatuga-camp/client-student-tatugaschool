import { Language } from "../../interfaces";

export const gradeDataLanguage = {
  hiddenNote: (language: Language) => {
    switch (language) {
      case "en":
        return "Some scores are hidden by your teacher and are not included in the total.";
      case "th":
        return "คะแนนบางรายการถูกซ่อนโดยครูผู้สอน และไม่ถูกนำมารวมในคะแนนรวม";
      default:
        return "Some scores are hidden by your teacher and are not included in the total.";
    }
  },
} as const;
