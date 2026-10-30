/** The page the "scan to open on your phone" QR code points at. */
export function phoneHandoffUrl(input: {
  origin: string;
  pathname: string;
  asPath: string;
  subjectCode?: string | null;
}): string {
  const { origin, pathname, asPath, subjectCode } = input;
  if (pathname === "/welcome" || pathname === "/") return origin + asPath;
  if (subjectCode) {
    return `${origin}/?subject_code=${encodeURIComponent(subjectCode)}`;
  }
  return `${origin}/welcome`;
}
