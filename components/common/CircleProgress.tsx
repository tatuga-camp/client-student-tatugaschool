import React from "react";

type Props = {
  value: number;
  maxValue: number;
};
function CircleProgress({ value, maxValue }: Props) {
  const strokeDasharray = (value / maxValue) * 75;
  return (
    <div className="relative size-40">
      <svg
        className="rotate-[135deg] size-full"
        viewBox="0 0 36 36"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          className="stroke-current text-gray-200 "
          stroke-width="1.5"
          stroke-dasharray="75 100"
          stroke-linecap="round"
        ></circle>
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          className="stroke-current text-blue-600 "
          stroke-width="1.5"
          stroke-dasharray={`${strokeDasharray} 100`}
          stroke-linecap="round"
        ></circle>
      </svg>

      <div className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <span className="text-4xl font-bold text-blue-600 ">{value}</span>
        <span className="text-blue-600  block">Score</span>
      </div>
    </div>
  );
}

export default CircleProgress;
