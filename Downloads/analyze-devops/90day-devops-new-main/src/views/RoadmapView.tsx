import React, { useState, useEffect } from 'react';
import { PHASES, Phase, DayData, Task } from '../data/phases';
import { UseAppStateReturnType } from '../hooks/useAppState';
import { AIService } from '../components/AIService';
import { showToast } from '../components/Toast';
import confetti from 'canvas-confetti';

const XP_MAP = { concept: 10, code: 25, quiz: 20, project: 50 };

interface RoadmapViewProps {
  appState: UseAppStateReturnType;
  switchView: (view: string) => void;
  setFocusDay: (day: string) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  appState,
  switchView,
  setFocusDay,
}) => {
  const {
    state,
    cntDone,
    cntTotal,
    dayDone,
    dayTotal,
    dayPct,
    dayStatus,
    getNote,
    setNote,
    hasNote,
    getConf,
    setConf,
    dayAvgConf,
    typeCounts,
    studyHours,
    calcETA,
    getLevelInfo,
    getSmartNext,
    checkPhaseJustCompleted,
    getWeekDone,
    getWeekPct,
    toggleTask,
    bulkMarkDay,
    isPhaseOpen,
    togglePhaseCollapse,
    isDayOpen,
    toggleDayCollapse
  } = appState;

  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>(''); // 'done' | 'incomplete' | ''
  const [phaseFilter, setPhaseFilter] = useState<string>('all'); // 'all' | '0' | '1' ...

  const doneCount = cntDone();
  const totalCount = cntTotal();
  const progressPct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
  const levelInfo = getLevelInfo();
  const eta = calcETA();
  const nextTask = getSmartNext();

  const handleTaskToggle = (pi: number, di: number, ti: number) => {
    toggleTask(pi, di, ti);
    const justCompleted = checkPhaseJustCompleted(pi);
    if (justCompleted) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast('🎉 Phase complete! Excellent work!', 'rgba(0,217,160,.15)');
    }
  };

  const handleBulkMark = (pi: number, di: number, type: 'concept' | 'code' | 'all') => {
    bulkMarkDay(pi, di, type);
    const justCompleted = checkPhaseJustCompleted(pi);
    if (justCompleted) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast('🎉 Phase complete! Great work!', 'rgba(0,217,160,.15)');
    }
  };

  const handleSmartNextClick = () => {
    if (nextTask) {
      setFocusDay(`${nextTask.pi}_${nextTask.di}`);
      switchView('focus');
    }
  };

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleStatusFilter = (status: string) => {
    setSelectedStatus(prev => (prev === status ? '' : status));
  };

  // Filter phase helper
  const matchesFilter = (pi: number, d: DayData) => {
    const sl = search.toLowerCase();
    
    // Type Filter
    const typeOk = selectedTypes.length === 0 || d.tasks.some(t => selectedTypes.includes(t.k));
    
    // Status Filter
    const statusOk = !selectedStatus || (
      selectedStatus === 'incomplete' 
        ? dayDone(pi, PHASES[pi].data.indexOf(d)) < dayTotal(pi, PHASES[pi].data.indexOf(d))
        : dayDone(pi, PHASES[pi].data.indexOf(d)) === dayTotal(pi, PHASES[pi].data.indexOf(d))
    );

    // Search filter
    const textOk = !sl || d.tasks.some(t => t.t.toLowerCase().includes(sl)) || d.label.toLowerCase().includes(sl) || d.day.toLowerCase().includes(sl);

    return typeOk && statusOk && textOk;
  };

  return (
    <div className="wrap">
      <div style={{ marginBottom: '14px' }}>
        <div className="eyebrow">GK's path to a DevOps job</div>
        <h1 className="page-title">
          DevOps Roadmap <span style={{ color: 'var(--amber)', fontSize: '14px' }}>v4</span>
        </h1>
        <p className="page-sub">Build real projects. Ship to GitHub. Get hired.</p>
      </div>

      {/* VERSION SWITCHER BANNER */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'rgba(0,217,160,.04)',
        border: '1px solid rgba(0,217,160,.15)',
        borderRadius: 'var(--r8)',
        padding: '10px 14px',
        marginBottom: 18,
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
            📌 You are on the original roadmap (topic-first)
          </div>
          <div style={{ fontSize: 11, color: 'var(--sub)', lineHeight: 1.6 }}>
            A new <strong style={{ color: 'var(--green)' }}>💥 Problem-First Roadmap v2</strong> is available — 90 days starting with "your server is broken, fix it." Every concept is learned to solve a real production problem. Separate progress tracking.
          </div>
        </div>
        <button
          onClick={() => switchView('roadmap-v2')}
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            fontWeight: 700,
            padding: '8px 16px',
            borderRadius: 'var(--r8)',
            border: '1px solid rgba(0,217,160,.3)',
            background: 'rgba(0,217,160,.1)',
            color: 'var(--green)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all .15s',
          }}
        >
          Try v2 Roadmap →
        </button>
      </div>

      {/* XP/Level Bar */}
      <div className="xp-bar-wrap">
        <div 
          className="xp-level-badge" 
          style={{ 
            color: levelInfo.lvl.color, 
            borderColor: levelInfo.lvl.color,
            background: `rgba(${hexToRgb(levelInfo.lvl.color)}, .07)`
          }}
        >
          {levelInfo.lvl.title}
        </div>
        <div className="xp-info">
          <div className="xp-label-row">
            <span>{levelInfo.lvl.title}</span>
            <span>
              {levelInfo.next 
                ? `${levelInfo.next.min - levelInfo.xp} XP to ${levelInfo.next.title}` 
                : 'MAX LEVEL 🎉'}
            </span>
          </div>
          <div className="xp-track">
            <div className="xp-fill" style={{ width: `${levelInfo.pct}%` }}></div>
          </div>
        </div>
        <div className="xp-total" style={{ color: 'var(--amber)' }}>{levelInfo.xp} XP</div>
      </div>

      {/* Weekly Goal Mini */}
      <div className="week-goal-mini" onClick={() => switchView('weekly')}>
        <div className="wgm-row">
          <span className="wgm-label">📅 WEEKLY GOAL</span>
          <span className="wgm-nums">{getWeekDone()} / {state.weekGoal}</span>
        </div>
        <div className="wgm-track">
          <div className="wgm-fill" style={{ width: `${getWeekPct()}%` }}></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-row">
        <div className="sc">
          <div className="sc-num">{doneCount}</div>
          <div className="sc-lbl">Done</div>
        </div>
        <div className="sc">
          <div className="sc-num" style={{ color: 'var(--red)' }}>{totalCount - doneCount}</div>
          <div className="sc-lbl">Left</div>
        </div>
        <div className="sc">
          <div className="sc-num">{totalCount}</div>
          <div className="sc-lbl">Total</div>
        </div>
        <div className="sc">
          <div 
            className="sc-num" 
            style={{ 
              background: 'linear-gradient(135deg,#7864ff,#00d9a0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {progressPct}%
          </div>
          <div className="sc-lbl">Progress</div>
        </div>
        <div className="sc">
          <div className="sc-num" style={{ color: 'var(--amber)' }}>{state.streak}</div>
          <div className="sc-lbl">🔥 Streak</div>
        </div>
        <div className="sc">
          <div className="sc-num" style={{ color: 'var(--teal)' }}>{studyHours()}h</div>
          <div className="sc-lbl">⏱ Studied</div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="prog-row">
        <span>OVERALL PROGRESS</span>
        <span>{progressPct}%</span>
      </div>
      <div className="prog-track">
        <div className="prog-fill" style={{ width: `${progressPct}%` }}></div>
      </div>

      {/* Next Task Card */}
      {nextTask && (
        <div className="smart-next-card" onClick={handleSmartNextClick}>
          <span style={{ fontSize: '18px' }}>🎯</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
              Next task
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>
              {nextTask.d.day} — {nextTask.d.label}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--sub)', marginTop: '1px' }}>
              {nextTask.ph.title.split(' — ')[1]} · {dayDone(nextTask.pi, nextTask.di)}/{dayTotal(nextTask.pi, nextTask.di)} tasks done
            </div>
          </div>
          <span style={{ color: 'var(--green)', fontSize: '15px', flexShrink: 0 }}>→</span>
        </div>
      )}

      {/* ETA Banner */}
      <div className="banner">
        <span>🕐</span>
        <span>
          {doneCount === 0 
            ? 'Start your 90-day DevOps journey today. Mark your first task done!'
            : doneCount === totalCount
            ? '🎉 All 90 days complete! You are a DevOps engineer.'
            : eta
            ? `At ${eta.avgPerDay} tasks/day → finish in ~${eta.daysLeft} days (est. ${eta.eta})`
            : `${totalCount - doneCount} tasks to go. Keep the streak alive!`}
        </span>
      </div>

      {/* Search Input */}
      <div className="search-wrap" style={{ marginBottom: '5px' }}>
        <span style={{ color: 'var(--muted)', fontSize: '13px' }}>🔍</span>
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search… (/ to focus)"
        />
        <button 
          onClick={() => { setSearch(''); setSelectedTypes([]); setSelectedStatus(''); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '12px' }}
        >
          ✕
        </button>
      </div>

      {/* Filter Chips */}
      <div className="sf-wrap">
        {(['concept', 'code', 'quiz', 'project'] as const).map(type => (
          <button 
            key={type}
            className={`sf-chip f-type-${type} ${selectedTypes.includes(type) ? 'active' : ''}`}
            onClick={() => toggleTypeFilter(type)}
          >
            {type}
          </button>
        ))}
        <button 
          className={`sf-chip f-status ${selectedStatus === 'incomplete' ? 'active' : ''}`}
          style={{ color: 'var(--amber)' }}
          onClick={() => toggleStatusFilter('incomplete')}
        >
          incomplete
        </button>
        <button 
          className={`sf-chip f-status ${selectedStatus === 'done' ? 'active' : ''}`}
          style={{ color: 'var(--green)' }}
          onClick={() => toggleStatusFilter('done')}
        >
          done
        </button>
      </div>

      {/* Phase Filters */}
      <div className="filter-bar">
        <button 
          className={`fpill ${phaseFilter === 'all' ? 'active' : ''}`} 
          onClick={() => setPhaseFilter('all')}
        >
          All Phases
        </button>
        {PHASES.map((ph, pi) => (
          <button 
            key={pi}
            className={`fpill ${phaseFilter === String(pi) ? 'active' : ''}`}
            onClick={() => setPhaseFilter(String(pi))}
          >
            {ph.title.split(' — ')[1] || ph.title}
          </button>
        ))}
      </div>

      {/* Roadmap Wrap */}
      <div id="roadmap-wrap">
        {PHASES.map((ph, pi) => {
          if (phaseFilter !== 'all' && phaseFilter !== String(pi)) return null;

          const phTotal = ph.data.reduce((a, _d, di) => a + dayTotal(pi, di), 0);
          const phDone = ph.data.reduce((a, _d, di) => a + dayDone(pi, di), 0);
          const phPct = phTotal ? Math.round((phDone / phTotal) * 100) : 0;
          const isComp = phDone === phTotal && phTotal > 0;
          const isOpen = isPhaseOpen(pi);

          const filteredDays = ph.data.filter(d => matchesFilter(pi, d));
          if (filteredDays.length === 0) return null;

          return (
            <div 
              key={pi}
              className="phase-card" 
              style={{
                borderColor: ph.color,
                // Assigning colors for use in component variables
                ['--pc' as any]: ph.color,
                ['--pcd' as any]: ph.dim,
              }}
            >
              <div className="phase-hdr" onClick={() => togglePhaseCollapse(pi)}>
                <div className="phase-icon" style={{ background: ph.dim, border: `1px solid ${ph.color}` }}>
                  {ph.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="phase-title">{ph.title}</div>
                  <div className="phase-meta">{ph.days} · {phDone}/{phTotal} tasks</div>
                  <div className="mini-bar">
                    <div className="mini-fill" style={{ width: `${phPct}%`, background: ph.color }}></div>
                  </div>
                </div>
                {isComp ? (
                  <div className="done-pill">✓ done</div>
                ) : (
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', padding: '2px 8px', borderRadius: '8px', background: 'var(--s3)', color: 'var(--sub)' }}>
                    {phPct}%
                  </span>
                )}
                <svg 
                  width="13" 
                  height="13" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  style={{ color: 'var(--sub)', flexShrink: 0, transition: 'transform .3s', transform: `rotate(${isOpen ? 180 : 0}deg)` }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>

              {isOpen && (
                <div className="phase-body open">
                  <div className="phase-body-inner">
                    <div className="phase-inner">
                      {filteredDays.map((d, di) => {
                        const originalDi = ph.data.indexOf(d);
                        const dDone = dayDone(pi, originalDi);
                        const dTotal = dayTotal(pi, originalDi);
                        const allDone = dDone === dTotal;
                        const dOpen = isDayOpen(pi, originalDi);
                        const avgConf = dayAvgConf(pi, originalDi);

                        return (
                          <div key={originalDi} className={`day-block ${allDone ? 'all-done' : ''}`}>
                            <div className="day-hdr" onClick={() => toggleDayCollapse(pi, originalDi)}>
                              <span className="day-tag">{d.day}</span>
                              <span className="day-label">{d.label}</span>
                              <span className="day-count" style={{ color: allDone ? 'var(--green)' : 'var(--sub)' }}>
                                {dDone}/{dTotal}
                                {allDone && ' ✓'}
                                {hasNote(pi, originalDi) && ' 📝'}
                                {avgConf > 0 && ` ⭐${avgConf.toFixed(1)}`}
                              </span>
                              <svg className={`day-chev ${dOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="6 9 12 15 18 9"/>
                              </svg>
                            </div>

                            {dOpen && (
                              <div className="day-tasks open">
                                <div className="day-tasks-inner">
                                  {/* Bulk Actions */}
                                  <div className="bulk-actions">
                                    <button className="bulk-btn" onClick={(e) => { e.stopPropagation(); handleBulkMark(pi, originalDi, 'concept'); }}>
                                      ✓ All Concepts
                                    </button>
                                    <button className="bulk-btn" onClick={(e) => { e.stopPropagation(); handleBulkMark(pi, originalDi, 'code'); }}>
                                      ✓ All Code
                                    </button>
                                    <button className="bulk-btn" style={{ color: 'var(--green)' }} onClick={(e) => { e.stopPropagation(); handleBulkMark(pi, originalDi, 'all'); }}>
                                      ✓ All Tasks
                                    </button>
                                  </div>

                                  {/* Task Rows */}
                                  {d.tasks.map((task, ti) => {
                                    const tidStr = `p${pi}d${originalDi}t${ti}`;
                                    const done = !!state.completedTasks[tidStr];
                                    const conf = getConf(pi, originalDi, ti);
                                    
                                    return (
                                      <div key={ti} className="task-row">
                                        <div 
                                          className={`task-check ${done ? 'done' : ''}`} 
                                          onClick={() => handleTaskToggle(pi, originalDi, ti)}
                                        >
                                          {done && '✓'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                          <span className={`task-text ${done ? 'done' : ''}`}>{task.t}</span>
                                          <div className="conf-row">
                                            <span className="conf-label">conf:</span>
                                            {[1, 2, 3, 4, 5].map(v => (
                                              <span 
                                                key={v} 
                                                className={`conf-star ${conf >= v ? 'on' : ''}`}
                                                onClick={() => setConf(pi, originalDi, ti, conf === v ? 0 : v)}
                                              >
                                                ★
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
                                          <span className={`task-badge badge-${task.k}`}>{task.k}</span>
                                          <span className="task-xp" style={{ opacity: done ? 1 : 0 }}>
                                            +{XP_MAP[task.k as keyof typeof XP_MAP]}xp
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {/* Notes Widget */}
                                  <NotesWidget 
                                    pi={pi} 
                                    di={originalDi} 
                                    getNote={getNote} 
                                    setNote={setNote} 
                                  />

                                  {/* AI Brief Widget */}
                                  <AIBriefWidget 
                                    pi={pi} 
                                    di={originalDi} 
                                    day={d.day} 
                                    label={d.label} 
                                    phaseTitle={ph.title}
                                    tasks={d.tasks}
                                    note={getNote(pi, originalDi)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Sub-components
interface NotesWidgetProps {
  pi: number;
  di: number;
  getNote: (pi: number, di: number) => string;
  setNote: (pi: number, di: number, val: string) => void;
}

const NotesWidget: React.FC<NotesWidgetProps> = ({ pi, di, getNote, setNote }) => {
  const [noteVal, setNoteVal] = useState(getNote(pi, di));
  const [saveLabel, setSaveLabel] = useState('Save note');

  const handleSave = () => {
    setNote(pi, di, noteVal);
    setSaveLabel('✓ Saved');
    setTimeout(() => setSaveLabel('Save note'), 1500);
  };

  return (
    <div className="notes-widget">
      <div className="notes-label">📝 NOTES</div>
      <textarea 
        className="notes-ta"
        value={noteVal}
        onChange={(e) => setNoteVal(e.target.value)}
        placeholder="Add your notes, links, or reflections…"
      />
      <button className="notes-save" onClick={handleSave}>{saveLabel}</button>
    </div>
  );
};

interface AIBriefWidgetProps {
  pi: number;
  di: number;
  day: string;
  label: string;
  phaseTitle: string;
  tasks: Task[];
  note?: string;
}

interface QuizState {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

const AIBriefWidget: React.FC<AIBriefWidgetProps> = ({
  pi,
  di,
  day,
  label,
  phaseTitle,
  tasks,
  note,
}) => {
  const [brief, setBrief] = useState<string>('');
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  const handleGenerateBrief = async () => {
    setLoadingBrief(true);
    setBrief('');
    try {
      const tasksText = tasks.map(t => `- [${t.k}] ${t.t}`).join('\n');
      const text = await AIService.generateDailyBrief(day, label, phaseTitle, tasksText, note);
      setBrief(text);
    } catch (e: any) {
      setBrief(`⚠ Error: ${e.message || 'Could not connect. Make sure your API Key is set in Settings (◑).'}`);
    } finally {
      setLoadingBrief(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setLoadingQuiz(true);
    setQuiz(null);
    setSelectedOpt(null);
    try {
      const tasksText = tasks.map(t => t.t).join(', ');
      const q = await AIService.generateQuiz(label, tasksText);
      setQuiz(q);
    } catch (e: any) {
      showToast(`⚠ Quiz Error: ${e.message || 'Failed to generate.'}`, 'var(--red)');
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Convert simple markdown headings & lists to React markup
  const renderMarkdown = (txt: string) => {
    const lines = txt.split('\n');
    return lines.map((l, i) => {
      if (l.startsWith('## ')) {
        return <h3 key={i} style={{ fontSize: '13px', fontWeight: 700, margin: '14px 0 7px', color: 'var(--text)' }}>{l.slice(3)}</h3>;
      }
      if (l.startsWith('- ')) {
        return <li key={i} style={{ marginLeft: '12px', marginBottom: '4px' }}>{l.slice(2)}</li>;
      }
      return <p key={i} style={{ margin: '4px 0' }}>{l}</p>;
    });
  };

  return (
    <div className="ai-brief-wrap">
      <div className="ai-brief-hdr">
        <div className="ai-brief-title">✦ AI Daily Brief</div>
        <div className="ai-brief-btns">
          <button className="ai-btn ai-btn-brief" onClick={handleGenerateBrief}>
            Generate Brief
          </button>
          <button className="ai-btn ai-btn-quiz" onClick={handleGenerateQuiz}>
            AI Quiz
          </button>
        </div>
      </div>
      
      <div className="ai-brief-body" id={`ai-brief-content-${pi}_${di}`}>
        {loadingBrief ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--sub)', fontSize: '13px' }}>
            <div className="ai-spinner"></div>Generating your daily brief…
          </div>
        ) : brief ? (
          <div>{renderMarkdown(brief)}</div>
        ) : (
          <span style={{ color: 'var(--muted)', fontSize: '12px' }}>
            Click "Generate Brief" for an AI-powered study plan for today's topics.
          </span>
        )}
      </div>

      {loadingQuiz && (
        <div style={{ padding: '0 14px 14px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--sub)', fontSize: '13px' }}>
          <div className="ai-spinner"></div>Generating quiz question…
        </div>
      )}

      {quiz && (
        <div style={{ padding: '0 14px 14px' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, marginBottom: '12px', lineHeight: 1.5, color: 'var(--text)' }}>
            {quiz.question}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '12px' }}>
            {quiz.options.map((opt, oIdx) => {
              const isSelected = selectedOpt === oIdx;
              const isCorrect = oIdx === quiz.answer;
              const hasAnswered = selectedOpt !== null;
              
              let style: React.CSSProperties = {
                textAlign: 'left',
                background: 'var(--s3)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '10px 14px',
                borderRadius: 'var(--r8)',
                cursor: hasAnswered ? 'default' : 'pointer',
                fontSize: '13px',
                fontFamily: 'var(--body)'
              };

              if (hasAnswered) {
                if (isCorrect) {
                  style.background = 'rgba(0, 217, 160, .12)';
                  style.borderColor = 'var(--green)';
                  style.color = 'var(--green)';
                } else if (isSelected) {
                  style.background = 'rgba(255, 95, 95, .08)';
                  style.borderColor = 'var(--red)';
                  style.color = 'var(--red)';
                } else {
                  style.color = 'var(--muted)';
                }
              }

              return (
                <button
                  key={oIdx}
                  disabled={hasAnswered}
                  onClick={() => setSelectedOpt(oIdx)}
                  style={style}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {selectedOpt !== null && (
            <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 'var(--r8)', padding: '12px 14px', fontSize: '13px', color: 'var(--sub)', lineHeight: 1.6 }}>
              <span style={{ color: 'var(--text)', fontWeight: 600 }}>Explanation: </span>
              {quiz.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Color utility
function hexToRgb(hex: string) {
  if (!hex || hex.length < 7) return '0,0,0';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
