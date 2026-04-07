"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getBriefUrlSnapshot() {
  return typeof window !== "undefined"
    ? `${window.location.origin}/present`
    : "";
}

function getServerBriefUrlSnapshot() {
  return "";
}

export function BriefCallout() {
  const fullUrl = useSyncExternalStore(
    subscribe,
    getBriefUrlSnapshot,
    getServerBriefUrlSnapshot,
  );

  return (
    <div className="rounded-xl border border-accent/35 bg-accent/10 px-4 py-4 sm:px-5">
      <p className="text-sm font-semibold text-foreground">
        Port-adjacent context brief
      </p>
      <p className="mt-2 text-sm text-muted">
        Open the general-cargo warehouse capability page (not the GitHub template
        blurb below).
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          href="/login"
          className="inline-flex w-fit items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
        >
          Create your free account
        </Link>
        <Link
          href="/present"
          className="inline-flex w-fit items-center justify-center rounded-lg border border-foreground/20 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-foreground/5"
        >
          Capability brief
        </Link>
        <Link
          href="/operator"
          className="inline-flex w-fit items-center justify-center rounded-lg border border-foreground/20 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-foreground/5"
        >
          Operator playbook
        </Link>
        <a
          href="/present"
          className="inline-flex w-fit items-center justify-center rounded-lg border border-foreground/20 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-foreground/5"
        >
          Brief (plain anchor)
        </a>
      </div>
      {fullUrl !== "" ? (
        <p className="mt-3 break-all font-mono text-xs text-muted">
          Or paste: {fullUrl}
        </p>
      ) : null}
    </div>
  );
}
