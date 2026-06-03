import React, { useState } from 'react';
import { UseAppStateReturnType } from '../hooks/useAppState';
import { PHASES } from '../data/phases';
import { showToast } from '../components/Toast';

interface ReportViewProps {
  appState: UseAppStateReturnType;
}

export const ReportView: React.FC<ReportViewProps> = ({ appState }) => {
  const {
    state,
    weekData,
    studyHours,
    readinessScore,
    cntDone,
    cntTotal,
    calcETA,
    calcXP,
    getLevelInfo,
    dayTotal,
    dayDone,
  } = appState;

  const [reportWeekOffset, setReportWeekOffset] = useState(0);

  const done = cntDone();
  const total = cntTotal();
  const progressPct = total ? Math.round((done / total) * 100) : 0;
  const levelInfo = getLevelInfo();

  const wd = weekData(reportWeekOffset);
  const weekTasks = wd.reduce((a, d) => a + d.count, 0);
  const activeDays = wd.filter(d => d.count > 0 && !d.isFuture).length;
  const wLabel = reportWeekOffset === 0 ? 'This week' : reportWeekOffset === 1 ? 'Last week' : `${reportWeekOffset} weeks ago`;

  const eta = calcETA();

  const handleExport = () => {
    let text = `90 Days of DevOps v4 — Weekly Report\n==========================================\nGenerated: ${new Date().toLocaleDateString('en-IN')}\n\n`;
    text += `OVERALL: ${done}/${total} tasks (${progressPct}%) | XP: ${calcXP()} | Readiness: ${readinessScore()}%\n`;
    text += `Level: ${levelInfo.lvl.title}\n\n`;
    text += `PHASE BREAKDOWN:\n`;
    PHASES.forEach((ph, pi) => {
      const phTotal = ph.data.reduce((a, _d, di) => a + dayTotal(pi, di), 0);
      const phDone = ph.data.reduce((a, _d, di) => a + dayDone(pi, di), 0);
      text += `${ph.title}: ${phDone}/${phTotal}\n`;
    });
    
    try {
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'devops90-v4-report.txt';
      a.click();
      URL.revokeObjectURL(url);
      showToast('✓ Report exported successfully', 'rgba(0,217,160,.1)');
    } catch (_) {
      showToast('Export failed', 'var(--red)');
    }
  };

  const maxCount = Math.max(1, ...wd.map(d => d.count));

  return (
    <div className="wrap">
      <div style={{ marginBottom: '14px' }}>
        <div className="eyebrow">Weekly retro</div>
        <h2 className="page-title">Weekly Report</h2>
      </div>

      <div className="report-card" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '15px', marginBottom: '10px' }}>
        <div className="report-week-nav" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', justifyContent: 'center' }}>
          <button
            className="report-week-btn"
            onClick={() => setReportWeekOffset(prev => prev + 1)}
            style={{ background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 10px', borderRadius: 'var(--r8)', cursor: 'pointer' }}
          >
            ←
          </button>
          <span className="report-week-label" style={{ fontWeight: 600, fontSize: '13px', minWidth: '130px', textAlign: 'center' }}>
            {wLabel}
          </span>
          <button
            className="report-week-btn"
            disabled={reportWeekOffset === 0}
            onClick={() => setReportWeekOffset(prev => Math.max(0, prev - 1))}
            style={{ background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 10px', borderRadius: 'var(--r8)', cursor: reportWeekOffset === 0 ? 'not-allowed' : 'pointer', opacity: reportWeekOffset === 0 ? 0.5 : 1 }}
          >
            →
          </button>
        </div>

        <div className="report-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '7px', marginBottom: '12px' }}>
          <div className="report-stat" style={{ textAlign: 'center' }}>
            <div className="report-stat-num" style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--green)' }}>
              {weekTasks}
            </div>
            <div className="report-stat-lbl" style={{ fontSize: '9px', color: 'var(--sub)', fontFamily: 'var(--mono)' }}>
              Tasks
            </div>
          </div>
          <div className="report-stat" style={{ textAlign: 'center' }}>
            <div className="report-stat-num" style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--blue)' }}>
              {activeDays}/7
            </div>
            <div className="report-stat-lbl" style={{ fontSize: '9px', color: 'var(--sub)', fontFamily: 'var(--mono)' }}>
              Active days
            </div>
          </div>
          <div className="report-stat" style={{ textAlign: 'center' }}>
            <div className="report-stat-num" style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--amber)' }}>
              {studyHours()}h
            </div>
            <div className="report-stat-lbl" style={{ fontSize: '9px', color: 'var(--sub)', fontFamily: 'var(--mono)' }}>
              Pomo hrs
            </div>
          </div>
          <div className="report-stat" style={{ textAlign: 'center' }}>
            <div className="report-stat-num" style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--purple)' }}>
              {readinessScore()}%
            </div>
            <div className="report-stat-lbl" style={{ fontSize: '9px', color: 'var(--sub)', fontFamily: 'var(--mono)' }}>
              Readiness
            </div>
          </div>
        </div>

        <div className="report-section-title" style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '6px' }}>
          Day by day
        </div>
        <div id="report-day-bars">
          {wd.map((day, idx) => {
            const barPct = day.isFuture ? 0 : Math.round((day.count / maxCount) * 100);

            return (
              <div key={idx} className="day-bar-row" style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
                <span className="day-bar-name" style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--sub)', width: '28px' }}>
                  {day.name}
                </span>
                <div className="day-bar-track" style={{ flex: 1, height: '7px', background: 'var(--s3)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    className="day-bar-fill"
                    style={{
                      height: '100%',
                      background: day.isFuture ? 'var(--s3)' : 'var(--green)',
                      borderRadius: '4px',
                      width: `${barPct}%`,
                      transition: 'width .4s'
                    }}
                  ></div>
                </div>
                <span className="day-bar-count" style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--sub)', width: '48px', textAlign: 'right' }}>
                  {day.isFuture ? '—' : `${day.count} tasks`}
                </span>
              </div>
            );
          })}
        </div>

        {eta && eta.etaBest && eta.etaWorst && (
          <div className="eta-band" id="eta-band" style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 'var(--r8)', padding: '8px 11px', marginTop: '7px' }}>
            <div className="eta-band-title" style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--sub)', marginBottom: '4px' }}>
              📅 ETA BAND
            </div>
            <div id="eta-band-content" style={{ fontSize: '12px', color: 'var(--sub)' }}>
              Best case: <strong style={{ color: 'var(--green)' }}>{eta.etaBest}</strong> · Likely:{' '}
              <strong style={{ color: 'var(--amber)' }}>{eta.eta}</strong> · Worst case:{' '}
              <strong style={{ color: 'var(--red)' }}>{eta.etaWorst}</strong>
              <br />
              <span style={{ fontSize: '11px', fontFamily: 'var(--mono)' }}>
                Based on {eta.avgPerDay} avg tasks/day over last 7 active days
              </span>
            </div>
          </div>
        )}

        <button
          className="report-export-btn"
          onClick={handleExport}
          style={{ background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: '10px', padding: '5px 12px', borderRadius: 'var(--r8)', cursor: 'pointer', marginTop: '10px' }}
        >
          ↓ Export Report
        </button>
      </div>

      <div className="report-card" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '15px', marginBottom: '10px' }}>
        <div className="report-section-title" style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '10px' }}>
          Overall
        </div>
        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          <div className="sc" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '10px 6px', textAlign: 'center' }}>
            <div className="sc-num" style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--green)' }}>
              {done}
            </div>
            <div className="sc-lbl" style={{ fontSize: '9px', color: 'var(--sub)', marginTop: '2px', fontFamily: 'var(--mono)' }}>
              Tasks Done
            </div>
          </div>
          <div className="sc" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '10px 6px', textAlign: 'center' }}>
            <div className="sc-num" style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--amber)' }}>
              {state.streak}
            </div>
            <div className="sc-lbl" style={{ fontSize: '9px', color: 'var(--sub)', marginTop: '2px', fontFamily: 'var(--mono)' }}>
              🔥 Streak
            </div>
          </div>
          <div className="sc" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '10px 6px', textAlign: 'center' }}>
            <div className="sc-num" style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--teal)' }}>
              {studyHours()}h
            </div>
            <div className="sc-lbl" style={{ fontSize: '9px', color: 'var(--sub)', marginTop: '2px', fontFamily: 'var(--mono)' }}>
              ⏱ Studied
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReportView;
