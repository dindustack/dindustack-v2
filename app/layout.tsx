import type { Metadata } from "next";
import { Marcellus, Gentium_Book_Plus, Merriweather } from "next/font/google";
import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "@/prismicio";
import SmoothScroller from "@/components/SmoothScroller";
import Nav from "@/components/Nav";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import "./globals.css";

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marcellus",
  display: "swap",
});

const gentium = Gentium_Book_Plus({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-gentium",
  display: "swap",
});

// Only the light italic: it sets the service keywords in the About page's
// "What i do" sentence and nothing else.
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: "300",
  style: "italic",
  variable: "--font-merriweather",
  // Used on the About page only, so not preloaded on every page.
  preload: false,
  display: "swap",
});


export const metadata: Metadata = {
  // Each page sets its own title; this adds the name after it.
  title: { default: "Chinwendu Agbaetuo", template: "%s | Chinwendu Agbaetuo" },
  description: "Creative developer in Texas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${marcellus.variable} ${gentium.variable} ${merriweather.variable}`}
    >
      <body className="bg-blush text-ink antialiased" suppressHydrationWarning>
        {/* First stop for keyboard users: jumps past the nav. Hidden until
            it receives focus. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Nav />
        <PageTransition />
        <SmoothScroller>
          {/* One wrapper around every page, so the footer can move the page
              as it rises without touching any pinned section inside. */}
          <main id="main" data-page tabIndex={-1} className="focus:outline-none">
            {children}
          </main>
          <Footer />
        </SmoothScroller>
      </body>
      <PrismicPreview repositoryName={repositoryName} />
    </html>
  );
}
