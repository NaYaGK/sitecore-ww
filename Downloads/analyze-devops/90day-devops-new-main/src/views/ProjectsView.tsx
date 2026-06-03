import React, { useState } from 'react';
import { PROJECTS, Project, generateREADME } from '../data/projects';
import { PHASES } from '../data/phases';
import { UseAppStateReturnType } from '../hooks/useAppState';
import { showToast } from '../components/Toast';
import confetti from 'canvas-confetti';

interface ProjectsViewProps {
  appState: UseAppStateReturnType;
  switchView: (view: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ appState, switchView }) => {
  const {
    dayTotal,
    dayDone,
    isProjectCompleted,
    toggleProjectCompleted,
    addBuildLog,
  } = appState;

  const [activeSpecProject, setActiveSpecProject] = useState<Project | null>(null);
  const [activeTipsProject, setActiveTipsProject] = useState<Project | null>(null);

  // Compute phase progress percentages
  const phasePct = PHASES.map((ph, pi) => {
    const tot = ph.data.reduce((a, _d, di) => a + dayTotal(pi, di), 0);
    const don = ph.data.reduce((a, _d, di) => a + dayDone(pi, di), 0);
    return tot ? Math.round((don / tot) * 100) : 0;
  });

  const handleMarkProject = (projId: string, isNowDone: boolean) => {
    toggleProjectCompleted(projId);
    if (isNowDone) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast('🚀 Project marked as built! Add it to Build Logger for your portfolio.', 'rgba(0,217,160,.12)');
    } else {
      showToast('Project unmarked.', 'var(--sub)');
    }
  };

  const handleCopyReadme = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('✓ README template copied to clipboard', 'rgba(0,217,160,.1)');
    });
  };

  const handleAddToLogger = (proj: Project) => {
    addBuildLog({
      tool: proj.techStack[0],
      project: proj.repoName,
      what: proj.headline,
      learned: proj.oneLiner,
      broke: '',
      github: '',
    });
    setActiveSpecProject(null);
    switchView('buildlog');
    showToast('✓ Added to Build Logger', 'rgba(0,217,160,.1)');
  };

  return (
    <div className="wrap">
      <div style={{ marginBottom: '16px' }}>
        <div className="eyebrow">Ship real things</div>
        <h2 className="page-title">Production Projects</h2>
        <p className="page-sub">9 projects that make your GitHub look like a working DevOps engineer, not a student.</p>
      </div>

      <div style={{ background: 'rgba(255,95,95,.06)', border: '1px solid rgba(255,95,95,.2)', borderRadius: 'var(--r12)', padding: '12px 14px', marginBottom: '16px', fontSize: '13px', color: 'var(--sub)' }}>
        <strong style={{ color: 'var(--red)' }}>The rule:</strong> Every repo name, README, and commit message should read like a production system — not a tutorial. Recruiters open GitHub before the first interview.
      </div>

      <div id="projects-wrap">
        {PROJECTS.map(proj => {
          const pct = phasePct[proj.phaseIdx] || 0;
          const unlocked = pct >= 30;
          const done = isProjectCompleted(proj.id);

          return (
            <div
              key={proj.id}
              style={{
                background: 'var(--s1)',
                border: `1px solid ${done ? 'rgba(0,217,160,.4)' : unlocked ? 'var(--border)' : 'var(--s3)'}`,
                borderRadius: '16px',
                padding: '18px',
                marginBottom: '12px',
                opacity: unlocked ? 1 : 0.5,
                transition: 'border-color .2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: done ? 'var(--green)' : 'var(--sub)', marginBottom: '4px' }}>
                    {proj.phase} · {unlocked ? 'UNLOCKED' : 'LOCKED — complete 30% of phase'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--text)' }}>
                      {proj.repoName}
                    </div>
                    {done && (
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--green)', border: '1px solid var(--green)', padding: '2px 8px', borderRadius: '6px' }}>
                        ✓ Built
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--sub)', marginBottom: '8px' }}>{proj.headline}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                    {proj.techStack.map((t, idx) => (
                      <span key={idx} style={{ background: 'var(--s3)', border: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '9px', padding: '2px 7px', borderRadius: '4px', color: 'var(--sub)' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 'shrink:0', textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)' }}>Phase progress</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--mono)', color: pct >= 50 ? 'var(--green)' : pct >= 30 ? 'var(--amber)' : 'var(--red)' }}>
                    {pct}%
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 12px', marginBottom: '10px', fontSize: '12.5px', color: 'var(--sub)', lineHeight: '1.7' }}>
                <strong style={{ color: 'var(--text)' }}>What to build:</strong> {proj.oneLiner}
                <br />
                <span style={{ color: 'var(--red)', fontFamily: 'var(--mono)', fontSize: '10px' }}>❌ NOT: {proj.NOT}</span>
              </div>

              <div style={{ background: 'rgba(0,217,160,.04)', border: '1px solid rgba(0,217,160,.15)', borderRadius: '8px', padding: '10px 12px', marginBottom: '10px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--green)', marginBottom: '5px' }}>
                  RESUME LINE
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text)', lineHeight: '1.6' }}>{proj.resumeLine}</div>
              </div>

              <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', marginBottom: '10px', fontFamily: 'var(--mono)' }}>
                <div style={{ fontSize: '10px', color: 'var(--sub)', marginBottom: '6px' }}>REQUIRED FILES</div>
                {proj.files.slice(0, 4).map((f, fIdx) => (
                  <div key={fIdx} style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)', padding: '3px 0', borderBottom: '1px solid var(--s3)' }}>
                    <span style={{ color: 'var(--green)' }}>{f.path}</span> <span style={{ color: 'var(--muted)' }}># {f.desc}</span>
                  </div>
                ))}
                {proj.files.length > 4 && (
                  <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>
                    + {proj.files.length - 4} more files (see full spec below)
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                {unlocked ? (
                  <>
                    <button className="v4-btn-primary" onClick={() => setActiveSpecProject(proj)}>
                      📋 Full Spec + README
                    </button>
                    <button className="v4-btn-secondary" onClick={() => setActiveTipsProject(proj)}>
                      🎤 Interview Tips
                    </button>
                    <button
                      className="v4-btn-secondary"
                      style={{ color: 'var(--green)', borderColor: 'rgba(0,217,160,.35)' }}
                      onClick={() => handleMarkProject(proj.id, !done)}
                    >
                      {done ? '↩ Unmark' : '✓ Mark Built'}
                    </button>
                  </>
                ) : (
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)' }}>
                    🔒 Complete 30% of "{proj.phase.split(' — ')[1] || proj.phase}" to unlock this project
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Spec Modal */}
      {activeSpecProject && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 500,
            background: 'rgba(0,0,0,.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setActiveSpecProject(null)}
        >
          <div
            style={{
              background: 'var(--s1)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '22px',
              width: 'min(680px, 96vw)',
              maxHeight: '85vh',
              overflowY: 'auto',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveSpecProject(null)}
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sub)', fontSize: '16px' }}
            >
              ✕
            </button>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', paddingRight: '24px' }}>
              📋 {activeSpecProject.repoName} Spec
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)', marginBottom: '12px' }}>
              Full file structure + generated README template
            </div>
            <div style={{ background: '#0d1117', borderRadius: '8px', padding: '12px', fontFamily: 'var(--mono)', fontSize: '11px', color: '#a8b8cc', maxHeight: '200px', overflowY: 'auto', marginBottom: '12px', whiteSpace: 'pre' }}>
              {activeSpecProject.files.map(f => `${f.path.padEnd(40)}# ${f.desc}`).join('\n')}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--green)', marginBottom: '6px' }}>
              GENERATED README TEMPLATE (copy to GitHub)
            </div>
            <textarea
              id="readme-output"
              value={generateREADME(activeSpecProject)}
              readOnly
              style={{ width: '100%', background: '#0d1117', border: '1px solid var(--border)', color: '#a8b8cc', fontFamily: 'var(--mono)', fontSize: '10px', padding: '10px', borderRadius: '8px', minHeight: '280px', resize: 'vertical', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: '7px', marginTop: '10px' }}>
              <button className="v4-btn-primary" onClick={() => handleCopyReadme(generateREADME(activeSpecProject))}>
                Copy README
              </button>
              <button className="v4-btn-secondary" onClick={() => handleAddToLogger(activeSpecProject)}>
                + Add to Build Logger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Tips Modal */}
      {activeTipsProject && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 500,
            background: 'rgba(0,0,0,.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setActiveTipsProject(null)}
        >
          <div
            style={{
              background: 'var(--s1)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '22px',
              width: 'min(680px, 96vw)',
              maxHeight: '85vh',
              overflowY: 'auto',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveTipsProject(null)}
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sub)', fontSize: '16px' }}
            >
              ✕
            </button>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', paddingRight: '24px' }}>
              🎤 Interview Talking Points — {activeTipsProject.repoName}
            </div>
            <div>
              {activeTipsProject.interviewTalkingPoints.map((tp, idx) => {
                const parts = tp.split(' — ');
                return (
                  <div key={idx} style={{ borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--amber)', marginBottom: '4px' }}>
                      ❓ {parts[0]}
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--sub)', lineHeight: '1.7' }}>{parts[1] || tp}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProjectsView;
