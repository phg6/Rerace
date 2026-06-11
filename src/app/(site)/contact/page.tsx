import type { Metadata } from "next";
import { SectionLabel } from "@/components/SectionLabel";
import { SocialIcons } from "@/components/SocialIcons";
import { ContactForm } from "@/components/contact/ContactForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Rerace — media, partners, rights holders and support. Takedown requests from verified rights holders are processed promptly.",
  openGraph: {
    title: `Contact — ${SITE.name}`,
    description: "Get in touch with Rerace — media, partners, rights holders and support.",
  },
};

export default function ContactPage() {
  return (
    <div className="container-site py-12 sm:py-16">
      <div className="mx-auto max-w-3xl animate-rise">
        <header>
          <SectionLabel className="mb-3">Get in touch</SectionLabel>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Contact</h1>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
            Whether you&rsquo;re media, a potential partner, a rights holder with a takedown request, or just need
            support — drop us a line below. Rights-holder requests are reviewed and acted on promptly once verified.
          </p>
        </header>

        <div className="mt-10">
          <ContactForm />
        </div>

        <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500">
            Prefer community channels? Find us on Discord, X, Telegram and Instagram.
          </p>
          <SocialIcons />
        </div>
      </div>
    </div>
  );
}
