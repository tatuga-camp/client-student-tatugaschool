import React, { LegacyRef } from "react";
import { FaExclamationCircle } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { subjectDataLanguage } from "../../data/languages";
import { useGetLanguage } from "../../react-query";
import Password from "../common/Password";
import SpinLoading from "../common/SpinLoading";
import { Password as PasswordPrimereact } from "primereact/password";
type Props = {
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  passwordInputRef?: LegacyRef<PasswordPrimereact>;
  isPending: boolean;
  /** Inline error shown under the password field (e.g. wrong password). */
  errorMessage?: string | null;
  /** Called when the student edits the password, so the parent can clear the error. */
  onPasswordChange?: () => void;
};
function SignInStudentForm({
  onSubmit,
  onClose,
  passwordInputRef,
  isPending,
  errorMessage,
  onPasswordChange,
}: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const hasError = Boolean(errorMessage);
  return (
    <form
      onSubmit={onSubmit}
      className="relative flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 font-Anuphan text-black shadow-[0_12px_24px_rgba(145,158,171,0.12)] sm:p-6"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={() => onClose()}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
      >
        <IoMdClose />
      </button>
      <div className="pr-8">
        <h2 className="text-lg font-semibold text-icon-color">
          {subjectDataLanguage.password(lang)}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {subjectDataLanguage.passwordDescription(lang)}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Password
          inputRef={passwordInputRef}
          toggleMask
          required={true}
          name="password"
          feedback={false}
          invalid={hasError}
          ariaDescribedBy={hasError ? "student-password-error" : undefined}
          onChange={() => onPasswordChange?.()}
        />
        {hasError && (
          <p
            id="student-password-error"
            role="alert"
            className="flex items-start gap-1.5 text-sm text-error-color"
          >
            <FaExclamationCircle
              aria-hidden
              className="mt-0.5 shrink-0 text-base"
            />
            <span>{errorMessage}</span>
          </p>
        )}
      </div>
      <button
        disabled={isPending}
        type="submit"
        className="main-button flex min-h-11 w-full items-center justify-center disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
      >
        {isPending ? <SpinLoading /> : subjectDataLanguage.passwordButton(lang)}
      </button>

      <p className="text-center text-xs text-gray-500">
        {subjectDataLanguage.forgetPassword(lang)}
      </p>
    </form>
  );
}

export default SignInStudentForm;
