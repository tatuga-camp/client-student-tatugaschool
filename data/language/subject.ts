import { Language } from "../../interfaces";

export const subjectDataLanguage = {
  educationYear: (language: Language) => {
    switch (language) {
      case "en":
        return "Education Year";
      case "th":
        return "ปีการศึกษา";
      default:
        return "Education Year";
    }
  },
  code: (language: Language) => {
    switch (language) {
      case "en":
        return "Subject Code";
      case "th":
        return "รหัสเข้ารายวิชา";
      default:
        return "Subject Code";
    }
  },
  choose: (language: Language) => {
    switch (language) {
      case "en":
        return "Choose Yourself";
      case "th":
        return "เลือกตัวเอง";
      default:
        return "Choose Yourself";
    }
  },
  joinDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "to join subject";
      case "th":
        return "เพื่อเข้าสู่รายวิชา";
      default:
        return "to join subject";
    }
  },
  buttonJoin: (language: Language) => {
    switch (language) {
      case "en":
        return "join";
      case "th":
        return "เข้ารายวิชา";
      default:
        return "join";
    }
  },
  teacher: (language: Language) => {
    switch (language) {
      case "en":
        return "Teachers";
      case "th":
        return "ครูในรายวิชา";
      default:
        return "Teachers";
    }
  },
  searchPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Search for your name";
      case "th":
        return "ค้นหาชื่อตัวเอง";
      default:
        return "Search for your name";
    }
  },
  password: (language: Language) => {
    switch (language) {
      case "en":
        return "Enter your password";
      case "th":
        return "ใส่รหัสผ่านของคุณ";
      default:
        return "Enter your password";
    }
  },
  passwordButton: (language: Language) => {
    switch (language) {
      case "en":
        return "Enter";
      case "th":
        return "ยืนยัน";
      default:
        return "Enter";
    }
  },
  forgetPassword: (language: Language) => {
    switch (language) {
      case "en":
        return "If you forget your password, please contact your teacher.";
      case "th":
        return "หากจำรหัสผ่านไม่ได้ ติดต่อครูผู้สอนให้รีเซ็ตรหัสผ่าน";
      default:
        return "If you forget your password, please contact your teacher.";
    }
  },
} as const;

export const menuSubjectDataLanguage = {
  classwork: (language: Language) => {
    switch (language) {
      case "en":
        return "Classwork";
      case "th":
        return "งานที่ถูกมอบหมาย";
      default:
        return "Classwork";
    }
  },
  attendance: (language: Language) => {
    switch (language) {
      case "en":
        return "Attendance";
      case "th":
        return "ข้อมูลเช็คชื่อ";
      default:
        return "Attendance";
    }
  },
  grade: (language: Language) => {
    switch (language) {
      case "en":
        return "Grade";
      case "th":
        return "ข้อมูลคะแนนและเกรด";
      default:
        return "Grade";
    }
  },
} as const;
