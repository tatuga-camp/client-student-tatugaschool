# Upload Progress Percentage in AssignmentUploadFile — Design

**Date:** 2026-08-08
**App:** `clients/client-student-tatugaschool`
**Component:** `components/subject/AssignmentUploadFile.tsx`

## Problem

Students uploading assignment files see only an indeterminate PrimeReact
`ProgressBar` — no percentage, no sense of how long a large upload will
take. The teacher app already has an XHR-based upload service with a
progress callback (`UploadSignURLWithProgressService` in
`client-main-tatugaschool/services/google-storage.ts`); the student app's
`UploadSignURLService` uses `fetch` with no progress (and does not check
`response.ok`, so a failed PUT reports success).

## Solution overview

Port the teacher app's progress service into the student app and use it in
`AssignmentUploadFile` to drive a single determinate progress bar showing
**overall batch progress weighted by file size**, labeled
"Uploading 2/3 — 45%" (bilingual). Scope is this component only: the
fetch-based `UploadSignURLService` keeps its other two consumers
(`components/common/TextEditor.tsx`, `pages/student/[studentId]/index.tsx`)
unchanged.

## Components

### 1. `UploadSignURLWithProgressService` in `services/google-storage.ts`

Copied verbatim from the teacher app (same name and signature for
cross-repo parity), added alongside the existing service:

- `input: RequestUploadSignURLService & { onProgress?: (progress: number, event: ProgressEvent) => void }`
- XHR `PUT` to `input.signURL` with `Content-Type` header; `xhr.upload.onprogress`
  reports `(loaded / total) * 100` when `lengthComputable`.
- Resolves `{ message: "success" }` on status 200; rejects otherwise —
  so a failed upload now surfaces in this component's existing Swal error
  handling instead of silently "succeeding".

### 2. `overallUploadPercent` in new `utils/uploadProgress.ts`

Pure, node:test-covered function:

```ts
overallUploadPercent(input: {
  uploadedBytes: number;  // bytes of files already fully uploaded
  currentLoaded: number;  // bytes uploaded of the in-flight file
  totalBytes: number;     // sum of all selected files' sizes
}): number
```

Returns `((uploadedBytes + currentLoaded) / totalBytes) * 100`, clamped to
[0, 100]; returns `0` when `totalBytes <= 0` (no division by zero).
Re-exported from `utils/index.ts`.

### 3. `AssignmentUploadFile` changes

- New state: `progress: { percent: number; index: number; count: number } | null`
  (`index` is 1-based for display).
- In `handleUploadFiles`: compute `totalBytes` and track `uploadedBytes`
  across the existing sequential loop. Replace the `UploadSignURLService`
  call with `UploadSignURLWithProgressService`, whose `onProgress` sets
  `progress` using `overallUploadPercent` with `event.loaded`.
  After each file's PUT resolves, `uploadedBytes += file.size`.
- Rendering while `loading`:
  - `totalBytes > 0`: determinate `<ProgressBar value={Math.round(percent)} />`
    plus a text line "`{uploading} {index}/{count} — {percent}%`".
  - `totalBytes === 0` (all empty files): keep today's indeterminate bar.
- `progress` resets to `null` on completion and in the catch block. The
  success toast, `onClose()`, and Swal error handling are unchanged.

### 4. Bilingual label

New `classworkDataLanguage.uploading` entry in
`data/languages/classwork.ts`: en `"Uploading"`, th `"กำลังอัปโหลด"`.
The component composes the full label string.

## Error handling

XHR rejection (non-200 or network error) propagates to the component's
existing `catch`, which already shows the Swal error dialog; `loading` and
`progress` reset there. Non-upload steps in the loop (signed-URL fetch,
blurhash, `createFile` mutation) simply leave the bar at its last value —
accepted.

## Testing

- node:test cases for `overallUploadPercent` (mid-batch weighting, clamp
  at 100, zero-total guard, first/last file boundaries).
- `npx tsc --noEmit` and `npm run build`.
- Manual: upload a large file with devtools network throttling and watch
  the bar advance; multi-file batch shows forward-only weighted progress;
  a forced failure (expired signed URL) shows the error dialog.
