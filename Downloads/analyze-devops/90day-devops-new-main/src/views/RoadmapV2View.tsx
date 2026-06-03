import React, { useState } from 'react';
import { PHASES_V2 } from '../data/phases_v2';
import type { UseAppStateReturnType } from '../hooks/useAppState';
import confetti from 'canvas-confetti';

const XP_MAP: Record<string, number> = { concept: 10, code: 25, quiz: 20, project: 50 };
const V2_STORAGE = 'devops90_v2_tasks';

// Separate localStorage for v2 so v1 progress is never touched
function loadV2State(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(V2_STORAGE) || '{}'); } catch { return {}; }
}
function saveV2State(s: Record<string, boolean>) {
  try { localStorage.setItem(V2_STORAGE, JSON.stringify(s)); } catch { /**/ }
}

function v2key(pi: number, di: number, ti: number) { return `v2_${pi}_${di}_${ti}`; }

function phaseDone(pi: number, state: Record<string, boolean>) {
  const ph = PHASES_V2[pi];
  return ph.data.reduce((a, d, di) =>
    a + d.tasks.filter((_, ti) => !!state[v2key(pi, di, ti)]).length, 0);
}
function phaseTotal(pi: number) {
  return PHASES_V2[pi].data.reduce((a, d) => a + d.tasks.length, 0);
}

interface Props {
  appState: UseAppStateReturnType;
  switchView: (v: string) => void;
}

export const RoadmapV2View: React.FC<Props> = ({ appState }) => {
  const [v2state, setV2State] = useState<Record<string, boolean>>(loadV2State);
  const [openPhases, setOpenPhases] = useState<Record<number, boolean>>({ 0: true });
  const [openDays, setOpenDays] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');

  const totalDone = PHASES_V2.reduce((a, _, pi) => a + phaseDone(pi, v2state), 0);
  const totalAll  = PHASES_V2.reduce((a, _, pi) => a + phaseTotal(pi), 0);
  const overallPct = totalAll ? Math.round((totalDone / totalAll) * 100) : 0;
  const totalXP = Object.entries(v2state).filter(([, v]) => v).length * 15; // approx

  function toggle(pi: number, di: number, ti: number) {
    const key = v2key(pi, di, ti);
    const next = { ...v2state, [key]: !v2state[key] };
    setV2State(next);
    saveV2State(next);
    // Phase completion confetti
    const done = PHASES_V2[pi].data.reduce((a, d, ddi) =>
      a + d.tasks.filter((_, tti) => !!next[v2key(pi, ddi, tti)]).length, 0);
    if (done === phaseTotal(pi)) {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    }
  }

  function togglePhase(pi: number) {
    setOpenPhases(p => ({ ...p, [pi]: !p[pi] }));
  }
  function toggleDay(pi: number, di: number) {
    const k = `${pi}_${di}`;
    setOpenDays(p => ({ ...p, [k]: !p[k] }));
  }
  function isDayOpen(pi: number, di: number) { return !!openDays[`${pi}_${di}`]; }

  const sl = search.toLowerCase();

  // Find next incomplete task
  let nextTask: { pi: number; di: number; day: string; label: string; phase: string } | null = null;
  outer: for (let pi = 0; pi < PHASES_V2.length; pi++) {
    for (let di = 0; di < PHASES_V2[pi].data.length; di++) {
      const d = PHASES_V2[pi].data[di];
      for (let ti = 0; ti < d.tasks.length; ti++) {
        if (!v2state[v2key(pi, di, ti)]) {
          nextTask = { pi, di, day: d.day, label: d.label, phase: PHASES_V2[pi].title };
          break outer;
        }
      }
    }
  }

  return (
    <div style={{ padding: '0 0 80px' }}>

      {/* HEADER BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,217,160,.08) 0%, rgba(79,168,255,.06) 100%)',
        border: '1px solid rgba(0,217,160,.18)',
        borderRadius: 'var(--r12)',
        padding: '20px 22px',
        marginBottom: 20,
        display: 'flex',
        gap: 20,
        alignItems: 'flex-start',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 22 }}>💥</span>
            <span style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: 'var(--green)',
              background: 'rgba(0,217,160,.1)',
              padding: '2px 8px',
              borderRadius: 4,
              border: '1px solid rgba(0,217,160,.2)',
            }}>
              Original · Problem-First Roadmap
            </span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
            "Your server is broken. Fix it."
          </div>
          <div style={{ fontSize: 12, color: 'var(--sub)', lineHeight: 1.7, maxWidth: 500 }}>
            90 days. Every day starts with a real production problem — not a concept, not a tutorial.
            You learn Linux because your server crashed. You learn Docker because "it works on my machine."
            You learn Kubernetes because your docker-compose.yml has 12 services and is falling apart.
            <span style={{ color: 'var(--green)', fontWeight: 600 }}> This is what hiring managers actually test.</span>
          </div>
        </div>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Done', value: totalDone, color: 'var(--green)' },
            { label: 'Left', value: totalAll - totalDone, color: 'var(--red)' },
            { label: 'Progress', value: overallPct + '%', color: 'var(--blue)' },
            { label: 'XP', value: '~' + totalXP, color: 'var(--amber)' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--s1)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r8)',
              padding: '12px 14px',
              textAlign: 'center',
              minWidth: 68,
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* OVERALL PROGRESS BAR */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--sub)' }}>
          <span>overall progress</span>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{overallPct}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--s3)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            borderRadius: 3,
            background: 'linear-gradient(90deg, var(--green), var(--blue))',
            width: overallPct + '%',
            transition: 'width .5s ease',
          }} />
        </div>
      </div>

      {/* NEXT UP BANNER */}
      {nextTask && (
        <div
          onClick={() => {
            setOpenPhases(p => ({ ...p, [nextTask!.pi]: true }));
            setOpenDays(prev => ({ ...prev, [`${nextTask!.pi}_${nextTask!.di}`]: true }));
            setTimeout(() => {
              document.getElementById(`day-${nextTask!.pi}-${nextTask!.di}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 150);
          }}
          style={{
            background: 'rgba(0,217,160,.06)',
            border: '1px solid rgba(0,217,160,.2)',
            borderRadius: 'var(--r8)',
            padding: '11px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 16,
            cursor: 'pointer',
          }}>
          <span style={{ fontSize: 16 }}>🎯</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--green)', marginBottom: 2 }}>
              Next up
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
              {nextTask.day} — {nextTask.label}
            </div>
            <div style={{ fontSize: 11, color: 'var(--sub)' }}>{nextTask.phase}</div>
          </div>
          <span style={{ color: 'var(--green)', fontSize: 16 }}>→</span>
        </div>
      )}

      {/* CONTROLS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', opacity: .35, pointerEvents: 'none' }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search topics, scenarios, tools..."
            style={{
              width: '100%',
              background: 'var(--s1)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r8)',
              padding: '9px 12px 9px 36px',
              fontSize: 13,
              color: 'var(--text)',
              fontFamily: 'var(--body)',
              outline: 'none',
            }} />
        </div>
        {(['all', 'todo', 'done'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            fontWeight: 600,
            padding: '8px 14px',
            borderRadius: 'var(--r8)',
            border: '1px solid var(--border)',
            background: filter === f ? 'var(--text)' : 'transparent',
            color: filter === f ? 'var(--bg)' : 'var(--sub)',
            cursor: 'pointer',
            transition: 'all .15s',
          }}>
            {f === 'all' ? 'All' : f === 'todo' ? '⬜ Todo' : '✅ Done'}
          </button>
        ))}
      </div>

      {/* LEGEND */}
      <div style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        padding: '10px 14px',
        background: 'var(--s1)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r8)',
        marginBottom: 18,
        fontSize: 12,
        color: 'var(--sub)',
        alignItems: 'center',
      }}>
        {[
          { k: 'concept', label: 'Concept', color: 'var(--blue)' },
          { k: 'code',    label: 'Code',    color: 'var(--green)' },
          { k: 'quiz',    label: 'Quiz',    color: 'var(--amber)' },
          { k: 'project', label: 'Project', color: 'var(--purple)' },
        ].map(b => (
          <span key={b.k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              fontFamily: 'var(--mono)',
              fontSize: 9,
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: 3,
              background: b.color + '18',
              color: b.color,
              border: '1px solid ' + b.color + '30',
            }}>{b.k}</span>
            {b.label}
          </span>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>
          💥 = scenario · 💡 = why this · ⚠️ = gotcha · 📝 = note · 🎤 = interview
        </span>
      </div>

      {/* PHASE CARDS */}
      {PHASES_V2.map((phase, pi) => {
        const phDone  = phaseDone(pi, v2state);
        const phTotal = phaseTotal(pi);
        const phPct   = phTotal ? Math.round(phDone / phTotal * 100) : 0;
        const complete = phDone === phTotal && phTotal > 0;
        const inProg   = phDone > 0 && !complete;
        const isOpen   = !!openPhases[pi];

        // Search + filter at phase level
        const hasMatch = !search || phase.title.toLowerCase().includes(sl) ||
          phase.data.some(d =>
            d.label.toLowerCase().includes(sl) ||
            d.day.toLowerCase().includes(sl) ||
            d.tasks.some(t => t.t.toLowerCase().includes(sl))
          );
        if (!hasMatch) return null;
        if (filter === 'done' && phDone === 0) return null;
        if (filter === 'todo' && complete) return null;

        // Phase mini ring
        const r = 18, circ = 2 * Math.PI * r;
        const offset = circ - (phPct / 100) * circ;

        return (
          <div key={pi} style={{
            background: 'var(--s1)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r12)',
            overflow: 'hidden',
            marginBottom: 10,
            position: 'relative',
            transition: 'border-color .2s',
          }}>
            {/* Accent bar */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
              background: phase.color, borderRadius: '12px 0 0 12px',
            }} />

            {/* Phase header */}
            <button
              onClick={() => togglePhase(pi)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 20px 16px 24px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'inherit',
              }}>
              {/* Mini ring */}
              <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
                <svg width="44" height="44" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="22" cy="22" r={r} fill="none" stroke="var(--s3)" strokeWidth="4" />
                  <circle cx="22" cy="22" r={r} fill="none" stroke={phase.color} strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset .6s ease' }} />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>{phase.icon}</div>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', marginBottom: 2 }}>
                  Phase {phase.days}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.25 }}>
                  {phase.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 3 }}>
                  {phDone}/{phTotal} tasks
                </div>
              </div>

              {/* Status badge */}
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 20,
                flexShrink: 0,
                ...(complete
                  ? { background: 'rgba(0,217,160,.1)', color: 'var(--green)', border: '1px solid rgba(0,217,160,.22)' }
                  : inProg
                  ? { background: phase.dim, color: phase.color, border: `1px solid ${phase.color}30` }
                  : { background: 'var(--s3)', color: 'var(--muted)' }),
              }}>
                {complete ? '✓ complete' : inProg ? phPct + '%' : 'not started'}
              </div>

              {/* Chevron */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" style={{
                  color: 'var(--muted)', flexShrink: 0,
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform .3s',
                }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Collapsible phase body */}
            <div style={{
              display: 'grid',
              gridTemplateRows: isOpen ? '1fr' : '0fr',
              transition: 'grid-template-rows .32s cubic-bezier(.16,1,.3,1)',
            }}>
              <div style={{ overflow: 'hidden' }}>
                {phase.data.map((day, di) => {
                  // Day-level filter
                  const dayMatch = !search ||
                    day.label.toLowerCase().includes(sl) ||
                    day.day.toLowerCase().includes(sl) ||
                    day.tasks.some(t => t.t.toLowerCase().includes(sl));
                  if (!dayMatch) return null;

                  const dayDoneCount = day.tasks.filter((_, ti) => !!v2state[v2key(pi, di, ti)]).length;
                  const dayComplete  = dayDoneCount === day.tasks.length;
                  if (filter === 'done' && dayDoneCount === 0) return null;
                  if (filter === 'todo' && dayComplete) return null;

                  const dayIsOpen = isDayOpen(pi, di);

                  return (
                    <div key={di} id={`day-${pi}-${di}`} style={{
                      borderTop: '1px solid var(--border)',
                      background: dayComplete ? 'rgba(0,217,160,.025)' : 'transparent',
                    }}>
                      {/* Day header */}
                      <div
                        onClick={() => toggleDay(pi, di)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '12px 20px 12px 26px',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}>
                        <span style={{
                          fontFamily: 'var(--mono)',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: phase.dim,
                          color: phase.color,
                          flexShrink: 0,
                        }}>{day.day}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', flex: 1 }}>
                          {day.label}
                        </span>
                        <span style={{
                          fontFamily: 'var(--mono)',
                          fontSize: 10,
                          color: dayComplete ? 'var(--green)' : 'var(--muted)',
                          flexShrink: 0,
                        }}>
                          {dayDoneCount}/{day.tasks.length}{dayComplete ? ' ✓' : ''}
                        </span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5" style={{
                            color: 'var(--muted)', flexShrink: 0,
                            transform: dayIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform .2s',
                          }}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>

                      {/* Day tasks — collapsible */}
                      <div style={{
                        display: 'grid',
                        gridTemplateRows: dayIsOpen ? '1fr' : '0fr',
                        transition: 'grid-template-rows .25s cubic-bezier(.16,1,.3,1)',
                      }}>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ padding: '0 20px 14px 26px' }}>
                            {day.tasks.map((task, ti) => {
                              const taskMatch = !search || task.t.toLowerCase().includes(sl);
                              if (!taskMatch && search) return null;

                              const done = !!v2state[v2key(pi, di, ti)];
                              if (filter === 'done' && !done) return null;
                              if (filter === 'todo' && done) return null;

                              // Detect line type for styling
                              const isScenario = task.t.startsWith('🔴');
                              const isWhy      = task.t.startsWith('💡');
                              const isGotcha   = task.t.startsWith('⚠️');
                              const isNote     = task.t.startsWith('📝');
                              const isInterview = task.t.startsWith('🎤');

                              const kindColors: Record<string, string> = {
                                concept: '#38bdf8', code: '#00d9a0', quiz: '#ffc850', project: '#c084fc'
                              };

                              return (
                                <div
                                  key={ti}
                                  onClick={() => toggle(pi, di, ti)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 10,
                                    padding: '7px 10px',
                                    borderRadius: 'var(--r8)',
                                    cursor: 'pointer',
                                    marginBottom: 2,
                                    background: isScenario
                                      ? 'rgba(255,95,95,.04)'
                                      : isWhy
                                      ? 'rgba(0,217,160,.04)'
                                      : isGotcha
                                      ? 'rgba(255,200,80,.04)'
                                      : isNote
                                      ? 'rgba(79,168,255,.04)'
                                      : isInterview
                                      ? 'rgba(192,132,252,.04)'
                                      : 'transparent',
                                    borderLeft: isScenario
                                      ? '2px solid rgba(255,95,95,.3)'
                                      : isInterview
                                      ? '2px solid rgba(192,132,252,.3)'
                                      : isGotcha
                                      ? '2px solid rgba(255,200,80,.3)'
                                      : '2px solid transparent',
                                    transition: 'background .1s',
                                  }}>
                                  {/* Checkbox */}
                                  <div style={{
                                    width: 16, height: 16,
                                    borderRadius: 4,
                                    border: done ? 'none' : '1.5px solid var(--muted)',
                                    background: done ? phase.color : 'transparent',
                                    flexShrink: 0,
                                    marginTop: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all .18s cubic-bezier(.34,1.56,.64,1)',
                                  }}>
                                    {done && (
                                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none"
                                        stroke="#000" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="2 6 5 9 10 3" />
                                      </svg>
                                    )}
                                  </div>

                                  {/* Task text */}
                                  <span style={{
                                    flex: 1,
                                    fontSize: 12,
                                    lineHeight: 1.6,
                                    color: done ? 'var(--muted)' : 'var(--sub)',
                                    textDecoration: done ? 'line-through' : 'none',
                                    opacity: done ? .5 : 1,
                                  }}>
                                    {task.t}
                                  </span>

                                  {/* Kind badge */}
                                  <span style={{
                                    fontFamily: 'var(--mono)',
                                    fontSize: 9,
                                    fontWeight: 700,
                                    padding: '1px 5px',
                                    borderRadius: 3,
                                    background: (kindColors[task.k] || '#888') + '18',
                                    color: kindColors[task.k] || '#888',
                                    border: '1px solid ' + (kindColors[task.k] || '#888') + '30',
                                    flexShrink: 0,
                                    marginTop: 2,
                                  }}>{task.k}</span>
                                </div>
                              );
                            })}

                            {/* Day quiz prompt */}
                            {!search && (() => {
                              const quizPrompt = `I just finished studying: "${day.label}" (${day.day}). Quiz me as a senior DevOps engineer would in an interview. Ask 3 questions one at a time, wait for my answer, then give detailed feedback on whether my answer was correct and what I missed.`;
                              return (
                                <div style={{
                                  marginTop: 10,
                                  borderRadius: 'var(--r8)',
                                  overflow: 'hidden',
                                  border: '1px solid var(--border)',
                                  background: 'linear-gradient(135deg, rgba(192,132,252,.03) 0%, rgba(0,217,160,.02) 100%)',
                                }}>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 12px',
                                    borderBottom: '1px solid var(--border)',
                                  }}>
                                    <span style={{ fontSize: 14 }}>🤖</span>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', flex: 1 }}>
                                      AI Quiz — {day.label}
                                    </span>
                                    <span style={{
                                      fontFamily: 'var(--mono)',
                                      fontSize: 9,
                                      padding: '1px 6px',
                                      borderRadius: 10,
                                      background: 'rgba(192,132,252,.12)',
                                      color: 'var(--purple)',
                                      border: '1px solid rgba(192,132,252,.2)',
                                    }}>AI quiz</span>
                                  </div>
                                  <div style={{ display: 'flex' }}>
                                    <button
                                      onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(quizPrompt).catch(() => {}); }}
                                      style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 5,
                                        padding: '7px 10px',
                                        background: 'transparent',
                                        border: 'none',
                                        borderRight: '1px solid var(--border)',
                                        color: 'var(--sub)',
                                        fontSize: 11,
                                        cursor: 'pointer',
                                        fontFamily: 'var(--body)',
                                      }}>
                                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                      </svg>
                                      Copy prompt
                                    </button>
                                    <a
                                      href={`https://claude.ai/new?q=${encodeURIComponent(quizPrompt)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={e => e.stopPropagation()}
                                      style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 5,
                                        padding: '7px 10px',
                                        color: 'var(--sub)',
                                        fontSize: 11,
                                        textDecoration: 'none',
                                      }}>
                                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                                        <polyline points="15 3 21 3 21 9"/>
                                        <line x1="10" y1="14" x2="21" y2="3"/>
                                      </svg>
                                      Open in Claude ↗
                                    </a>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
