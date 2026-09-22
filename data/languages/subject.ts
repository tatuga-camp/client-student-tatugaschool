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
        return "Join";
      case "th":
        return "เข้ารายวิชา";
      default:
        return "Join";
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
  whoAreYou: (language: Language) => {
    switch (language) {
      case "en":
        return "Who are you?";
      case "th":
        return "คุณคือใคร?";
      default:
        return "Who are you?";
    }
  },
  typeYourName: (language: Language) => {
    switch (language) {
      case "en":
        return "Type your name or number above to find yourself!";
      case "th":
        return "พิมพ์ชื่อหรือเลขที่ของคุณด้านบนเพื่อค้นหา!";
      default:
        return "Type your name or number above to find yourself!";
    }
  },
  keepTyping: (language: Language) => {
    switch (language) {
      case "en":
        return "Keep typing...";
      case "th":
        return "พิมพ์ต่อไป...";
      default:
        return "Keep typing...";
    }
  },
  typeMoreThan3: (language: Language) => {
    switch (language) {
      case "en":
        return "Please type more than 2 characters to search!";
      case "th":
        return "กรุณาพิมพ์มากกว่า 2 ตัวอักษรเพื่อค้นหา!";
      default:
        return "Please type more than 2 characters to search!";
    }
  },
  noStudentsFound: (language: Language) => {
    switch (language) {
      case "en":
        return "No students found";
      case "th":
        return "ไม่พบรายชื่อนักเรียน";
      default:
        return "No students found";
    }
  },
  checkSpelling: (language: Language) => {
    switch (language) {
      case "en":
        return "Try checking your spelling!";
      case "th":
        return "ลองตรวจสอบการสะกดคำของคุณดูนะ!";
      default:
        return "Try checking your spelling!";
    }
  },
  clearSearch: (language: Language) => {
    switch (language) {
      case "en":
        return "Clear search";
      case "th":
        return "ล้างคำค้นหา";
      default:
        return "Clear search";
    }
  },
  loadingStudents: (language: Language) => {
    switch (language) {
      case "en":
        return "Loading students...";
      case "th":
        return "กำลังโหลดรายชื่อนักเรียน...";
      default:
        return "Loading students...";
    }
  },
  noStudentsYet: (language: Language) => {
    switch (language) {
      case "en":
        return "No students in this subject yet";
      case "th":
        return "ยังไม่มีนักเรียนในรายวิชานี้";
      default:
        return "No students in this subject yet";
    }
  },
  noStudentsYetDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "Ask your teacher to add you to the subject, then try again.";
      case "th":
        return "แจ้งครูผู้สอนให้เพิ่มชื่อคุณในรายวิชา แล้วลองใหม่อีกครั้ง";
      default:
        return "Ask your teacher to add you to the subject, then try again.";
    }
  },
  loadErrorTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Couldn't load the student list";
      case "th":
        return "โหลดรายชื่อนักเรียนไม่สำเร็จ";
      default:
        return "Couldn't load the student list";
    }
  },
  loadErrorDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "Check your connection and try again.";
      case "th":
        return "ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง";
      default:
        return "Check your connection and try again.";
    }
  },
  retry: (language: Language) => {
    switch (language) {
      case "en":
        return "Try again";
      case "th":
        return "ลองใหม่";
      default:
        return "Try again";
    }
  },
  back: (language: Language) => {
    switch (language) {
      case "en":
        return "Back";
      case "th":
        return "ย้อนกลับ";
      default:
        return "Back";
    }
  },
  wrongPassword: (language: Language) => {
    switch (language) {
      case "en":
        return "Incorrect password. Please try again.";
      case "th":
        return "รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง";
      default:
        return "Incorrect password. Please try again.";
    }
  },
  passwordDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "This account is protected. Enter the password your teacher gave you.";
      case "th":
        return "บัญชีนี้มีการตั้งรหัสผ่านไว้ กรุณาใส่รหัสผ่านที่ได้รับจากครูผู้สอน";
      default:
        return "This account is protected. Enter the password your teacher gave you.";
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
