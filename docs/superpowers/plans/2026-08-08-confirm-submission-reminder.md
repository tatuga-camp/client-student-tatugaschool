# Confirm-Submission Reminder + Footer Quick Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop new students from mistaking "attached" for "submitted" by adding a warning banner, a leave-page confirm dialog, and a footer action sheet with attach + confirm actions to the student assignment page.

**Architecture:** All UI lives in the existing page `pages/subject/[subjectId]/assignment/[assignmentId].tsx`, driven by one shared predicate extracted to a testable util. A new `useConfirmSubmissionGuard` hook intercepts Pages Router navigation (throw-to-cancel idiom) and `beforeunload`; a new `AssignmentActionSheet` component is opened by the existing middle Footbar button. Confirm actions everywhere reuse the page's existing `handleUpdateWork` mutation.

**Tech Stack:** Next.js 16 (Pages Router), React 18, TypeScript, Tailwind v3, SweetAlert2, @tanstack/react-query, node:test via `npm test`.

**Spec:** `docs/superpowers/specs/2026-08-08-confirm-submission-reminder-design.md`

## Global Constraints

- Working directory for ALL commands: `clients/client-student-tatugaschool` (this directory is its own git repo; the monorepo root is NOT a git repo).
- Branch: all commits go on the existing `confirm-submission-reminder` branch.
- Every user-facing string must exist in English AND Thai via `classworkDataLanguage` in `data/languages/classwork.ts` (switch-per-language pattern, `default` returns the English string).
- Styling uses theme tokens from `tailwind.config.ts` (`primary-color`, `warning-color`, etc.) and `font-Anuphan` — never new hex values.
- No new npm dependencies.
- The status enum literals are spelled `"PENDDING"`, `"SUBMITTED"`, `"REVIEWD"`, `"IMPROVED"` (misspellings are intentional; they match the backend).
- `npm run lint` is broken (Next 16 removed `next lint`) — verify with `npx tsc --noEmit` and `npm run build` instead.
- Do not modify `components/layouts/PopupLayout.tsx`, `components/Footbar.tsx`, or `components/layouts/Layout.tsx` — no task needs them changed.

---

### Task 1: Pure logic utils — `hasUnconfirmedWork` and `isSamePath`

**Files:**
- Create: `utils/confirmSubmission.ts`
- Create: `utils/confirmSubmission.test.ts`
- Modify: `utils/index.ts` (append one export line)

**Interfaces:**
- Consumes: nothing (standalone module).
- Produces:
  - `hasUnconfirmedWork(input: { assignmentType: "Assignment" | "Material" | "VideoQuiz"; fileCount: number; status: "PENDDING" | "SUBMITTED" | "REVIEWD" | "IMPROVED" }): boolean`
  - `isSamePath(currentAsPath: string, targetUrl: string): boolean`
  - Both re-exported from `utils/index.ts`, so later tasks import them as `import { hasUnconfirmedWork, isSamePath } from "../../utils"` (path depth as appropriate).

- [ ] **Step 1: Write the failing tests**

Create `utils/confirmSubmission.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { hasUnconfirmedWork, isSamePath } from "./confirmSubmission";

test("hasUnconfirmedWork is true for Assignment with files and PENDDING status", () => {
  assert.equal(
    hasUnconfirmedWork({ assignmentType: "Assignment", fileCount: 2, status: "PENDDING" }),
    true,
  );
});

test("hasUnconfirmedWork is true for IMPROVED status (resubmission after teacher feedback)", () => {
  assert.equal(
    hasUnconfirmedWork({ assignmentType: "Assignment", fileCount: 1, status: "IMPROVED" }),
    true,
  );
});

test("hasUnconfirmedWork is true for VideoQuiz with attached files", () => {
  assert.equal(
    hasUnconfirmedWork({ assignmentType: "VideoQuiz", fileCount: 1, status: "PENDDING" }),
    true,
  );
});

test("hasUnconfirmedWork is false for Material regardless of files and status", () => {
  assert.equal(
    hasUnconfirmedWork({ assignmentType: "Material", fileCount: 3, status: "PENDDING" }),
    false,
  );
});

test("hasUnconfirmedWork is false when no files are attached", () => {
  assert.equal(
    hasUnconfirmedWork({ assignmentType: "Assignment", fileCount: 0, status: "PENDDING" }),
    false,
  );
});

test("hasUnconfirmedWork is false when already SUBMITTED", () => {
  assert.equal(
    hasUnconfirmedWork({ assignmentType: "Assignment", fileCount: 3, status: "SUBMITTED" }),
    false,
  );
});

test("hasUnconfirmedWork is false when REVIEWD", () => {
  assert.equal(
    hasUnconfirmedWork({ assignmentType: "Assignment", fileCount: 3, status: "REVIEWD" }),
    false,
  );
});

test("isSamePath ignores query strings", () => {
  assert.equal(isSamePath("/subject/a/assignment/b?tab=1", "/subject/a/assignment/b?tab=2"), true);
});

test("isSamePath ignores hash fragments", () => {
  assert.equal(isSamePath("/subject/a/assignment/b", "/subject/a/assignment/b#comments"), true);
});

test("isSamePath ignores a trailing slash", () => {
  assert.equal(isSamePath("/subject/a/assignment/b/", "/subject/a/assignment/b"), true);
});

test("isSamePath is false for different paths", () => {
  assert.equal(isSamePath("/subject/a/assignment/b", "/subject/a/assignment/c"), false);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module './confirmSubmission'` (the existing `pwaManifest` and `zoomMath` tests still pass).

- [ ] **Step 3: Write the implementation**

Create `utils/confirmSubmission.ts`:

```ts
type AssignmentType = "Assignment" | "Material" | "VideoQuiz";
type SubmissionStatus = "PENDDING" | "SUBMITTED" | "REVIEWD" | "IMPROVED";

export function hasUnconfirmedWork(input: {
  assignmentType: AssignmentType;
  fileCount: number;
  status: SubmissionStatus;
}): boolean {
  return (
    input.assignmentType !== "Material" &&
    input.fileCount > 0 &&
    (input.status === "PENDDING" || input.status === "IMPROVED")
  );
}

function pathnameOf(url: string): string {
  const path = url.split(/[?#]/)[0];
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

export function isSamePath(currentAsPath: string, targetUrl: string): boolean {
  return pathnameOf(currentAsPath) === pathnameOf(targetUrl);
}
```

Append to `utils/index.ts`:

```ts
export * from "./confirmSubmission";
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all tests including the 11 new ones.

- [ ] **Step 5: Typecheck and commit**

Run: `npx tsc --noEmit`
Expected: no errors.

```bash
git add utils/confirmSubmission.ts utils/confirmSubmission.test.ts utils/index.ts
git commit -m "feat: add hasUnconfirmedWork and isSamePath utils for submission reminder"
```

---

### Task 2: Bilingual strings for banner and leave dialog

**Files:**
- Modify: `data/languages/classwork.ts` (add two entries to `classworkDataLanguage`, before the closing `} as const;`)

**Interfaces:**
- Consumes: existing `Language` type (`"en" | "th"`), already imported in the file.
- Produces (used by Tasks 3 and 4):
  - `classworkDataLanguage.unsubmittedBanner(language: Language): string`
  - `classworkDataLanguage.leaveDialog.title(language)`, `.text(language)`, `.confirm(language)`, `.leave(language)`, `.stay(language)`
- Note: the action sheet (Task 5) needs NO new strings — it reuses `attrachs`, `attrachType.*`, and `menuSummitLists.*`.

- [ ] **Step 1: Add the entries**

In `data/languages/classwork.ts`, inside the `classworkDataLanguage` object, after the `summitWorkDescription` entry (before `} as const;`), add:

```ts
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
  leaveDialog: {
    title: (language: Language) => {
      switch (language) {
        case "en":
          return "You haven't submitted your work!";
        case "th":
          return "คุณยังไม่ได้ส่งงาน!";
        default:
          return "You haven't submitted your work!";
      }
    },
    text: (language: Language) => {
      switch (language) {
        case "en":
          return "You attached work but haven't confirmed the submission, so your teacher will not see it as submitted.";
        case "th":
          return "คุณแนบงานแล้ว แต่ยังไม่ได้กดยืนยันการส่งงาน คุณครูจะยังไม่เห็นว่างานของคุณถูกส่ง";
        default:
          return "You attached work but haven't confirmed the submission, so your teacher will not see it as submitted.";
      }
    },
    confirm: (language: Language) => {
      switch (language) {
        case "en":
          return "Confirm submission";
        case "th":
          return "ยืนยันการส่งงาน";
        default:
          return "Confirm submission";
      }
    },
    leave: (language: Language) => {
      switch (language) {
        case "en":
          return "Leave without submitting";
        case "th":
          return "ออกโดยไม่ส่งงาน";
        default:
          return "Leave without submitting";
      }
    },
    stay: (language: Language) => {
      switch (language) {
        case "en":
          return "Stay on this page";
        case "th":
          return "อยู่ในหน้านี้ต่อ";
        default:
          return "Stay on this page";
      }
    },
  },
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add data/languages/classwork.ts
git commit -m "feat: add bilingual strings for unsubmitted-work banner and leave dialog"
```

---

### Task 3: `useConfirmSubmissionGuard` hook

**Files:**
- Create: `hook/useConfirmSubmissionGuard.ts`

**Interfaces:**
- Consumes:
  - `isSamePath` from `../utils` (Task 1)
  - `classworkDataLanguage.leaveDialog.*` (Task 2)
  - `Language` type from `../interfaces`
- Produces (used by Task 4):
  - `default export function useConfirmSubmissionGuard(options: { enabled: boolean; onConfirm: () => Promise<boolean>; language: Language }): void`
  - `onConfirm` must resolve `true` on success (navigation then continues) and `false` on failure (student stays on the page). It must NOT throw.

- [ ] **Step 1: Write the hook**

Create `hook/useConfirmSubmissionGuard.ts`:

```ts
import { useRouter } from "next/router";
import React from "react";
import Swal from "sweetalert2";
import { classworkDataLanguage } from "../data/languages";
import { Language } from "../interfaces";
import { isSamePath } from "../utils";

const ABORT_MESSAGE =
  "Route change aborted by useConfirmSubmissionGuard (safe to ignore)";

function useConfirmSubmissionGuard({
  enabled,
  onConfirm,
  language,
}: {
  enabled: boolean;
  onConfirm: () => Promise<boolean>;
  language: Language;
}): void {
  const router = useRouter();
  const bypassRef = React.useRef(false);
  const enabledRef = React.useRef(enabled);
  const onConfirmRef = React.useRef(onConfirm);
  const languageRef = React.useRef(language);
  enabledRef.current = enabled;
  onConfirmRef.current = onConfirm;
  languageRef.current = language;

  React.useEffect(() => {
    const showLeaveDialog = async (url: string) => {
      const lang = languageRef.current;
      const result = await Swal.fire({
        icon: "warning",
        title: classworkDataLanguage.leaveDialog.title(lang),
        text: classworkDataLanguage.leaveDialog.text(lang),
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: classworkDataLanguage.leaveDialog.confirm(lang),
        denyButtonText: classworkDataLanguage.leaveDialog.leave(lang),
        cancelButtonText: classworkDataLanguage.leaveDialog.stay(lang),
        customClass: {
          popup: "rounded-2xl border border-gray-100 shadow-md",
        },
      });
      if (result.isConfirmed) {
        const success = await onConfirmRef.current();
        if (success) {
          bypassRef.current = true;
          router.push(url);
        }
      } else if (result.isDenied) {
        bypassRef.current = true;
        router.push(url);
      }
    };

    const handleRouteChangeStart = (url: string) => {
      if (!enabledRef.current || bypassRef.current) return;
      if (isSamePath(router.asPath, url)) return;
      router.events.emit("routeChangeError");
      showLeaveDialog(url);
      // Throwing inside routeChangeStart is the Pages Router idiom to
      // cancel a navigation; Next.js surfaces it as a routeChangeError.
      throw ABORT_MESSAGE;
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [router]);

  React.useEffect(() => {
    if (!enabled) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled]);
}

export default useConfirmSubmissionGuard;
```

Design notes for the implementer (do not skip):
- Refs (`enabledRef`, `onConfirmRef`, `languageRef`) exist because the `routeChangeStart` handler is registered once and would otherwise close over stale props.
- `bypassRef` stays `true` after a permitted navigation; the page unmounts on successful navigation so it never needs resetting.
- `isSamePath` guards against query-only route changes (e.g. `?subject_id=` params) re-triggering the dialog.
- There is no test infrastructure for hooks in this repo (node:test covers only `utils/`); this hook is verified by typecheck, build, and the manual QA task.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add hook/useConfirmSubmissionGuard.ts
git commit -m "feat: add useConfirmSubmissionGuard leave-page hook"
```

---

### Task 4: Page wiring — predicate, banner, leave guard

**Files:**
- Modify: `pages/subject/[subjectId]/assignment/[assignmentId].tsx`

**Interfaces:**
- Consumes: `hasUnconfirmedWork` (Task 1), `classworkDataLanguage.unsubmittedBanner` (Task 2), `useConfirmSubmissionGuard` (Task 3).
- Produces (used by Task 5): `handleUpdateWork(status: StudentAssignmentStatus): Promise<boolean>` — same function as today but now returns `true` on success, `false` on failure (it already catches its own errors and shows a Swal; existing callers ignore the return value, so this is non-breaking).

- [ ] **Step 1: Make `handleUpdateWork` return a success boolean**

In `pages/subject/[subjectId]/assignment/[assignmentId].tsx`, the function currently reads (around line 211):

```ts
  const handleUpdateWork = async (status: StudentAssignmentStatus) => {
    try {
      await updateWork.mutateAsync({
        ...
      });
      toast.current?.show({ ... });
      setTriggerSummitDropDown(false);
    } catch (error) {
      let result = error as ErrorMessages;
      Swal.fire({ ... });
    }
  };
```

Change only two things: add `return true;` as the last statement of the `try` block (after `setTriggerSummitDropDown(false);`) and `return false;` as the last statement of the `catch` block (after the `Swal.fire({...});` call). The declaration becomes:

```ts
  const handleUpdateWork = async (
    status: StudentAssignmentStatus,
  ): Promise<boolean> => {
```

- [ ] **Step 2: Compute the shared predicate and mount the guard**

Add the imports at the top of the file:

```ts
import useConfirmSubmissionGuard from "../../../../hook/useConfirmSubmissionGuard";
import { hasUnconfirmedWork } from "../../../../utils";
```

(`timeAgo, timeLeft` are already imported from `"../../../../utils"` — merge `hasUnconfirmedWork` into that existing import statement instead of adding a duplicate.)

Then, inside the component: the guard is a hook, so it must be called unconditionally, BEFORE the early `if (!assignment)` return (hooks rule). Place this block directly after the `useClickOutside(divRef, ...)` call and before `if (!assignment)`:

```ts
  const unconfirmedWork = assignment
    ? hasUnconfirmedWork({
        assignmentType: assignment.type,
        fileCount: studentFiles.data?.length ?? 0,
        status: assignment.studentOnAssignment.status,
      })
    : false;

  useConfirmSubmissionGuard({
    enabled: unconfirmedWork && !updateWork.isPending,
    onConfirm: () => handleUpdateWorkRef.current("SUBMITTED"),
    language: language.data ?? "en",
  });
```

`handleUpdateWork` is declared after the early return, so it cannot be referenced directly here. Add this ref alongside the other refs near the top of the component (after `const videoPlayerRef = ...`):

```ts
  const handleUpdateWorkRef = React.useRef<
    (status: StudentAssignmentStatus) => Promise<boolean>
  >(() => Promise.resolve(false));
```

and immediately after the `handleUpdateWork` declaration (after its closing `};`), add:

```ts
  handleUpdateWorkRef.current = handleUpdateWork;
```

If `assignment.type` from the interfaces is a plain `string` rather than the
`"Assignment" | "Material" | "VideoQuiz"` union, the `hasUnconfirmedWork` call
will fail typecheck — in that case cast at the call site:
`assignmentType: assignment.type as "Assignment" | "Material" | "VideoQuiz"`.
Same for `status`.

- [ ] **Step 3: Add the warning banner to `SummitStatus`**

Inside the `SummitStatus` function component, between the header `<div className="flex w-full items-center justify-between p-2 text-xl font-semibold">...</div>` and `<div className="relative flex items-center">`, insert:

```tsx
        {unconfirmedWork && (
          <div className="mx-2 mb-2 flex items-center gap-2 rounded-xl border border-warning-color bg-warning-color/20 p-2 text-sm font-medium text-gray-800">
            ⚠️
            {classworkDataLanguage.unsubmittedBanner(language.data ?? "en")}
          </div>
        )}
```

- [ ] **Step 4: Typecheck and build**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add "pages/subject/[subjectId]/assignment/[assignmentId].tsx"
git commit -m "feat: warn students about unconfirmed work via banner and leave-page dialog"
```

---

### Task 5: `AssignmentActionSheet` + footer button wiring

**Files:**
- Create: `components/subject/AssignmentActionSheet.tsx`
- Modify: `pages/subject/[subjectId]/assignment/[assignmentId].tsx`

**Interfaces:**
- Consumes: `classworkDataLanguage.attrachs/attrachType/menuSummitLists` (existing), `handleUpdateWork(status): Promise<boolean>` (Task 4), `Language` and `StudentAssignmentStatus` from `../../interfaces`.
- Produces: `default export AssignmentActionSheet` with props `{ language: Language; status: StudentAssignmentStatus; isPending: boolean; onSelectAttach: (menu: "Link" | "Create" | "Upload") => void; onUpdateStatus: (status: "SUBMITTED" | "PENDDING") => void; onClose: () => void }`.

- [ ] **Step 1: Create the component**

Create `components/subject/AssignmentActionSheet.tsx`. Deliberate deviation from the spec's "via PopupLayout" wording: `PopupLayout`'s backdrop fires `confirm("Do you want to close?")`, which is wrong for a tap-to-dismiss menu, so the sheet renders its own overlay. It sits above the Footbar (`z-40`) at `z-50`, bottom-anchored like a mobile action sheet:

```tsx
import React from "react";
import { FcLink, FcPlus, FcUpload } from "react-icons/fc";
import { MdOutlineDone, MdOutlineRemoveDone } from "react-icons/md";
import { classworkDataLanguage } from "../../data/languages";
import { Language, StudentAssignmentStatus } from "../../interfaces";

const attachMenus = [
  { title: "Link", icon: <FcLink /> },
  { title: "Create", icon: <FcPlus /> },
  { title: "Upload", icon: <FcUpload /> },
] as const;

type Props = {
  language: Language;
  status: StudentAssignmentStatus;
  isPending: boolean;
  onSelectAttach: (menu: "Link" | "Create" | "Upload") => void;
  onUpdateStatus: (status: "SUBMITTED" | "PENDDING") => void;
  onClose: () => void;
};

function AssignmentActionSheet({
  language,
  status,
  isPending,
  onSelectAttach,
  onUpdateStatus,
  onClose,
}: Props) {
  return (
    <section className="fixed inset-0 z-50 flex items-end justify-center font-Anuphan">
      <button
        type="button"
        aria-label="close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/30"
      />
      <div className="relative z-10 mb-24 w-[98%] max-w-md rounded-2xl border border-gray-100 bg-white p-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <span className="px-1 text-sm text-gray-500">
          {classworkDataLanguage.attrachs(language)}
        </span>
        <div className="mt-1 grid gap-1">
          {attachMenus.map((menu) => (
            <button
              key={menu.title}
              type="button"
              onClick={() => onSelectAttach(menu.title)}
              className="flex w-full items-center gap-3 rounded-xl p-2 text-base hover:bg-gray-100"
            >
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border text-lg">
                {menu.icon}
              </div>
              {classworkDataLanguage.attrachType[
                menu.title.toLowerCase() as keyof typeof classworkDataLanguage.attrachType
              ](language)}
            </button>
          ))}
        </div>
        <div className="my-2 border-t" />
        {(status === "PENDDING" || status === "IMPROVED") && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => onUpdateStatus("SUBMITTED")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-color p-2 text-base font-medium text-white opacity-90 hover:opacity-100"
          >
            {classworkDataLanguage.menuSummitLists.done(language)}
            <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-green-200 text-green-600">
              <MdOutlineDone />
            </div>
          </button>
        )}
        {status === "SUBMITTED" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => onUpdateStatus("PENDDING")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-400 p-2 text-base font-medium text-white opacity-90 hover:opacity-100"
          >
            {classworkDataLanguage.menuSummitLists.notdone(language)}
            <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-red-200 text-red-600">
              <MdOutlineRemoveDone />
            </div>
          </button>
        )}
        {status === "REVIEWD" && (
          <div className="p-2 text-center text-sm text-gray-500">
            {classworkDataLanguage.menuSummitLists.review(language)}
          </div>
        )}
      </div>
    </section>
  );
}

export default AssignmentActionSheet;
```

- [ ] **Step 2: Wire it to the footer button**

In `pages/subject/[subjectId]/assignment/[assignmentId].tsx`:

Add the import:

```ts
import AssignmentActionSheet from "../../../../components/subject/AssignmentActionSheet";
```

Add state next to the other `useState` calls:

```ts
  const [openActionSheet, setOpenActionSheet] = React.useState(false);
```

Change the Assignment-type custom menu in the `<Layout customMenus={[...]}>` array from:

```ts
          ...(assignment.type === "Assignment"
            ? [
                {
                  icon: <FaPlus />,
                  action: "button" as const,
                  onClick: () => setSelectMenu({ title: "Create" }),
                },
              ]
            : []),
```

to:

```ts
          ...(assignment.type === "Assignment"
            ? [
                {
                  icon: <FaPlus />,
                  action: "button" as const,
                  onClick: () => setOpenActionSheet(true),
                },
              ]
            : []),
```

Render the sheet next to the other overlays — directly after the `{selectMenu !== null && (<PopupLayout ...>...)}` block, add:

```tsx
      {openActionSheet && assignment.type === "Assignment" && (
        <AssignmentActionSheet
          language={language.data ?? "en"}
          status={studentOnAssignment.status}
          isPending={updateWork.isPending}
          onSelectAttach={(title) => {
            setOpenActionSheet(false);
            setSelectMenu({ title });
          }}
          onUpdateStatus={async (status) => {
            const success = await handleUpdateWork(status);
            if (success) {
              setOpenActionSheet(false);
            }
          }}
          onClose={() => setOpenActionSheet(false)}
        />
      )}
```

- [ ] **Step 3: Typecheck and build**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/subject/AssignmentActionSheet.tsx "pages/subject/[subjectId]/assignment/[assignmentId].tsx"
git commit -m "feat: add footer action sheet with attach and confirm-submission actions"
```

---

### Task 6: Full verification + manual QA

**Files:**
- No new files; fix-up commits only if QA finds issues.

**Interfaces:**
- Consumes: everything above.
- Produces: a verified feature branch ready for merge/PR.

- [ ] **Step 1: Run the full automated verification**

```bash
npm test
npx tsc --noEmit
npm run build
```

Expected: all pass.

- [ ] **Step 2: Manual QA in a browser**

Run `npm run dev` (serves on port 8282), open an Assignment-type classwork as a student, use a mobile viewport (~390px wide) in devtools. Check each:

1. With 0 attached files and status PENDDING: no banner; navigating away shows NO dialog.
2. Attach a file: banner appears in the Summit Work card (warning-yellow, bilingual per language setting).
3. Tap a Footbar nav item (e.g. homepage): the three-button dialog appears; the URL does NOT change behind it. **This is the highest-risk item** — the throw-to-cancel idiom must be verified against Next 16's Pages Router. If navigation is not cancelled, stop and debug with the superpowers:systematic-debugging skill before continuing.
4. Dialog "Stay on this page": dialog closes, still on assignment page.
5. Dialog "Leave without submitting": navigates to the tapped destination; status stays PENDDING.
6. Return, dialog "Confirm submission": status flips to SUBMITTED (toast shows), then navigation completes. Banner is gone on return.
7. With unconfirmed work, press browser reload/close tab: native browser warning appears. With no unconfirmed work: no warning.
8. Middle footer plus-button opens the action sheet above the footbar; backdrop tap closes it without any confirm() prompt.
9. Sheet rows Link/Create/Upload each close the sheet and open the matching popup.
10. Sheet confirm row: PENDDING → "Mark as done" (primary color) submits; when SUBMITTED, reopening shows gray "Mark as not done"; after teacher review (REVIEWD), row shows "Teacher has reviewd" text only.
11. Switch language to Thai: banner, dialog, and sheet are all in Thai.
12. Material-type classwork: no banner, no guard, no middle footer button. VideoQuiz: play button still present; guard fires only if files were attached.

- [ ] **Step 3: Commit any QA fixes**

Each fix as its own commit on `confirm-submission-reminder`:

```bash
git add <changed files>
git commit -m "fix: <what QA revealed>"
```
