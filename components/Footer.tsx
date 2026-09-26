import FooterMotion from "./FooterMotion";

const EMAIL = "contact@dindustack.com";

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/dindustack" },
  { label: "Github", href: "https://github.com/dindustack" },
  { label: "Twitter (X)", href: "https://x.com/dindustack" },
  { label: "Dribbble", href: "https://dribbble.com/dindustack" },
];

/**
 * The seal from Figma (public/icons/seal.svg), inlined so its colour comes
 * from the umber token. Sized to the design: 48px against 156px type.
 */
function Seal() {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden
      className="h-[0.31em] w-[0.31em] shrink-0 fill-umber"
    >
      <path d="M20.6065 2.04656C21.743 -0.682066 25.6085 -0.682065 26.7451 2.04656C27.5836 4.0597 30.1005 4.7341 31.8333 3.40994C34.1819 1.61515 37.5295 3.54791 37.1495 6.47924C36.8691 8.64193 38.7116 10.4844 40.8743 10.2041C43.8056 9.82401 45.7384 13.1717 43.9436 15.5202C42.6194 17.253 43.2938 19.7699 45.307 20.6084C48.0356 21.745 48.0356 25.6105 45.307 26.747C43.2938 27.5856 42.6194 30.1025 43.9436 31.8352C45.7384 34.1838 43.8056 37.5315 40.8743 37.1514C38.7116 36.871 36.8691 38.7135 37.1495 40.8762C37.5295 43.8076 34.1819 45.7403 31.8333 43.9455C30.1005 42.6214 27.5836 43.2958 26.7451 45.3089C25.6085 48.0375 21.743 48.0375 20.6065 45.3089C19.768 43.2958 17.251 42.6214 15.5183 43.9455C13.1697 45.7403 9.82206 43.8076 10.2021 40.8762C10.4825 38.7135 8.63998 36.871 6.47729 37.1514C3.54596 37.5315 1.61319 34.1838 3.40798 31.8352C4.73215 30.1025 4.05775 27.5856 2.04461 26.747C-0.684019 25.6105 -0.684019 21.745 2.04461 20.6084C4.05775 19.7699 4.73215 17.253 3.40798 15.5202C1.61319 13.1717 3.54596 9.82401 6.47729 10.2041C8.63998 10.4844 10.4825 8.64193 10.2021 6.47924C9.82206 3.54791 13.1697 1.61515 15.5183 3.40994C17.251 4.7341 19.768 4.0597 20.6065 2.04656Z" />
    </svg>
  );
}

/** One run of the marquee. Two identical runs make the loop seamless. */
function Run() {
  return (
    <div className="flex shrink-0 items-center">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex shrink-0 items-center gap-[0.2em] pr-[0.2em]">
          <span className="whitespace-nowrap">{EMAIL}</span>
          <Seal />
        </div>
      ))}
    </div>
  );
}

export default function Footer() {
  return (
    <FooterMotion>
      <footer
        data-surface="blush"
        className="relative z-10 flex min-h-svh flex-col justify-between overflow-hidden bg-blush pb-7.5 pt-[20svh] text-ink shadow-[0_-24px_60px_rgba(21,9,8,0.08)]"
      >
        <p className="page-gutter text-[clamp(32px,3.47vw,60px)] leading-none tracking-[-0.05em]">
          Let&rsquo;s make great work together
        </p>

        <a
          href={`mailto:${EMAIL}`}
          aria-label={`Email ${EMAIL}`}
          className="font-display block py-10 text-[max(64px,9.05vw)] leading-none tracking-hero text-black/80 transition-colors hover:text-black"
        >
          <span className="flex w-max animate-marquee motion-reduce:animate-none">
            <Run />
            <Run />
          </span>
        </a>

        <div className="page-gutter flex flex-col-reverse gap-4 text-[clamp(18px,1.39vw,24px)] tracking-[-0.05em] sm:flex-row sm:items-end sm:justify-between">
          <p>&copy;{new Date().getFullYear()}. All Rights Reserved</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-opacity hover:opacity-60"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </FooterMotion>
  );
}
