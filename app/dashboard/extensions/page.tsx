'use client';

import { Puzzle, Store, ServerCog, BarChart3 } from 'lucide-react';

const sections = [
  {
    title: 'Commerce Integrations',
    icon: Store,
    items: [
      {
        name: 'Shopify',
        status: 'In Build',
        description: 'Connect your store to auto-create payment links and sync order status.',
      },
      {
        name: 'WooCommerce',
        status: 'Coming Soon',
        description: 'Generate checkout links, post back settlement events, and reconcile orders.',
      },
    ],
  },
  {
    title: 'Platform Capabilities',
    icon: ServerCog,
    items: [
      {
        name: 'Webhooks & API',
        status: 'In Build',
        description: 'Real-time events, secure webhooks, and REST endpoints for bespoke flows.',
      },
      {
        name: 'Workers & Reconciliation',
        status: 'Coming Soon',
        description: 'Background jobs to verify on-chain receipts, handle retries, and resolve edge cases.',
      },
    ],
  },
  {
    title: 'Insights & Operations',
    icon: BarChart3,
    items: [
      {
        name: 'Analytics',
        status: 'Planned',
        description: 'Volume, conversion, retry rates, and settlement timing — all in one view.',
      },
      {
        name: 'Invoices',
        status: 'Coming Soon',
        description: 'Create branded invoices with crypto settlement and automatic status updates.',
      },
      {
        name: 'Lite CRM',
        status: 'Planned',
        description: 'Track customers, notes, and payment history for faster follow-ups.',
      },
    ],
  },
];

const statusTone: Record<string, string> = {
  'In Build': 'bg-[rgba(10,132,255,0.12)] text-[var(--suzaa-blue)]',
  'Coming Soon': 'bg-[rgba(100,116,139,0.12)] text-[var(--suzaa-muted)]',
  Planned: 'bg-[rgba(11,17,31,0.08)] text-[var(--suzaa-midnight)]',
};

export default function ExtensionsPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-[var(--suzaa-border)] bg-white/80 px-4 py-3 shadow-soft">
          <Puzzle className="h-5 w-5 text-[var(--suzaa-blue)]" />
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--suzaa-muted)]">
            Extensions · Coming Soon
          </span>
        </div>
        <div className="max-w-2xl space-y-3">
          <h2 className="text-2xl font-semibold text-[var(--suzaa-navy)]">Extend SUZAA with trusted integrations and automation modules.</h2>
          <p className="text-sm text-[var(--suzaa-muted)]">
            We&apos;re building a streamlined marketplace of connectors, background services, and analytics features. Here&apos;s what&apos;s shipping next.
          </p>
        </div>
      </header>

      <div className="space-y-8">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <section key={section.title} className="rounded-3xl border border-[var(--suzaa-border)] bg-white/90 shadow-soft">
              <div className="flex flex-col gap-4 border-b border-[var(--suzaa-border)] px-6 py-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--suzaa-surface-muted)]">
                    <Icon className="h-5 w-5 text-[var(--suzaa-blue)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--suzaa-navy)]">{section.title}</h3>
                    <p className="text-xs text-[var(--suzaa-muted)]">Curated roll-out of integrations crafted for scale.</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-[var(--suzaa-border)]/70">
                {section.items.map((item) => (
                  <div key={item.name} className="flex flex-col gap-3 px-6 py-5 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-[var(--suzaa-navy)]">{item.name}</p>
                      <p className="text-sm text-[var(--suzaa-muted)]">{item.description}</p>
                    </div>
                    <span className={`self-start rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusTone[item.status] ?? 'bg-[rgba(15,23,42,0.08)] text-[var(--suzaa-navy)]'}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <footer className="rounded-3xl border border-dashed border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)] px-6 py-6 text-sm text-[var(--suzaa-muted)]">
        Have an integration request? Email <a href="mailto:extensions@suzaa.com" className="font-semibold text-[var(--suzaa-blue)] hover:text-[var(--suzaa-teal)]">extensions@suzaa.com</a> so we can prioritise your workflow.
      </footer>
    </div>
  );
}
