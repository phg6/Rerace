import { cn } from "@/lib/utils";

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("section-label", className)}>{children}</p>;
}

export function SectionHeading({
  label,
  title,
  action,
  className,
}: {
  label?: string;
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-4", className)}>
      <div>
        {label && <SectionLabel className="mb-2">{label}</SectionLabel>}
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
