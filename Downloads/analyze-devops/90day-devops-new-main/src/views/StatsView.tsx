import React from 'react';
import { UseAppStateReturnType, LEVELS } from '../hooks/useAppState';
import { PHASES } from '../data/phases';

interface StatsViewProps {
  appState: UseAppStateReturnType;
}

export const StatsView: React.FC<StatsViewProps> = ({ appState }) => {
  const {
    state,
    getLevelInfo,
    calcXP,
    readinessScore,
    typeCounts,
    lowConfTasks,
    dayDone,
    dayTotal,
  } = appState;

  const levelInfo = getLevelInfo();
  const readiness = readinessScore();
  const xp = calcXP();
  const { tot, don } = typeCounts();
  const lowConf = lowConfTasks();

  // Heatmap rendering logic (last 84 days)
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const hist = state.history || {};

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 83);
  const startDayOfWeek = startDate.getDay();

  const heatmapCells: React.ReactNode[] = [];

  // Padding cells
  for (let pad = 0; pad < startDayOfWeek; pad++) {
    heatmapCells.push(<div key={`pad-${pad}`} className="heat-cell" style={{ visibility: 'hidden' }}></div>);
  }

  // Active cells
  for (let i = 0; i < 84; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toDateString();
    const count = hist[dateStr] || 0;

    let cellClass = 'heat-cell';
    if (count >= 15) cellClass += ' h4';
    else if (count >= 10) cellClass += ' h3';
    else if (count >= 5) cellClass += ' h2';
    else if (count > 0) cellClass += ' h1';

    heatmapCells.push(
      <div
        key={`cell-${i}`}
        className={cellClass}
        title={`${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}: ${count} tasks`}
      ></div>
    );
  }

  const taskTypes = [
    { k: 'concept' as const, label: 'concept', color: '#4fa8ff' },
    { k: 'code' as const, label: 'code', color: '#00d9a0' },
    { k: 'quiz' as const, label: 'quiz', color: '#ffc850' },
    { k: 'project' as const, label: 'project', color: '#c084fc' },
  ];

  return (
    <div className="wrap">
      <div style={{ marginBottom: '14px' }}>
        <div className="eyebrow">Metrics</div>
        <h2 className="page-title">Progress Stats</h2>
      </div>

      <div id="stats-content">
        <div className="stat-grid">
          {/* Readiness Score Card */}
          <div className="stat-card">
            <div className="stat-card-title">Readiness Score</div>
            <div
              style={{
                fontSize: '46px',
                fontWeight: 800,
                family: 'var(--mono)',
                background: 'linear-gradient(135deg,var(--green),var(--blue))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {readiness}
              <span style={{ fontSize: '22px' }}>%</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--sub)', marginTop: '6px' }}>
              Quizzes 30% · Projects 30% · Code 25% · Concepts 15%
            </div>
          </div>

          {/* XP & Level Card */}
          <div className="stat-card">
            <div className="stat-card-title">XP & Level</div>
            <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--amber)' }}>
              {xp} <span style={{ fontSize: '16px' }}>XP</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, margin: '6px 0 4px', color: levelInfo.lvl.color }}>
              {levelInfo.lvl.title}
            </div>
            <div style={{ height: '5px', background: 'var(--s3)', borderRadius: '3px', overflow: 'hidden', marginBottom: '5px' }}>
              <div style={{ height: '100%', background: levelInfo.lvl.color, width: `${levelInfo.pct}%`, borderRadius: '3px', transition: 'width .5s' }}></div>
            </div>
            {levelInfo.next ? (
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)' }}>
                {levelInfo.next.min - xp} XP → {levelInfo.next.title}
              </div>
            ) : (
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--green)' }}>MAX LEVEL</div>
            )}
          </div>

          {/* Task Types Card */}
          <div className="stat-card">
            <div className="stat-card-title">Task Types</div>
            {taskTypes.map(type => {
              const t = tot[type.k] || 0;
              const d = don[type.k] || 0;
              const pct = t ? Math.round((d / t) * 100) : 0;

              return (
                <div key={type.k} className="type-row">
                  <span className="type-label" style={{ color: type.color }}>
                    {type.label}
                  </span>
                  <div className="type-bar-track">
                    <div className="type-bar-fill" style={{ width: `${pct}%`, background: type.color }}></div>
                  </div>
                  <span className="type-count">
                    {d}/{t}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Phase Progress Card */}
          <div className="stat-card">
            <div className="stat-card-title">Phase Progress</div>
            {PHASES.map((ph, pi) => {
              const phTotal = ph.data.reduce((a, _d, di) => a + dayTotal(pi, di), 0);
              const phDone = ph.data.reduce((a, _d, di) => a + dayDone(pi, di), 0);
              const pct = phTotal ? Math.round((phDone / phTotal) * 100) : 0;
              const shortName = `P${pi + 1}`;

              return (
                <div key={pi} className="type-row">
                  <span className="type-label" style={{ color: ph.color, fontSize: '10px' }}>
                    {shortName}
                  </span>
                  <div className="type-bar-track">
                    <div className="type-bar-fill" style={{ width: `${pct}%`, background: ph.color }}></div>
                  </div>
                  <span className="type-count">{pct}%</span>
                </div>
              );
            })}
          </div>

          {/* Low Confidence Tasks Card */}
          {lowConf.length > 0 && (
            <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
              <div className="stat-card-title">⚠ Low Confidence Tasks (★1–2) — Scheduled for Review</div>
              {lowConf.slice(0, 10).map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: '12px',
                    color: 'var(--sub)',
                    marginBottom: '6px',
                    paddingBottom: '5px',
                    borderBottom: '1px solid var(--s3)'
                  }}
                >
                  <span style={{ fontFamily: 'var(--mono)', color: 'var(--red)' }}>★{item.conf}</span>{' '}
                  {item.d.day}: {item.task.t.substring(0, 80)}
                </div>
              ))}
            </div>
          )}

          {/* Heatmap Card */}
          <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
            <div className="stat-card-title" style={{ marginBottom: '10px' }}>
              Activity Heatmap (last 84 days)
            </div>
            <div className="heatmap-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
              {daysOfWeek.map((day, idx) => (
                <div key={idx} className="heat-day-lbl" style={{ fontFamily: 'var(--mono)', fontSize: '8px', color: 'var(--sub)', textAlign: 'center' }}>
                  {day}
                </div>
              ))}
              {heatmapCells}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default StatsView;
