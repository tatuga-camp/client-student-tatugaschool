import { Language } from "../../interfaces";

export const careerLanguage = {
  heading: (language: Language) =>
    language === "th" ? "อาชีพที่เหมาะกับทักษะของคุณ" : "Careers that fit your skills",
  source: (language: Language) =>
    language === "th"
      ? "คำนวณจากคะแนนทักษะในงานของคุณที่ได้รับการตรวจแล้ว"
      : "Based on skill scores from your graded classwork.",
  strongestSkills: (language: Language) =>
    language === "th" ? "ทักษะที่โดดเด่น" : "Strongest skills",
  skillsToGrow: (language: Language) =>
    language === "th" ? "ทักษะที่ควรพัฒนา" : "Skills to grow",
  topMatch: (language: Language) =>
    language === "th" ? "กลุ่มอาชีพที่เหมาะที่สุด" : "Best-fit career area",
  exampleJobs: (language: Language) =>
    language === "th" ? "ตัวอย่างอาชีพ" : "Example jobs",
  rankedCareers: (language: Language) =>
    language === "th" ? "กลุ่มอาชีพทั้งหมดที่เข้ากัน" : "All matching career areas",
  keySkillsHeading: (language: Language) =>
    language === "th" ? "ทักษะสำคัญของกลุ่มอาชีพนี้" : "Key skills in this area",
  strongerSkill: (language: Language) =>
    language === "th" ? "หนึ่งในทักษะที่โดดเด่นของคุณ" : "One of your stronger skills",
  showMore: (language: Language, n: number) =>
    language === "th" ? `แสดงอีก ${n} รายการ` : `Show ${n} more`,
  showLess: (language: Language) =>
    language === "th" ? "แสดงน้อยลง" : "Show less",
  notEnoughData: (language: Language) =>
    language === "th" ? "ยังมีข้อมูลทักษะไม่พอ" : "Not enough skill data yet.",
  notEnoughDataBody: (language: Language) =>
    language === "th"
      ? "ระบบจะแนะนำอาชีพได้เมื่อมีงานของคุณที่ได้รับการตรวจและผูกกับทักษะมากขึ้น"
      : "Career suggestions appear once more of your graded classwork includes skills.",
  loadError: (language: Language) =>
    language === "th"
      ? "โหลดคำแนะนำอาชีพไม่สำเร็จ"
      : "Couldn't load career suggestions.",
  tryAgain: (language: Language) =>
    language === "th" ? "ลองอีกครั้ง" : "Try again",
  noCareers: (language: Language) =>
    language === "th" ? "ยังไม่มีอาชีพที่แนะนำ" : "No career suggestions yet.",
};
