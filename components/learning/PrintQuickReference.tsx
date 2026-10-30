"use client";

import styles from "./Learning.module.css";

/** Prints only the quick-reference card by flagging the body for the print stylesheet. */
export function PrintQuickReference() {
  function print() {
    document.body.dataset.print = "quick-reference";
    window.addEventListener("afterprint", () => { delete document.body.dataset.print; }, { once: true });
    window.print();
  }
  return <button type="button" className={styles.printButton} onClick={print}>Print this card</button>;
}
