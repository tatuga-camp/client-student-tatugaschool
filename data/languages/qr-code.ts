import { Language } from "../../interfaces";

export const qrcodeMenuBarLanguage = {
  status: (language: Language) => {
    switch (language) {
      case "en":
        return "Update Status";
      case "th":
        return "สถานะเช็คชื่อ";
      default:
        return "Update Status";
    }
  },
  note: (language: Language) => {
    switch (language) {
      case "en":
        return "Add Note";
      case "th":
        return "เพิ่มโน็ต";
      default:
        return "Add Note";
    }
  },
};

export const qrcodeAttendanceLanguage = {
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "Attendance By QR Code";
      case "th":
        return "ระบบเช็คชื่อด้วย QR CODE";
      default:
        return "Attendance By QR Code";
    }
  },
  subject: (language: Language) => {
    switch (language) {
      case "en":
        return "subject";
      case "th":
        return "ชื่อวิชา";
      default:
        return "subject";
    }
  },
  allow_scan_at: (language: Language) => {
    switch (language) {
      case "en":
        return "Allow to scan At";
      case "th":
        return "อนุญาตให้เช้คชื่อเมื่อเวลาถึง";
      default:
        return "Allow to scan At";
    }
  },
  click_continue: (language: Language) => {
    switch (language) {
      case "en":
        return "click to continue";
      case "th":
        return "คลิกเพื่อไปต่อ";
      default:
        return "click to continue";
    }
  },
  warning_allow_scan: (language: Language) => {
    switch (language) {
      case "en":
        return "You will allow to update your attendance when it is the time!";
      case "th":
        return "ระบบจะอนุญาตให้คุณอัพเดตสถานะเช็คชื่อ เมื่อถึงเวลาที่กำหนด";
      default:
        return "You will allow to update your attendance when it is the time!";
    }
  },
  create_button: (language: Language) => {
    switch (language) {
      case "en":
        return "Create";
      case "th":
        return "อัพเดตสถานะ";
      default:
        return "Create";
    }
  },
  expired_at: (language: Language) => {
    switch (language) {
      case "en":
        return "Expire In";
      case "th":
        return "หมดอายุในเวลา";
      default:
        return "Expire In";
    }
  },
  time_up: (language: Language) => {
    switch (language) {
      case "en":
        return "Time's up!";
      case "th":
        return "หมดเวลาการเช็คชื่อ";
      default:
        return "Time's up!";
    }
  },
  privacy: (language: Language) => {
    switch (language) {
      case "en":
        return "To protect privacy, results are not displayed publicly—only the teacher can view them.";
      case "th":
        return "เพื่อความเป็นส่วนตัว ผลลัพธ์ของการเช็คชื่อของนักเรียนจะไม่แสดงต่อสาธารณะ มีเฉพาะครูเท่านั้นที่สามารถดูได้";
      default:
        return "To protect privacy, results are not displayed publicly—only the teacher can view them.";
    }
  },
} as const;
