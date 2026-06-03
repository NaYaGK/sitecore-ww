import React, { useState, useEffect } from 'react';
import { PHASES, Phase, DayData } from '../data/phases';
import { UseAppStateReturnType } from '../hooks/useAppState';
import { AIService } from '../components/AIService';
import { showToast } from '../components/Toast';

interface FocusViewProps {
  appState: UseAppStateReturnType;
  focusDay: string;
  setFocusDay: (day: string) => void;
}

const XP_MAP = { concept: 10, code: 25, quiz: 20, project: 50 };

export const FocusView: React.FC<FocusViewProps> = ({
  appState,
  focusDay,
  setFocusDay,
}) => {
  const {
    state,
    dayDone,
    dayTotal,
    dayPct,
    getNote,
    setNote,
    hasNote,
    getConf,
    setConf,
    toggleTask,
    getSmartNext
  } = appState;

  const [pi, setPi] = useState(0);
  const [di, setDi] = useState(0);

  // Sync state when focusDay prop changes
  useEffect(() => {
    if (focusDay) {
      const parts = focusDay.split('_');
      setPi(parseInt(parts[0]) || 0);
      setDi(parseInt(parts[1]) || 0);
    }
  }, [focusDay]);

  const allDaysList: { pi: number; di: number; text: string }[] = [];
  PHASES.forEach((ph, pIdx) => {
    ph.data.forEach((d, dIdx) => {
      allDaysList.push({
        pi: pIdx,
        di: dIdx,
        text: `${d.day} — ${d.label}`
      });
    });
  });

  const curVal = `${pi}_${di}`;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFocusDay(e.target.value);
  };

  const handlePrev = () => {
    const idx = allDaysList.findIndex(x => x.pi === pi && x.di === di);
    if (idx > 0) {
      const prev = allDaysList[idx - 1];
      setFocusDay(`${prev.pi}_${prev.di}`);
    }
  };

  const handleNext = () => {
    const idx = allDaysList.findIndex(x => x.pi === pi && x.di === di);
    if (idx < allDaysList.length - 1) {
      const next = allDaysList[idx + 1];
      setFocusDay(`${next.pi}_${next.di}`);
    }
  };

  const handleFocusToday = () => {
    const nextTask = getSmartNext();
    if (nextTask) {
      setFocusDay(`${nextTask.pi}_${nextTask.di}`);
    }
  };

  const currentPhase = PHASES[pi];
  const currentDay = currentPhase?.data[di];
  
  if (!currentPhase || !currentDay) {
    return <div className="wrap">Select a valid day to start focusing.</div>;
  }

  const dDone = dayDone(pi, di);
  const dTotal = dayTotal(pi, di);
  const pct = dayPct(pi, di);

  return (
    <div className="wrap">
      {/* Focus Nav */}
      <div className="focus-nav">
        <select value={curVal} onChange={handleSelectChange}>
          {allDaysList.map(item => (
            <option key={`${item.pi}_${item.di}`} value={`${item.pi}_${item.di}`}>
              {item.text}
            </option>
          ))}
        </select>
        <button className="focus-btn" onClick={handlePrev}>← Prev</button>
        <button className="focus-btn" onClick={handleNext}>Next →</button>
        <button className="focus-btn primary" onClick={handleFocusToday}>🎯 Focus Today</button>
      </div>

      {/* Focus Content */}
      <div id="focus-content">
        <div className="focus-card">
          <div className="focus-day-tag">
            {currentDay.day} · {currentPhase.title.split(' — ')[1] || currentPhase.title}
          </div>
          <div className="focus-title">{currentDay.label}</div>
          <div className="focus-meta">
            {dDone}/{dTotal} tasks · {pct}% done
          </div>
          
          <div className="focus-pct-bar">
            <div className="focus-pct-fill" style={{ width: `${pct}%` }}></div>
          </div>

          {currentDay.link && (
            <a 
              href={currentDay.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="focus-link"
            >
              🔗 View on 90DaysOfDevOps →
            </a>
          )}

          {/* Tasks List */}
          {currentDay.tasks.map((task, ti) => {
            const tidStr = `p${pi}d${di}t${ti}`;
            const done = !!state.completedTasks[tidStr];
            const conf = getConf(pi, di, ti);

            return (
              <div key={ti} className="task-row">
                <div 
                  className={`task-check ${done ? 'done' : ''}`}
                  onClick={() => toggleTask(pi, di, ti)}
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
                        onClick={() => setConf(pi, di, ti, conf === v ? 0 : v)}
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
            di={di}
            getNote={getNote}
            setNote={setNote}
          />

          {/* AI Brief Widget */}
          <AIBriefWidget 
            pi={pi}
            di={di}
            day={currentDay.day}
            label={currentDay.label}
            phaseTitle={currentPhase.title}
            tasks={currentDay.tasks}
            note={getNote(pi, di)}
          />
        </div>
      </div>
    </div>
  );
};

// Sub-components replicated for self-containment
interface NotesWidgetProps {
  pi: number;
  di: number;
  getNote: (pi: number, di: number) => string;
  setNote: (pi: number, di: number, val: string) => void;
}

const NotesWidget: React.FC<NotesWidgetProps> = ({ pi, di, getNote, setNote }) => {
  const [noteVal, setNoteVal] = useState(getNote(pi, di));
  const [saveLabel, setSaveLabel] = useState('Save note');

  useEffect(() => {
    setNoteVal(getNote(pi, di));
  }, [pi, di, getNote]);

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
        placeholder="Add your notes, reflections, or codes..."
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
  tasks: any[];
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

  // Reset widget when day changes
  useEffect(() => {
    setBrief('');
    setQuiz(null);
    setSelectedOpt(null);
  }, [pi, di]);

  const handleGenerateBrief = async () => {
    setLoadingBrief(true);
    setBrief('');
    try {
      const tasksText = tasks.map(t => `- [${t.k}] ${t.t}`).join('\n');
      const text = await AIService.generateDailyBrief(day, label, phaseTitle, tasksText, note);
      setBrief(text);
    } catch (e: any) {
      setBrief(`⚠ Error: ${e.message || 'Could not connect. Configure your Anthropic Key.'}`);
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
      
      <div className="ai-brief-body">
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
export default FocusView;
