import { Language } from "../../interfaces";

export const classworkCardDataLanguage = {
  Published: (language: Language) => {
    switch (language) {
      case "en":
        return "Published";
      case "th":
        return "เผยแพร่";
      default:
        return "Published";
    }
  },
  Draft: (language: Language) => {
    switch (language) {
      case "en":
        return "Draft";
      case "th":
        return "แบบร่าง";
      default:
        return "Draft";
    }
  },
  score: (language: Language) => {
    switch (language) {
      case "en":
        return "Max Score";
      case "th":
        return "คะแนนเต็ม";
      default:
        return "Max Score";
    }
  },
  pubishAt: (language: Language) => {
    switch (language) {
      case "en":
        return "Posted at";
      case "th":
        return "มอบหมายงานเมื่อ";
      default:
        return "Posted at";
    }
  },
  view: (language: Language) => {
    switch (language) {
      case "en":
        return "View detail";
      case "th":
        return "ดูรายละเอียด";
      default:
        return "View detail";
    }
  },
  yourscore: (language: Language) => {
    switch (language) {
      case "en":
        return "Your Score";
      case "th":
        return "คะแนนที่ได้";
      default:
        return "Your Score";
    }
  },
  weight: (language: Language) => {
    switch (language) {
      case "en":
        return "Weight";
      case "th":
        return "ค่าน้ำหนักชิ้นงาน";
      default:
        return "Weight";
    }
  },
  Deadline: (language: Language) => {
    switch (language) {
      case "en":
        return "Deadline";
      case "th":
        return "กำหนดส่ง";
      default:
        return "Deadline";
    }
  },
  NoWork: (language: Language) => {
    switch (language) {
      case "en":
        return "No Work";
      case "th":
        return "ไม่ได้ส่งงาน";
      default:
        return "No Work";
    }
  },
  WaitReview: (language: Language) => {
    switch (language) {
      case "en":
        return "Wait Review";
      case "th":
        return "รอตรวจ";
      default:
        return "Wait Review";
    }
  },
  Reviewed: (language: Language) => {
    switch (language) {
      case "en":
        return "Reviewed";
      case "th":
        return "ตรวจแล้ว";
      default:
        return "Reviewed";
    }
  },
  Improve: (language: Language) => {
    switch (language) {
      case "en":
        return "Need Improvement";
      case "th":
        return "ต้องการปรับปรุง";
      default:
        return "Need Improvement";
    }
  },
} as const;
