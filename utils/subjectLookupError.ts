import { SUBJECT_ARCHIVED_CODE } from "./subjectArchived";

export type SubjectLookupErrorProps = {
  statusCode: number | null;
  message: string | null;
  /** Only "SUBJECT_ARCHIVED" is passed on; the key is absent otherwise
   *  (Next.js props can't hold `undefined`). */
  code?: typeof SUBJECT_ARCHIVED_CODE;
};

/**
 * The join page's server-side subject lookup failed: turn the thrown body
 * into page props. A 400 (malformed code) is a class that doesn't exist; an
 * archived subject keeps its code so the page can say it is archived.
 */
export function errorPropsFromLookup(error: unknown): SubjectLookupErrorProps {
  const e = (error ?? {}) as {
    statusCode?: unknown;
    message?: unknown;
    code?: unknown;
  };
  if (e.statusCode === 400) return { statusCode: 404, message: null };
  const statusCode = typeof e.statusCode === "number" ? e.statusCode : null;
  return {
    statusCode,
    // Only a real HTTP answer carries a message worth showing.
    message:
      statusCode !== null && typeof e.message === "string" ? e.message : null,
    ...(e.code === SUBJECT_ARCHIVED_CODE
      ? { code: SUBJECT_ARCHIVED_CODE }
      : {}),
  };
}
