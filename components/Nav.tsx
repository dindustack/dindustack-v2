import Link from "next/link";

export default function Nav() {
  return (
    <header className="page-gutter fixed inset-x-0 top-0 z-50 text-white mix-blend-difference">
      <div className="flex items-start justify-between">
        <Link
          href="/"
          className="font-mark pt-4.5 text-[15px] font-black leading-6 tracking-[-0.07em]"
        >
          D.S
        </Link>

        <nav className="font-display flex w-33.5 justify-between pt-6 text-[16px] uppercase tracking-nav">
          <Link href="/works" className="hover:opacity-60">
            works
          </Link>
          <Link href="/about" className="hover:opacity-60">
            about
          </Link>
        </nav>
      </div>
    </header>
  );
}
