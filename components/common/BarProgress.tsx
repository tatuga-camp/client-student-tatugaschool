import React from "react";

type Props = {
  value: number;
  maxValue: number;
};
function BarProgress({ value, maxValue }: Props) {
  const percentage = (value / maxValue) * 100;
  return (
    <div>
      <div
        style={{
          marginInlineStart: `calc( ${percentage}% - 1.25rem)`,
        }}
        className="mb-2 inline-block rounded-2xl border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-600"
      >
        {value.toFixed(2)}
      </div>
      <div
        className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={maxValue}
      >
        <div
          className="flex flex-col justify-center overflow-hidden whitespace-nowrap rounded-full bg-blue-600 text-center text-xs text-white transition duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

export default BarProgress;
