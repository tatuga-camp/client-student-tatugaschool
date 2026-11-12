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
import { subjectDataLanguage } from "../../data/languages";
import type { ErrorMessages } from "../../interfaces";
import { useGetLanguage } from "../../react-query/language";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// How long a sign-in waits for a token. Long enough for a student to answer
// an interactive challenge if Cloudflare asks for one.
const TOKEN_TIMEOUT_MS = 60_000;

type Waiter = {
  resolve: (token: string) => void;
  reject: (error: ErrorMessages) => void;
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
 * screen that signs students in is on the page. The widget is invisible
 * unless Cloudflare needs the student to interact, and solves in the
 * background, so tapping a name stays a single tap.
 *
 * Tokens are single-use: each getToken() call takes the current token (or
 * waits for the next one) and resets the widget to start solving another,
 * so the "needs password" retry gets its own token.
 */
export function TurnstileProvider({ children }: { children: React.ReactNode }) {
  const lang = useGetLanguage().data ?? "en";
  const [users, setUsers] = useState(0);
  const widget = useRef<TurnstileInstance>(null);
  const token = useRef<string | null>(null);
  const waiters = useRef<Waiter[]>([]);
  const langRef = useRef(lang);
  langRef.current = lang;

  const failure = (): ErrorMessages => ({
    error: subjectDataLanguage.securityCheckTitle(langRef.current),
    message: subjectDataLanguage.securityCheckFailed(langRef.current),
    statusCode: 0,
  });

  // Fails every sign-in waiting for a token, so a widget that can't produce
  // one (blocked, unsupported browser, script blocked by the network) shows
  // the error right away instead of after the full timeout.
  const failWaiters = () => {
    for (const w of waiters.current.splice(0)) {
      clearTimeout(w.timer);
      w.reject(failure());
    }
  };

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
    for (const w of waiters.current.splice(0)) clearTimeout(w.timer);
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
    return new Promise<string>((resolve, reject) => {
      const waiter: Waiter = {
        resolve,
        reject,
        timer: setTimeout(() => {
          waiters.current = waiters.current.filter((w) => w !== waiter);
          widget.current?.reset();
          reject(failure());
        }, TOKEN_TIMEOUT_MS),
      };
      waiters.current.push(waiter);
    });
  }, []);

  const handleSuccess = (next: string) => {
    const waiter = waiters.current.shift();
    if (!waiter) {
      token.current = next;
      return;
    }
    clearTimeout(waiter.timer);
    waiter.resolve(next);
    widget.current?.reset();
  };

  const value = useMemo(() => ({ register, getToken }), [register, getToken]);

  return (
    <TurnstileContext.Provider value={value}>
      {children}
      {mounted && (
        // Top-centred so a challenge, when Cloudflare shows one, is visible on
        // the phone screen without covering the submit button of a bottom
        // sheet (the password sheet). Empty and click-through otherwise.
        <div
          className="pointer-events-none fixed inset-x-0 z-[1200] flex justify-center px-4"
          style={{ top: "calc(var(--safe-top, 0px) + 12px)" }}
        >
          <div className="pointer-events-auto">
            <Turnstile
              ref={widget}
              siteKey={SITE_KEY as string}
              // No `language`: Turnstile follows the browser, and passing the
              // app language would re-render the widget once it loads.
              options={{
                action: "student-sign-in",
                appearance: "interaction-only",
                theme: "light",
              }}
              scriptOptions={{ onError: failWaiters }}
              onSuccess={handleSuccess}
              onExpire={() => {
                token.current = null;
              }}
              // Turnstile retries by itself after an error, so the next tap
              // can still get a token.
              onError={() => {
                token.current = null;
                failWaiters();
              }}
              onUnsupported={failWaiters}
            />
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
