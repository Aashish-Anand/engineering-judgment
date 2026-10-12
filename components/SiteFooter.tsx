export function SiteFooter() {
  return (
    <footer className="w-full pt-12 pb-14 px-6 border-t border-slate-200/80 bg-white/40">
      <div className="wide-width mx-auto">
        <div className="flex flex-col items-center justify-center text-center py-4 select-none">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-sm mb-4">
            ⚡
          </div>

          <h3 className="font-sans text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Better models. Better decisions.
          </h3>

          <p className="font-sans text-sm sm:text-base text-slate-600 mb-3 max-w-md">
            Not just what to build, but how to reason through trade-offs under high production pressure.
          </p>

          <p className="font-sans text-xs sm:text-sm font-medium text-slate-500 italic mb-5">
            &ldquo;Better systems start with better questions.&rdquo;
          </p>

          <div className="text-xs font-mono text-slate-400">
            Engineering Judgment · Architecture Under Pressure
          </div>
        </div>
      </div>
    </footer>
  );
}
