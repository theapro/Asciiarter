"use client";

import * as React from "react";
import LiveBackground from "../background/LiveBackground";
import { cn } from "../../lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Interaktiv Fon */}
      <LiveBackground />

      {/* Asosiy Kontent - O'rtada turishi uchun flex-1 */}
      <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col px-6 py-8 sm:px-10 lg:py-12">
        <main className="min-h-0 flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-3 duration-1000">
          {children}
        </main>

        {/* Minimalistik va Chiroyli Footer */}
        <footer className="mt-12 flex flex-col items-center gap-4">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
          
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary/80"></span>
              </span>
              <span className="hover:text-foreground transition-colors cursor-default">
                <a href="https://www.theapro.me" target="_blank">
                  By Theapro
                </a>
              </span>
            </div>

            <span className="hidden sm:inline opacity-30 select-none">|</span>

            <span className="hover:text-foreground transition-colors cursor-default tracking-[0.3em]">
              Asciiarter
            </span>

            <span className="hidden sm:inline opacity-30 select-none">|</span>

            <a 
              href="https://github.com/theapro/asciiarter" 
              target="_blank" 
              className="hover:text-primary transition-colors hover:underline underline-offset-4"
            >
              Source Code
            </a>
          </div>

          <p className="text-[9px] text-muted-foreground/40 font-mono italic">
            Minimal image to ASCII conversion unit. Inspired from <a href="https://x.com/IceSolst" target="_blank" className="hover:text-primary transition-colors underline">IceSolst</a>
          </p>
        </footer>
      </div>
    </div>
  );
}