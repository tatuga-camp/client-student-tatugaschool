import { Language } from "../../interfaces";

export const askNotificationDataLanguage = {
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "Don't miss announcements from your teacher";
      case "th":
        return "ไม่พลาดประกาศจากคุณครู";
      default:
        return "Don't miss announcements from your teacher";
    }
  },
  body: (language: Language) => {
    switch (language) {
      case "en":
        return "Please allow notification";
      case "th":
        return "กรุณาอนุญาตการแจ้งเตือน";
      default:
        return "Please allow notification";
    }
  },
  allow: (language: Language) => {
    switch (language) {
      case "en":
        return "Yes, Allow!";
      case "th":
        return "อนุญาต";
      default:
        return "Yes, Allow!";
    }
  },
  later: (language: Language) => {
    switch (language) {
      case "en":
        return "Maybe Later";
      case "th":
        return "ไว้ทีหลัง";
      default:
        return "Maybe Later";
    }
  },
  iosInstallTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Add to Home Screen to get notifications";
      case "th":
        return "เพิ่มลงหน้าจอโฮมเพื่อรับการแจ้งเตือน";
      default:
        return "Add to Home Screen to get notifications";
    }
  },
  iosInstallBody: (language: Language) => {
    switch (language) {
      case "en":
        return "On iPhone, tap Share → Add to Home Screen, then open the app from your home screen to enable notifications.";
      case "th":
        return "บน iPhone กดปุ่มแชร์ → เพิ่มลงหน้าจอโฮม แล้วเปิดแอปจากหน้าจอโฮมเพื่อเปิดการแจ้งเตือน";
      default:
        return "On iPhone, tap Share → Add to Home Screen, then open the app from your home screen to enable notifications.";
    }
  },
  gotIt: (language: Language) => {
    switch (language) {
      case "en":
        return "Got it";
      case "th":
        return "เข้าใจแล้ว";
      default:
        return "Got it";
    }
  },
};

export const announcementDataLanguage = {
  sectionTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Announcements";
      case "th":
        return "ประกาศ";
      default:
        return "Announcements";
    }
  },
  comments: (language: Language) => {
    switch (language) {
      case "en":
        return "Comments";
      case "th":
        return "ความคิดเห็น";
      default:
        return "Comments";
    }
  },
  writeComment: (language: Language) => {
    switch (language) {
      case "en":
        return "Write a comment...";
      case "th":
        return "เขียนความคิดเห็น...";
      default:
        return "Write a comment...";
    }
  },
  send: (language: Language) => {
    switch (language) {
      case "en":
        return "Send";
      case "th":
        return "ส่ง";
      default:
        return "Send";
    }
  },
  delete: (language: Language) => {
    switch (language) {
      case "en":
        return "Delete";
      case "th":
        return "ลบ";
      default:
        return "Delete";
    }
  },
  attachments: (language: Language) => {
    switch (language) {
      case "en":
        return "Attachments";
      case "th":
        return "ไฟล์แนบ";
      default:
        return "Attachments";
    }
  },
};
