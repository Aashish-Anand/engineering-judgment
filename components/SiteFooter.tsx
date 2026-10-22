import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner page-shell">
      <div><Link href="/" className="footer-brand">Engineering Judgment<span aria-hidden="true">.</span></Link><p>A field guide to architecture under pressure.</p></div>
      <nav aria-label="Footer navigation"><Link href="/library">Library</Link><Link href="/#labs">Workbench</Link><Link href="/#about">About</Link><a href="#top">Back to top ↑</a></nav>
      </div>
    </footer>
  );
}
