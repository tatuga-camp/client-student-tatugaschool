import { useEffect } from "react";
import { useGetStudent } from "../react-query";
import { SubscribeStudentToPushService } from "../services";
import { registerServiceWorker } from "../utils/notifications";
import { safeGet, safeSet } from "../utils/safeStorage";

// Browsers rotate or drop push subscriptions and the server deletes dead
// ones, so once allowed we quietly re-send ours, at most once a day.
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000;
const syncKey = (studentId: string) => `push-sync-at:${studentId}`;

/**
 * Background push upkeep for the subject app (call once, in SubjectShell):
 * registers the service worker and re-sends an allowed subscription daily.
 * The prompt and the bell only ask; this keeps it working.
 */
export function usePushSync(): void {
  const student = useGetStudent();
  const studentId = student.data?.id;

  useEffect(() => {
    registerServiceWorker().catch((error) =>
      console.error("Service worker registration failed:", error),
    );
  }, []);

  useEffect(() => {
    if (!studentId || typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    const last = Number(safeGet(syncKey(studentId)));
    if (last && Date.now() - last <= SYNC_INTERVAL_MS) return;
    SubscribeStudentToPushService()
      .then(() => safeSet(syncKey(studentId), String(Date.now())))
      .catch((error) => console.error("Push subscription re-sync failed:", error));
  }, [studentId]);
}
