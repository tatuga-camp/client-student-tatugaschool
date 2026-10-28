export function isIosSafariWithoutPwa(): boolean {
  if (typeof window === "undefined") return false;
  const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;
  return isIos && !isStandalone;
}

export type PushStatus =
  | "granted"
  | "default"
  | "denied"
  | "ios-install"
  | "unsupported";

/** Where web push stands here; iOS needs the home-screen app first. */
export function getPushStatus(): PushStatus {
  if (typeof window === "undefined") return "unsupported";
  if (isIosSafariWithoutPwa()) return "ios-install";
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission as PushStatus;
}

/**
 * Which prompt shows on its own (the old AskNotification rules): none once
 * dismissed; the install steps on iPhone Safari; Allow while the browser
 * can still ask. Blocked, granted and unsupported ask nothing.
 */
export function autoPushPrompt(input: {
  dismissed: boolean;
  status: PushStatus;
}): "ask" | "ios-install" | null {
  if (input.dismissed) return null;
  if (input.status === "ios-install") return "ios-install";
  return input.status === "default" ? "ask" : null;
}

export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    return await navigator.serviceWorker.register("/sw.js");
  }
  console.error("Service Worker not supported");
  return null;
}

/** Registers this device for push (call once permission is granted). */
export async function subscribePush(): Promise<void> {
  // Subscribing waits for an active service worker.
  await registerServiceWorker();
  // Loaded on use: services/push imports this module (a static import
  // would be a cycle through services/apiService and utils/index).
  const { SubscribeStudentToPushService } = await import("../services/push");
  await SubscribeStudentToPushService();
}

export async function subscribeUserToPush() {
  try {
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string
      ),
    });
    console.log("Push Subscription successful:", subscription.toJSON());
    return subscription;
  } catch (error) {
    console.error("Push Subscription failed:", error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string | any[]) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array(Array.from(rawData).map((char) => char.charCodeAt(0)));
}
