import Link from "next/link";

export default function NotFound() {
  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="prose-width mx-auto text-center">
        <span className="font-hand text-lg font-bold text-[#DC2626]">404 · Missing notebook page</span>
        <h1 className="mt-3 font-hand text-4xl sm:text-5xl font-bold text-[#171717]">
          This problem hasn&apos;t been written yet.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base sm:text-lg">
          The route may be incorrect, or the topic may still be waiting on the whiteboard.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/" className="doodle-btn bg-[#FFF0B8]">
            Return to the notebook
          </Link>
          <Link
            href="/#problems"
            className="font-hand text-lg font-bold text-[#171717] underline decoration-2 underline-offset-4 hover:text-[#DC2626]"
          >
            Browse available problems →
          </Link>
        </div>
      </div>
    </section>
  );
}
