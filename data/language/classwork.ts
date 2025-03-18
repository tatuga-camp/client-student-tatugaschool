import { Language } from "../../interfaces";

export const classworkDataLanguage = {
  attrachs: (language: Language) => {
    switch (language) {
      case "en":
        return "Attrach work";
      case "th":
        return "แนบงาน";
      default:
        return "Attrach work";
    }
  },
  attrachType: {
    link: (language: Language) => {
      switch (language) {
        case "en":
          return "Link";
        case "th":
          return "แนบลิงค์";
        default:
          return "Link";
      }
    },
    create: (language: Language) => {
      switch (language) {
        case "en":
          return "Note";
        case "th":
          return "แนบข้อความ";
        default:
          return "Note";
      }
    },
    upload: (language: Language) => {
      switch (language) {
        case "en":
          return "Files";
        case "th":
          return "แนบไฟล์";
        default:
          return "Files";
      }
    },
  },
  menuSummitLists: {
    done: (language: Language) => {
      switch (language) {
        case "en":
          return "Mark as done";
        case "th":
          return "ยืนยันการส่งงาน";
        default:
          return "Mark as done";
      }
    },
    notdone: (language: Language) => {
      switch (language) {
        case "en":
          return "Mark as not done";
        case "th":
          return "ยกเลิกการส่งงาน";
        default:
          return "Mark as not done";
      }
    },
    review: (language: Language) => {
      switch (language) {
        case "en":
          return "Teacher has reviewd";
        case "th":
          return "คุณครูได้ตรวจงานแล้ว";
        default:
          return "Teacher has reviewd";
      }
    },
  },

  notFound: (language: Language) => {
    switch (language) {
      case "en":
        return "Assignment Not Found";
      case "th":
        return "ไม่พบงานที่ถูกมอบหมาย กรุณาลองรีโหลดเว็บไซต์";
      default:
        return "Assignment Not Found";
    }
  },
  yourWork: (language: Language) => {
    switch (language) {
      case "en":
        return "ํYour Work";
      case "th":
        return "งานที่คุณแนบมา";
      default:
        return "ํYour Work";
    }
  },
  assignment: (language: Language) => {
    switch (language) {
      case "en":
        return "Assignment";
      case "th":
        return "งานมอบหมาย";
      default:
        return "Assignment";
    }
  },
  status: (language: Language) => {
    switch (language) {
      case "en":
        return "Status";
      case "th":
        return "สถานะงาน";
      default:
        return "Status";
    }
  },
  score: (language: Language) => {
    switch (language) {
      case "en":
        return "Score";
      case "th":
        return "คะแนนของคุณ";
      default:
        return "Score";
    }
  },
  summitAt: (language: Language) => {
    switch (language) {
      case "en":
        return "Summit Work At";
      case "th":
        return "คุณส่งงานเมื่อ";
      default:
        return "Summit Work At";
    }
  },
  reviewAt: (language: Language) => {
    switch (language) {
      case "en":
        return "Review Work At";
      case "th":
        return "คุณครูตรวจงานเมื่อ";
      default:
        return "Review Work At";
    }
  },
  deadline: (language: Language) => {
    switch (language) {
      case "en":
        return "Deadline";
      case "th":
        return "กดหนดส่ง";
      default:
        return "Deadline";
    }
  },
  summitWorkTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Summit Work";
      case "th":
        return "การส่งงาน";
      default:
        return "Summit Work";
    }
  },
  summitWorkDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "You can summit work here";
      case "th":
        return "คุณสามารถอัปเดทสถานะงานได้ที่นี้";
      default:
        return "You can summit work here";
    }
  },
} as const;
