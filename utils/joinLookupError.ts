import { SUBJECT_ARCHIVED_CODE } from "./subjectArchived";

/**
 * What a failed `GET /v1/subjects/code/:code` throws. Keeps the server body's
 * `statusCode` / `message` / `code` keys (other helpers read those) and adds
 * `reason` so a "not found" can be told from a request that never got an
 * answer. A non-JSON body (a firewall or challenge page) keeps its status and
 * says so instead of becoming a bare string.
 */
export type LookupError = {
  statusCode: number | null;
  message: string | null;
  code?: string;
  reason: "http" | "network" | "timeout" | "cancelled" | "unknown";
};

type AxiosLike = {
  code?: unknown;
  message?: unknown;
  response?: { status?: unknown; data?: unknown; statusText?: unknown };
};

export function lookupErrorFromAxios(error: unknown): LookupError {
  const e = (error ?? {}) as AxiosLike;
  const status = e.response?.status;
  if (typeof status === "number") {
    const data = e.response?.data;
    if (data && typeof data === "object") {
      const body = data as { message?: unknown; code?: unknown };
      return {
        statusCode: status,
        message: typeof body.message === "string" ? body.message : null,
        ...(typeof body.code === "string" ? { code: body.code } : {}),
        reason: "http",
      };
    }
    const text = typeof e.response?.statusText === "string" ? e.response.statusText : "";
    return {
      statusCode: status,
      message: `non-JSON response${text ? ` (${text})` : ""}`,
      reason: "http",
    };
  }
  const code = typeof e.code === "string" ? e.code : "";
  const reason: LookupError["reason"] =
    code === "ECONNABORTED" || code === "ETIMEDOUT"
      ? "timeout"
      : code === "ERR_CANCELED"
        ? "cancelled"
        : code === "ERR_NETWORK"
          ? "network"
          : "unknown";
  return {
    statusCode: null,
    message:
      code || (typeof e.message === "string" && e.message ? e.message : null),
    reason,
  };
}

export type JoinFailure = {
  kind: "not-found" | "archived" | "failed";
  /** One line for a screenshot: status, reason, the code tried, the time. */
  detail: string;
};

const MAX_MESSAGE = 60;

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** "HH:MM DD/MM" in the device's local time. */
export function stampOf(now: Date): string {
  return `${pad(now.getHours())}:${pad(now.getMinutes())} ${pad(
    now.getDate(),
  )}/${pad(now.getMonth() + 1)}`;
}

/**
 * Turn a lookup failure into what the welcome page shows. Only a real 404
 * (or a 400, which is a malformed code) is "not found"; anything else is a
 * failed request, and the detail line says what came back so a screenshot
 * is enough to diagnose it.
 */
export function describeJoinFailure(
  error: unknown,
  code: string,
  now: Date,
): JoinFailure {
  const e = (error ?? {}) as Partial<LookupError>;
  const status = typeof e.statusCode === "number" ? e.statusCode : null;
  const kind: JoinFailure["kind"] =
    status === 403 && e.code === SUBJECT_ARCHIVED_CODE
      ? "archived"
      : status === 404 || status === 400
        ? "not-found"
        : "failed";

  const parts: string[] = [];
  if (status !== null) parts.push(`HTTP ${status}`);
  else parts.push(e.reason === "timeout" ? "timeout" : "no response");
  const message = typeof e.message === "string" ? e.message.trim() : "";
  if (message && kind === "failed") {
    parts.push(
      message.length > MAX_MESSAGE
        ? `${message.slice(0, MAX_MESSAGE - 1)}…`
        : message,
    );
  }
  parts.push(`code ${code.toUpperCase()}`);
  parts.push(stampOf(now));
  return { kind, detail: parts.join(" · ") };
}
