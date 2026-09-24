export const convertToDateTimeLocalString = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

type DurationLanguage = "en" | "th";

const DURATION_UNITS: Record<
  DurationLanguage,
  Record<"year" | "month" | "week" | "day" | "hour" | "minute" | "second", [string, string]>
> = {
  en: {
    year: ["year", "years"],
    month: ["month", "months"],
    week: ["week", "weeks"],
    day: ["day", "days"],
    hour: ["hour", "hours"],
    minute: ["minute", "minutes"],
    second: ["second", "seconds"],
  },
  th: {
    year: ["ปี", "ปี"],
    month: ["เดือน", "เดือน"],
    week: ["สัปดาห์", "สัปดาห์"],
    day: ["วัน", "วัน"],
    hour: ["ชั่วโมง", "ชั่วโมง"],
    minute: ["นาที", "นาที"],
    second: ["วินาที", "วินาที"],
  },
};

const formatDuration = (diffMs: number, language: DurationLanguage): string => {
  const units = DURATION_UNITS[language] ?? DURATION_UNITS.en;
  const label = (n: number, unit: keyof typeof units) =>
    `${n} ${units[unit][n === 1 ? 0 : 1]}`;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return label(years, "year");
  if (months > 0) return label(months, "month");
  if (weeks > 0) return label(weeks, "week");
  if (days > 0) return label(days, "day");
  if (hours > 0) return label(hours, "hour");
  if (minutes > 0) return label(minutes, "minute");
  return label(seconds, "second");
};

/** Time remaining until targetTime, e.g. "2 days" / "2 วัน". */
export const timeLeft = ({
  targetTime,
  language = "en",
}: {
  targetTime: string; // ISO format or date string
  language?: DurationLanguage;
}): string => {
  const diff = new Date(targetTime).getTime() - new Date().getTime();
  if (diff <= 0) {
    return language === "th" ? "หมดเวลาแล้ว" : "Time is up!";
  }
  return formatDuration(diff, language);
};

/** Time elapsed since pastTime, e.g. "3 hours" / "3 ชั่วโมง". */
export const timeAgo = ({
  pastTime,
  language = "en",
}: {
  pastTime: string;
  language?: DurationLanguage;
}): string => {
  const diff = new Date().getTime() - new Date(pastTime).getTime();
  if (diff <= 0) {
    return language === "th" ? "เมื่อสักครู่" : "Just now";
  }
  return formatDuration(diff, language);
};
