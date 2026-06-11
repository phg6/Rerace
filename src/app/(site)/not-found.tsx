import type { Metadata } from "next";
import { EmptyState } from "@/components/EmptyState";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="container-site flex min-h-[60vh] items-center justify-center py-16">
      <EmptyState
        className="w-full max-w-xl"
        title="Off track — this page doesn't exist"
        message="The page you're looking for has been black-flagged or never made it to the grid. Head back to the pits and try again."
        ctaHref="/"
        ctaLabel="Back to home"
      />
    </div>
  );
}
