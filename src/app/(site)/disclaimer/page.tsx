import type { Metadata } from "next";
import Link from "next/link";
import { SectionLabel } from "@/components/SectionLabel";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Rerace is an independent platform not affiliated with any motorsport rights holder. Read about third-party content, trademarks and takedown requests.",
  openGraph: {
    title: `Disclaimer — ${SITE.name}`,
    description: "Independence, third-party content and takedown information for Rerace.",
  },
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="pt-4 text-xl font-bold tracking-tight text-white sm:text-2xl">{children}</h2>;
}

export default function DisclaimerPage() {
  return (
    <div className="container-site pb-20 pt-10">
      <article className="mx-auto max-w-3xl animate-rise">
        <header>
          <SectionLabel className="mb-2">Legal</SectionLabel>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Disclaimer</h1>
          <p className="mt-3 text-sm text-zinc-500">Last updated: June 11, 2026</p>
        </header>

        <div className="mt-10 space-y-6 text-sm leading-relaxed text-zinc-400 sm:text-base">
          <H2>1. Independence</H2>
          <p>
            Rerace is an independent platform. It is <span className="font-semibold text-zinc-200">not</span>{" "}
            affiliated with, endorsed by, sponsored by or in any way officially connected to Formula 1, Formula One
            Management, the Fédération Internationale de l&rsquo;Automobile (FIA), the FIA Formula 2 Championship, the
            FIA Formula 3 Championship, MotoGP or Dorna Sports, NASCAR, IndyCar, the FIA World Endurance Championship
            (WEC) or the Automobile Club de l&rsquo;Ouest (ACO), the FIA World Rally Championship (WRC), Porsche, or
            any other championship, series organiser, team, broadcaster or rights holder.
          </p>

          <H2>2. Trademarks</H2>
          <p>
            All series names, event names, team names, logos, liveries and other trademarks or trade dress referenced
            on this site are the property of their respective owners. They are used solely for identification and
            descriptive purposes, and such use does not imply any association with or endorsement by the trademark
            owners.
          </p>

          <H2>3. Third-party streams and videos</H2>
          <p>
            Streams, replays, videos and other media that appear on Rerace are hosted and transmitted by third
            parties. Rerace does not host, store or upload any of the media files itself — it indexes and embeds
            content that is made available elsewhere on the internet. Rerace has no control over, and assumes no
            responsibility for, the availability, quality, legality or content of third-party media.
          </p>
          <p>
            Rerace respects the rights of content owners and acts on takedown requests from verified rights holders.
            If you own rights to content that is indexed or embedded here and want it removed, please submit a request
            via the <Link href="/contact" className="text-race-bright hover:underline">contact page</Link> using the
            &ldquo;Rights holder / takedown&rdquo; subject, including the URL(s) concerned and proof of ownership or
            authority. Verified requests are processed promptly.
          </p>

          <H2>4. Accuracy of information</H2>
          <p>
            Schedules, session times, replays, standings, results and news on Rerace are compiled and refreshed on a
            best-effort basis from public sources. While we aim for accuracy, we make no representation or warranty
            that any information on the site is complete, correct or up to date. Always verify critical details (such
            as session start times) with official sources.
          </p>

          <H2>5. External links</H2>
          <p>
            The site contains links to external websites, including news publishers and media hosts. These links are
            provided for convenience only. Rerace does not control external sites and is not responsible for their
            content, policies or practices. Following external links is at your own risk.
          </p>

          <H2>6. Use at your own discretion</H2>
          <p>
            Your use of Rerace, including any reliance on information found here and any viewing of embedded
            third-party media, is at your own discretion and risk. You are responsible for ensuring that your use of
            the Service complies with the laws applicable in your jurisdiction.
          </p>

          <H2>7. No warranty</H2>
          <p>
            The Service and everything available through it are provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo;, without warranty of any kind, express or implied. To the maximum extent permitted by
            law, Rerace disclaims all warranties, including merchantability, fitness for a particular purpose,
            non-infringement and uninterrupted or error-free operation. See our{" "}
            <Link href="/terms" className="text-race-bright hover:underline">Terms of Service</Link> for the full
            disclaimers and limitations of liability.
          </p>

          <H2>8. Contact</H2>
          <p>
            Questions about this disclaimer, or a takedown request? Use the{" "}
            <Link href="/contact" className="text-race-bright hover:underline">contact page</Link>.
          </p>
        </div>
      </article>
    </div>
  );
}
