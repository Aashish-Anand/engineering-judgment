import type { ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
};

/** Wraps a block that rises into place on scroll. The motion is pure CSS
 *  (see `.reveal` in globals.css), so the content is never hidden. */
export function ScrollReveal({ children, className = "" }: ScrollRevealProps) {
  return <div className={`reveal ${className}`}>{children}</div>;
}
