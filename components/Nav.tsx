import Link from "next/link";
import NavMotion from "./NavMotion";

/** Hover grows each link slightly; origin set so it grows in place. */
const HOVER =
  "inline-block transition-transform duration-300 ease-out hover:scale-110 focus-visible:scale-110";

export default function Nav() {
  return (
    <header className="page-gutter fixed inset-x-0 top-0 z-50 text-white mix-blend-difference">
      <NavMotion>
        <Link
          href="/"
          data-nav="logo"
          data-intro
          className={`font-mark pt-4.5 text-[15px] font-black leading-6 tracking-[-0.07em] origin-left ${HOVER}`}
        >
          D.S
        </Link>

        <nav
          data-nav="links"
          data-intro
          className="font-display flex w-33.5 justify-between pt-6 text-[16px] uppercase tracking-nav"
        >
          <Link href="/works" className={HOVER}>
            works
          </Link>
          <Link href="/about" className={HOVER}>
            about
          </Link>
        </nav>
      </NavMotion>
    </header>
  );
}
