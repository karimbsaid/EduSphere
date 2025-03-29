/* eslint-disable react/prop-types */
"use client";

import { FiLoader } from "react-icons/fi";
import { HiCheckCircle, HiCircleStack, HiXCircle } from "react-icons/hi2";

export function ProgressIndicator({
  status,
  label,
  successMessage,
  errorMessage,
  className,
}) {
  return (
    <div className="flex items-center gap-3">
      {status === "idle" && (
        <HiCircleStack className="h-5 w-5 text-muted-foreground" />
      )}

      {status === "loading" && (
        <FiLoader className="h-5 w-5 animate-spin text-primary" />
      )}

      {status === "success" && (
        <HiCheckCircle className="h-5 w-5 text-green-500" />
      )}

      {status === "fail" && <HiXCircle className="h-5 w-5 text-red-500" />}

      <div>
        {status === "idle" && (
          <p className="text-sm text-muted-foreground">{label}</p>
        )}

        {status === "loading" && (
          <p className="text-sm font-medium">{label}...</p>
        )}

        {status === "success" && (
          <p className="text-sm font-medium text-green-500">{label}</p>
        )}

        {status === "error" && (
          <p className="text-sm font-medium text-red-500">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
