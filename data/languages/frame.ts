import { Language } from "../../interfaces";

const t = (l: Language, en: string, th: string) => (l === "th" ? th : en);

export const frameLanguage = {
  qrTitle: (l: Language) =>
    t(l, "Scan to open on your phone", "สแกนเพื่อเปิดในมือถือ"),
  qrBody: (l: Language) =>
    t(
      l,
      "Tatuga works best on a phone. Scan with your camera, then add it to your home screen like an app.",
      "Tatuga ใช้งานได้ดีที่สุดบนมือถือ สแกนด้วยกล้อง แล้วเพิ่มไปที่หน้าจอหลักเหมือนแอป",
    ),
  qrHide: (l: Language) => t(l, "Hide", "ซ่อน"),
  qrShow: (l: Language) =>
    t(l, "Show QR code for your phone", "แสดง QR code สำหรับมือถือ"),
  hintDrag: (l: Language) =>
    t(l, "Drag the screen sideways to swipe", "ลากหน้าจอไปด้านข้างเพื่อปัดหน้า"),
  hintKeys: (l: Language) => t(l, "switch tabs", "เปลี่ยนแท็บ"),
};
