import { ProgressSpinner } from "primereact/progressspinner";
import React from "react";

type Props = {
  width?: string;
};
function LoadingSpinner({ width = "20px" }: Props) {
  return (
    <ProgressSpinner
      animationDuration="1s"
      style={{ width: width, height: width }}
      strokeWidth="8"
    />
  );
}

export default LoadingSpinner;
