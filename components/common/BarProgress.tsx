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
        className="inline-block mb-2  py-0.5 px-1.5
       bg-blue-50 border border-blue-200 text-xs font-medium text-blue-600 rounded-lg "
      >
        {value.toFixed(2)}
      </div>
      <div
        className="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden "
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={maxValue}
      >
        <div
          className="flex flex-col justify-center rounded-full overflow-hidden
           bg-blue-600 text-xs text-white text-center whitespace-nowrap transition duration-500 "
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

export default BarProgress;
