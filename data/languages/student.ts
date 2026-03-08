import { Language } from "../../interfaces";

export const studentDataLanguage = {
  studentNotFound: (language: Language) => {
    switch (language) {
      case "en":
        return "Student not found";
      case "th":
        return "ไม่พบนักเรียน";
      default:
        return "Student not found";
    }
  },
  passwordNotMatch: (language: Language) => {
    switch (language) {
      case "en":
        return "Password and Confirm Password not match";
      case "th":
        return "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน";
      default:
        return "Password and Confirm Password not match";
    }
  },
  studentUpdated: (language: Language) => {
    switch (language) {
      case "en":
        return "Student Updated";
      case "th":
        return "อัปเดตข้อมูลนักเรียนเรียบร้อย";
      default:
        return "Student Updated";
    }
  },
  studentInformation: (language: Language) => {
    switch (language) {
      case "en":
        return "Student Information";
      case "th":
        return "ข้อมูลนักเรียน";
      default:
        return "Student Information";
    }
  },
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "Title";
      case "th":
        return "คำนำหน้า";
      default:
        return "Title";
    }
  },
  firstName: (language: Language) => {
    switch (language) {
      case "en":
        return "First Name";
      case "th":
        return "ชื่อ";
      default:
        return "First Name";
    }
  },
  lastName: (language: Language) => {
    switch (language) {
      case "en":
        return "Last Name";
      case "th":
        return "นามสกุล";
      default:
        return "Last Name";
    }
  },
  uploadImage: (language: Language) => {
    switch (language) {
      case "en":
        return "Upload Student Image (Optional)";
      case "th":
        return "อัปโหลดรูปภาพนักเรียน (ไม่บังคับ)";
      default:
        return "Upload Student Image (Optional)";
    }
  },
  clickToUpload: (language: Language) => {
    switch (language) {
      case "en":
        return "Click to upload";
      case "th":
        return "คลิกเพื่ออัปโหลด";
      default:
        return "Click to upload";
    }
  },
  orDragAndDrop: (language: Language) => {
    switch (language) {
      case "en":
        return "or drag and drop";
      case "th":
        return "หรือลากและวาง";
      default:
        return "or drag and drop";
    }
  },
  imageFormat: (language: Language) => {
    switch (language) {
      case "en":
        return "PNG, JPG or GIF (MAX. 800x400px)";
      case "th":
        return "PNG, JPG หรือ GIF (ขนาดไม่เกิน 800x400px)";
      default:
        return "PNG, JPG or GIF (MAX. 800x400px)";
    }
  },
  updatePassword: (language: Language) => {
    switch (language) {
      case "en":
        return "Update Password";
      case "th":
        return "อัปเดตรหัสผ่าน";
      default:
        return "Update Password";
    }
  },
  leaveBlank: (language: Language) => {
    switch (language) {
      case "en":
        return "Leave it blank if you don't want to update your password";
      case "th":
        return "ปล่อยว่างไว้หากคุณไม่ต้องการอัปเดตรหัสผ่าน";
      default:
        return "Leave it blank if you don't want to update your password";
    }
  },
  enterNewPassword: (language: Language) => {
    switch (language) {
      case "en":
        return "Enter New Password";
      case "th":
        return "ใส่รหัสผ่านใหม่";
      default:
        return "Enter New Password";
    }
  },
  password: (language: Language) => {
    switch (language) {
      case "en":
        return "Password";
      case "th":
        return "รหัสผ่าน";
      default:
        return "Password";
    }
  },
  enterConfirmPassword: (language: Language) => {
    switch (language) {
      case "en":
        return "Enter New Confirm Password";
      case "th":
        return "ยืนยันรหัสผ่านใหม่";
      default:
        return "Enter New Confirm Password";
    }
  },
  confirmPassword: (language: Language) => {
    switch (language) {
      case "en":
        return "Confirm Password";
      case "th":
        return "ยืนยันรหัสผ่าน";
      default:
        return "Confirm Password";
    }
  },
  update: (language: Language) => {
    switch (language) {
      case "en":
        return "Update";
      case "th":
        return "อัปเดต";
      default:
        return "Update";
    }
  },
  success: (language: Language) => {
    switch (language) {
      case "en":
        return "Success";
      case "th":
        return "สำเร็จ";
      default:
        return "Success";
    }
  },
  somethingWentWrong: (language: Language) => {
    switch (language) {
      case "en":
        return "Something Went Wrong";
      case "th":
        return "เกิดข้อผิดพลาด";
      default:
        return "Something Went Wrong";
    }
  },
};
