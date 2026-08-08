export function overallUploadPercent(input: {
  uploadedBytes: number;
  currentLoaded: number;
  totalBytes: number;
}): number {
  if (input.totalBytes <= 0) return 0;
  const percent =
    ((input.uploadedBytes + input.currentLoaded) / input.totalBytes) * 100;
  return Math.min(100, Math.max(0, percent));
}
