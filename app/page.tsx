'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--suzaa-surface-subtle)]">
      <div className="absolute inset-0 bg-gradient-midnight opacity-95" />
      <div className="absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[var(--suzaa-blue)]/30 blur-[160px]" />
      <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-[var(--suzaa-teal)]/25 blur-[150px]" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-20 px-6 py-24 md:px-10 lg:px-12">
        <section className="text-center text-white md:text-left">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-white/70">
            <span className="h-2 w-2 rounded-full bg-[var(--suzaa-teal)]" />
            Enterprise Crypto Payments
          </div>
          <div className="mt-8 grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
                Accept payments globally<br />
                with a credible fintech core.
              </h1>
              <p className="mt-6 text-base text-white/70 md:text-lg">
                SUZAA is an open payment network engineered for compliance teams, operators,
                and developers. Start with cash, expand with blockchain plugins, and stay in
                full control of risk.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-primary text-base"
                >
                  Launch Merchant Console
                </button>
                <button
                  onClick={() => window.open('https://github.com/suzaaglobal/first', '_blank')}
                  className="btn-secondary text-base"
                >
                  View GitHub →
                </button>
              </div>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-[0_45px_120px_-60px_rgba(0,0,0,0.5)] backdrop-blur">
              <div className="flex flex-col gap-6 text-left">
                {[
                  {
                    title: 'Security-first architecture',
                    body: 'Passwordless authentication, hardware-backed secrets, and distributed rate limiting.',
                    icon: Shield,
                  },
                  {
                    title: 'Instant merchant activation',
                    body: 'Cash settlement out of the box. Plug in blockchain rails when you’re ready.',
                    icon: Zap,
                  },
                  {
                    title: 'Global reach, unified control',
                    body: 'Deploy in any region, orchestrate plugins centrally, and observe in real time.',
                    icon: Globe,
                  },
                ].map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="flex gap-4 rounded-2xl bg-white/5 p-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{feature.title}</p>
                        <p className="mt-1 text-sm text-white/65">{feature.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/20 bg-white/90 p-8 shadow-[0_40px_120px_-60px_rgba(11,17,31,0.55)]">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Observable by default',
                body: 'Structured logging, audit trails, and clear incident workflows keep compliance teams informed.',
              },
              {
                title: 'Plugin ecosystem ready',
                body: 'Authorised blockchain plugins communicate over signed HTTP, keeping the core language-agnostic.',
              },
              {
                title: 'Trusted experience',
                body: 'Minimalist UI with strong contrast, precise spacing, and clarity that inspires customer trust.',
              },
            ].map((item) => (
              <div key={item.title} className="surface-card p-6">
                <h3 className="text-lg font-semibold text-[var(--suzaa-navy)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-[var(--suzaa-muted)]">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--suzaa-border)]/70 bg-[var(--suzaa-surface-muted)] px-6 py-8 text-center md:flex-row md:justify-between md:text-left">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[var(--suzaa-muted)]">
                Live Demo
              </p>
              <p className="mt-2 text-sm text-[var(--suzaa-midnight)]">
                Explore a merchant storefront powered by SUZAA.
              </p>
            </div>
            <button
              onClick={() => router.push('/jumasm')}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <span className="font-mono text-sm">jumasm</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
