import { useSovereignStore } from '../store/sovereign';
import { ShieldAlert, History, AlertTriangle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PunishmentCard } from '../components/punishments/PunishmentCard';
import { AccountabilityMeter } from '../components/punishments/AccountabilityMeter';
import { cn } from '../lib/utils';
import { useState } from 'react';

export default function Punishments() {
  const { punishments, accountabilityScore } = useSovereignStore();
  const [filter, setFilter] = useState<'all' | 'active' | 'cleared'>('active');

  const filteredPunishments = punishments.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const activeCount = punishments.filter((p) => p.status === 'active').length;
  const statusLabel =
    accountabilityScore >= 90
      ? 'Fully compliant'
      : accountabilityScore < 40
        ? 'Critical instability'
        : 'Operational';

  return (
    <div
      data-testid="accountability-page"
      className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto space-y-10 pb-20"
    >
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
        <div className="max-w-2xl">
          <p className="eyebrow mb-2 flex items-center gap-2 text-[var(--danger)]">
            <AlertTriangle size={12} strokeWidth={2} />
            Accountability command
          </p>
          <h1 className="h-display text-[var(--text-primary)]">
            Penal protocols <span className="text-[var(--text-muted)] font-normal">&</span> sanction registry
          </h1>
          <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-relaxed">
            The system tracks all deviations from the prime protocol. Unresolved violations cascade
            into progressive neural degradation and wealth sanctions.
          </p>
        </div>
        <div className="w-full lg:w-auto">
          <AccountabilityMeter score={accountabilityScore} />
        </div>
      </header>

      {/* Control bar */}
      <div
        data-testid="accountability-filter-bar"
        className="flex flex-wrap items-center justify-between gap-4 p-2 surface-card"
      >
        <div className="flex items-center gap-1">
          <FilterButton
            active={filter === 'active'}
            onClick={() => setFilter('active')}
            label="Active"
            count={activeCount}
            testid="filter-active"
          />
          <FilterButton
            active={filter === 'cleared'}
            onClick={() => setFilter('cleared')}
            label="Resolved"
            count={punishments.length - activeCount}
            testid="filter-cleared"
          />
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            label="All"
            testid="filter-all"
          />
        </div>

        <div className="hidden md:flex items-center gap-3 pr-3">
          <span className="eyebrow text-[10px]">Status</span>
          <span
            className={cn(
              'text-[12px] font-semibold tracking-[-0.005em]',
              accountabilityScore >= 90
                ? 'text-[var(--success)]'
                : accountabilityScore < 40
                  ? 'text-[var(--danger)]'
                  : 'text-[var(--text-primary)]',
            )}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Punishment grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredPunishments.length > 0 ? (
            filteredPunishments.map((p) => <PunishmentCard key={p.id} punishment={p} />)
          ) : (
            <motion.div
              data-testid="accountability-empty-state"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full py-24 surface-card border-dashed flex flex-col items-center justify-center text-center px-6"
            >
              <div className="h-14 w-14 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] mb-5">
                <ShieldAlert size={24} strokeWidth={1.5} />
              </div>
              <h3 className="h-card">Registry clear</h3>
              <p className="mt-2 text-[13px] text-[var(--text-secondary)]">
                No active protocol violations detected.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Escalation tiers */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="h-section text-[22px]">Escalation tiers</h2>
          <p className="text-[13px] text-[var(--text-secondary)]">How violations compound.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              tier: 'Tier 1',
              label: 'Minor',
              penalty: '−5 Accountability',
              trigger: '1–2 active violations',
              color: 'var(--warning)',
            },
            {
              tier: 'Tier 2',
              label: 'Severe',
              penalty: '−2% Wealth · −10 Mind',
              trigger: '3–4 active violations',
              color: 'var(--stat-brand)',
            },
            {
              tier: 'Tier 3',
              label: 'Critical',
              penalty: 'Protocol lockout · −50 XP',
              trigger: '5+ active violations',
              color: 'var(--danger)',
            },
          ].map((t, i) => {
            const active = activeCount >= i * 2 + 1;
            return (
              <article
                key={t.tier}
                data-testid={`tier-card-${i + 1}`}
                className="surface-card p-5 hover-lift"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="eyebrow text-[10px]"
                      style={{ color: t.color }}
                    >
                      {t.tier} · {t.label}
                    </span>
                  </div>
                  {active ? (
                    <Zap size={14} style={{ color: t.color }} strokeWidth={2} />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--border-strong)]" />
                  )}
                </div>
                <div className="text-[15px] font-semibold text-[var(--text-primary)] mb-1.5">
                  {t.penalty}
                </div>
                <div className="text-[12px] text-[var(--text-muted)] font-mono tracking-wide">
                  Trigger: {t.trigger}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Footer / policy */}
      <aside
        data-testid="accountability-policy"
        className="rounded-2xl border border-[color-mix(in_srgb,var(--danger)_25%,transparent)] bg-[color-mix(in_srgb,var(--danger)_3%,transparent)] p-6 flex flex-col md:flex-row items-center gap-5"
      >
        <div className="h-12 w-12 shrink-0 rounded-xl border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] flex items-center justify-center text-[var(--danger)]">
          <History size={22} strokeWidth={1.5} />
        </div>
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">System policy</h3>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            A missed protocol at 00:00 costs 5 Accountability. Two or more consecutive failures
            trigger domain-specific consequences. Resolve penalty quests to restore integrity and
            clear violations.
          </p>
        </div>
      </aside>
    </div>
  );
}

function FilterButton({
  active,
  label,
  count,
  onClick,
  testid,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  testid?: string;
}) {
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      aria-pressed={active}
      aria-label={`Filter by ${label}`}
      className={cn(
        'inline-flex items-center gap-2 h-9 px-4 rounded-lg text-[12px] font-medium tracking-[-0.005em] transition-colors outline-none',
        active
          ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]',
      )}
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            'px-1.5 py-px rounded-md text-[10px] font-mono',
            active
              ? 'bg-[var(--bg-primary)]/15 text-[var(--bg-primary)]/80'
              : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
