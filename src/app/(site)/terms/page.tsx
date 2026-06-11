import type { Metadata } from "next";
import Link from "next/link";
import { SectionLabel } from "@/components/SectionLabel";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The Terms of Service for Rerace — the rules for accounts, chat, polls, predictions and third-party streams on the platform.",
  openGraph: {
    title: `Terms of Service — ${SITE.name}`,
    description: "The rules that govern your use of Rerace.",
  },
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="pt-4 text-xl font-bold tracking-tight text-white sm:text-2xl">{children}</h2>;
}

export default function TermsPage() {
  return (
    <div className="container-site py-12 sm:py-16">
      <article className="mx-auto max-w-3xl animate-rise">
        <header>
          <SectionLabel className="mb-3">Legal</SectionLabel>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Terms of Service</h1>
          <p className="mt-3 text-sm text-zinc-500">Last updated: June 11, 2026</p>
        </header>

        <div className="mt-10 space-y-6 text-sm leading-relaxed text-zinc-400 sm:text-base">
          <H2>1. Acceptance of these terms</H2>
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) are a binding agreement between you and Rerace
            (&ldquo;Rerace&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) governing your access to and use of the Rerace
            website, applications and related services (together, the &ldquo;Service&rdquo;). By visiting the Service,
            creating an account or otherwise using any part of it, you agree to be bound by these Terms and by our{" "}
            <Link href="/privacy" className="text-race-bright hover:underline">Privacy Policy</Link> and{" "}
            <Link href="/disclaimer" className="text-race-bright hover:underline">Disclaimer</Link>. If you do not
            agree, do not use the Service.
          </p>

          <H2>2. Eligibility</H2>
          <p>
            You must be at least 13 years old to use the Service. If you are under the age of majority in your
            jurisdiction, you may only use the Service with the consent of a parent or legal guardian who agrees to
            these Terms on your behalf. By using the Service you represent that you meet these requirements.
          </p>

          <H2>3. Accounts</H2>
          <p>
            Accounts on Rerace are free. A verified account is required for certain features such as chat, polls,
            predictions, profiles, movies and replays. When you create an account you agree to:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>provide accurate, current information (including a working, non-disposable email address) and keep it up to date;</li>
            <li>maintain only one account per person;</li>
            <li>keep your credentials confidential and not share or transfer your account; and</li>
            <li>accept responsibility for all activity that occurs under your account.</li>
          </ul>
          <p>
            We may refuse, suspend or reclaim usernames that impersonate others, infringe rights or are otherwise
            inappropriate.
          </p>

          <H2>4. Acceptable use</H2>
          <p>When using the Service, including chat and other community features, you agree not to:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>harass, abuse, threaten, defame or discriminate against any person, or post hateful, obscene or otherwise objectionable content;</li>
            <li>spam, flood, advertise or solicit in chat, or impersonate any person or entity;</li>
            <li>use bots, scripts, scrapers, crawlers or any other automated means to access the Service, collect content or data, or interact with community features;</li>
            <li>circumvent, disable or interfere with security features, rate limits, account requirements, moderation systems or access controls;</li>
            <li>probe, scan or test the vulnerability of the Service or attempt to gain unauthorised access to systems, accounts or data; or</li>
            <li>use the Service for any unlawful purpose or in violation of any applicable law or regulation.</li>
          </ul>

          <H2>5. User content</H2>
          <p>
            You retain ownership of the content you submit to the Service, such as chat messages, poll votes,
            predictions and profile information (&ldquo;User Content&rdquo;). By submitting User Content you grant
            Rerace a worldwide, non-exclusive, royalty-free, transferable and sublicensable licence to host, store,
            reproduce, display, adapt and distribute that content for the purposes of operating, improving and
            promoting the Service. You represent that you have all rights necessary to submit your User Content and
            that it does not violate these Terms or any law.
          </p>

          <H2>6. Moderation</H2>
          <p>
            We use automated moderation (including banned-word filtering and rate limiting) as well as human review to
            keep the community safe. We may, at our discretion and without prior notice, remove or edit User Content,
            restrict features, time-out, suspend or permanently ban accounts that violate these Terms or that we
            reasonably believe harm the Service or other users. We are not obliged to monitor all content and accept
            no liability for User Content posted by others.
          </p>

          <H2>7. Third-party content and streams</H2>
          <p>
            Rerace indexes, links to and embeds streams, videos and other media that are hosted and transmitted by
            third parties. Rerace does not host these media files on its own servers and has no control over their
            availability, quality, legality or content. Embedded sources may become unavailable at any time, and we do
            not guarantee that any particular stream, replay or video will be accessible.
          </p>
          <p>
            If you are a rights holder and believe content indexed or embedded on the Service infringes your rights,
            please submit a removal request through our{" "}
            <Link href="/contact" className="text-race-bright hover:underline">contact page</Link>, selecting the
            &ldquo;Rights holder / takedown&rdquo; subject. We review verified requests promptly and act on them in
            accordance with applicable law.
          </p>

          <H2>8. Intellectual property</H2>
          <p>
            The Service — including its design, branding, software, text and original editorial content — is owned by
            or licensed to Rerace and is protected by copyright, trademark and other laws. Except as expressly
            permitted, you may not copy, modify, distribute, sell or lease any part of the Service. All third-party
            names, logos and trademarks that appear on the Service belong to their respective owners; see our{" "}
            <Link href="/disclaimer" className="text-race-bright hover:underline">Disclaimer</Link> for details.
          </p>

          <H2>9. Termination</H2>
          <p>
            You may stop using the Service and delete your account at any time. We may suspend or terminate your
            access to all or part of the Service at any time, with or without notice, if you breach these Terms, if we
            are required to do so by law, or if we discontinue the Service. Sections that by their nature should
            survive termination (including licences to User Content already distributed, disclaimers, limitations of
            liability and indemnification) survive.
          </p>

          <H2>10. Disclaimers of warranty</H2>
          <p>
            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo;, WITHOUT WARRANTIES OF ANY KIND,
            WHETHER EXPRESS, IMPLIED OR STATUTORY, INCLUDING WITHOUT LIMITATION WARRANTIES OF MERCHANTABILITY, FITNESS
            FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY OR UNINTERRUPTED AVAILABILITY. SCHEDULES, STANDINGS,
            RESULTS AND NEWS ARE PROVIDED ON A BEST-EFFORT BASIS AND MAY CONTAIN ERRORS OR DELAYS. SOME JURISDICTIONS
            DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES, SO SOME OF THE ABOVE MAY NOT APPLY TO YOU.
          </p>

          <H2>11. Limitation of liability</H2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, RERACE AND ITS OPERATORS, AFFILIATES AND SUPPLIERS WILL NOT BE
            LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY OR PUNITIVE DAMAGES, OR FOR ANY LOSS
            OF PROFITS, DATA, GOODWILL OR USE, ARISING OUT OF OR RELATING TO YOUR USE OF (OR INABILITY TO USE) THE
            SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR AGGREGATE LIABILITY FOR ALL CLAIMS
            RELATING TO THE SERVICE WILL NOT EXCEED ONE HUNDRED EUROS (EUR 100) OR THE AMOUNT YOU PAID US IN THE TWELVE
            MONTHS BEFORE THE CLAIM, WHICHEVER IS GREATER. NOTHING IN THESE TERMS EXCLUDES LIABILITY THAT CANNOT BE
            EXCLUDED UNDER APPLICABLE LAW.
          </p>

          <H2>12. Indemnification</H2>
          <p>
            You agree to indemnify, defend and hold harmless Rerace and its operators from and against any claims,
            damages, liabilities, costs and expenses (including reasonable legal fees) arising out of or related to
            your User Content, your use of the Service, or your violation of these Terms or of any law or third-party
            right.
          </p>

          <H2>13. Changes to these terms</H2>
          <p>
            We may update these Terms from time to time. When we make material changes we will update the &ldquo;Last
            updated&rdquo; date above and, where appropriate, provide additional notice on the Service. Your continued
            use of the Service after changes take effect constitutes acceptance of the revised Terms. If you do not
            agree to the changes, you must stop using the Service.
          </p>

          <H2>14. Severability</H2>
          <p>
            If any provision of these Terms is held to be invalid or unenforceable, that provision will be enforced to
            the maximum extent permissible and the remaining provisions will remain in full force and effect. Our
            failure to enforce any provision is not a waiver of our right to do so later.
          </p>

          <H2>15. Contact</H2>
          <p>
            Questions about these Terms? Reach us via the{" "}
            <Link href="/contact" className="text-race-bright hover:underline">contact page</Link> — it is the fastest
            way to get a reply for legal, support and takedown matters.
          </p>
        </div>
      </article>
    </div>
  );
}
