import type { Metadata } from "next";
import { Marcellus, Gentium_Book_Plus, Inter } from "next/font/google";
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
  variable: "--font-gentium",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chinwendu Agbaetuo",
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
      className={`${marcellus.variable} ${gentium.variable} ${inter.variable}`}
    >
      <body className="bg-blush text-ink antialiased" suppressHydrationWarning>
        <Nav />
        <PageTransition />
        <SmoothScroller>
          {children}
          <Footer />
        </SmoothScroller>
      </body>
      <PrismicPreview repositoryName={repositoryName} />
    </html>
  );
}
