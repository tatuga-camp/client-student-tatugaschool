import { ProgressSpinner } from "primereact/progressspinner";
import React from "react";

function SpinLoading() {
  return (
    <ProgressSpinner
      style={{ width: "20px", height: "20px" }}
      strokeWidth="8"
      animationDuration=".5s"
    />
  );
}

export default SpinLoading;
