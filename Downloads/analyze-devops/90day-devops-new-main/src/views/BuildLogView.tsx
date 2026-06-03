import React, { useState } from 'react';
import { UseAppStateReturnType } from '../hooks/useAppState';
import { PROJECTS } from '../data/projects';
import { showToast } from '../components/Toast';

interface BuildLogViewProps {
  appState: UseAppStateReturnType;
}

export const BuildLogView: React.FC<BuildLogViewProps> = ({ appState }) => {
  const {
    state,
    addBuildLog,
    deleteBuildLog,
    isProjectCompleted,
  } = appState;

  const [tool, setTool] = useState('');
  const [project, setProject] = useState('');
  const [what, setWhat] = useState('');
  const [broke, setBroke] = useState('');
  const [learned, setLearned] = useState('');
  const [github, setGithub] = useState('');

  const handleAddLog = () => {
    if (!tool.trim() || !what.trim()) {
      showToast('Tool and "what you built" are required', 'var(--red)');
      return;
    }

    addBuildLog({
      tool: tool.trim(),
      project: project.trim(),
      what: what.trim(),
      broke: broke.trim(),
      learned: learned.trim(),
      github: github.trim(),
    });

    setTool('');
    setProject('');
    setWhat('');
    setBroke('');
    setLearned('');
    setGithub('');

    showToast('✓ Entry logged — your portfolio grows', 'rgba(0,217,160,.1)');
  };

  const handleExportPortfolio = () => {
    const builtProjects = PROJECTS.filter(p => isProjectCompleted(p.id));
    const logs = state.buildLogs;

    let html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DevOps Portfolio</title>
<style>body{font-family:'Segoe UI',sans-serif;background:#07090f;color:#e6edf3;max-width:800px;margin:0 auto;padding:32px 20px;line-height:1.7}
h1{font-size:28px;font-weight:800;margin-bottom:4px}h2{font-size:18px;color:#00d9a0;border-bottom:1px solid #222d42;padding-bottom:8px;margin:28px 0 14px}
.card{background:#0d1117;border:1px solid #222d42;border-radius:12px;padding:16px;margin-bottom:10px}
.tag{background:#1c2436;font-family:monospace;font-size:11px;padding:2px 7px;border-radius:4px;color:#00d9a0}
.meta{font-family:monospace;font-size:11px;color:#4a5568;margin-top:4px}a{color:#4fa8ff}
.resume-line{background:#0a1a12;border:1px solid rgba(0,217,160,.2);border-radius:8px;padding:10px 12px;font-size:13px;margin-top:8px;color:#a8b8cc}
</style></head><body>
<h1>DevOps Engineering Portfolio</h1>
<p style="color:#7d8fa8">Built as part of a 90-day structured DevOps programme. Every project here solves a real problem.</p>
<h2>Production Projects (${builtProjects.length})</h2>`;

    builtProjects.forEach(p => {
      html += `<div class="card"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><strong style="font-size:15px">${p.repoName}</strong><span style="font-size:11px;color:#7d8fa8">${p.phase}</span></div>
<p style="color:#7d8fa8;font-size:13px;margin:4px 0">${p.oneLiner}</p>
<div style="display:flex;flex-wrap:wrap;gap:4px;margin:6px 0">${p.techStack.map(t => `<span class="tag">${t}</span>`).join('')}</div>
<div class="resume-line">${p.resumeLine}</div></div>`;
    });

    html += `<h2>Build Log (${logs.length} entries)</h2>`;
    logs.forEach(log => {
      html += `<div class="card"><div style="display:flex;align-items:center;gap:8px;margin-bottom:5px"><span class="tag">${log.tool}</span><strong>${log.project || log.what.substring(0, 40)}</strong><span class="meta" style="margin-left:auto">${log.date}</span></div>
<p style="font-size:13px;margin:4px 0;color:#a8b8cc">${log.what}</p>
${log.learned ? `<p style="font-size:12px;color:#7d8fa8"><strong>Learned:</strong> ${log.learned}</p>` : ''}
${log.github ? `<a href="${log.github}">${log.github}</a>` : ''}
</div>`;
    });

    html += '</body></html>';

    try {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'devops-portfolio.html';
      a.click();
      URL.revokeObjectURL(url);
      showToast('✓ Portfolio exported — host on GitHub Pages', 'rgba(0,217,160,.1)');
    } catch (_) {
      showToast('Export failed', 'var(--red)');
    }
  };

  return (
    <div className="wrap">
      <div style={{ marginBottom: '16px' }}>
        <div className="eyebrow">Your proof of work</div>
        <h2 className="page-title">Build Logger</h2>
        <p className="page-sub">
          Log what you build each day. This becomes your portfolio.{' '}
          <span id="bl-count" style={{ color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '11px' }}>
            {state.buildLogs.length} entries
          </span>
        </p>
      </div>

      <div className="v4-card" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '16px', marginBottom: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <div>
            <label className="v4-label">Tool / Technology *</label>
            <input className="v4-input" value={tool} onChange={e => setTool(e.target.value)} placeholder="e.g. Kubernetes, Terraform, ArgoCD" />
          </div>
          <div>
            <label className="v4-label">Project / Repo Name</label>
            <input className="v4-input" value={project} onChange={e => setProject(e.target.value)} placeholder="e.g. k8s-production-hardening" />
          </div>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label className="v4-label">What did you BUILD today? (not learn — build) *</label>
          <textarea
            className="v4-input"
            value={what}
            onChange={e => setWhat(e.target.value)}
            placeholder="e.g. Deployed ArgoCD app-of-apps to a 3-environment cluster with Sealed Secrets for secret management"
            style={{ minHeight: '60px', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <div>
            <label className="v4-label">What broke? (be honest)</label>
            <textarea
              className="v4-input"
              value={broke}
              onChange={e => setBroke(e.target.value)}
              placeholder="e.g. Sealed Secrets controller couldn't decrypt — wrong cluster key"
              style={{ minHeight: '50px', resize: 'vertical' }}
            />
          </div>
          <div>
            <label className="v4-label">Key insight / what you learned</label>
            <textarea
              className="v4-input"
              value={learned}
              onChange={e => setLearned(e.target.value)}
              placeholder="e.g. The private key never leaves the cluster — you need kubeseal --fetch-cert to get the public key"
              style={{ minHeight: '50px', resize: 'vertical' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label className="v4-label">GitHub link (optional)</label>
          <input className="v4-input" value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/yourusername/repo-name" />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="v4-btn-primary" onClick={handleAddLog} style={{ background: 'rgba(0,217,160,.1)', border: '1px solid rgba(0,217,160,.4)', color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '10px', padding: '6px 13px', borderRadius: 'var(--r8)', cursor: 'pointer' }}>
            + Log Entry
          </button>
          <button className="v4-btn-secondary" onClick={handleExportPortfolio}>
            ↓ Export Portfolio HTML
          </button>
        </div>
      </div>

      <div id="bl-entries" style={{ marginTop: '4px' }}>
        {state.buildLogs.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
            No entries yet. Log what you build each day — this becomes your portfolio.
          </div>
        ) : (
          state.buildLogs.map(log => (
            <div key={log.id} style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                    <span style={{ background: 'var(--s3)', fontFamily: 'var(--mono)', fontSize: '10px', padding: '2px 7px', borderRadius: '4px', color: 'var(--green)' }}>
                      {log.tool}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>{log.project || log.what.substring(0, 40)}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>{log.date}</div>
                </div>
                <button onClick={() => deleteBuildLog(log.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '12px', flexShrink: 0 }}>
                  ✕
                </button>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '5px' }}>
                <strong>Built:</strong> {log.what}
              </div>
              {log.broke && (
                <div style={{ fontSize: '12.5px', color: 'var(--sub)', marginBottom: '4px' }}>
                  <strong style={{ color: 'var(--amber)' }}>What broke:</strong> {log.broke}
                </div>
              )}
              {log.learned && (
                <div style={{ fontSize: '12.5px', color: 'var(--sub)', marginBottom: '4px' }}>
                  <strong style={{ color: 'var(--blue)' }}>Learned:</strong> {log.learned}
                </div>
              )}
              {log.github && (
                <a
                  href={log.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--blue)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', border: '1px solid rgba(79,168,255,.3)', borderRadius: '5px' }}
                >
                  🔗 {log.github.replace('https://github.com/', 'github.com/')}
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default BuildLogView;
