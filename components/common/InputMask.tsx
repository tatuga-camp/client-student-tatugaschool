import React from "react";
import {
  InputMask as InputMaskPrimeReact,
  InputMaskProps,
} from "primereact/inputmask";
import { classNames } from "primereact/utils";

function InputMask(propsInput: InputMaskProps) {
  return (
    <InputMaskPrimeReact
      {...propsInput}
      className=""
      pt={{
        root: (props) => ({
          className: classNames(
            "m-0",
            `main-input text-gray-700 ${propsInput.className}`,
            {
              "focus:outline-none focus:outline-offset-0 focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)] ":
                !props?.context.disabled,
              "hover:border-blue-500":
                !props?.props.invalid && !props?.context.disabled,
              "opacity-60 select-none pointer-events-none cursor-default":
                props?.context.disabled,
              "border-gray-300 ": !props?.props.invalid,
              "border-red-500 hover:border-red-500/80 focus:border-red-500":
                props?.props.invalid && !props?.context.disabled,
              "border-red-500/50":
                props?.props.invalid && props?.context.disabled,
            },
            {
              "text-lg px-4 py-4": props?.props.size === "large",
              "text-xs px-2 py-2": props?.props.size === "small",
              "p-3 text-base":
                !props?.props.size || typeof props?.props.size === "number",
            },
            {
              "pl-8": (props?.context as any).iconPosition === "left",
              "pr-8": (props?.props as any).iconPosition === "right",
            }
          ),
        }),
      }}
    />
  );
}

export default InputMask;
