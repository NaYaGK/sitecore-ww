import React, { useState, useEffect, useRef } from 'react';
import { QBANK } from '../data/qbank';
import { UseAppStateReturnType } from '../hooks/useAppState';
import { AIService } from '../components/AIService';
import { showToast } from '../components/Toast';

interface MockInterviewViewProps {
  appState: UseAppStateReturnType;
  switchView: (view: string) => void;
}

interface MockQuestionState {
  active: boolean;
  qIdx: number;
  questions: typeof QBANK;
  timeLeft: number;
  answers: { q: string; cat: string; score: number; timedOut?: boolean }[];
}

export const MockInterviewView: React.FC<MockInterviewViewProps> = ({ appState, switchView }) => {
  const { addMockResult, getWeakTopics, state } = appState;

  const [topic, setTopic] = useState('all');
  const [count, setCount] = useState(5);
  const [mock, setMock] = useState<MockQuestionState>({
    active: false,
    qIdx: 0,
    questions: [],
    timeLeft: 120,
    answers: [],
  });

  const [userAnswer, setUserAnswer] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<any | null>(null);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startMockInterview = () => {
    let pool = topic === 'all' ? [...QBANK] : QBANK.filter(q => q.cat === topic);
    if (!pool.length) {
      showToast('No questions found for this topic', 'var(--red)');
      return;
    }
    pool = pool.sort(() => Math.random() - 0.5).slice(0, count);

    setMock({
      active: true,
      qIdx: 0,
      questions: pool,
      timeLeft: 120,
      answers: [],
    });
    setUserAnswer('');
    setGradeResult(null);
    setIsTimedOut(false);
    setShowResults(false);
  };

  // Handle countdown
  useEffect(() => {
    if (mock.active && !showResults && !gradeResult && !isTimedOut) {
      timerRef.current = setInterval(() => {
        setMock(prev => {
          if (prev.timeLeft <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            // Handle timeout
            handleTimeoutSubmit(prev);
            return { ...prev, timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mock.active, mock.qIdx, showResults, gradeResult, isTimedOut]);

  const handleTimeoutSubmit = async (currentState: MockQuestionState) => {
    setIsTimedOut(true);
    const q = currentState.questions[currentState.qIdx];
    const newAnswers = [...currentState.answers, { q: q.q, cat: q.cat, score: 0, timedOut: true }];
    setMock(prev => ({ ...prev, answers: newAnswers }));
  };

  const submitAnswer = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const q = mock.questions[mock.qIdx];
    setIsGrading(true);
    setGradeResult(null);

    try {
      const result = await AIService.gradeMockInterviewAnswer(q.q, q.a, userAnswer.trim());
      setGradeResult(result);
      setMock(prev => ({
        ...prev,
        answers: [...prev.answers, { q: q.q, cat: q.cat, score: result.score }]
      }));
    } catch (e: any) {
      showToast(e.message || 'AI grading failed. Saving default grade.', 'var(--red)');
      setGradeResult({
        score: 50,
        improvement: 'Failed to connect to Claude. Model answer is shown below.',
        correct: [],
        missing: [],
        wrong: [],
      });
      setMock(prev => ({
        ...prev,
        answers: [...prev.answers, { q: q.q, cat: q.cat, score: 50 }]
      }));
    } finally {
      setIsGrading(false);
    }
  };

  const handleNext = () => {
    setGradeResult(null);
    setIsTimedOut(false);
    setUserAnswer('');
    
    if (mock.qIdx + 1 >= mock.questions.length) {
      // End interview
      const avg = mock.answers.length
        ? Math.round(mock.answers.reduce((a, r) => a + r.score, 0) / mock.answers.length)
        : 0;
      
      addMockResult({
        date: new Date().toLocaleDateString('en-IN'),
        questions: mock.questions.length,
        avg,
        answers: mock.answers.map(ans => ({ q: ans.q, cat: ans.cat, score: ans.score, timedOut: ans.timedOut })),
        cat: topic,
      });

      setShowResults(true);
    } else {
      setMock(prev => ({
        ...prev,
        qIdx: prev.qIdx + 1,
        timeLeft: 120
      }));
    }
  };

  const resetMockInterview = () => {
    setMock({
      active: false,
      qIdx: 0,
      questions: [],
      timeLeft: 120,
      answers: [],
    });
    setUserAnswer('');
    setGradeResult(null);
    setIsTimedOut(false);
    setShowResults(false);
  };

  const formatTimerTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const weakTopics = getWeakTopics();

  return (
    <div className="wrap">
      <div style={{ marginBottom: '16px' }}>
        <div className="eyebrow">Pressure practice</div>
        <h2 className="page-title">Mock Interview</h2>
        <p className="page-sub">Timed questions. No peeking at answers. AI grades your response. Tracks weak topics.</p>
      </div>

      {!mock.active && (
        <div id="mock-setup">
          <div className="v4-card" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label className="v4-label">Topic</label>
                <select
                  className="v4-select v4-input"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  style={{ width: '100%', background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '13px', padding: '8px 11px', borderRadius: 'var(--r8)', outline: 'none' }}
                >
                  <option value="all">All Topics (recommended)</option>
                  <option value="k8s">Kubernetes</option>
                  <option value="gitops">GitOps</option>
                  <option value="iac">IaC / Terraform</option>
                  <option value="security">Security</option>
                  <option value="cicd">CI/CD</option>
                  <option value="obs">Observability</option>
                  <option value="platform">Platform Engineering</option>
                </select>
              </div>
              <div>
                <label className="v4-label">Questions</label>
                <select
                  className="v4-select v4-input"
                  value={count}
                  onChange={e => setCount(parseInt(e.target.value))}
                  style={{ width: '100%', background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '13px', padding: '8px 11px', borderRadius: 'var(--r8)', outline: 'none' }}
                >
                  <option value="3">3 questions (10 min)</option>
                  <option value="5">5 questions (15 min)</option>
                  <option value="10">10 questions (30 min)</option>
                </select>
              </div>
            </div>
            <div style={{ background: 'var(--s2)', borderRadius: 'var(--r8)', padding: '11px 13px', fontSize: '13px', color: 'var(--sub)', marginBottom: '14px' }}>
              📋 <strong style={{ color: 'var(--text)' }}>Rules:</strong> 2 minutes per question. Type your answer as if speaking to an interviewer. Be specific — say the command, name the tool, describe the architecture. Vague answers score low.
            </div>
            <button
              className="v4-btn-primary"
              onClick={startMockInterview}
              style={{ width: '100%', padding: '10px', fontSize: '12px', background: 'rgba(0,217,160,.1)', border: '1px solid rgba(0,217,160,.4)', color: 'var(--green)', fontFamily: 'var(--mono)', borderRadius: 'var(--r8)', cursor: 'pointer' }}
            >
              Start Mock Interview →
            </button>
          </div>

          {/* Past results */}
          {state.mockHistory.length > 0 && (
            <div style={{ marginTop: '14px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>
                Past sessions
              </div>
              {state.mockHistory.slice(0, 5).map(r => (
                <div key={r.id} style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r8)', padding: '9px 12px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--mono)', color: r.avg >= 75 ? 'var(--green)' : r.avg >= 55 ? 'var(--amber)' : 'var(--red)' }}>
                    {r.avg}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>
                      {r.questions} questions · {r.date}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--sub)' }}>Avg score: {r.avg}/100</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mock.active && !showResults && (
        <div id="mock-arena">
          <div className="v4-card" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--sub)' }}>
                Question {mock.qIdx + 1} of {mock.questions.length}
              </div>
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: mock.timeLeft < 30 ? 'var(--red)' : mock.timeLeft < 60 ? 'var(--amber)' : 'var(--green)'
                }}
              >
                {formatTimerTime(mock.timeLeft)}
              </div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.6, marginBottom: '14px', color: 'var(--text)' }}>
              {mock.questions[mock.qIdx]?.q}
            </div>

            <textarea
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              disabled={isGrading || !!gradeResult || isTimedOut}
              className="v4-input"
              placeholder="Type your answer here… be specific. Name the commands, tools, and architecture decisions."
              style={{ minHeight: '120px', resize: 'vertical', marginBottom: '10px', fontSize: '13px', lineHeight: 1.6, background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--body)', padding: '8px 11px', borderRadius: 'var(--r8)', outline: 'none' }}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              {!gradeResult && !isTimedOut && (
                <button
                  className="v4-btn-primary"
                  onClick={submitAnswer}
                  disabled={isGrading}
                  style={{ padding: '8px 18px', background: 'rgba(0,217,160,.1)', border: '1px solid rgba(0,217,160,.4)', color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '10px', borderRadius: 'var(--r8)', cursor: 'pointer' }}
                >
                  Submit Answer
                </button>
              )}
              {(gradeResult || isTimedOut) && (
                <button
                  className="v4-btn-secondary"
                  onClick={handleNext}
                  style={{ padding: '8px 18px', background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--sub)', fontFamily: 'var(--mono)', fontSize: '10px', borderRadius: 'var(--r8)', cursor: 'pointer' }}
                >
                  {mock.qIdx + 1 >= mock.questions.length ? 'Show Results' : 'Next Question →'}
                </button>
              )}
            </div>

            {/* Grading State */}
            {isGrading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sub)', fontSize: '12px', padding: '8px', marginTop: '12px' }}>
                <div className="ai-spinner"></div>
                Grading your answer…
              </div>
            )}

            {/* Timeout Feedback */}
            {isTimedOut && !gradeResult && (
              <div id="mock-feedback" style={{ marginTop: '12px' }}>
                <div style={{ color: 'var(--red)', fontSize: '13px', padding: '10px' }}>⏰ Time's up! No answer submitted.</div>
                <div style={{ marginTop: '8px', padding: '10px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)', marginBottom: '4px' }}>MODEL ANSWER</div>
                  <div style={{ fontSize: '12px', color: 'var(--sub)', lineHeight: 1.7 }}>{mock.questions[mock.qIdx]?.a}</div>
                </div>
              </div>
            )}

            {/* Grade Feedback */}
            {gradeResult && (
              <div id="mock-feedback" style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'var(--s2)', borderRadius: '10px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--mono)', color: gradeResult.score >= 80 ? 'var(--green)' : gradeResult.score >= 60 ? 'var(--amber)' : 'var(--red)' }}>
                    {gradeResult.score}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>
                      {gradeResult.score >= 80 ? 'Strong answer' : 'Needs improvement'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--sub)', marginTop: '2px' }}>{gradeResult.improvement || ''}</div>
                  </div>
                </div>
                {gradeResult.correct && gradeResult.correct.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--green)', marginBottom: '4px' }}>✓ CORRECT</div>
                    {gradeResult.correct.map((c: string, idx: number) => (
                      <div key={idx} style={{ fontSize: '12px', color: 'var(--sub)', padding: '2px 0' }}>• {c}</div>
                    ))}
                  </div>
                )}
                {gradeResult.missing && gradeResult.missing.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--amber)', marginBottom: '4px' }}>⚠ MISSING</div>
                    {gradeResult.missing.map((c: string, idx: number) => (
                      <div key={idx} style={{ fontSize: '12px', color: 'var(--sub)', padding: '2px 0' }}>• {c}</div>
                    ))}
                  </div>
                )}
                {gradeResult.wrong && gradeResult.wrong.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--red)', marginBottom: '4px' }}>✗ INCORRECT</div>
                    {gradeResult.wrong.map((c: string, idx: number) => (
                      <div key={idx} style={{ fontSize: '12px', color: 'var(--sub)', padding: '2px 0' }}>• {c}</div>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: '8px', padding: '10px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)', marginBottom: '4px' }}>MODEL ANSWER</div>
                  <div style={{ fontSize: '12px', color: 'var(--sub)', lineHeight: 1.7 }}>{mock.questions[mock.qIdx]?.a}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showResults && (
        <div id="mock-results">
          {(() => {
            const avg = mock.answers.length
              ? Math.round(mock.answers.reduce((a, r) => a + r.score, 0) / mock.answers.length)
              : 0;

            return (
              <>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '48px', fontWeight: 800, fontFamily: 'var(--mono)', color: avg >= 75 ? 'var(--green)' : avg >= 55 ? 'var(--amber)' : 'var(--red)' }}>
                    {avg}
                    <span style={{ fontSize: '22px' }}>/100</span>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--sub)', marginTop: '5px' }}>
                    {avg >= 75 ? 'Interview ready' : 'Keep practising'} · {mock.answers.length} questions
                  </div>
                </div>
                {mock.answers.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--s3)' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)', width: '24px' }}>{i + 1}</div>
                    <div style={{ flex: 1, fontSize: '12px', color: 'var(--sub)' }}>{a.q.substring(0, 70)}…</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: a.score >= 75 ? 'var(--green)' : a.score >= 55 ? 'var(--amber)' : 'var(--red)' }}>
                      {a.score}
                    </div>
                  </div>
                ))}
                {weakTopics.length > 0 && (
                  <div style={{ marginTop: '14px', padding: '12px', background: 'rgba(255,200,80,.06)', border: '1px solid rgba(255,200,80,.2)', borderRadius: '10px' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--amber)', marginBottom: '7px' }}>
                      WEAK TOPICS — FOCUS HERE NEXT
                    </div>
                    {weakTopics.map((t, idx) => (
                      <div key={idx} style={{ fontSize: '12px', color: 'var(--sub)', padding: '2px 0' }}>
                        • {t.cat.toUpperCase()} (avg score: {t.avg}/100)
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                  <button
                    className="v4-btn-primary"
                    onClick={resetMockInterview}
                    style={{ padding: '10px 18px', background: 'rgba(0,217,160,.1)', border: '1px solid rgba(0,217,160,.4)', color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '10px', borderRadius: 'var(--r8)', cursor: 'pointer' }}
                  >
                    Try Again
                  </button>
                  <button
                    className="v4-btn-secondary"
                    onClick={() => switchView('qbank')}
                    style={{ padding: '10px 18px', background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--sub)', fontFamily: 'var(--mono)', fontSize: '10px', borderRadius: 'var(--r8)', cursor: 'pointer' }}
                  >
                    Go to Q-Bank
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
export default MockInterviewView;
