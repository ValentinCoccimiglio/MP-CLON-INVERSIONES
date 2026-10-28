"use client";
import type { ReactNode } from "react";
import { useDemo } from "./DemoProvider";
export function DemoButton({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const show = useDemo();
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      onClick={() => show(label)}
    >
      {children}
    </button>
  );
}
