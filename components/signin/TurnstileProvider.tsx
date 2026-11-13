import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LuShieldCheck, LuX } from "react-icons/lu";
import { subjectDataLanguage as t } from "../../data/languages";
import type { ErrorMessages } from "../../interfaces";
import { useGetLanguage } from "../../react-query/language";
import type { SignInCancelled } from "../../utils/signInError";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// How long a sign-in waits for a token. Long enough for a student to answer
// an interactive challenge if Cloudflare asks for one.
const TOKEN_TIMEOUT_MS = 60_000;

// Error codes Turnstile retries by itself after ("challenge timed out",
// "interaction timed out", "iframe load error", and the 300*/600* "generic
// challenge failure" families). A retry can pass, or come back as the
// checkbox, so a waiting sign-in rides these out instead of failing.
// https://developers.cloudflare.com/turnstile/troubleshooting/client-side-errors/error-codes/
const RETRIED_CODE = /^(110600|110620|200500|300\d*|600\d*)$/;

// How many errors in a row a waiting sign-in sits through before giving up.
const MAX_ERRORS_WHILE_WAITING = 3;

// Turnstile's own default is 8s, too long for a student watching a spinner.
const RETRY_INTERVAL_MS = 3_000;

const SCRIPT_BLOCKED = "script-blocked";
const CLOCK_WRONG = "200100";

type Waiter = {
  resolve: (token: string) => void;
  reject: (error: ErrorMessages | SignInCancelled) => void;
  timer: ReturnType<typeof setTimeout>;
};

type TurnstileContextValue = {
  /** Mounts the widget while at least one caller is registered. */
  register: () => () => void;
  /** A fresh single-use token, or undefined when no site key is configured. */
  getToken: () => Promise<string | undefined>;
};

const TurnstileContext = createContext<TurnstileContextValue | null>(null);

/**
 * One Cloudflare Turnstile widget for the whole app, mounted only while a
 * screen that signs students in is on the page. The widget solves in the
 * background, so tapping a name stays a single tap.
 *
 * When Cloudflare does need the student to tick its box, the box is shown in
 * the app's own "Quick check" popup, and only while a sign-in is waiting for
 * it: a challenge that comes up before the student has tapped anything stays
 * out of sight until they do. The widget lives inside that popup the whole
 * time (moving it would re-render it), so the popup is hidden, not unmounted.
 *
 * Tokens are single-use: each getToken() call takes the current token (or
 * waits for the next one) and resets the widget to start solving another,
 * so the "needs password" retry gets its own token.
 */
export function TurnstileProvider({ children }: { children: React.ReactNode }) {
  const lang = useGetLanguage().data ?? "en";
  const [users, setUsers] = useState(0);
  // Cloudflare is showing its checkbox and waiting for a tap.
  const [interactive, setInteractive] = useState(false);
  // Sign-ins waiting for a token; mirrors waiters.current.length.
  const [waiting, setWaiting] = useState(0);
  const widget = useRef<TurnstileInstance>(null);
  const token = useRef<string | null>(null);
  const waiters = useRef<Waiter[]>([]);
  const langRef = useRef(lang);
  langRef.current = lang;

  // Why the widget can't produce a token at all (a code Turnstile doesn't
  // retry, a blocked script, an unsupported browser). Taps fail right away
  // while this is set, instead of hanging for the full timeout.
  const fatal = useRef<string | null>(null);
  // Errors in a row since a sign-in started waiting.
  const errorsWhileWaiting = useRef(0);

  // The code goes in the message so a teacher's screenshot tells us which
  // Turnstile failure a school's PCs are hitting.
  const failure = (code: string): ErrorMessages => ({
    error: t.securityCheckTitle(langRef.current),
    // 200100 is Turnstile refusing a device whose clock is wrong. No
    // checkbox can fix that, so tell the student what will.
    message: `${
      code === CLOCK_WRONG
        ? t.securityCheckClockWrong(langRef.current)
        : t.securityCheckFailed(langRef.current)
    } (${code})`,
    statusCode: 0,
  });

  /** Settles every waiting sign-in with `error`. */
  const rejectWaiters = (error: () => ErrorMessages | SignInCancelled) => {
    for (const w of waiters.current.splice(0)) {
      clearTimeout(w.timer);
      w.reject(error());
    }
    setWaiting(0);
  };

  const failWaiters = (code: string) => rejectWaiters(() => failure(code));

  // A widget that can't produce a token at all fails the sign-in right away
  // instead of after the full timeout.
  const failForGood = (code: string) => {
    fatal.current = code;
    failWaiters(code);
  };

  const handleError = (raw?: unknown) => {
    const code = raw == null || raw === "" ? "unknown" : String(raw);
    console.warn(`[turnstile] error ${code}`);
    token.current = null;
    setInteractive(false);
    if (!RETRIED_CODE.test(code)) {
      failForGood(code);
      return;
    }
    // Turnstile is about to retry. Keep any sign-in waiting: the retry may
    // pass or ask for the checkbox, which opens the popup.
    if (waiters.current.length === 0) return;
    errorsWhileWaiting.current += 1;
    if (errorsWhileWaiting.current >= MAX_ERRORS_WHILE_WAITING) {
      errorsWhileWaiting.current = 0;
      failWaiters(code);
    }
  };

  // The student closed the popup: end the sign-in quietly (callers show no
  // error for this). The challenge stays as it is, for the next tap.
  const cancel = () => rejectWaiters(() => ({ signInCancelled: true }));

  const register = useCallback(() => {
    setUsers((n) => n + 1);
    return () => setUsers((n) => n - 1);
  }, []);

  const mounted = users > 0 && Boolean(SITE_KEY);

  // Unmounting the widget drops its token. Anyone still waiting is left
  // unsettled rather than rejected: the screen that asked has gone, and a
  // rejection would pop an error over whatever page the student moved to.
  useEffect(() => {
    if (mounted) return;
    token.current = null;
    // The next mount renders a new widget; only a blocked script stays so.
    if (fatal.current !== SCRIPT_BLOCKED) fatal.current = null;
    for (const w of waiters.current.splice(0)) clearTimeout(w.timer);
    setWaiting(0);
    setInteractive(false);
  }, [mounted]);

  const getToken = useCallback((): Promise<string | undefined> => {
    // Without a site key (local dev) send no token; the server skips the
    // check outside production.
    if (!SITE_KEY) return Promise.resolve(undefined);
    const ready = token.current;
    if (ready) {
      token.current = null;
      widget.current?.reset();
      return Promise.resolve(ready);
    }
    if (fatal.current) {
      // Start over for the next tap, in case whatever broke has cleared.
      if (fatal.current !== SCRIPT_BLOCKED) widget.current?.reset();
      return Promise.reject(failure(fatal.current));
    }
    return new Promise<string>((resolve, reject) => {
      if (waiters.current.length === 0) errorsWhileWaiting.current = 0;
      const waiter: Waiter = {
        resolve,
        reject,
        timer: setTimeout(() => {
          waiters.current = waiters.current.filter((w) => w !== waiter);
          setWaiting(waiters.current.length);
          widget.current?.reset();
          reject(failure("timeout"));
        }, TOKEN_TIMEOUT_MS),
      };
      waiters.current.push(waiter);
      setWaiting(waiters.current.length);
    });
  }, []);

  const handleSuccess = (next: string) => {
    setInteractive(false);
    fatal.current = null;
    errorsWhileWaiting.current = 0;
    const waiter = waiters.current.shift();
    if (!waiter) {
      token.current = next;
      return;
    }
    setWaiting(waiters.current.length);
    clearTimeout(waiter.timer);
    waiter.resolve(next);
    widget.current?.reset();
  };

  const popupOpen = interactive && waiting > 0;

  useEffect(() => {
    if (!popupOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [popupOpen]);

  const value = useMemo(() => ({ register, getToken }), [register, getToken]);

  return (
    <TurnstileContext.Provider value={value}>
      {children}
      {mounted && (
        // Hidden with opacity, never display:none: the widget has to stay
        // rendered to keep solving in the background.
        <div
          className={`fixed inset-0 z-[1200] flex items-center justify-center p-2 font-Anuphan transition-opacity duration-200 motion-reduce:transition-none ${
            popupOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={popupOpen ? undefined : true}
        >
          <div
            aria-hidden="true"
            onClick={cancel}
            className="absolute inset-0 bg-icon-color/40 backdrop-blur-[2px]"
          />
          <div
            role="dialog"
            aria-modal={popupOpen ? true : undefined}
            aria-labelledby="security-check-title"
            aria-describedby="security-check-body"
            data-testid="security-check-popup"
            className={`chunky relative w-full max-w-[344px] pb-5 pt-6 text-center shadow-xl transition-transform duration-200 motion-reduce:transition-none ${
              popupOpen ? "scale-100" : "scale-95"
            }`}
          >
            <button
              type="button"
              onClick={cancel}
              tabIndex={popupOpen ? 0 : -1}
              aria-label={t.securityCheckCancel(lang)}
              className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full text-lg text-[#7A80A0] transition hover:bg-background-color"
            >
              <LuX aria-hidden />
            </button>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-color/10 text-[28px] text-primary-color">
              <LuShieldCheck aria-hidden />
            </div>
            <h2
              id="security-check-title"
              className="mt-3 px-5 text-xl font-extrabold text-icon-color"
            >
              {t.securityCheckPopupTitle(lang)}
            </h2>
            <p
              id="security-check-body"
              className="mt-1 px-5 text-sm text-[#7A80A0]"
            >
              {t.securityCheckPopupBody(lang)}
            </p>
            {/* Cloudflare's box is 300px wide; the card's margins leave
                exactly that on a 320px phone. */}
            <div className="mt-4 flex min-h-[65px] justify-center">
              <Turnstile
                ref={widget}
                siteKey={SITE_KEY as string}
                // No `language`: Turnstile follows the browser, and passing
                // the app language would re-render the widget once it loads.
                options={{
                  action: "student-sign-in",
                  appearance: "interaction-only",
                  theme: "light",
                  retryInterval: RETRY_INTERVAL_MS,
                }}
                scriptOptions={{ onError: () => failForGood(SCRIPT_BLOCKED) }}
                onBeforeInteractive={() => setInteractive(true)}
                onAfterInteractive={() => setInteractive(false)}
                onSuccess={handleSuccess}
                onExpire={() => {
                  token.current = null;
                }}
                onError={handleError}
                onUnsupported={() => failForGood("unsupported")}
              />
            </div>
            <p className="mt-3 px-5 text-xs text-[#9AA3B8]">
              {t.securityCheckPopupHint(lang)}
            </p>
          </div>
        </div>
      )}
    </TurnstileContext.Provider>
  );
}

/**
 * Keeps the Turnstile widget mounted while the calling screen is, and
 * returns a function that resolves to a fresh token for one sign-in.
 */
export function useTurnstileToken(): () => Promise<string | undefined> {
  const ctx = useContext(TurnstileContext);
  if (!ctx) {
    throw new Error("useTurnstileToken must be used inside TurnstileProvider");
  }
  const { register, getToken } = ctx;
  useEffect(() => register(), [register]);
  return getToken;
}
