import Link from "next/link";
import Logo from "./Logo";
import NavMotion from "./NavMotion";

/** Hover and keyboard focus grow each item slightly. */
const HOVER =
  "inline-block transition-transform duration-300 ease-out hover:scale-110 focus-visible:scale-110";

/** The logo's box, shared by both layers so the two halves line up. */
const LOGO_BOX = "pt-5";

export default function Nav() {
  return (
    <NavMotion>
      {/* Blended layer: flips between black and white against the page. */}
      <header className="page-gutter fixed inset-x-0 top-0 z-50 text-white mix-blend-difference">
        <div className="flex items-start justify-between">
          <Link
            href="/"
            aria-label="dindustack, home"
            data-nav="logo"
            data-intro
            className={`group ${LOGO_BOX}`}
          >
            <span data-nav-logo-scale className="block origin-left transition-transform duration-300 ease-out group-hover:scale-110 group-focus-visible:scale-110">
              <Logo part="letters" />
            </span>
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
        </div>
      </header>

      {/*
        Unblended layer for the logo's yellow bars, laid exactly over the
        letters. A blend would turn the yellow blue on the blush pages. It
        copies the logo's entrance and hover (see globals.css) and ignores
        the pointer, so the link underneath still gets every click.
      */}
      <div
        aria-hidden
        className="page-gutter pointer-events-none fixed inset-x-0 top-0 z-50"
      >
        <div data-nav="logo" data-intro className={`w-max ${LOGO_BOX}`}>
          <span data-nav-bars-scale className="block origin-left transition-transform duration-300 ease-out">
            <Logo part="bars" />
          </span>
        </div>
      </div>
    </NavMotion>
  );
}
