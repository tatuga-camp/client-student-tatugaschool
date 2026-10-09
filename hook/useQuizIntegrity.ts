import { useCallback, useEffect, useRef, useState } from "react";
import { IntegrityEvent, IntegrityEventType } from "../interfaces";
import {
  SendIntegrityBatchService,
  sendIntegrityKeepalive,
} from "../services/quiz";
import {
  createIntegritySender,
  createIntegrityTracker,
  EventQueue,
  isScreenshotKey,
  isTranslatedDocument,
  shouldShowAwayNotice,
} from "../utils/quizIntegrity";

export function useQuizIntegrity(soaId: string, enabled: boolean) {
  const queueRef = useRef(new EventQueue(200));
  const [awayNoticeMs, setAwayNoticeMs] = useState<number | null>(null);

  const report = useCallback((type: IntegrityEventType) => {
    queueRef.current.push([{ type, clientAt: new Date().toISOString() }]);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const queue = queueRef.current;
    // Wall clock on purpose: performance.now() can pause while a phone is suspended,
    // which would undercount exactly the absences we care about.
    const tracker = createIntegrityTracker(
      () => Date.now(),
      () => new Date().toISOString(),
    );
    const sender = createIntegritySender({
      queue,
      send: (batch) => SendIntegrityBatchService(soaId, batch),
      keepalive: (batch) => sendIntegrityKeepalive(soaId, batch),
    });
    const flush = sender.flush;
    const push = (events: IntegrityEvent[]) => queue.push(events);
    const flushKeepalive = () => void sender.flushKeepalive();
    const notice = (awayMs: number | null) => {
      if (shouldShowAwayNotice(awayMs)) setAwayNoticeMs(awayMs);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        push(tracker.onHidden().events);
        flushKeepalive(); // the page may freeze next; send now
      } else {
        const back = tracker.onVisible();
        push(back.events);
        notice(back.awayMs);
        void flush();
      }
    };
    const onBlur = () => push(tracker.onBlur().events);
    const onFocus = () => {
      const back = tracker.onFocus();
      push(back.events);
      notice(back.awayMs);
    };
    const onPageHide = () => {
      push(tracker.onPageHide().events);
      flushKeepalive();
    };
    const onPageShow = () => push(tracker.onPageShow().events);
    const onKey = (e: KeyboardEvent) => {
      if (isScreenshotKey(e)) report("SCREENSHOT_KEY");
    };
    let wasFullscreen = !!document.fullscreenElement;
    const onFullscreen = () => {
      const now = !!document.fullscreenElement;
      if (wasFullscreen && !now) report("FULLSCREEN_EXIT");
      wasFullscreen = now;
    };

    const html = document.documentElement;
    const originalLang = html.lang;
    let translateReported = false;
    const checkTranslate = () => {
      if (
        !translateReported &&
        isTranslatedDocument(
          { className: html.className, lang: html.lang },
          originalLang,
        )
      ) {
        translateReported = true;
        report("TRANSLATE_DETECTED");
      }
    };
    const observer = new MutationObserver(checkTranslate);
    observer.observe(html, {
      attributes: true,
      attributeFilter: ["class", "lang"],
    });
    checkTranslate();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("keyup", onKey); // PrintScreen arrives on keyup on Windows
    window.addEventListener("keydown", onKey); // macOS Cmd+Shift+3/4/5, when the OS lets it through
    document.addEventListener("fullscreenchange", onFullscreen);
    // First heartbeat now, then every 10 s.
    const stopHeartbeat = sender.startHeartbeat(
      (fn, ms) => window.setInterval(fn, ms),
      (handle) => window.clearInterval(handle as number),
    );

    return () => {
      stopHeartbeat();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("keyup", onKey);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFullscreen);
      flushKeepalive();
    };
  }, [soaId, enabled, report]);

  return {
    report,
    awayNoticeMs,
    dismissAwayNotice: () => setAwayNoticeMs(null),
  };
}
