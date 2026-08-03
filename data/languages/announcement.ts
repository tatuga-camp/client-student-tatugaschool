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
  lookForPrompt: (language: Language) => {
    switch (language) {
      case "en":
        return "Waiting for the browser… look for the permission popup near the address bar and click Allow";
      case "th":
        return "กำลังรอเบราว์เซอร์… มองหาป๊อปอัพขออนุญาตใกล้แถบที่อยู่ แล้วกด อนุญาต (Allow)";
      default:
        return "Waiting for the browser… look for the permission popup near the address bar and click Allow";
    }
  },
  promptDismissedHelp: (language: Language) => {
    switch (language) {
      case "en":
        return "No popup appeared? Click the bell icon in your browser's address bar, select Allow, then try again.";
      case "th":
        return "ไม่เห็นป๊อปอัพ? กดไอคอนรูปกระดิ่งที่แถบที่อยู่ของเบราว์เซอร์ เลือก อนุญาต (Allow) แล้วลองอีกครั้ง";
      default:
        return "No popup appeared? Click the bell icon in your browser's address bar, select Allow, then try again.";
    }
  },
  promptBlockedHelp: (language: Language) => {
    switch (language) {
      case "en":
        return "Your browser blocked notifications. Click the bell or lock icon in the address bar, select Allow, then try again.";
      case "th":
        return "เบราว์เซอร์ปิดกั้นการแจ้งเตือน กดไอคอนกระดิ่งหรือแม่กุญแจที่แถบที่อยู่ เลือก อนุญาต (Allow) แล้วลองอีกครั้ง";
      default:
        return "Your browser blocked notifications. Click the bell or lock icon in the address bar, select Allow, then try again.";
    }
  },
  tryAgain: (language: Language) => {
    switch (language) {
      case "en":
        return "Try again";
      case "th":
        return "ลองอีกครั้ง";
      default:
        return "Try again";
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
  notifications: (language: Language) => {
    switch (language) {
      case "en":
        return "Notifications";
      case "th":
        return "การแจ้งเตือน";
      default:
        return "Notifications";
    }
  },
  markAllRead: (language: Language) => {
    switch (language) {
      case "en":
        return "Mark all as read";
      case "th":
        return "อ่านทั้งหมดแล้ว";
      default:
        return "Mark all as read";
    }
  },
  empty: (language: Language) => {
    switch (language) {
      case "en":
        return "No notifications yet";
      case "th":
        return "ยังไม่มีการแจ้งเตือน";
      default:
        return "No notifications yet";
    }
  },
  enablePushBanner: (language: Language) => {
    switch (language) {
      case "en":
        return "Turn on notifications so you never miss an announcement";
      case "th":
        return "เปิดการแจ้งเตือนเพื่อไม่พลาดประกาศจากคุณครู";
      default:
        return "Turn on notifications so you never miss an announcement";
    }
  },
};
