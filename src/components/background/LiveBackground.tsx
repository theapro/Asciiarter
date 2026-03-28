import { cn } from "../../lib/utils";

export type LiveBackgroundProps = {
  className?: string;
};

export default function LiveBackground({ className }: LiveBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0 bg-background" />

      <div
        className="absolute -top-56 left-1/2 h-[720px] w-[720px] -translate-x-1/2 rounded-full blur-3xl opacity-35"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--glow-1) / 0.55), transparent 70%)",
        }}
      />

      <div
        className="absolute -bottom-64 left-[-160px] h-[680px] w-[680px] rounded-full blur-3xl opacity-30"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--glow-2) / 0.55), transparent 70%)",
        }}
      />

      <div
        className="absolute -bottom-64 right-[-160px] h-[680px] w-[680px] rounded-full blur-3xl opacity-30"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--glow-3) / 0.55), transparent 70%)",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background/80" />
    </div>
  );
}
