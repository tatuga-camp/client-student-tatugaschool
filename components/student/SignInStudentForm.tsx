import React, { LegacyRef } from "react";
import { IoMdClose } from "react-icons/io";
import { subjectDataLanguage } from "../../data/language";
import { useGetLanguage } from "../../react-query";
import Password from "../common/Password";
import SpinLoading from "../common/SpinLoading";
import { Password as PasswordPrimereact } from "primereact/password";
type Props = {
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  passwordInputRef?: LegacyRef<PasswordPrimereact>;
  isPending: boolean;
};
function SignInStudentForm({
  onSubmit,
  onClose,
  passwordInputRef,
  isPending,
}: Props) {
  const language = useGetLanguage();
  return (
    <form
      onSubmit={onSubmit}
      className="relative flex h-max w-96 flex-col items-center justify-center gap-2 rounded-2xl border bg-white p-3 py-10"
    >
      <button
        type="button"
        onClick={() => onClose()}
        className="absolute right-2 top-2 m-auto flex h-6 w-6 items-center justify-center rounded text-lg font-semibold hover:bg-gray-300/50"
      >
        <IoMdClose />
      </button>
      <h1 className="text-lg font-semibold">
        {subjectDataLanguage.password(language.data ?? "en")}
      </h1>
      <Password
        inputRef={passwordInputRef}
        toggleMask
        required={true}
        name="password"
        feedback={false}
      />
      <button
        disabled={isPending}
        type="submit"
        className="main-button flex h-10 w-80 items-center justify-center"
      >
        {isPending ? (
          <SpinLoading />
        ) : (
          subjectDataLanguage.passwordButton(language.data ?? "en")
        )}
      </button>

      <p className="text-xs text-gray-500">
        {subjectDataLanguage.forgetPassword(language.data ?? "en")}
      </p>
    </form>
  );
}

export default SignInStudentForm;
