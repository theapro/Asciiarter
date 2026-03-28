import * as React from "react";

import LiveBackground from "../background/LiveBackground";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[100dvh]">
      <LiveBackground />

      <div className="mx-auto flex min-h-[100dvh] w-full max-w-screen-2xl flex-col px-4 py-4 sm:px-6">
        <main className="min-h-0 flex-1 min-w-0">{children}</main>

        <footer className="pt-2 text-center text-xs text-muted-foreground">
          Asciiarter — minimal image to ASCII
        </footer>
      </div>
    </div>
  );
}
