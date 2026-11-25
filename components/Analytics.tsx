import Script from "next/script";

/**
 * Google Analytics 4. Loads only when NEXT_PUBLIC_GA_ID is set (in
 * .env.local for testing, in Vercel's Environment Variables for the live
 * site), so local development sends nothing by default.
 *
 * Page views on client-side navigation are recorded by GA4 itself: its
 * enhanced measurement listens for browser history changes, which is how
 * Next.js moves between pages.
 *
 * Loaded after the page is interactive, so it does not affect load speed.
 */
export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');`}
      </Script>
    </>
  );
}
