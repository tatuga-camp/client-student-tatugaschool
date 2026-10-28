import { Language } from "../../interfaces";

const t = (en: string, th: string) => (language: Language) =>
  language === "th" ? th : en;

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
        return "กำหนดส่ง";
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
  uploading: (language: Language) => {
    switch (language) {
      case "en":
        return "Uploading";
      case "th":
        return "กำลังอัปโหลด";
      default:
        return "Uploading";
    }
  },
  uploadNetworkError: (language: Language) => {
    switch (language) {
      case "en":
        return "Upload failed because the internet connection was interrupted. Please check your signal and try again.";
      case "th":
        return "อัปโหลดไฟล์ไม่สำเร็จ เนื่องจากการเชื่อมต่ออินเทอร์เน็ตขัดข้อง กรุณาตรวจสอบสัญญาณแล้วลองใหม่อีกครั้ง";
      default:
        return "Upload failed because the internet connection was interrupted. Please check your signal and try again.";
    }
  },
  uploadFileUnreadable: (language: Language) => {
    switch (language) {
      case "en":
        return "Could not read the selected file. Please select the file again.";
      case "th":
        return "ไม่สามารถอ่านไฟล์ที่เลือกได้ กรุณาเลือกไฟล์ใหม่อีกครั้ง";
      default:
        return "Could not read the selected file. Please select the file again.";
    }
  },
  notGraded: (language: Language) => {
    switch (language) {
      case "en":
        return "Not graded yet";
      case "th":
        return "ยังไม่ได้ตรวจ";
      default:
        return "Not graded yet";
    }
  },
  ago: (language: Language) => {
    switch (language) {
      case "en":
        return "ago";
      case "th":
        return "ที่ผ่านมา";
      default:
        return "ago";
    }
  },
  left: (language: Language) => {
    switch (language) {
      case "en":
        return "left";
      case "th":
        return "คงเหลือ";
      default:
        return "left";
    }
  },
  assignmentFiles: (language: Language) => {
    switch (language) {
      case "en":
        return "Assignment files";
      case "th":
        return "ไฟล์ประกอบงาน";
      default:
        return "Assignment files";
    }
  },
} as const;

export const commentDataLanguage = {
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "Comments";
      case "th":
        return "ความคิดเห็น";
      default:
        return "Comments";
    }
  },
  send: (language: Language) => {
    switch (language) {
      case "en":
        return "Comment";
      case "th":
        return "ส่ง";
      default:
        return "Comment";
    }
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

/** The assignment detail page (title card, instructions, teacher files). */
export const assignmentPageLanguage = {
  pointsCount: (l: Language, n: number) =>
    l === "th" ? `${n} คะแนน` : `${n} ${n === 1 ? "point" : "points"}`,
  instructions: t("Instructions", "คำชี้แจง"),
  fromTeacher: t("From your teacher", "จากครูของคุณ"),
  timeLeft: (l: Language, d: string) =>
    l === "th" ? `เหลือ ${d}` : `${d} left`,
  timeAgo: (l: Language, d: string) => (l === "th" ? `เลยมา ${d}` : `${d} ago`),
  fastForwardOff: t(
    "Fast-forwarding is turned off for this video.",
    "วิดีโอนี้ปิดการกรอไปข้างหน้า",
  ),
  seek: t("Seek", "เลื่อนเวลา"),
  play: t("Play", "เล่น"),
  pause: t("Pause", "หยุด"),
  mute: t("Mute", "ปิดเสียง"),
  unmute: t("Unmute", "เปิดเสียง"),
  fullscreen: t("Full screen", "เต็มจอ"),
  exitFullscreen: t("Exit full screen", "ออกจากเต็มจอ"),
  // Your work sheet
  yourWork: t("Your work", "งานของคุณ"),
  nothingAdded: t("Nothing added yet", "ยังไม่ได้เพิ่มงาน"),
  itemsCount: (l: Language, n: number) =>
    l === "th" ? `${n} ชิ้น` : `${n} ${n === 1 ? "item" : "items"}`,
  addWork: t("Add work", "เพิ่มงาน"),
  turnedIn: t("Turned in", "ส่งแล้ว"),
  reviewedByTeacher: t("Your teacher has reviewed this", "ครูตรวจงานนี้แล้ว"),
  unsubmittedWarning: t(
    "You added work but haven't marked it as done yet, so your teacher can't see it as turned in.",
    "คุณเพิ่มงานแล้วแต่ยังไม่ได้ทำเครื่องหมายว่าเสร็จ ครูจึงยังไม่เห็นว่าส่งแล้ว",
  ),
  camera: t("Camera", "ถ่ายรูป"),
  photosAndFiles: t("Photos & files", "รูปภาพและไฟล์"),
  note: t("Note", "บันทึก"),
  uploadingProgress: (l: Language, i: number, n: number, percent: number) =>
    l === "th"
      ? `กำลังอัปโหลด ${i} / ${n} · ${percent}%`
      : `Uploading ${i} / ${n} · ${percent}%`,
  moreActions: t("More actions", "ตัวเลือกเพิ่มเติม"),
  open: t("Open", "เปิด"),
  rename: t("Rename", "เปลี่ยนชื่อ"),
  delete: t("Delete", "ลบ"),
  fileName: t("File name", "ชื่อไฟล์"),
  deleteConfirmTitle: t("Delete this item?", "ลบรายการนี้?"),
  cancel: t("Cancel", "ยกเลิก"),
  addLink: t("Add link", "เพิ่มลิงก์"),
  linkPlaceholder: t("Paste a link", "วางลิงก์"),
  add: t("Add", "เพิ่ม"),
  save: t("Save", "บันทึก"),
  noteTitlePlaceholder: t("Add your title", "ใส่ชื่อบันทึก"),
  fileUploaded: t("File uploaded", "อัปโหลดไฟล์แล้ว"),
  linkAdded: t("Link added", "เพิ่มลิงก์แล้ว"),
  noteSaved: t("Note saved", "บันทึกแล้ว"),
  markedDone: t("Marked as done", "ทำเครื่องหมายว่าเสร็จแล้ว"),
  markedNotDone: t("Marked as not done", "ยกเลิกการส่งงานแล้ว"),
  somethingWentWrong: t("Something went wrong", "เกิดข้อผิดพลาด"),
  // Turned-in celebration
  turnedInTitle: t("Turned in!", "ส่งงานแล้ว!"),
  turnedInBody: (l: Language, name: string) =>
    l === "th"
      ? `เยี่ยมมาก${name ? ` ${name}` : ""} ครูจะตรวจงานของคุณเร็วๆ นี้`
      : `Nice work${name ? `, ${name}` : ""}. Your teacher will check it soon.`,
  tileOnTime: t("ON TIME", "ตรงเวลา"),
  tileYourWork: t("YOUR WORK", "งานของคุณ"),
  tileSentAt: t("SENT AT", "ส่งเมื่อ"),
  yes: t("Yes", "ใช่"),
  no: t("No", "ไม่"),
  nextAssignment: (l: Language, title: string) =>
    l === "th" ? `ถัดไป: ${title}` : `Next: ${title}`,
  backToClasswork: t("Back to classwork", "กลับไปงานทั้งหมด"),
  // Reviewed card
  greatJob: t("Great job!", "เก่งมาก!"),
  keepGoing: t(
    "Keep going! Ask your teacher about it",
    "สู้ต่อไป! ลองถามครูเพิ่มเติมนะ",
  ),
  reviewedTitle: t("Reviewed", "ตรวจแล้ว"),
  reviewedOn: (l: Language, date: string) =>
    l === "th" ? `ตรวจเมื่อ ${date}` : `Reviewed ${date}`,
  turnedInOn: (l: Language, date: string) =>
    l === "th" ? `ส่งเมื่อ ${date}` : `Turned in ${date}`,
  // Rubric
  rubric: t("Rubric", "เกณฑ์การให้คะแนน"),
  loadingRubric: t("Loading rubric...", "กำลังโหลดเกณฑ์การให้คะแนน..."),
  rubricNotGraded: t("Not graded", "ยังไม่ได้ตรวจ"),
  teacherNote: t("Teacher's note:", "หมายเหตุจากครู:"),
  // Comments chat
  commentsCount: (l: Language, n: number) =>
    l === "th" ? `ความคิดเห็น · ${n}` : `Comments · ${n}`,
  addComment: t("Add a comment…", "เขียนความคิดเห็น…"),
  sendComment: t("Send", "ส่ง"),
  teacherRole: t("Teacher", "ครู"),
  leaveGuardTitle: t(
    "You added work but didn't mark it as done",
    "คุณเพิ่มงานแล้วแต่ยังไม่ได้ทำเครื่องหมายว่าเสร็จ",
  ),
  leaveGuardBody: t(
    "Your teacher can't see it as turned in yet.",
    "ครูจะยังไม่เห็นว่าคุณส่งงานแล้ว",
  ),
  leaveAnyway: t("Leave anyway", "ออกเลย"),
  stay: t("Stay", "อยู่ต่อ"),
  waitingForUpload: t("Waiting for your upload…", "กำลังรอการอัปโหลดของคุณ…"),
  markingDone: t("Marking as done…", "กำลังทำเครื่องหมายว่าเสร็จ…"),
  uploadWaitTimeout: t(
    "Your upload is taking too long. Wait for it to finish, then try again.",
    "การอัปโหลดใช้เวลานานเกินไป รอให้เสร็จแล้วลองอีกครั้ง",
  ),
  updateFailedTitle: t("Couldn't update your work", "อัปเดตงานของคุณไม่สำเร็จ"),
  updateFailedText: t("Please try again.", "กรุณาลองอีกครั้ง"),
  contentNotShown: t("(content not shown)", "(ไม่แสดงเนื้อหา)"),
  nothingAddedShort: t("Nothing added", "ไม่มีงาน"),
  ok: t("OK", "ตกลง"),
  errorCode: (l: Language, code: string) =>
    l === "th" ? `รหัสข้อผิดพลาด: ${code}` : `Error code: ${code}`,
  deleteCommentTitle: t("Delete this comment?", "ลบความคิดเห็นนี้?"),
  link: t("Link", "ลิงก์"),
  fileKindPdf: t("PDF", "PDF"),
  fileKindImage: t("Image", "รูปภาพ"),
  fileKindVideo: t("Video", "วิดีโอ"),
  fileKindFile: t("File", "ไฟล์"),
  closeViewer: t("Close", "ปิด"),
  zoomHint: t("Pinch or double-tap to zoom", "บีบหรือแตะสองครั้งเพื่อซูม"),
  markedDoneAt: t("Marked as done at", "ทำเครื่องหมายว่าเสร็จเมื่อ"),
  workUpdatedTitle: t("Success", "สำเร็จ"),
  workUpdatedDetail: t("Work updated successfully", "อัปเดตงานเรียบร้อยแล้ว"),
  reviewedVideoNotice: t(
    "You can watch the video, but you cannot submit anymore as it has been reviewed.",
    "คุณสามารถดูวิดีโอได้ แต่ไม่สามารถส่งงานได้อีกต่อไปเนื่องจากได้รับการตรวจแล้ว",
  ),
} as const;
