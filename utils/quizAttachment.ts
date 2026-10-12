const MB = 1024 * 1024;

/** 0 B, 850 KB, 12.4 MB, 200 MB. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${Math.round(bytes / 1024)} KB`;
  const mb = bytes / MB;
  return `${Number.isInteger(Math.round(mb * 10) / 10) ? Math.round(mb) : mb.toFixed(1)} MB`;
}
