# Upload Progress Percentage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a byte-weighted overall percentage progress bar while students upload assignment files, replacing the indeterminate bar.

**Architecture:** Port the teacher app's XHR-based `UploadSignURLWithProgressService` (progress callback, status-checked) into the student app's `services/google-storage.ts`, extract the batch-percent math into a node:test-covered util, and wire both into `AssignmentUploadFile`'s existing sequential upload loop with a determinate PrimeReact `ProgressBar` and a bilingual "Uploading i/n — X%" label.

**Tech Stack:** Next.js 16 (Pages Router), React 18, TypeScript, PrimeReact `ProgressBar`, XMLHttpRequest, node:test via `npm test`.

**Spec:** `docs/superpowers/specs/2026-08-08-upload-progress-design.md`

## Global Constraints

- Working directory for ALL commands: `clients/client-student-tatugaschool` (its own git repo; monorepo root is NOT git).
- Branch: all commits go on the existing `upload-progress` branch (stacked on unmerged `confirm-submission-reminder`).
- User-facing strings bilingual via `classworkDataLanguage` in `data/languages/classwork.ts` (switch-per-language, `default` = English).
- No new npm dependencies. `npm run lint` is broken — verify with `npx tsc --noEmit` and `npm run build`.
- Do NOT modify or remove the existing fetch-based `UploadSignURLService` — `components/common/TextEditor.tsx` and `pages/student/[studentId]/index.tsx` still use it.
- The new service must keep the exact teacher-app name and signature: `UploadSignURLWithProgressService`.

---

### Task 1: `overallUploadPercent` util (TDD)

**Files:**
- Create: `utils/uploadProgress.ts`
- Create: `utils/uploadProgress.test.ts`
- Modify: `utils/index.ts` (append one export line)

**Interfaces:**
- Consumes: nothing (standalone).
- Produces (used by Task 3): `overallUploadPercent(input: { uploadedBytes: number; currentLoaded: number; totalBytes: number }): number` — byte-weighted batch percent in [0, 100]; returns `0` when `totalBytes <= 0`. Re-exported from `utils/index.ts`.

- [ ] **Step 1: Write the failing tests**

Create `utils/uploadProgress.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { overallUploadPercent } from "./uploadProgress";

test("returns 0 at the start of a batch", () => {
  assert.equal(
    overallUploadPercent({ uploadedBytes: 0, currentLoaded: 0, totalBytes: 100 }),
    0,
  );
});

test("weights the in-flight file against the whole batch", () => {
  // 50 bytes done from earlier files + 25 of the current file, out of 100 total
  assert.equal(
    overallUploadPercent({ uploadedBytes: 50, currentLoaded: 25, totalBytes: 100 }),
    75,
  );
});

test("reaches 100 when the last file finishes", () => {
  assert.equal(
    overallUploadPercent({ uploadedBytes: 60, currentLoaded: 40, totalBytes: 100 }),
    100,
  );
});

test("clamps overshoot at 100", () => {
  assert.equal(
    overallUploadPercent({ uploadedBytes: 100, currentLoaded: 50, totalBytes: 100 }),
    100,
  );
});

test("returns 0 for a zero-byte batch instead of dividing by zero", () => {
  assert.equal(
    overallUploadPercent({ uploadedBytes: 0, currentLoaded: 0, totalBytes: 0 }),
    0,
  );
});

test("clamps negative inputs to 0", () => {
  assert.equal(
    overallUploadPercent({ uploadedBytes: -10, currentLoaded: 0, totalBytes: 100 }),
    0,
  );
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module './uploadProgress'` (all pre-existing tests still pass).

- [ ] **Step 3: Write the implementation**

Create `utils/uploadProgress.ts`:

```ts
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
```

Append to `utils/index.ts`:

```ts
export * from "./uploadProgress";
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (27 tests total: 21 existing + 6 new).

- [ ] **Step 5: Typecheck and commit**

Run: `npx tsc --noEmit`
Expected: no errors.

```bash
git add utils/uploadProgress.ts utils/uploadProgress.test.ts utils/index.ts
git commit -m "feat: add overallUploadPercent util for batch upload progress"
```

---

### Task 2: Port `UploadSignURLWithProgressService`

**Files:**
- Modify: `services/google-storage.ts` (append after the existing `UploadSignURLService`, which ends around line 59)

**Interfaces:**
- Consumes: existing `RequestUploadSignURLService` type in the same file (`{ contentType: string; file: File; signURL: string }`).
- Produces (used by Task 3): `UploadSignURLWithProgressService(input: RequestUploadSignURLService & { onProgress?: (progress: number, event: ProgressEvent) => void }): Promise<{ message: "success" | "error" }>` — rejects on non-200 status or network error.

- [ ] **Step 1: Append the ported service**

Add to the end of `services/google-storage.ts` (verbatim port from `client-main-tatugaschool/services/google-storage.ts:61-98`):

```ts
export async function UploadSignURLWithProgressService(
  input: RequestUploadSignURLService & {
    onProgress?: (progress: number, event: ProgressEvent) => void;
  },
): Promise<{
  message: "success" | "error";
}> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", input.signURL, true);
    xhr.setRequestHeader("Content-Type", input.contentType);

    if (input.onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          input.onProgress!(percentComplete, event);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve({ message: "success" });
      } else {
        console.error("Upload file fail:", xhr.responseText);
        reject(xhr.responseText);
      }
    };

    xhr.onerror = () => {
      console.error("Upload file fail: Network Error");
      reject(new Error("Network Error"));
    };

    xhr.send(input.file);
  });
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. (The service is exported via the `services` barrel the same way `UploadSignURLService` already is — check `services/index.ts` re-exports `./google-storage`; no change needed if it uses `export *`.)

- [ ] **Step 3: Commit**

```bash
git add services/google-storage.ts
git commit -m "feat: port UploadSignURLWithProgressService from teacher app"
```

---

### Task 3: Wire progress into `AssignmentUploadFile` + bilingual label

**Files:**
- Modify: `data/languages/classwork.ts` (one new entry)
- Modify: `components/subject/AssignmentUploadFile.tsx`

**Interfaces:**
- Consumes: `overallUploadPercent` (Task 1), `UploadSignURLWithProgressService` (Task 2), `useGetLanguage` from `../../react-query` (existing hook, returns `{ data?: Language }`).
- Produces: final UI. No downstream consumers.

- [ ] **Step 1: Add the `uploading` language entry**

In `data/languages/classwork.ts`, inside `classworkDataLanguage`, after the `leaveDialog` entry (before `} as const;`), add:

```ts
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
```

- [ ] **Step 2: Update the component's imports and state**

In `components/subject/AssignmentUploadFile.tsx`:

Replace the services import:

```ts
import {
  getSignedURLStudentService,
  UploadSignURLService,
} from "../../services";
```

with:

```ts
import {
  getSignedURLStudentService,
  UploadSignURLWithProgressService,
} from "../../services";
```

Add these imports:

```ts
import { classworkDataLanguage } from "../../data/languages";
import { useGetLanguage } from "../../react-query";
```

(merge `useGetLanguage` into the existing `../../react-query` import that already brings `useCreateFileStudentAssignment`), and extend the utils import:

```ts
import { generateBlurHash, overallUploadPercent } from "../../utils";
```

Inside the component, next to the existing `loading` state:

```ts
  const language = useGetLanguage();
  const [progress, setProgress] = React.useState<{
    percent: number;
    index: number;
    count: number;
  } | null>(null);
```

- [ ] **Step 3: Rework the upload loop**

Replace the body of `handleUploadFiles` between `setLoading(true);` and the end of the `for` loop with byte tracking and the progress service. The full function after the change:

```ts
  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (!files) {
        return;
      }
      setLoading(true);
      const filesArray = Array.from(files);
      const totalBytes = filesArray.reduce((sum, file) => sum + file.size, 0);
      let uploadedBytes = 0;
      for (const [index, file] of filesArray.entries()) {
        let blurHash: string | undefined = undefined;
        const signURL = await getSignedURLStudentService({
          fileName: file.name,
          fileType: file.type,
          schoolId,
          fileSize: file.size,
        });

        const upload = await UploadSignURLWithProgressService({
          contentType: file.type,
          file: file,
          signURL: signURL.signURL,
          onProgress:
            totalBytes > 0
              ? (_percent, event) => {
                  setProgress({
                    percent: overallUploadPercent({
                      uploadedBytes,
                      currentLoaded: event.loaded,
                      totalBytes,
                    }),
                    index: index + 1,
                    count: filesArray.length,
                  });
                }
              : undefined,
        });
        uploadedBytes += file.size;

        if (file.type.includes("image")) {
          blurHash = await generateBlurHash(file);
        }
        await createFile.mutateAsync({
          studentOnAssignmentId: studentOnAssignmentId,
          type: file.type,
          name: file.name,
          body: signURL.originalURL,
          size: file.size,
          blurHash: blurHash,
          contentType: "FILE",
        });
      }
      setProgress(null);
      setLoading(false);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "File uploaded successfully",
        life: 3000,
      });
      onClose();
    } catch (error) {
      setProgress(null);
      setLoading(false);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };
```

Notes: `filesArray.entries()` supplies the 1-based display index via `index + 1`. When `totalBytes === 0`, `onProgress` is `undefined` so `progress` stays `null` and the old indeterminate bar renders (Step 4). The unused `_percent` parameter keeps the teacher-app callback signature.

- [ ] **Step 4: Replace the progress rendering**

Replace:

```tsx
      {loading && (
        <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
      )}
```

with:

```tsx
      {loading && progress && (
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">
            {classworkDataLanguage.uploading(language.data ?? "en")}{" "}
            {progress.index}/{progress.count} — {Math.round(progress.percent)}%
          </span>
          <ProgressBar
            value={Math.round(progress.percent)}
            style={{ height: "10px" }}
          />
        </div>
      )}
      {loading && !progress && (
        <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
      )}
```

- [ ] **Step 5: Typecheck and build**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add data/languages/classwork.ts components/subject/AssignmentUploadFile.tsx
git commit -m "feat: show weighted upload percentage in assignment file upload"
```

---

### Task 4: Full verification + manual QA

**Files:**
- No new files; fix-up commits only if QA finds issues.

- [ ] **Step 1: Run the full automated verification**

```bash
npm test
npx tsc --noEmit
npm run build
```

Expected: all pass (27 node tests).

- [ ] **Step 2: Manual QA**

With the dev server on port 8282, open an Assignment as a student, open the Upload popup (footer sheet → Files, or the attach card):

1. Upload one large file with devtools "Slow 4G" throttling: label shows "Uploading 1/1 — N%" and the bar advances smoothly to 100%.
2. Upload 2–3 files of different sizes: the bar only moves forward; the counter steps 1/3 → 2/3 → 3/3; percent is weighted (a small file barely moves the bar next to a large one).
3. Switch language to Thai: label reads "กำลังอัปโหลด 2/3 — 45%".
4. Force a failure (e.g. devtools offline mid-upload): Swal error dialog appears, bar disappears, popup stays usable for retry.
5. The other `UploadSignURLService` consumers (TextEditor image upload, profile page) still work unchanged.

- [ ] **Step 3: Commit any QA fixes**

```bash
git add <changed files>
git commit -m "fix: <what QA revealed>"
```
