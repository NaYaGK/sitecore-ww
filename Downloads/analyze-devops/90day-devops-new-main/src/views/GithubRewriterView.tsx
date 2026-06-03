import React, { useState, useEffect } from 'react';
import { UseAppStateReturnType } from '../hooks/useAppState';
import { PROJECTS } from '../data/projects';
import { showToast } from '../components/Toast';

interface GithubRewriterViewProps {
  appState: UseAppStateReturnType;
}

interface GradedRepo {
  repo: any;
  isBad: boolean;
  score: number;
}

export const GithubRewriterView: React.FC<GithubRewriterViewProps> = ({ appState }) => {
  const { state, updateGHUser, isProjectCompleted } = appState;
  const [username, setUsername] = useState(state.ghUser || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [auditResult, setAuditResult] = useState<any | null>(null);
  const [showReadmeModal, setShowReadmeModal] = useState(false);

  useEffect(() => {
    if (state.ghUser) {
      setUsername(state.ghUser);
      runAudit(state.ghUser);
    }
  }, [state.ghUser]);

  const handleAudit = () => {
    if (username.trim()) {
      updateGHUser(username.trim());
      runAudit(username.trim());
    }
  };

  const suggestRepoName = (name: string, desc: string) => {
    const suggestions: Record<string, string> = {
      docker: 'containerised-api',
      kubernetes: 'k8s-production-cluster',
      terraform: 'aws-production-infra',
      ansible: 'server-hardening-playbooks',
      python: 'devops-automation-tools',
      bash: 'sysadmin-toolkit',
      git: 'gitops-platform',
      linux: 'linux-hardening-scripts',
      ci: 'cicd-pipeline-template',
      helm: 'k8s-helm-charts',
      monitoring: 'observability-stack',
      aws: 'cloud-infrastructure-iac',
    };
    const combined = (name + ' ' + desc).toLowerCase();
    for (const key in suggestions) {
      if (combined.includes(key)) return suggestions[key];
    }
    return name.replace(/learn-?|tutorial-?|practice-?|study-?/gi, '').replace(/^[-_]+|[-_]+$/g, '') + '-production';
  };

  const getRepoImproveTip = (repo: any) => {
    if (!repo.description || repo.description.length < 20) return 'Add a description — 1 sentence explaining what problem this solves';
    if (repo.stargazers_count === 0 && repo.forks_count === 0) return 'Add GitHub topics (Settings → Topics) for SEO — recruiters search these';
    if (!repo.homepage) return 'Add a demo link or docs URL in the repo settings';
    return '';
  };

  const runAudit = async (user: string) => {
    setLoading(true);
    setError('');
    setAuditResult(null);
    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${user}`),
        fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=updated`),
      ]);
      const userData = await userRes.json();
      const reposData = await reposRes.json();

      if (userData.message) {
        setError(`User not found: ${user}`);
        setLoading(false);
        return;
      }

      const BAD_WORDS = ['learn', 'tutorial', 'practice', 'study', 'course', 'exercise', 'demo', 'test', 'hello-world', 'getting-started', 'beginner', 'intro', 'basics', 'following', 'along'];
      const graded: GradedRepo[] = (Array.isArray(reposData) ? reposData : []).map(repo => {
        const name = repo.name.toLowerCase();
        const desc = (repo.description || '').toLowerCase();
        const isBad = BAD_WORDS.some(w => name.includes(w) || desc.includes(w));
        let score = 0;
        if (repo.description && repo.description.length > 20) score += 20;
        if (!isBad) score += 25;
        if (repo.stargazers_count > 0) score += 15;
        if (repo.has_wiki || (repo.description || '').length > 50) score += 10;
        if (['docker', 'k8s', 'terraform', 'pipeline', 'production', 'deploy', 'kubernetes'].some(w => desc.includes(w))) score += 20;
        if (repo.language) score += 10;
        return { repo, isBad, score };
      }).sort((a, b) => a.score - b.score);

      const badRepos = graded.filter(g => g.isBad);
      const goodRepos = graded.filter(g => !g.isBad);
      const profileScore = graded.length ? Math.round(goodRepos.reduce((a, g) => a + g.score, 0) / Math.max(graded.length, 1)) : 0;

      setAuditResult({
        user: userData,
        badRepos,
        goodRepos,
        profileScore,
      });
    } catch (_) {
      setError('Error fetching GitHub data. Check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProfileREADME = () => {
    if (!auditResult) return '';
    const builtProjects = PROJECTS.filter(p => isProjectCompleted(p.id));

    return `# Hi, I'm ${auditResult.user.name || username} 👋

## DevOps Engineer | Building production systems, not tutorials

\`\`\`yaml
current_focus: Platform Engineering & Cloud Native
learning:      Kubernetes (CKA prep) · Terraform · GitOps
building:      See pinned repos below ↓
location:      ${auditResult.user.location || 'India'}
available:     Open to DevOps / Platform Engineering roles
\`\`\`

## Tech Stack

| Area | Tools |
|------|-------|
| Containers | Docker · Kubernetes · Helm |
| IaC | Terraform · Ansible · OpenTofu |
| CI/CD | GitHub Actions · ArgoCD · Jenkins |
| Cloud | AWS (ECS, RDS, VPC) · Azure |
| Observability | Prometheus · Grafana · OpenTelemetry |
| Security | Trivy · OPA Gatekeeper · Falco |
| Scripting & Languages | Bash · Python · Go (basics) · YAML · HCL |

## What I've Built (not learned — built)

${builtProjects.map(p => `- **[${p.repoName}](https://github.com/${username}/${p.repoName})** — ${p.headline}`).join('\n') || '- Building production systems across 9 DevOps domains (in progress)'}

## Currently Working On

- 90-day structured DevOps programme — shipping real projects, not following tutorials
- Every repo has a real problem statement, architecture decisions, and interview talking points

## Connect

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://linkedin.com/in/${username})

---
*"Recruiters don't hire people who learned DevOps. They hire people who have done DevOps."*
`;
  };

  const handleCopyReadme = () => {
    const text = getProfileREADME();
    navigator.clipboard.writeText(text).then(() => {
      showToast('✓ README copied', 'rgba(0,217,160,.1)');
    });
  };

  return (
    <div className="wrap">
      <div style={{ marginBottom: '16px' }}>
        <div className="eyebrow">Profile audit</div>
        <h2 className="page-title">GitHub Rewriter</h2>
        <p className="page-sub">Flags student repos · Suggests production names · Grades each repo · Generates profile README</p>
      </div>

      <div className="v4-card" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '16px', marginBottom: '12px' }}>
        <div className="gh-input-wrap" style={{ display: 'flex', gap: '8px', marginBottom: 0 }}>
          <input
            type="text"
            className="v4-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your GitHub username…"
            style={{ flex: 1, background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '13px', padding: '8px 11px', borderRadius: 'var(--r8)', outline: 'none' }}
          />
          <button
            className="v4-btn-primary"
            onClick={handleAudit}
            style={{ padding: '8px 16px', background: 'rgba(0,217,160,.1)', border: '1px solid rgba(0,217,160,.4)', color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '10px', borderRadius: 'var(--r8)', cursor: 'pointer' }}
          >
            Audit Profile
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--sub)', fontSize: '13px', padding: '16px' }}>
          <div className="ai-spinner"></div>
          Fetching your repos…
        </div>
      )}

      {error && <div style={{ color: 'var(--red)', fontSize: '13px', padding: '12px' }}>{error}</div>}

      {auditResult && (
        <div id="gh-rewrite-output">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', padding: '14px', background: 'var(--s2)', borderRadius: '12px' }}>
            <img src={auditResult.user.avatar_url} style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid var(--border)' }} alt="" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>{auditResult.user.name || username}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--sub)' }}>
                @{auditResult.user.login} · {auditResult.user.public_repos} repos
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  fontFamily: 'var(--mono)',
                  color: auditResult.profileScore >= 60 ? 'var(--green)' : auditResult.profileScore >= 35 ? 'var(--amber)' : 'var(--red)'
                }}
              >
                {auditResult.profileScore}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--sub)' }}>GitHub Score</div>
            </div>
          </div>

          {!auditResult.user.bio && (
            <div style={{ background: 'rgba(255,200,80,.07)', border: '1px solid rgba(255,200,80,.25)', borderRadius: '8px', padding: '10px 13px', marginBottom: '10px', fontSize: '13px', color: 'var(--amber)' }}>
              ⚠ No bio set. Add: "DevOps Engineer | Kubernetes · Terraform · GitOps | Building in public"
            </div>
          )}
          {!auditResult.user.blog && (
            <div style={{ background: 'rgba(255,95,95,.07)', border: '1px solid rgba(255,95,95,.2)', borderRadius: '8px', padding: '10px 13px', marginBottom: '10px', fontSize: '13px', color: 'var(--red)' }}>
              ⚠ No website/portfolio link. Add your GitHub Pages URL or LinkedIn.
            </div>
          )}

          {auditResult.badRepos.length > 0 && (
            <>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>
                🚩 Repos that scream "student" — make private or rename
              </div>
              {auditResult.badRepos.map((g: GradedRepo) => (
                <div key={g.repo.id} style={{ background: 'rgba(255,95,95,.05)', border: '1px solid rgba(255,95,95,.2)', borderRadius: '8px', padding: '10px 13px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--red)' }}>❌ {g.repo.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{g.repo.description || 'No description'}</div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)' }}>Rename to:</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--green)' }}>
                      {suggestRepoName(g.repo.name, g.repo.description || '')}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {auditResult.goodRepos.length > 0 && (
            <>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.08em', margin: '12px 0 8px' }}>
                ✓ Repos that look like engineering work
              </div>
              {auditResult.goodRepos.slice(0, 8).map((g: GradedRepo) => {
                const improveTip = getRepoImproveTip(g.repo);
                return (
                  <div key={g.repo.id} style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 13px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text)' }}>{g.repo.name}</div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', marginLeft: 'auto', color: g.score >= 60 ? 'var(--green)' : g.score >= 40 ? 'var(--amber)' : 'var(--red)' }}>
                        Score: {g.score}/100
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--sub)', marginBottom: '5px' }}>
                      {g.repo.description || <span style={{ color: 'var(--red)' }}>No description — add one!</span>}
                    </div>
                    {improveTip && (
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--amber)' }}>
                        💡 {improveTip}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          <div style={{ marginTop: '14px', background: 'linear-gradient(135deg,rgba(0,217,160,.05),rgba(79,168,255,.05))', border: '1px solid rgba(0,217,160,.2)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--green)', marginBottom: '6px' }}>
              PROFILE README TEMPLATE
            </div>
            <div style={{ fontSize: '12px', color: 'var(--sub)', marginBottom: '10px' }}>
              Create a repo named <code style={{ background: 'var(--s3)', padding: '1px 5px', borderRadius: '3px', fontFamily: 'var(--mono)' }}>{username}/{username}</code> with a README.md — it shows on your profile.
            </div>
            <button
              className="v4-btn-primary"
              onClick={() => setShowReadmeModal(true)}
              style={{ background: 'rgba(0,217,160,.1)', border: '1px solid rgba(0,217,160,.4)', color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '10px', padding: '6px 13px', borderRadius: 'var(--r8)', cursor: 'pointer' }}
            >
              Generate Profile README
            </button>
          </div>
        </div>
      )}

      {/* Profile README Modal */}
      {showReadmeModal && (
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
          onClick={() => setShowReadmeModal(false)}
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
              onClick={() => setShowReadmeModal(false)}
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sub)', fontSize: '16px' }}
            >
              ✕
            </button>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', paddingRight: '24px' }}>
              GitHub Profile README
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)', marginBottom: '8px' }}>
              Create repo: github.com/{username}/{username} → paste this README.md
            </div>
            <textarea
              id="profile-readme-ta"
              value={getProfileREADME()}
              readOnly
              style={{ width: '100%', background: '#0d1117', border: '1px solid var(--border)', color: '#a8b8cc', fontFamily: 'var(--mono)', fontSize: '10px', padding: '10px', borderRadius: '8px', minHeight: '320px', resize: 'vertical', outline: 'none' }}
            />
            <button
              className="v4-btn-primary"
              style={{ marginTop: '8px', background: 'rgba(0,217,160,.1)', border: '1px solid rgba(0,217,160,.4)', color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '10px', padding: '6px 13px', borderRadius: 'var(--r8)', cursor: 'pointer' }}
              onClick={handleCopyReadme}
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default GithubRewriterView;
