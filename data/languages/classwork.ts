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
  unsubmittedBanner: (language: Language) => {
    switch (language) {
      case "en":
        return "Your work is attached but NOT submitted yet — press the confirm button below to submit.";
      case "th":
        return "งานของคุณถูกแนบแล้ว แต่ยังไม่ได้ถูกส่ง — กดปุ่มยืนยันการส่งงานด้านล่างเพื่อส่งงาน";
      default:
        return "Your work is attached but NOT submitted yet — press the confirm button below to submit.";
    }
  },
  leaveDialog: {
    title: (language: Language) => {
      switch (language) {
        case "en":
          return "You haven't submitted your work!";
        case "th":
          return "คุณยังไม่ได้ส่งงาน!";
        default:
          return "You haven't submitted your work!";
      }
    },
    text: (language: Language) => {
      switch (language) {
        case "en":
          return "You attached work but haven't confirmed the submission, so your teacher will not see it as submitted.";
        case "th":
          return "คุณแนบงานแล้ว แต่ยังไม่ได้กดยืนยันการส่งงาน คุณครูจะยังไม่เห็นว่างานของคุณถูกส่ง";
        default:
          return "You attached work but haven't confirmed the submission, so your teacher will not see it as submitted.";
      }
    },
    confirm: (language: Language) => {
      switch (language) {
        case "en":
          return "Confirm submission";
        case "th":
          return "ยืนยันการส่งงาน";
        default:
          return "Confirm submission";
      }
    },
    leave: (language: Language) => {
      switch (language) {
        case "en":
          return "Leave without submitting";
        case "th":
          return "ออกโดยไม่ส่งงาน";
        default:
          return "Leave without submitting";
      }
    },
    stay: (language: Language) => {
      switch (language) {
        case "en":
          return "Stay on this page";
        case "th":
          return "อยู่ในหน้านี้ต่อ";
        default:
          return "Stay on this page";
      }
    },
  },
} as const;

export const tagsDataLanguage = {
  showAll: (language: Language) => {
    switch (language) {
      case "en":
        return "Show All";
      case "th":
        return "แสดงทั้งหมด";
      default:
        return "Show All";
    }
  },
} as const;
