import { animated, useSpring } from "@react-spring/web";
import { useEffect, useRef, useState } from "react";
import { cleanCodeInput } from "../../utils/joinCode";

type Props = {
  length: 6;
  value: string;
  onChange: (v: string) => void;
  mode: "alnum" | "digits";
  invalid?: boolean;
  shakeKey?: number;
  autoFocus?: boolean;
  ariaLabel: string;
};

const SHAKE = [0, -10, 10, -6, 6, 0];

export function CodeBoxes({
  length,
  value,
  onChange,
  mode,
  invalid,
  shakeKey,
  autoFocus,
  ariaLabel,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [{ x }, api] = useSpring(() => ({ x: 0 }));

  useEffect(() => {
    if (!shakeKey) return;
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    api.start({
      from: { x: 0 },
      to: SHAKE.map((v) => ({ x: v })),
      config: { duration: 300 / SHAKE.length },
    });
  }, [shakeKey, api]);

  useEffect(() => {
    if (autoFocus && window.matchMedia?.("(pointer: fine)").matches) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const active = Math.min(value.length, length - 1);

  return (
    <animated.div
      className="relative flex justify-center gap-2"
      style={{ x }}
      onClick={() => inputRef.current?.focus()}
    >
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(cleanCodeInput(e.target.value, mode))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        inputMode={mode === "digits" ? "numeric" : "text"}
        autoComplete="one-time-code"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        // Room for a pasted teacher link: the code is taken out of it.
        maxLength={200}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        className="absolute inset-0 h-full w-full cursor-text opacity-0"
        style={{ fontSize: 16 }}
      />
      {Array.from({ length }, (_, i) => {
        const isActive = focused && i === active && value.length < length;
        return (
          <div
            key={i}
            aria-hidden
            className="chunky flex h-14 w-11 items-center justify-center text-2xl font-bold text-[#383767]"
            style={{
              borderColor: invalid
                ? "#F04438"
                : isActive
                  ? "#2C7CD1"
                  : undefined,
            }}
          >
            {value[i] ?? (isActive ? <span className="code-caret" /> : null)}
          </div>
        );
      })}
    </animated.div>
  );
}
