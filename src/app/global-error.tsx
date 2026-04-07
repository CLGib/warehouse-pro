"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
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
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16 text-foreground">
          <h1 className="text-lg font-semibold">Application error</h1>
          <p className="mt-2 max-w-md text-center text-sm text-muted">
            {error.message || "A critical error occurred. Please refresh the page."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
