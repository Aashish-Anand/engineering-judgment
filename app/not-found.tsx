import Link from "next/link";

export default function NotFound() {
  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="prose-width mx-auto text-center">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
          404 · Topic Not Found
        </span>
        <h1 className="mt-4 font-sans text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          This architectural scenario hasn&apos;t been published yet.
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-sans text-sm sm:text-base text-slate-600 leading-relaxed">
          The requested route doesn&apos;t match an active production blueprint. Check our catalog of real-world bottlenecks below.
        </p>
        <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
          <Link
            href="/"
            className="font-sans text-xs sm:text-sm font-bold py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors no-underline"
          >
            Return to Homepage
          </Link>
          <Link
            href="/#problems"
            className="font-sans text-xs sm:text-sm font-semibold py-2.5 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg shadow-xs transition-colors no-underline"
          >
            Browse Production Scenarios →
          </Link>
        </div>
      </div>
    </section>
  );
}
