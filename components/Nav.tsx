import Link from "next/link";
import Logo from "./Logo";
import NavMotion from "./NavMotion";

/** Hover and keyboard focus grow each item slightly. */
const HOVER =
  "inline-block transition-transform duration-300 ease-out hover:scale-110 focus-visible:scale-110";

/**
 * The nav is ink over blush sections and white over ink ones. NavMotion
 * watches which section is under it (each carries data-surface) and sets
 * data-tone on the header. Real colours rather than a blend, so contrast is
 * what it looks like, for people and for accessibility checkers alike.
 */
export default function Nav() {
  return (
    <NavMotion>
      <header
        data-nav-header
        data-tone="ink"
        className="page-gutter fixed inset-x-0 top-0 z-50 text-ink transition-colors duration-300 data-[tone=white]:text-white"
      >
        <div className="flex items-start justify-between">
          <Link
            href="/"
            aria-label="dindustack, home"
            data-nav="logo"
            data-intro
            className="group pt-5"
          >
            <span className="block origin-left transition-transform duration-300 ease-out group-hover:scale-110 group-focus-visible:scale-110">
              <Logo />
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
    </NavMotion>
  );
}
