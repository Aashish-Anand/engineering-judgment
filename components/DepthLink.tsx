"use client";

import Link from "next/link";
import type { PointerEvent, ReactNode } from "react";
import styles from "./DepthLink.module.css";

type Props = { href: string; children: ReactNode; className?: string; tilt?: number };

export function DepthLink({ href, children, className = "", tilt = 3 }: Props) {
  function trackPointer(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    event.currentTarget.style.setProperty("--depth-x", `${(0.5 - y) * tilt}deg`);
    event.currentTarget.style.setProperty("--depth-y", `${(x - 0.5) * tilt}deg`);
    event.currentTarget.style.setProperty("--light-x", `${x * 100}%`);
    event.currentTarget.style.setProperty("--light-y", `${y * 100}%`);
  }

  function reset(event: PointerEvent<HTMLAnchorElement>) {
    event.currentTarget.style.removeProperty("--depth-x");
    event.currentTarget.style.removeProperty("--depth-y");
    event.currentTarget.style.removeProperty("--light-x");
    event.currentTarget.style.removeProperty("--light-y");
  }

  return <Link href={href} className={`${styles.surface} ${className}`} onPointerMove={trackPointer} onPointerLeave={reset} onPointerCancel={reset}>{children}</Link>;
}
