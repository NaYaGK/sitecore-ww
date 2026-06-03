import React, { useState } from 'react';
import { QBANK, Question } from '../data/qbank';
import { UseAppStateReturnType } from '../hooks/useAppState';

interface QbankViewProps {
  appState: UseAppStateReturnType;
}

export const QbankView: React.FC<QbankViewProps> = ({ appState }) => {
  const { qDone, toggleQ } = appState;

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedDiff, setSelectedDiff] = useState(''); // 'easy' | 'med' | 'hard' | ''
  const [expandedQId, setExpandedQId] = useState<string | null>(null);

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'k8s', label: 'Kubernetes' },
    { key: 'gitops', label: 'GitOps' },
    { key: 'iac', label: 'IaC' },
    { key: 'security', label: 'Security' },
    { key: 'cicd', label: 'CI/CD' },
    { key: 'obs', label: 'Observability' },
    { key: 'platform', label: 'Platform' },
  ];

  const catLabels: Record<string, string> = {
    k8s: 'Kubernetes',
    gitops: 'GitOps',
    iac: 'IaC',
    security: 'Security',
    cicd: 'CI/CD',
    obs: 'Observability',
    platform: 'Platform',
  };

  const difficulties = [
    { key: 'easy', label: 'Easy', color: 'var(--green)' },
    { key: 'med', label: 'Med', color: 'var(--amber)' },
    { key: 'hard', label: 'Hard', color: 'var(--red)' },
  ];

  const filtered = QBANK.filter(q => {
    if (selectedCat !== 'all' && q.cat !== selectedCat) return false;
    if (selectedDiff && q.diff !== selectedDiff) return false;
    if (search.trim()) {
      const sl = search.toLowerCase();
      return q.q.toLowerCase().includes(sl) || q.a.toLowerCase().includes(sl);
    }
    return true;
  });

  const doneCount = filtered.filter(q => qDone(q.id)).length;

  const handleCardClick = (id: string) => {
    setExpandedQId(prev => (prev === id ? null : id));
  };

  const handleCheckClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleQ(id);
  };

  return (
    <div className="wrap">
      <div style={{ marginBottom: '14px' }}>
        <div className="eyebrow">Interview prep</div>
        <h2 className="page-title">Question Bank</h2>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search questions…"
        style={{
          width: '100%',
          background: 'var(--s1)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          fontFamily: 'var(--body)',
          fontSize: '12px',
          padding: '8px 11px',
          borderRadius: 'var(--r8)',
          outline: 'none',
          marginBottom: '8px'
        }}
      />

      <div className="qbank-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
        {categories.map(cat => (
          <button
            key={cat.key}
            className={`qb-chip ${selectedCat === cat.key ? 'active' : ''}`}
            onClick={() => setSelectedCat(cat.key)}
          >
            {cat.label}
          </button>
        ))}
        <span style={{ width: '1px', background: 'var(--border)', margin: '0 3px', alignSelf: 'stretch' }}></span>
        {difficulties.map(diff => (
          <button
            key={diff.key}
            className={`qb-chip ${selectedDiff === diff.key ? 'active' : ''}`}
            style={{ color: diff.color }}
            onClick={() => setSelectedDiff(prev => (prev === diff.key ? '' : diff.key))}
          >
            {diff.label}
          </button>
        ))}
      </div>

      <div id="qbank-count" style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)', marginBottom: '9px' }}>
        {doneCount}/{filtered.length} answered
      </div>

      <div id="qbank-wrap">
        {filtered.map(q => {
          const isDone = qDone(q.id);
          const isExpanded = expandedQId === q.id;
          const diffColor = q.diff === 'easy' ? 'var(--green)' : q.diff === 'med' ? 'var(--amber)' : 'var(--red)';

          return (
            <div
              key={q.id}
              className={`q-card ${isDone ? 'done-q' : ''}`}
              onClick={() => handleCardClick(q.id)}
            >
              <div className="q-card-top">
                <div
                  className={`q-check ${isDone ? 'on' : ''}`}
                  onClick={(e) => handleCheckClick(e, q.id)}
                >
                  {isDone && '✓'}
                </div>
                <div className="q-question">{q.q}</div>
              </div>
              <div className="q-meta">
                <span className="q-cat">{catLabels[q.cat] || q.cat}</span>
                <span className="q-cat" style={{ color: diffColor }}>
                  {q.diff}
                </span>
              </div>
              <div className={`q-answer-wrap ${isExpanded ? 'open' : ''}`}>
                <div className="q-answer">
                  <div className="q-answer-inner">{q.a}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default QbankView;
