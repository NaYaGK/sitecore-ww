import React, { useState } from 'react';
import { PHASES, Phase, DayData } from '../data/phases';
import { UseAppStateReturnType } from '../hooks/useAppState';

interface KanbanViewProps {
  appState: UseAppStateReturnType;
  switchView: (view: string) => void;
  setFocusDay: (day: string) => void;
}

interface KanbanItem {
  ph: Phase;
  pi: number;
  d: DayData;
  di: number;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  appState,
  switchView,
  setFocusDay,
}) => {
  const { dayStatus, dayDone, dayTotal, isPhaseOpen } = appState;
  const [kbPhase, setKbPhase] = useState<string>('all');

  const cols: Record<'backlog' | 'inprogress' | 'review' | 'done', KanbanItem[]> = {
    backlog: [],
    inprogress: [],
    review: [],
    done: [],
  };

  PHASES.forEach((ph, pi) => {
    if (kbPhase !== 'all' && kbPhase !== String(pi)) return;
    ph.data.forEach((d, di) => {
      const status = dayStatus(pi, di) as keyof typeof cols;
      cols[status].push({ ph, pi, d, di });
    });
  });

  const handleCardClick = (pi: number, di: number) => {
    setFocusDay(`${pi}_${di}`);
    switchView('focus');
  };

  const columnsDef = [
    { key: 'backlog' as const, label: 'Backlog', emoji: '○' },
    { key: 'inprogress' as const, label: 'In Progress', emoji: '◑' },
    { key: 'review' as const, label: 'Review', emoji: '◕' },
    { key: 'done' as const, label: 'Done', emoji: '●' },
  ];

  return (
    <div className="wrap">
      <div style={{ marginBottom: '16px' }}>
        <div className="eyebrow">Task Board</div>
        <h2 className="page-title">Day Progress Kanban</h2>
        <p className="page-sub">Visualize your 90 days of DevOps as active task lanes.</p>
      </div>

      {/* Phase Filters */}
      <div className="filter-bar" style={{ marginBottom: '16px' }}>
        <button 
          className={`fpill ${kbPhase === 'all' ? 'active' : ''}`} 
          onClick={() => setKbPhase('all')}
        >
          All Phases
        </button>
        {PHASES.map((ph, pi) => (
          <button 
            key={pi}
            className={`fpill ${kbPhase === String(pi) ? 'active' : ''}`}
            onClick={() => setKbPhase(String(pi))}
          >
            {ph.title.split(' — ')[1] || ph.title}
          </button>
        ))}
      </div>

      {/* Kanban Grid */}
      <div className="kanban-grid">
        {columnsDef.map(col => {
          const items = cols[col.key];

          return (
            <div key={col.key} className="k-col">
              <div className="k-col-hdr">
                <span className="k-col-title">{col.emoji} {col.label}</span>
                <span className="k-count">{items.length}</span>
              </div>
              <div className="k-body">
                {items.length === 0 ? (
                  <div className="k-empty">Empty</div>
                ) : (
                  items.map(item => {
                    const dDone = dayDone(item.pi, item.di);
                    const dTotal = dayTotal(item.pi, item.di);
                    const pct = dTotal ? Math.round((dDone / dTotal) * 100) : 0;

                    return (
                      <div 
                        key={`${item.pi}_${item.di}`} 
                        className="k-card" 
                        style={{ ['--kc' as any]: item.ph.color } as React.CSSProperties}
                        onClick={() => handleCardClick(item.pi, item.di)}
                      >
                        <div className="k-card-day">{item.d.day}</div>
                        <div className="k-card-label">{item.d.label}</div>
                        <div className="k-card-pct">{dDone}/{dTotal} ({pct}%)</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default KanbanView;
