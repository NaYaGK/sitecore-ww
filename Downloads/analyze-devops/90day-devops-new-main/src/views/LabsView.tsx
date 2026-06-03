import React, { useState } from 'react';
import { LABS, Lab, Exercise } from '../data/labs';
import { UseAppStateReturnType } from '../hooks/useAppState';
import { TerminalSimulator } from '../components/TerminalSimulator';

interface LabsViewProps {
  appState: UseAppStateReturnType;
}

export const LabsView: React.FC<LabsViewProps> = ({ appState }) => {
  const { isLabDone, markLabDone, labDayDone } = appState;
  const labKeys = Object.keys(LABS);
  const [activeDk, setActiveDk] = useState<string>(labKeys[0] || '');

  const activeLab: Lab | undefined = LABS[activeDk];
  const done = activeLab ? labDayDone(activeDk) : 0;
  const total = activeLab ? activeLab.exercises.length : 0;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const formatTime = (secs: number) => {
    if (secs < 60) return secs + 's';
    return Math.floor(secs / 60) + 'm ' + (secs % 60) + 's';
  };

  return (
    <div className="wrap">
      <div style={{ marginBottom: '16px' }}>
        <div className="eyebrow">Hands-on practice</div>
        <h2 className="page-title">Interactive Labs</h2>
        <p className="page-sub">Simulated terminal · Auto-graded · Days 1–10</p>
      </div>

      <div style={{ background: 'rgba(255,200,80,.06)', border: '1px solid rgba(255,200,80,.2)', borderRadius: 'var(--r12)', padding: '11px 13px', marginBottom: '16px', fontSize: '13px', color: 'var(--sub)' }}>
        <strong style={{ color: 'var(--amber)' }}>Note:</strong> For Docker/K8s days, open KillerCoda in a new tab, run commands there, then enter them here to auto-verify.
      </div>

      {/* Lab selectors */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
        {labKeys.map(dk => {
          const lab = LABS[dk];
          const labDone = labDayDone(dk);
          const labTotal = lab.exercises.length;
          const isComplete = labDone === labTotal && labTotal > 0;
          const isActive = dk === activeDk;

          return (
            <button
              key={dk}
              className={`lab-day-btn ${isComplete ? 'lab-day-done' : ''}`}
              style={{
                background: isActive ? 'var(--s2)' : 'var(--s1)',
                borderColor: isComplete ? 'var(--green)' : 'var(--border)',
                color: isComplete ? 'var(--green)' : 'var(--sub)',
                fontFamily: 'var(--mono)',
                fontSize: '11px',
                padding: '5px 11px',
                borderRadius: 'var(--r8)',
                cursor: 'pointer',
                transition: 'all .2s',
                borderStyle: 'solid',
                borderWidth: '1px'
              }}
              onClick={() => setActiveDk(dk)}
            >
              {lab.day} {labDone > 0 ? `(${labDone}/${labTotal})` : ''}
            </button>
          );
        })}
      </div>

      {/* Active Lab Area */}
      {activeLab && (
        <div id="lab-exercises-area">
          <div style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '16px 18px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--green)', marginBottom: '3px' }}>
                  {activeLab.day} · {activeLab.type.toUpperCase()} LAB
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>{activeLab.title}</div>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: done === total && total > 0 ? 'var(--green)' : 'var(--sub)' }}>
                {done}/{total} done
              </div>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--sub)', marginBottom: '10px' }}>{activeLab.intro}</div>
            <div style={{ height: '4px', background: 'var(--s3)', borderRadius: '2px' }}>
              <div style={{ height: '100%', background: 'var(--green)', borderRadius: '2px', width: `${pct}%`, transition: 'width .4s' }}></div>
            </div>

            {/* Docker/K8s playgound links */}
            {(activeLab.type === 'docker' || activeLab.type === 'k8s') && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                {activeLab.killercoda && (
                  <a
                    href={activeLab.killercoda}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--amber)', decoration: 'none', padding: '5px 11px', border: '1px solid rgba(255,200,80,.3)', borderRadius: 'var(--r8)', background: 'rgba(255,200,80,.06)', textDecoration: 'none' }}
                  >
                    默默 Open KillerCoda Lab →
                  </a>
                )}
                {activeLab.playdocker && (
                  <a
                    href={activeLab.playdocker}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--blue)', decoration: 'none', padding: '5px 11px', border: '1px solid rgba(79,168,255,.3)', borderRadius: 'var(--r8)', background: 'rgba(79,168,255,.06)', textDecoration: 'none' }}
                  >
                    🐳 Play With Docker →
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Terminal (for terminal-type labs) */}
          {activeLab.type === 'terminal' && (
            <TerminalSimulator
              dk={activeDk}
              lab={activeLab}
              isLabDone={(exId) => isLabDone(activeDk, exId)}
              markLabDone={(exId) => markLabDone(activeDk, exId)}
              onExercisePassed={() => {}}
            />
          )}

          {/* Exercise list */}
          {activeLab.exercises.map((ex, idx) => {
            const isExDone = isLabDone(activeDk, ex.id);
            return (
              <ExerciseCard
                key={ex.id}
                ex={ex}
                idx={idx}
                isDone={isExDone}
                formatTime={formatTime}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

interface ExerciseCardProps {
  ex: Exercise;
  idx: number;
  isDone: boolean;
  formatTime: (secs: number) => string;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ ex, idx, isDone, formatTime }) => {
  const [showHint, setShowHint] = useState(false);

  return (
    <div
      style={{
        background: 'var(--s1)',
        border: `1px solid ${isDone ? 'rgba(0,217,160,.35)' : 'var(--border)'}`,
        borderRadius: 'var(--r12)',
        padding: '14px 16px',
        marginBottom: '8px',
        transition: 'border-color .2s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: isDone ? 'var(--green)' : 'var(--s3)',
            border: `1.5px solid ${isDone ? 'var(--green)' : 'var(--border)'}`,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            marginTop: '1px'
          }}
        >
          {isDone ? (
            <span style={{ color: '#000', fontWeight: 700 }}>✓</span>
          ) : (
            <span style={{ color: 'var(--sub)' }}>{idx + 1}</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              marginBottom: '5px',
              color: isDone ? 'var(--sub)' : 'var(--text)',
              textDecoration: isDone ? 'line-through' : 'none'
            }}
          >
            {ex.prompt}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowHint(!showHint)}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                color: 'var(--sub)',
                fontFamily: 'var(--mono)',
                fontSize: '10px',
                padding: '3px 9px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showHint ? '🙈 Hide hint' : '💡 Hint'}
            </button>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--amber)' }}>
              +{ex.xp} XP
            </span>
            {isDone && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--green)' }}>
                {ex.ok}
              </span>
            )}
          </div>
          {showHint && (
            <div
              style={{
                marginTop: '8px',
                background: 'var(--s3)',
                borderRadius: 'var(--r8)',
                padding: '8px 11px',
                fontFamily: 'var(--mono)',
                fontSize: '11px',
                color: 'var(--amber)',
                whiteSpace: 'pre-wrap'
              }}
            >
              {ex.hint}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
