"use client";

import { useEffect, useState } from "react";

/**
 * A floating "back to top" button that appears after scrolling past the first screen.
 * Styled to match the notebook aesthetic — ink border, stamp shadow, Shantell Sans.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-white border-[1.5px] border-[#171717] shadow-[2px_2px_0px_#171717] flex items-center justify-center text-lg font-hand font-bold text-[#171717] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#171717] active:translate-y-0 active:shadow-[1px_1px_0px_#171717] transition-all duration-150 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}
