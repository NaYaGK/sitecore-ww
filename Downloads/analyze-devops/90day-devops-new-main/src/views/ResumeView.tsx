import React, { useState } from 'react';
import { UseAppStateReturnType } from '../hooks/useAppState';
import { PROJECTS, checkATSScore } from '../data/projects';
import { CERT_MAP } from '../data/labs';
import { PHASES } from '../data/phases';
import { showToast } from '../components/Toast';

interface ResumeViewProps {
  appState: UseAppStateReturnType;
}

export const ResumeView: React.FC<ResumeViewProps> = ({ appState }) => {
  const {
    state,
    dayTotal,
    dayDone,
    dayPct,
    isProjectCompleted,
  } = appState;

  const [name, setName] = useState('GK');
  const [email, setEmail] = useState('gk@email.com');
  const [phone, setPhone] = useState('+91 9999999999');
  const [loc, setLoc] = useState('Hyderabad, India');
  const [linkedin, setLinkedin] = useState('linkedin.com/in/yourname');
  const [github, setGithub] = useState('yourusername');
  const [summary, setSummary] = useState('');
  const [extra, setExtra] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [atsResult, setAtsResult] = useState<any | null>(null);

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

  const handleGenerate = () => {
    const builtProjects = PROJECTS.filter(p => isProjectCompleted(p.id));
    const buildLogs = state.buildLogs.slice(0, 5);

    // Collect completed phase skills (progress >= 50%)
    const phaseSkills: string[] = [];
    PHASES.forEach((ph, pi) => {
      const tot = ph.data.reduce((a, _d, di) => a + dayTotal(pi, di), 0);
      const don = ph.data.reduce((a, _d, di) => a + dayDone(pi, di), 0);
      if (tot && don / tot >= 0.5) {
        phaseSkills.push(ph.title.split(' — ')[1] || ph.title);
      }
    });

    const skillsMap = {
      'Containers & Orchestration': ['Docker', 'Kubernetes', 'Helm', 'containerd', 'EKS', 'AKS'],
      'Infrastructure as Code': ['Terraform', 'OpenTofu', 'Ansible', 'Bicep', 'Pulumi'],
      'CI/CD & GitOps': ['GitHub Actions', 'ArgoCD', 'Flux', 'Jenkins', 'GitLab CI'],
      'Cloud Platforms': ['AWS (ECS, RDS, VPC, S3, CloudFront)', 'Azure', 'GCP'],
      'Observability': ['Prometheus', 'Grafana', 'OpenTelemetry', 'Jaeger', 'Loki'],
      'Security': ['Trivy', 'OPA Gatekeeper', 'Falco', 'Sealed Secrets', 'kube-bench'],
      'Scripting & Languages': ['Bash', 'Python', 'Go (basics)', 'YAML', 'HCL']
    };

    let resume = `${name.toUpperCase()}\n`;
    resume += `${email}${phone ? ' | ' + phone : ''}${loc ? ' | ' + loc : ''}\n`;
    resume += `${linkedin ? 'LinkedIn: ' + linkedin + ' ' : ''}${github ? 'GitHub: ' + github : ''}\n`;
    resume += `${'─'.repeat(60)}\n\n`;

    resume += `SUMMARY\n`;
    resume += `${summary || `DevOps engineer with hands-on experience building production systems across containerisation, infrastructure as code, GitOps pipelines, and Kubernetes security. Completed 90-day structured programme shipping ${builtProjects.length} production-grade projects. Seeking DevOps / Platform Engineering role to bring this foundation into a real team environment.`}\n\n`;

    resume += `${'─'.repeat(60)}\n`;
    resume += `SKILLS\n\n`;
    Object.entries(skillsMap).forEach(([cat, skills]) => {
      resume += `${cat}: ${skills.join(', ')}\n`;
    });

    resume += `\n${'─'.repeat(60)}\n`;
    resume += `PROJECTS\n\n`;

    if (builtProjects.length > 0) {
      builtProjects.forEach(proj => {
        resume += `${proj.repoName} | ${proj.techStack.join(', ')}\n`;
        resume += `  ${proj.resumeLine}\n`;
        resume += `  github.com/${github || 'YOUR-USERNAME'}/${proj.repoName}\n\n`;
      });
    } else if (buildLogs.length > 0) {
      buildLogs.forEach(log => {
        resume += `${log.project || log.tool} \n`;
        resume += `  ${log.what}\n`;
        if (log.github) resume += `  ${log.github}\n`;
        resume += '\n';
      });
    } else {
      resume += `[Build projects in the Projects tab and mark them as done — they auto-appear here]\n\n`;
    }

    resume += `${'─'.repeat(60)}\n`;
    resume += `EXPERIENCE\n\n`;
    resume += `${extra || '[Add your work experience here]\n[Use: Role | Company | Dates]\n[Bullet: Action verb + what you did + technology + result]'}\n\n`;

    resume += `${'─'.repeat(60)}\n`;
    resume += `CERTIFICATIONS & LEARNING\n\n`;
    resume += `90 Days of DevOps Programme | Self-directed | ${new Date().getFullYear()}\n`;
    resume += `  Completed structured programme covering ${phaseSkills.join(', ') || 'DevOps Fundamentals'}\n`;
    resume += `  Built ${builtProjects.length} production projects across infrastructure, security, and platform engineering\n`;

    const certsDone = Object.keys(CERT_MAP).filter(k => getCertReadiness(k) >= CERT_MAP[k].passmark);
    if (certsDone.length > 0) {
      certsDone.forEach(k => {
        resume += `  ${CERT_MAP[k].name} — Ready to sit\n`;
      });
    }

    setResumeText(resume);
    const scoreResult = checkATSScore(resume);
    setAtsResult(scoreResult);
    showToast('⚡ Resume generated!', 'rgba(0,217,160,.12)');
  };

  const handleCopy = () => {
    if (!resumeText) {
      showToast('Generate a resume first', 'var(--red)');
      return;
    }
    navigator.clipboard.writeText(resumeText).then(() => {
      showToast('✓ Resume copied — paste into Naukri/LinkedIn', 'rgba(0,217,160,.1)');
    });
  };

  const handleCheckATS = () => {
    if (!resumeText) {
      showToast('Generate a resume first', 'var(--red)');
      return;
    }
    const scoreResult = checkATSScore(resumeText);
    setAtsResult(scoreResult);
    showToast('✓ ATS score updated', 'rgba(0,217,160,.1)');
  };

  return (
    <div className="wrap">
      <div style={{ marginBottom: '16px' }}>
        <div className="eyebrow">ATS-optimised</div>
        <h2 className="page-title">Resume Builder</h2>
        <p className="page-sub">Auto-fills from your completed projects and roadmap phases. ATS keyword scoring included.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <div>
          <label className="v4-label">Full Name</label>
          <input className="v4-input" value={name} onChange={e => setName(e.target.value)} placeholder="GK" />
        </div>
        <div>
          <label className="v4-label">Email</label>
          <input className="v4-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="gk@email.com" />
        </div>
        <div>
          <label className="v4-label">Phone</label>
          <input className="v4-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9999999999" />
        </div>
        <div>
          <label className="v4-label">Location</label>
          <input className="v4-input" value={loc} onChange={e => setLoc(e.target.value)} placeholder="Hyderabad, India" />
        </div>
        <div>
          <label className="v4-label">LinkedIn URL</label>
          <input className="v4-input" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/yourname" />
        </div>
        <div>
          <label className="v4-label">GitHub Username</label>
          <input className="v4-input" value={github} onChange={e => setGithub(e.target.value)} placeholder="yourusername" />
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label className="v4-label">Summary (leave blank to auto-generate)</label>
        <textarea
          className="v4-input"
          value={summary}
          onChange={e => setSummary(e.target.value)}
          placeholder="Leave blank — auto-generates from your completed projects and phases"
          style={{ minHeight: '60px', resize: 'vertical' }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label className="v4-label">Work Experience (paste here)</label>
        <textarea
          className="v4-input"
          value={extra}
          onChange={e => setExtra(e.target.value)}
          placeholder="Role | Company | Dates&#10;• Action verb + what you did + technology + result"
          style={{ minHeight: '80px', resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button className="v4-btn-primary" onClick={handleGenerate} style={{ padding: '8px 18px', background: 'rgba(0,217,160,.1)', border: '1px solid rgba(0,217,160,.4)', color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '10px', borderRadius: 'var(--r8)', cursor: 'pointer' }}>
          ⚡ Generate Resume
        </button>
        <button className="v4-btn-secondary" onClick={handleCopy}>
          Copy to Clipboard
        </button>
        <button className="v4-btn-secondary" onClick={handleCheckATS}>
          Check ATS Score
        </button>
      </div>

      {atsResult && (
        <div
          id="ats-result"
          style={{
            background: 'var(--s1)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r12)',
            padding: '14px',
            marginBottom: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 800,
                fontFamily: 'var(--mono)',
                color: atsResult.score >= 70 ? 'var(--green)' : atsResult.score >= 50 ? 'var(--amber)' : 'var(--red)'
              }}
            >
              {atsResult.score}%
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px' }}>ATS Keyword Score</div>
              <div style={{ fontSize: '12px', color: 'var(--sub)' }}>Based on top 37 DevOps JD keywords</div>
            </div>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--green)', marginBottom: '4px' }}>
              FOUND ({atsResult.found.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
              {atsResult.found.map((k: string) => (
                <span key={k} style={{ background: 'rgba(0,217,160,.1)', border: '1px solid rgba(0,217,160,.3)', color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '9px', padding: '2px 6px', borderRadius: '3px' }}>
                  {k}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--red)', marginBottom: '4px' }}>
              MISSING — add these ({atsResult.missing.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
              {atsResult.missing.map((k: string) => (
                <span key={k} style={{ background: 'rgba(255,95,95,.07)', border: '1px solid rgba(255,95,95,.25)', color: 'var(--red)', fontFamily: 'var(--mono)', fontSize: '9px', padding: '2px 6px', borderRadius: '3px' }}>
                  {k}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <label className="v4-label">Generated Resume (copy into Word / LinkedIn / Naukri)</label>
      <textarea
        id="resume-output"
        value={resumeText}
        readOnly
        style={{
          width: '100%',
          background: '#0d1117',
          border: '1px solid var(--border)',
          color: '#e6edf3',
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          padding: '14px',
          borderRadius: 'var(--r12)',
          minHeight: '400px',
          resize: 'vertical',
          lineHeight: '1.7',
          outline: 'none'
        }}
        placeholder="Click 'Generate Resume' to build your resume from your completed projects and roadmap progress…"
      />
    </div>
  );
};
export default ResumeView;
