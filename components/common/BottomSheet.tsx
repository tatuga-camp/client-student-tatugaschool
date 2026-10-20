import React, { useEffect, useId } from "react";

type Props = {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: React.ReactNode;
};

function BottomSheet({ title, closeLabel, onClose, children }: Props) {
  const titleId = useId();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-end justify-center font-Anuphan"
    >
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/30"
      />
      <div className="relative z-10 mb-4 w-[98%] max-w-md rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <h2 id={titleId} className="mb-3 text-base font-medium">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

export default BottomSheet;
