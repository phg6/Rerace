import type { Metadata } from "next";
import Link from "next/link";
import { SectionLabel } from "@/components/SectionLabel";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Rerace collects, uses and protects your data — accounts, chat, reminders, newsletters, cookies and your rights.",
  openGraph: {
    title: `Privacy Policy — ${SITE.name}`,
    description: "How Rerace collects, uses and protects your data.",
  },
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="pt-4 text-xl font-bold tracking-tight text-white sm:text-2xl">{children}</h2>;
}

export default function PrivacyPage() {
  return (
    <div className="container-site py-12 sm:py-16">
      <article className="mx-auto max-w-3xl animate-rise">
        <header>
          <SectionLabel className="mb-3">Legal</SectionLabel>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-zinc-500">Last updated: June 11, 2026</p>
        </header>

        <div className="mt-10 space-y-6 text-sm leading-relaxed text-zinc-400 sm:text-base">
          <p>
            This Privacy Policy explains what personal data Rerace (&ldquo;Rerace&rdquo;, &ldquo;we&rdquo;,
            &ldquo;us&rdquo;) collects when you use our website and services (the &ldquo;Service&rdquo;), why we
            collect it, how long we keep it, and the rights you have over it. We keep data collection deliberately
            minimal: you can watch livestreams without an account, and we do not use tracking cookies by default.
          </p>

          <H2>1. Data we collect</H2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <span className="font-semibold text-zinc-200">Account data.</span> When you sign up we collect your
              email address and, if you sign in with Discord, basic Discord profile data (Discord ID, username and
              avatar). Your Rerace username and any optional profile fields you fill in (such as favourite series or
              driver) are also stored.
            </li>
            <li>
              <span className="font-semibold text-zinc-200">Community activity.</span> Chat messages, poll votes and
              race predictions you submit are stored together with your account identifier.
            </li>
            <li>
              <span className="font-semibold text-zinc-200">Reminders and newsletter.</span> If you set a session
              reminder or subscribe to the newsletter, we store the email address used and the relevant event or
              subscription details so we can deliver the messages you asked for.
            </li>
            <li>
              <span className="font-semibold text-zinc-200">Technical logs.</span> Like virtually every online
              service, our infrastructure providers record basic technical data (IP address, browser type, requested
              pages, timestamps) in short-lived server logs for security, abuse prevention and debugging.
            </li>
          </ul>
          <p>We do not collect payment data — Rerace accounts are free.</p>

          <H2>2. Why we process your data</H2>
          <ul className="list-disc space-y-2 pl-6">
            <li>to create and operate your account and provide community features (chat, polls, predictions, profiles);</li>
            <li>to send the session reminders and newsletters you explicitly request;</li>
            <li>to moderate the community, prevent abuse, spam and multiple-account misuse;</li>
            <li>to keep the Service secure, diagnose problems and maintain availability; and</li>
            <li>to comply with legal obligations, including responding to verified rights-holder requests.</li>
          </ul>

          <H2>3. Legal bases (GDPR)</H2>
          <p>Where the EU/UK General Data Protection Regulation applies, we rely on:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <span className="font-semibold text-zinc-200">Performance of a contract</span> (Art. 6(1)(b)) — operating
              your account and the features you use;
            </li>
            <li>
              <span className="font-semibold text-zinc-200">Consent</span> (Art. 6(1)(a)) — newsletters, reminders and
              push notifications, which you can withdraw at any time;
            </li>
            <li>
              <span className="font-semibold text-zinc-200">Legitimate interests</span> (Art. 6(1)(f)) — security,
              abuse prevention, moderation and service improvement, balanced against your rights; and
            </li>
            <li>
              <span className="font-semibold text-zinc-200">Legal obligation</span> (Art. 6(1)(c)) — where we must
              retain or disclose data to comply with the law.
            </li>
          </ul>

          <H2>4. Processors and service providers</H2>
          <p>
            We use a small number of processors that handle data on our behalf under data processing agreements:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <span className="font-semibold text-zinc-200">Supabase</span> — our database and authentication
            provider, hosted in the European Union, stores account data, community activity, reminders and newsletter
              subscriptions.
            </li>
            <li>
              <span className="font-semibold text-zinc-200">Resend</span> — our email delivery provider, processes the
              email address and message content of reminders, newsletters and transactional emails.
            </li>
            <li>
              <span className="font-semibold text-zinc-200">Hosting and infrastructure providers</span> — serve the
              website and keep short-lived technical logs as described above.
            </li>
          </ul>
          <p>We do not sell your personal data.</p>

          <H2>5. Cookies</H2>
          <p>
            Rerace uses only the cookies strictly necessary to keep you signed in (authentication session cookies). We
            do not set analytics or tracking cookies by default. If advertising is displayed on the Service, ad
            partners may set their own cookies when their ads load; those cookies are governed by the partners&rsquo;
            own policies. See our{" "}
            <Link href="/disclaimer" className="text-race-bright hover:underline">Disclaimer</Link> for more on
            third-party content.
          </p>

          <H2>6. Retention</H2>
          <p>
            We keep your account data for as long as your account exists. Chat messages, poll votes and predictions
            are retained while relevant to the community features. Reminder records are kept only as long as needed to
            send the reminder, plus a short period for troubleshooting. Newsletter subscriptions are kept until you
            unsubscribe. Technical logs are retained for a short, rolling window. When you delete your account, your
            personal data is deleted or irreversibly anonymised, except where we must retain limited records to comply
            with the law or resolve disputes.
          </p>

          <H2>7. Your rights</H2>
          <p>
            Depending on your location, you have the right to access, rectify, delete, restrict or object to the
            processing of your personal data, the right to data portability, and the right to withdraw consent at any
            time without affecting prior processing. You can exercise most of these directly from your account
            settings (edit profile, unsubscribe links in every email, delete account). For anything else, contact us
            via the <Link href="/contact" className="text-race-bright hover:underline">contact page</Link>. You also
            have the right to lodge a complaint with your local data protection authority.
          </p>

          <H2>8. Children</H2>
          <p>
            The Service is not directed at children under 13, and we do not knowingly collect personal data from them.
            If you believe a child under 13 has created an account, please contact us and we will delete it.
          </p>

          <H2>9. Security</H2>
          <p>
            We protect your data with industry-standard measures, including encryption in transit (TLS), encrypted
            storage, row-level access controls in our database, scoped API keys and the principle of least privilege
            for administrative access. No method of transmission or storage is completely secure, but we work to keep
            risk to a minimum and to respond quickly to any incident.
          </p>

          <H2>10. International transfers</H2>
          <p>
            Our primary data storage is in the European Union. Where data is transferred outside the EU/EEA (for
            example, by email or infrastructure providers operating globally), we rely on appropriate safeguards such
            as the European Commission&rsquo;s Standard Contractual Clauses or adequacy decisions.
          </p>

          <H2>11. Changes to this policy</H2>
          <p>
            We may update this Privacy Policy from time to time. We will update the &ldquo;Last updated&rdquo; date
            above and, for material changes, provide additional notice on the Service. Your continued use of the
            Service after changes take effect constitutes acceptance of the revised policy.
          </p>

          <H2>12. Contact</H2>
          <p>
            For privacy questions or to exercise your rights, reach us via the{" "}
            <Link href="/contact" className="text-race-bright hover:underline">contact page</Link>.
          </p>
        </div>
      </article>
    </div>
  );
}
