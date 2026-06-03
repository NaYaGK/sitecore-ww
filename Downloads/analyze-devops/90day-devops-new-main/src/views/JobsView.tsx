import React, { useState } from 'react';
import { UseAppStateReturnType, Job } from '../hooks/useAppState';
import { showToast } from '../components/Toast';

interface JobsViewProps {
  appState: UseAppStateReturnType;
}

export const JobsView: React.FC<JobsViewProps> = ({ appState }) => {
  const {
    state,
    addJob,
    deleteJob,
    moveJob,
  } = appState;

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [source, setSource] = useState('LinkedIn');
  const [notes, setNotes] = useState('');

  const handleAddJob = () => {
    if (!company.trim() || !role.trim()) {
      showToast('Company and Role are required', 'var(--red)');
      return;
    }
    addJob({
      company: company.trim(),
      role: role.trim(),
      source,
      notes: notes.trim(),
    });
    setCompany('');
    setRole('');
    setNotes('');
    showToast('✓ Job application tracked!', 'rgba(0,217,160,.1)');
  };

  const cols: Job['status'][] = ['applied', 'phone', 'technical', 'offer'];
  const labels: Record<Job['status'], string> = {
    applied: 'Applied',
    phone: 'Phone',
    technical: 'Technical',
    offer: 'Offer',
  };
  const colors: Record<Job['status'], string> = {
    applied: 'var(--sub)',
    phone: 'var(--blue)',
    technical: 'var(--amber)',
    offer: 'var(--green)',
  };
  const colEmojis: Record<Job['status'], string> = {
    applied: '📨',
    phone: '📞',
    technical: '💻',
    offer: '🎉',
  };

  const getDaysSinceApplied = (createdAt: string) => {
    try {
      const created = new Date(createdAt);
      const diff = new Date().getTime() - created.getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    } catch (_) {
      return 0;
    }
  };

  return (
    <div className="wrap">
      <div style={{ marginBottom: '14px' }}>
        <div className="eyebrow">The finish line</div>
        <h2 className="page-title">Job Tracker</h2>
        <p className="page-sub">Track your applications, interview stages, and offers.</p>
      </div>

      {/* Add Job Row */}
      <div className="job-add-row" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'flex-end' }}>
        <input
          className="job-input"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company *"
          style={{ maxWidth: '130px', background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '12px', padding: '7px 9px', borderRadius: 'var(--r8)', outline: 'none' }}
        />
        <input
          className="job-input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Role *"
          style={{ maxWidth: '150px', background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '12px', padding: '7px 9px', borderRadius: 'var(--r8)', outline: 'none' }}
        />
        <select
          className="job-source-select"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          style={{ background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '12px', padding: '7px 9px', borderRadius: 'var(--r8)', outline: 'none' }}
        >
          <option>LinkedIn</option>
          <option>Naukri</option>
          <option>Wellfound</option>
          <option>Company site</option>
          <option>Referral</option>
        </select>
        <input
          className="job-input"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (salary, stack…)"
          style={{ flex: 2, background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '12px', padding: '7px 9px', borderRadius: 'var(--r8)', outline: 'none', minWidth: '100px' }}
        />
        <button
          className="job-save-btn"
          onClick={handleAddJob}
          style={{ background: 'rgba(0,217,160,.09)', border: '1px solid rgba(0,217,160,.35)', color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '10px', padding: '7px 12px', borderRadius: 'var(--r8)', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          + Add
        </button>
      </div>

      {/* Stats row */}
      <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '12px' }}>
        {cols.map(c => {
          const cnt = state.jobs.filter(j => j.status === c).length;
          return (
            <div key={c} className="sc" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '10px 6px', textAlign: 'center' }}>
              <div className="sc-num" style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--mono)', color: colors[c] }}>
                {cnt}
              </div>
              <div className="sc-lbl" style={{ fontSize: '9px', color: 'var(--sub)', marginTop: '2px', fontFamily: 'var(--mono)' }}>
                {labels[c]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban lanes */}
      <div className="job-kanban" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {cols.map(colKey => {
          const colJobs = state.jobs.filter(j => j.status === colKey);
          
          return (
            <div key={colKey} className="job-col" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', overflow: 'hidden' }}>
              <div className="job-col-hdr" style={{ padding: '9px 11px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 600 }}>
                <span>{colEmojis[colKey]} {labels[colKey]}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)' }}>{colJobs.length}</span>
              </div>
              <div className="job-body" style={{ padding: '7px', display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '460px', overflowY: 'auto' }}>
                {colJobs.length === 0 ? (
                  <div style={{ color: 'var(--muted)', fontSize: '12px', textAlign: 'center', padding: '14px 0' }}>Empty</div>
                ) : (
                  colJobs.map(job => {
                    const days = getDaysSinceApplied(job.createdAt);
                    const isOverdue = days >= 7 && job.status === 'applied';

                    return (
                      <div
                        key={job.id}
                        className="job-card"
                        style={{
                          background: 'var(--s2)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--r8)',
                          padding: '8px 10px',
                          marginBottom: '5px'
                        }}
                      >
                        <div className="job-card-company" style={{ fontWeight: 700, fontSize: '12px' }}>{job.company}</div>
                        <div className="job-card-role" style={{ fontSize: '11px', color: 'var(--sub)', marginTop: '1px' }}>{job.role}</div>
                        <div className="job-card-meta" style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--muted)', marginTop: '3px' }}>
                          {job.source}{job.notes ? ` · ${job.notes.substring(0, 30)}` : ''}
                        </div>

                        {/* Overdue Badge */}
                        {isOverdue && (
                          <div
                            className="followup-badge"
                            style={{
                              marginTop: '6px',
                              background: `rgba(${days >= 14 ? '255,95,95' : '255,200,80'}, .08)`,
                              border: `1px solid rgba(${days >= 14 ? '255,95,95' : '255,200,80'}, .3)`,
                              borderRadius: '5px',
                              padding: '4px 8px',
                              fontFamily: 'var(--mono)',
                              fontSize: '10px',
                              color: days >= 14 ? 'var(--red)' : 'var(--amber)'
                            }}
                          >
                            ⏰ {days} days since applied{days >= 14 ? ' — FOLLOW UP NOW' : ' — consider following up'}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="job-card-actions" style={{ display: 'flex', gap: '3px', marginTop: '5px', flexWrap: 'wrap' }}>
                          {colKey === 'applied' && (
                            <button className="job-action-btn" style={{ fontFamily: 'var(--mono)', fontSize: '8px', padding: '2px 5px', borderRadius: '3px', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--s3)', color: 'var(--sub)', transition: 'all .2s' }} onClick={() => moveJob(job.id, 'phone')}>→ Phone</button>
                          )}
                          {colKey === 'phone' && (
                            <>
                              <button className="job-action-btn" style={{ fontFamily: 'var(--mono)', fontSize: '8px', padding: '2px 5px', borderRadius: '3px', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--s3)', color: 'var(--sub)', transition: 'all .2s' }} onClick={() => moveJob(job.id, 'applied')}>← Back</button>
                              <button className="job-action-btn" style={{ fontFamily: 'var(--mono)', fontSize: '8px', padding: '2px 5px', borderRadius: '3px', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--s3)', color: 'var(--sub)', transition: 'all .2s' }} onClick={() => moveJob(job.id, 'technical')}>→ Tech</button>
                            </>
                          )}
                          {colKey === 'technical' && (
                            <>
                              <button className="job-action-btn" style={{ fontFamily: 'var(--mono)', fontSize: '8px', padding: '2px 5px', borderRadius: '3px', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--s3)', color: 'var(--sub)', transition: 'all .2s' }} onClick={() => moveJob(job.id, 'phone')}>← Back</button>
                              <button className="job-action-btn" style={{ fontFamily: 'var(--mono)', fontSize: '8px', padding: '2px 5px', borderRadius: '3px', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--s3)', color: 'var(--sub)', transition: 'all .2s' }} onClick={() => moveJob(job.id, 'offer')}>→ Offer</button>
                            </>
                          )}
                          {colKey === 'offer' && (
                            <button className="job-action-btn" style={{ fontFamily: 'var(--mono)', fontSize: '8px', padding: '2px 5px', borderRadius: '3px', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--s3)', color: 'var(--sub)', transition: 'all .2s' }} onClick={() => moveJob(job.id, 'technical')}>← Back</button>
                          )}
                          <button
                            className="job-action-btn job-del"
                            style={{ fontFamily: 'var(--mono)', fontSize: '8px', padding: '2px 5px', borderRadius: '3px', cursor: 'pointer', border: '1px solid rgba(255,95,95,.2)', background: 'var(--s3)', color: 'var(--red)', transition: 'all .2s' }}
                            onClick={() => deleteJob(job.id)}
                          >
                            ✕ Remove
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default JobsView;
