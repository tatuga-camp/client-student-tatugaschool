import { useEffect, useRef, useState } from "react";
import { LuEye, LuEyeOff, LuLock } from "react-icons/lu";
import { subjectDataLanguage as t } from "../../data/languages";
import { useGetLanguage } from "../../react-query";
import { mascotForStudent } from "../../utils/mascot";
import { Sheet } from "../app/Sheet";
import { SignInSheetHeader } from "./SignInSheetHeader";

type Props = {
  open: boolean;
  /** `id` is the enrolment id (it picks the mascot, as in the grid). */
  student: {
    id: string;
    studentId: string;
    firstName: string;
    photo: string;
  } | null;
  error: string | null;
  /** Changes on every failed attempt; refocuses the field. */
  errorKey: number;
  pending: boolean;
  /** The password was edited; the parent clears its error. */
  onEdit: () => void;
  onSubmit: (password: string) => void;
  onClose: () => void;
};

// Let the sheet finish sliding in before the keyboard opens.
const FOCUS_DELAY_MS = 350;

export function PasswordSheet({
  open,
  student,
  error,
  errorKey,
  pending,
  onEdit,
  onSubmit,
  onClose,
}: Props) {
  const lang = useGetLanguage().data ?? "en";
  const [password, setPassword] = useState("");
  const [shown, setShown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setShown(false);
      return;
    }
    const id = setTimeout(() => inputRef.current?.focus(), FOCUS_DELAY_MS);
    return () => clearTimeout(id);
  }, [open]);

  // After a wrong password, put the cursor back in the field.
  useEffect(() => {
    if (errorKey > 0) inputRef.current?.focus();
  }, [errorKey]);

  const title = student ? t.heyName(lang, student.firstName) : "";
  return (
    <Sheet open={open} onClose={onClose} ariaLabel={title || t.password(lang)}>
      {student && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (password && !pending) onSubmit(password);
          }}
        >
          <SignInSheetHeader
            clips={mascotForStudent(student)}
            mascotId={`password-${student.id}`}
            title={title}
            subtitle={t.passwordPrompt(lang)}
          />
          <label
            className="chunky mt-4 flex items-center gap-2 px-3 focus-within:border-[#2C7CD1]"
            style={error ? { borderColor: "#F04438" } : undefined}
          >
            <LuLock aria-hidden className="shrink-0 text-[#9AA3B8]" />
            <input
              ref={inputRef}
              name="password"
              type={shown ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) onEdit();
              }}
              autoComplete="current-password"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder={t.password(lang)}
              aria-label={t.password(lang)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "password-error" : undefined}
              className="min-h-12 w-full bg-transparent text-[#383767] outline-none placeholder:text-[#9AA3B8]"
              style={{ fontSize: 16 }}
            />
            <button
              type="button"
              onClick={() => setShown((v) => !v)}
              aria-label={shown ? t.hidePassword(lang) : t.showPassword(lang)}
              aria-pressed={shown}
              className="flex h-11 w-11 shrink-0 items-center justify-center text-[#7A80A0]"
            >
              {shown ? <LuEyeOff aria-hidden /> : <LuEye aria-hidden />}
            </button>
          </label>
          <p
            id="password-error"
            role="alert"
            className="mt-2 min-h-[20px] text-sm font-semibold text-[#F04438]"
          >
            {error ?? ""}
          </p>
          <button
            type="submit"
            disabled={!password || pending}
            className="chunky-btn mt-2 w-full disabled:opacity-50"
          >
            {t.signInButton(lang)}
          </button>
          <p className="mt-3 text-center text-xs text-[#7A80A0]">
            {t.forgotPassword(lang)}
          </p>
        </form>
      )}
    </Sheet>
  );
}
