"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16">
      <h1 className="text-lg font-semibold text-foreground">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-center text-sm text-muted">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
