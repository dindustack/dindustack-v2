import FooterMotion from "./FooterMotion";

const EMAIL = "contact@dindustack.com";

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/dindustack" },
  { label: "Github", href: "https://github.com/dindustack" },
  { label: "Twitter (X)", href: "https://x.com/dindustack" },
  { label: "Dribbble", href: "https://dribbble.com/dindustack" },
];

/** Scalloped seal drawn to match the design's separator. */
const SEAL = Array.from({ length: 24 }, (_, i) => {
  const r = i % 2 === 0 ? 50 : 42;
  const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
  return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
}).join(" ");

function Seal() {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      className="h-[0.37em] w-[0.37em] shrink-0 fill-umber"
    >
      <polygon points={SEAL} />
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
