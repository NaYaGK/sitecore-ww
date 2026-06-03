import React, { useState } from 'react';
import { UseAppStateReturnType } from '../hooks/useAppState';
import { QBANK } from '../data/qbank';
import { PROJECTS } from '../data/projects';
import { CERT_MAP } from '../data/labs';
import { PHASES } from '../data/phases';

interface ReadinessViewProps {
  appState: UseAppStateReturnType;
}

export const ReadinessView: React.FC<ReadinessViewProps> = ({ appState }) => {
  const {
    state,
    cntDone,
    cntTotal,
    dayPct,
    getWeekDone,
    isProjectCompleted,
  } = appState;

  const [output, setOutput] = useState<any | null>(null);

  // Helper to compute cert readiness
  const getCertReadiness = (certKey: string) => {
    const cert = CERT_MAP[certKey];
    if (!cert) return 0;
    let totalWeight = 0;
    let coveredWeight = 0;

    cert.domains.forEach(dom => {
      totalWeight += dom.weight;
      const coveredDays = dom.days.filter(dayNum => {
        let found = false;
        PHASES.forEach((ph, pi) => {
          ph.data.forEach((d, di) => {
            const dn = parseInt((d.day || '').replace('Day ', ''));
            if (dn === dayNum && dayPct(pi, di) >= 50) found = true;
          });
        });
        return found;
      });
      coveredWeight += dom.weight * (coveredDays.length / Math.max(dom.days.length, 1));
    });

    return Math.round((coveredWeight / Math.max(totalWeight, 1)) * 100);
  };

  const handleCheck = () => {
    const done = cntDone();
    const total = cntTotal();
    const pct = total ? Math.round((done / total) * 100) : 0;
    const builtProjects = PROJECTS.filter(p => isProjectCompleted(p.id));
    const buildLogs = state.buildLogs;
    const qDoneCount = QBANK.filter(q => appState.qDone(q.id)).length;
    const qPct = Math.round((qDoneCount / QBANK.length) * 100);
    const ghUser = state.ghUser;

    // Check resume export
    const storedExportedAt = localStorage.getItem('devops90_resume_exported_at');
    const resumeExportedAt = storedExportedAt ? parseInt(storedExportedAt) : 0;
    const resumeExported = !!(resumeExportedAt && (Date.now() - resumeExportedAt) < 7 * 24 * 60 * 60 * 1000);

    const certReady = Object.keys(CERT_MAP).some(k => getCertReadiness(k) >= CERT_MAP[k].passmark);
    const weekDone = getWeekDone();

    const checks = [
      { label: 'Overall roadmap progress ≥ 60%', pass: pct >= 60, value: pct + '%', fix: 'Keep completing tasks in the Roadmap tab' },
      { label: 'Q-Bank answered ≥ 80%', pass: qPct >= 80, value: qPct + '%', fix: 'Go to Q-Bank and answer remaining questions' },
      { label: 'Production projects built ≥ 3', pass: builtProjects.length >= 3, value: builtProjects.length + ' built', fix: 'Build projects in the Projects tab and mark them done' },
      { label: 'Build log entries ≥ 5', pass: buildLogs.length >= 5, value: buildLogs.length + ' entries', fix: 'Log what you build each day in Build Logger' },
      { label: 'GitHub username connected', pass: !!ghUser, value: ghUser ? '@' + ghUser : 'Not set', fix: 'Go to GitHub Rewriter and connect your username' },
      { label: 'Resume exported in last 7 days', pass: resumeExported, value: resumeExported ? '✓ Recent' : 'Not exported', fix: 'Go to Resume Builder and generate + copy your resume' },
      { label: 'Active this week (≥ 5 tasks)', pass: weekDone >= 5, value: weekDone + ' this week', fix: 'Go to Roadmap and complete more tasks today' },
      { label: 'Cert readiness: at least 1 cert ≥ passmark', pass: certReady, value: certReady ? 'Ready' : 'Not yet', fix: 'Work through relevant roadmap phases for CKA or Terraform Associate' },
    ];

    const passCount = checks.filter(c => c.pass).length;
    const overallPct = Math.round((passCount / checks.length) * 100);
    const isReady = passCount >= 6;

    setOutput({
      checks,
      passCount,
      overallPct,
      isReady
    });
  };

  return (
    <div className="wrap">
      <div style={{ marginBottom: '16px' }}>
        <div className="eyebrow">Before you apply</div>
        <h2 className="page-title">Readiness Gate</h2>
        <p className="page-sub">Check this before applying to any company. Applying too early wastes referrals and burns goodwill.</p>
      </div>

      <div className="v4-card" style={{ textAlign: 'center', padding: '20px', background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', marginBottom: '12px' }}>
        <div style={{ fontSize: '14px', color: 'var(--sub)', marginBottom: '16px' }}>
          Run a readiness check against 8 criteria. 6/8 minimum before applying.
        </div>
        <button
          className="v4-btn-primary"
          onClick={handleCheck}
          style={{ padding: '10px 24px', fontSize: '12px', background: 'rgba(0,217,160,.1)', border: '1px solid rgba(0,217,160,.4)', color: 'var(--green)', fontFamily: 'var(--mono)', borderRadius: 'var(--r8)', cursor: 'pointer' }}
        >
          Run Readiness Check
        </button>
      </div>

      {output && (
        <div id="rg-output" style={{ marginTop: '4px' }}>
          <div style={{ textAlign: 'center', padding: '16px 0 20px' }}>
            <div
              style={{
                fontSize: '52px',
                fontWeight: 800,
                fontFamily: 'var(--mono)',
                color: output.isReady ? 'var(--green)' : output.overallPct >= 60 ? 'var(--amber)' : 'var(--red)'
              }}
            >
              {output.passCount}/{output.checks.length}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--sub)', marginTop: '5px' }}>
              {output.isReady ? '✅ READY TO APPLY' : '🚫 NOT READY YET — fix the red items below first'}
            </div>
            {output.isReady && (
              <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--green)' }}>
                Apply to 5-10 roles per week. Customise every resume to the JD.
              </div>
            )}
          </div>

          {output.checks.map((c: any, idx: number) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                background: 'var(--s1)',
                border: `1px solid ${c.pass ? 'rgba(0,217,160,.25)' : 'rgba(255,95,95,.2)'}`,
                borderRadius: '10px',
                marginBottom: '7px'
              }}
            >
              <div style={{ fontSize: '18px', flexShrink: 0 }}>{c.pass ? '✅' : '❌'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: c.pass ? 'var(--text)' : 'var(--sub)' }}>
                  {c.label}
                </div>
                {!c.pass && <div style={{ fontSize: '11px', color: 'var(--sub)', marginTop: '2px' }}>→ {c.fix}</div>}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: c.pass ? 'var(--green)' : 'var(--red)', flexShrink: 0 }}>
                {c.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ReadinessView;
