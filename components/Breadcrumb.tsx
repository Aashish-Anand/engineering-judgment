import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 font-hand text-base sm:text-lg text-[#6B7280] mb-4" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-[#171717]/40 select-none">/</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="text-[#4B5563] hover:text-[#171717] hover:underline decoration-1 underline-offset-2 transition-colors no-underline font-semibold"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[#171717] font-bold">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
