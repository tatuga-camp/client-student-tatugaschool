import React, { HTMLInputTypeAttribute, memo } from "react";
import { SiGoogleclassroom } from "react-icons/si";

type Props = {
  icon: React.ReactNode;
  placeholder: string;
  maxLength?: number;
  minLength?: number;
  type?: HTMLInputTypeAttribute;
  title?: string;
  height?: number;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};
function InputWithIcon({
  icon,
  placeholder,
  maxLength = 199,
  minLength = 5,
  type,
  title,
  value,
  height = 40,
  onChange,
  required,
}: Props) {
  return (
    <label className="flex w-full flex-col gap-1">
      {title && <span className="text-sm font-normal">{title}</span>}{" "}
      <div
        style={{ height: `${height}px` }}
        className="flex w-full focus:ring-2 group  items-center justify-center"
      >
        <div
          className="h-full w-10 rounded-l-md
        group-hover:border-blue-500 
        flex items-center justify-center border border-r-0"
        >
          {icon}
        </div>
        <input
          style={{ height: `${height}px` }}
          required={required}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="outline-none  group-hover:border-blue-500 rounded-md  border grow rounded-l-none border-l-0"
          placeholder={placeholder}
          maxLength={maxLength}
          minLength={minLength}
        />
      </div>
    </label>
  );
}

export default memo(InputWithIcon);
