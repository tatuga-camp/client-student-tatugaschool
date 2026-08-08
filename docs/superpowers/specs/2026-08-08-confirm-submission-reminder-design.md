# Confirm-Submission Reminder + Footer Quick Actions — Design

**Date:** 2026-08-08
**App:** `clients/client-student-tatugaschool` (student-facing Next.js app, Pages Router)
**Page:** `pages/subject/[subjectId]/assignment/[assignmentId].tsx`

## Problem

New students attach work (file/link/text) to an assignment and believe it is
submitted, but the assignment stays `PENDDING` until they press the Confirm
button in the `SummitStatus` card. Teachers must re-explain this every
academic year. Students asked for a reminder before/upon leaving the
submission page. Additionally, on mobile the `SummitStatus` card renders far
down the page (inside `listData`), so both the attach actions and the Confirm
button are hard to find.

## Solution overview

Three additions, all driven by one shared condition computed in the page
component:

```ts
const hasUnconfirmedWork =
  assignment.type !== "Material" &&
  (studentFiles.data?.length ?? 0) > 0 &&
  (studentOnAssignment.status === "PENDDING" ||
    studentOnAssignment.status === "IMPROVED");
```

1. **Persistent warning banner** in the `SummitStatus` card whenever
   `hasUnconfirmedWork` is true.
2. **Leave-guard dialog** when the student navigates away while
   `hasUnconfirmedWork` is true — offering *Confirm submission / Leave
   without submitting / Stay*. Fires on every visit (not only visits where
   something was attached).
3. **Footer action sheet** — for `Assignment`-type classwork, the middle
   Footbar button opens a sheet with the three attach actions (Link / Create /
   Upload) plus a highlighted, status-aware Confirm row.

## Components

### 1. `hook/useConfirmSubmissionGuard.ts` (new, ~80 lines)

Signature: `useConfirmSubmissionGuard({ enabled, onConfirm, language })`.

- **In-app navigation:** subscribes to `router.events.routeChangeStart`.
  When `enabled` and the target path differs from the current path
  (query-only changes are ignored), cancel the navigation using the standard
  Pages Router idiom (throw a sentinel + emit `routeChangeError`; suppress
  that error), then show a SweetAlert2 three-button dialog (warning icon,
  bilingual):
  - **Confirm submission** → `await onConfirm()`, then `router.push`
    the original URL. If `onConfirm` throws, show the existing Swal error
    pattern and stay on the page.
  - **Leave without submitting** → set a bypass ref, `router.push` the
    original URL.
  - **Stay** → close the dialog, do nothing.
- **Tab close / refresh:** registers a `beforeunload` listener while
  `enabled`. Browsers only allow their generic native warning here (no custom
  text — platform limitation, accepted).
- Guard is suspended while a confirm mutation is pending and while the
  dialog itself triggers navigation (bypass ref), preventing double dialogs
  and loops.

### 2. Banner in `SummitStatus` (inline, ~10 lines)

When `hasUnconfirmedWork`, render above the confirm button using the theme's
`warning-color` tokens from `tailwind.config.ts`:

> ⚠️ Your work is attached but NOT submitted yet — press Confirm to submit.

(+ Thai translation.) Always visible while the condition holds, on every
visit.

### 3. `components/subject/AssignmentActionSheet.tsx` (new, ~70 lines)

Opened by the existing `FaPlus` middle Footbar button for `Assignment`-type
classwork (replacing its current behavior of jumping straight to the
"Create" popup). Rendered via the existing `PopupLayout`, styled as a bottom
sheet on mobile. Contents:

- The three `SummitWorkMenus` rows (Link / Create / Upload) — each calls
  `setSelectMenu({ title })` and closes the sheet.
- A divider, then one status-aware action row reusing `handleUpdateWork`:
  - `PENDDING` / `IMPROVED` → highlighted **Confirm submission**
    (`bg-primary-color`, done icon) → `handleUpdateWork("SUBMITTED")`
  - `SUBMITTED` → **Mark as not done** (gray, matching the existing
    toggle) → `handleUpdateWork("PENDDING")`
  - `REVIEWD` → non-interactive "Already reviewed" text.

`VideoQuiz` keeps its play button; `Material` keeps no middle button.

## Data flow and reuse

- No new API calls or state shapes. All confirm actions reuse the existing
  `handleUpdateWork` mutation (`useUpdateStudentOnAssignment`), which already
  handles React Query invalidation and the success toast.
- The leave-guard hook receives `onConfirm = () => handleUpdateWork("SUBMITTED")`.
- New UI strings go into `classworkDataLanguage`
  (`data/languages/classwork.ts`) in English and Thai, following the
  existing switch-per-language pattern: banner text, dialog title/body,
  three dialog button labels, sheet row labels ("Confirm submission",
  "Mark as not done", "Already reviewed").

## Edge cases

- The leave guard also covers `VideoQuiz` assignments if files are attached
  while status is `PENDDING`/`IMPROVED` (same condition); the footer sheet
  remains `Assignment`-only.
- Query-only route changes (same pathname) never trigger the dialog.
- `beforeunload` shows only the browser's generic message — accepted.

## Verification

- `npx tsc --noEmit` and `npm run build` in
  `clients/client-student-tatugaschool`.
- Manual QA on a mobile viewport:
  - Attach work, navigate away → dialog appears; each of the three buttons
    behaves as specified.
  - Tab close with unconfirmed work → native browser warning.
  - Banner shows/hides correctly per status and file count.
  - Footer sheet shows correct rows per status; only for `Assignment` type.
  - Confirming from dialog or sheet updates status and shows the success
    toast.
