import React, { useState } from 'react';
import { UseAppStateReturnType } from '../hooks/useAppState';
import { PROJECTS, ATS_KEYWORDS } from '../data/projects';
import { PHASES } from '../data/phases';
import { showToast } from '../components/Toast';

interface SkillGapViewProps {
  appState: UseAppStateReturnType;
  setFocusDay: (day: string) => void;
  switchView: (view: string) => void;
}

export const SkillGapView: React.FC<SkillGapViewProps> = ({ appState, setFocusDay, switchView }) => {
  const {
    state,
    dayDone,
    addSavedJD,
    deleteSavedJD,
  } = appState;

  const [company, setCompany] = useState('');
  const [jdText, setJdText] = useState('');
  const [analysis, setAnalysis] = useState<any | null>(null);

  const handleAnalyse = () => {
    if (!jdText.trim()) {
      showToast('Paste a job description first', 'var(--red)');
      return;
    }

    // Extract keywords from JD
    const extractedKeywords = ATS_KEYWORDS.filter(kw =>
      jdText.toLowerCase().includes(kw.toLowerCase())
    );

    // Extra common terms
    const extraTerms = [
      'Helm', 'GitOps', 'EKS', 'GKE', 'AKS', 'Istio', 'Vault', 'Consul', 'Datadog',
      'Splunk', 'ELK', 'ArgoCD', 'Flux', 'Jenkins', 'CircleCI', 'Pulumi', 'CDK',
      'CloudFormation', 'Nagios', 'Zabbix'
    ];
    extraTerms.forEach(t => {
      if (jdText.toLowerCase().includes(t.toLowerCase()) && !extractedKeywords.includes(t)) {
        extractedKeywords.push(t);
      }
    });

    // Map against completed tasks + built projects
    const builtTechStack: string[] = [];
    PROJECTS.forEach(p => {
      const isDone = state.projdone[`proj_done_${p.id}`];
      if (isDone) builtTechStack.push(...p.techStack);
    });

    const completedDayKeywords: string[] = [];
    PHASES.forEach((ph, pi) => {
      ph.data.forEach((d, di) => {
        if (dayDone(pi, di) > 0) {
          d.tasks.forEach(t => {
            ATS_KEYWORDS.forEach(kw => {
              if (t.t.toLowerCase().includes(kw.toLowerCase())) {
                completedDayKeywords.push(kw);
              }
            });
          });
        }
      });
    });

    const allKnownKeywords = Array.from(new Set([...builtTechStack, ...completedDayKeywords]));

    const covered = extractedKeywords.filter(k =>
      allKnownKeywords.some(ak => ak.toLowerCase() === k.toLowerCase())
    );
    const partial = extractedKeywords.filter(k =>
      !covered.includes(k) && completedDayKeywords.some(ck => ck.toLowerCase() === k.toLowerCase())
    );
    const missing = extractedKeywords.filter(k =>
      !covered.includes(k) && !partial.includes(k)
    );
    const matchPct = extractedKeywords.length
      ? Math.round(((covered.length + partial.length * 0.5) / extractedKeywords.length) * 100)
      : 0;

    // Find which roadmap days cover the missing keywords
    const dayRecs: { day: string; label: string; kw: string; pi: number; di: number }[] = [];
    missing.forEach(kw => {
      PHASES.forEach((ph, pi) => {
        ph.data.forEach((d, di) => {
          if (d.tasks.some(t => t.t.toLowerCase().includes(kw.toLowerCase()))) {
            if (!dayRecs.find(r => r.day === d.day)) {
              dayRecs.push({ day: d.day, label: d.label, kw, pi, di });
            }
          }
        });
      });
    });

    setAnalysis({
      covered,
      partial,
      missing,
      matchPct,
      dayRecs,
      extractedCount: extractedKeywords.length,
    });
  };

  const handleSaveJD = () => {
    if (!jdText.trim()) {
      showToast('Paste a job description first', 'var(--red)');
      return;
    }
    const companyName = company.trim() || 'Unknown';
    addSavedJD(companyName, jdText);
    showToast('JD saved', 'rgba(0,217,160,.1)');
  };

  const handleDayRecClick = (pi: number, di: number) => {
    setFocusDay(`${pi}_${di}`);
    switchView('focus');
  };

  const handleSavedJdClick = (savedJd: any) => {
    setCompany(savedJd.company);
    setJdText(savedJd.jd);
    setTimeout(() => {
      // Re-run analysis dynamically
      handleAnalyse();
    }, 100);
  };

  return (
    <div className="wrap">
      <div style={{ marginBottom: '16px' }}>
        <div className="eyebrow">JD → study plan</div>
        <h2 className="page-title">Skill Gap Analyser</h2>
        <p className="page-sub">Paste any JD. See exactly what you cover, what you need, and which roadmap days to do next.</p>
      </div>

      <div className="v4-card" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '16px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <input
            className="v4-input"
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="Company name"
            style={{ maxWidth: '200px', background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '13px', padding: '8px 11px', borderRadius: 'var(--r8)', outline: 'none' }}
          />
          <button
            className="v4-btn-primary"
            onClick={handleAnalyse}
            style={{ padding: '8px 16px', background: 'rgba(0,217,160,.1)', border: '1px solid rgba(0,217,160,.4)', color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '10px', borderRadius: 'var(--r8)', cursor: 'pointer' }}
          >
            Analyse JD
          </button>
          <button className="v4-btn-secondary" onClick={handleSaveJD}>
            Save JD
          </button>
        </div>
        <label className="v4-label">Paste Job Description</label>
        <textarea
          className="v4-input"
          value={jdText}
          onChange={e => setJdText(e.target.value)}
          placeholder="Paste the full job description here — skills section, requirements, tech stack…"
          style={{ minHeight: '140px', resize: 'vertical', fontSize: '12px', background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--body)', padding: '8px 11px', borderRadius: 'var(--r8)', outline: 'none' }}
        />
      </div>

      {analysis && (
        <div id="sg-output" style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', padding: '16px', background: 'var(--s2)', borderRadius: '12px' }}>
            <div style={{ fontSize: '40px', fontWeight: 800, fontFamily: 'var(--mono)', color: analysis.matchPct >= 70 ? 'var(--green)' : analysis.matchPct >= 45 ? 'var(--amber)' : 'var(--red)' }}>
              {analysis.matchPct}%
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>Job Match Score</div>
              <div style={{ fontSize: '12px', color: 'var(--sub)', marginTop: '2px' }}>
                {analysis.extractedCount} keywords found in JD · {analysis.covered.length} covered · {analysis.partial.length} partial · {analysis.missing.length} missing
              </div>
            </div>
          </div>

          {analysis.covered.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--green)', marginBottom: '5px' }}>
                ✓ COVERED BY YOUR PROJECTS & COMPLETED DAYS ({analysis.covered.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                {analysis.covered.map((k: string) => (
                  <span key={k} style={{ background: 'rgba(0,217,160,.1)', border: '1px solid rgba(0,217,160,.3)', color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.partial.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--amber)', marginBottom: '5px' }}>
                ◑ SEEN IN LESSONS BUT NOT BUILT ({analysis.partial.length}) — build a project
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                {analysis.partial.map((k: string) => (
                  <span key={k} style={{ background: 'rgba(255,200,80,.08)', border: '1px solid rgba(255,200,80,.3)', color: 'var(--amber)', fontFamily: 'var(--mono)', fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.missing.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--red)', marginBottom: '5px' }}>
                ✗ GAPS — NOT COVERED ({analysis.missing.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                {analysis.missing.map((k: string) => (
                  <span key={k} style={{ background: 'rgba(255,95,95,.07)', border: '1px solid rgba(255,95,95,.25)', color: 'var(--red)', fontFamily: 'var(--mono)', fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.dayRecs.length > 0 && (
            <div style={{ marginTop: '12px', padding: '12px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '10px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--blue)', marginBottom: '8px' }}>
                📚 ROADMAP DAYS THAT COVER YOUR GAPS
              </div>
              {analysis.dayRecs.slice(0, 6).map((r: any, rIdx: number) => (
                <div
                  key={rIdx}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: '1px solid var(--s3)', cursor: 'pointer' }}
                  onClick={() => handleDayRecClick(r.pi, r.di)}
                >
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--green)', flexShrink: 0 }}>{r.day}</span>
                  <span style={{ fontSize: '12px', color: 'var(--sub)', flex: 1 }}>{r.label}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--red)' }}>{r.kw}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="v4-section-title" style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '10px' }}>
        Saved JDs (up to 10)
      </div>
      <div id="sg-saved-jds">
        {state.savedJDs.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: '12px' }}>No saved JDs yet. Analyse one and click Save.</div>
        ) : (
          state.savedJDs.map(jd => (
            <div key={jd.id} style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{jd.company}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)' }}>{jd.analysed}</div>
              </div>
              <button onClick={() => handleSavedJdClick(jd)} className="v4-btn-secondary" style={{ fontSize: '10px', padding: '3px 9px' }}>
                Re-analyse
              </button>
              <button onClick={() => deleteSavedJD(jd.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '12px' }}>
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default SkillGapView;
