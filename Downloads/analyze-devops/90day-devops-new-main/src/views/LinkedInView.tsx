import React, { useState } from 'react';
import { UseAppStateReturnType } from '../hooks/useAppState';
import { PROJECTS } from '../data/projects';
import { AIService } from '../components/AIService';
import { showToast } from '../components/Toast';

interface LinkedInViewProps {
  appState: UseAppStateReturnType;
}

export const LinkedInView: React.FC<LinkedInViewProps> = ({ appState }) => {
  const { state, isProjectCompleted } = appState;

  const [tone, setTone] = useState<'technical' | 'story' | 'insight'>('technical');
  const [customInput, setCustomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedPost('');

    const recentLog = state.buildLogs[0];
    const builtProjects = PROJECTS.filter(p => isProjectCompleted(p.id));
    const recentProject = builtProjects[builtProjects.length - 1];

    const context = customInput.trim() || (recentLog
      ? `Today I built: ${recentLog.what}. Tool: ${recentLog.tool}. What broke: ${recentLog.broke || 'nothing major'}. What I learned: ${recentLog.learned || 'see below'}.`
      : recentProject
      ? `I just finished building ${recentProject.repoName}: ${recentProject.headline}. Tech: ${recentProject.techStack.join(', ')}.`
      : 'Day in my 90-day DevOps learning programme. Working on Kubernetes, Terraform, GitOps, and container security.');

    try {
      const text = await AIService.generateLinkedInPost(context, tone);
      setGeneratedPost(text);
      showToast('✦ Post generated!', 'rgba(0,217,160,.1)');
    } catch (e: any) {
      setGeneratedPost(`⚠ Error: ${e.message || 'Could not connect. Configure your Anthropic Key.'}`);
      showToast('Generation failed', 'var(--red)');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPost) {
      showToast('Generate a post first', 'var(--red)');
      return;
    }
    navigator.clipboard.writeText(generatedPost).then(() => {
      showToast('✓ Post copied — paste into LinkedIn', 'rgba(0,217,160,.1)');
    });
  };

  return (
    <div className="wrap">
      <div style={{ marginBottom: '16px' }}>
        <div className="eyebrow">90 posts = 90 proof points</div>
        <h2 className="page-title">LinkedIn Post Generator</h2>
        <p className="page-sub">One click. AI writes the post from your build log. You post. Recruiters notice.</p>
      </div>

      <div className="v4-card" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '16px', marginBottom: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
          <div>
            <label className="v4-label">Tone</label>
            <select
              className="v4-select v4-input"
              value={tone}
              onChange={e => setTone(e.target.value as any)}
              style={{ width: '100%', background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '13px', padding: '8px 11px', borderRadius: 'var(--r8)', outline: 'none' }}
            >
              <option value="technical">Technical deep-dive (for engineers)</option>
              <option value="story">Story (what broke + what I fixed)</option>
              <option value="insight">Sharp insight (1 counterintuitive lesson)</option>
            </select>
          </div>
          <div></div>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label className="v4-label">What did you build today? (leave blank to use latest build log entry)</label>
          <textarea
            className="v4-input"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            placeholder="Optional — describe what you built or learned. Leave blank to auto-use your latest Build Logger entry."
            style={{ minHeight: '60px', resize: 'vertical', background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--body)', padding: '8px 11px', borderRadius: 'var(--r8)', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="v4-btn-primary"
            onClick={handleGenerate}
            disabled={loading}
            style={{ padding: '8px 16px', background: 'rgba(0,217,160,.1)', border: '1px solid rgba(0,217,160,.4)', color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '10px', borderRadius: 'var(--r8)', cursor: 'pointer' }}
          >
            ✦ Generate Post
          </button>
          <button className="v4-btn-secondary" onClick={handleCopy}>
            Copy
          </button>
          {generatedPost && (
            <span id="li-char-count" style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--sub)', alignSelf: 'center' }}>
              {generatedPost.length} chars
            </span>
          )}
        </div>
      </div>

      <div style={{ marginTop: '10px' }}>
        <label className="v4-label">Generated Post</label>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sub)', fontSize: '12px', padding: '13px', background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', minHeight: '280px' }}>
            <div className="ai-spinner"></div>
            Generating LinkedIn post…
          </div>
        ) : (
          <textarea
            id="li-output"
            value={generatedPost}
            readOnly
            style={{
              width: '100%',
              background: 'var(--s1)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontFamily: 'var(--body)',
              fontSize: '13px',
              padding: '13px',
              borderRadius: 'var(--r12)',
              minHeight: '280px',
              resize: 'vertical',
              lineHeight: '1.7',
              outline: 'none'
            }}
            placeholder="Click 'Generate Post' — it auto-pulls from your latest Build Logger entry…"
          />
        )}
      </div>

      <div style={{ marginTop: '12px', padding: '12px 14px', background: 'var(--s2)', borderRadius: 'var(--r12)', fontSize: '13px', color: 'var(--sub)' }}>
        <strong style={{ color: 'var(--text)' }}>The rule:</strong> Never write "Today I learned X." Always write "Today I deployed X and here's what happened." The first sounds like a student. The second sounds like an engineer.
      </div>
    </div>
  );
};
export default LinkedInView;
