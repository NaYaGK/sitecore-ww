import React from 'react';
import { UseAppStateReturnType } from '../hooks/useAppState';
import { showToast } from '../components/Toast';

interface ReviewsViewProps {
  appState: UseAppStateReturnType;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({ appState }) => {
  const { getDueReviews, markSRReviewed } = appState;

  const due = getDueReviews();

  const handleRate = (pi: number, di: number, ti: number, rating: number) => {
    markSRReviewed(pi, di, ti, rating);
    const intervals = [3, 7, 14, 30];
    const days = intervals[Math.min(rating - 1, intervals.length - 1)] || 3;
    showToast(`Scheduled for review in ${days} days`, 'rgba(0,217,160,.1)');
  };

  return (
    <div className="wrap">
      <div style={{ marginBottom: '14px' }}>
        <div className="eyebrow">Spaced repetition</div>
        <h2 className="page-title">Due Reviews</h2>
      </div>

      <div id="reviews-content">
        {due.length === 0 ? (
          <div style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>✅</div>
            <div style={{ fontWeight: 600, marginBottom: '6px' }}>No reviews due!</div>
            <div style={{ color: 'var(--sub)', fontSize: '13px' }}>
              Rate tasks ★1–2 on completion to schedule them for review. They'll appear here when due.
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--sub)', marginBottom: '14px' }}>
              {due.length} task{due.length > 1 ? 's' : ''} due for review today
            </div>
            {due.map((item, idx) => (
              <div key={idx} className="sr-item">
                <div style={{ flex: 1 }}>
                  <div className="sr-item-text">{item.task.t}</div>
                  <div className="sr-item-meta">
                    {item.d.day} · {item.ph.title.split(' — ')[1] || item.ph.title} · last rated ★{item.sr.conf}
                  </div>
                  <div className="sr-rate-row" style={{ display: 'flex', gap: '3px', marginTop: '5px' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', marginRight: '4px', alignSelf: 'center' }}>
                      Re-rate:
                    </span>
                    {[1, 2, 3, 4, 5].map(v => {
                      const col = v <= 2 ? 'var(--red)' : v === 3 ? 'var(--amber)' : 'var(--green)';
                      return (
                        <button
                          key={v}
                          className="sr-rate-btn"
                          style={{
                            color: col,
                            borderColor: col,
                            background: 'none',
                            fontFamily: 'var(--mono)',
                            fontSize: '9px',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            border: `1px solid ${col}`,
                            transition: 'all .2s'
                          }}
                          onClick={() => handleRate(item.pi, item.di, item.ti, v)}
                        >
                          ★{v}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
export default ReviewsView;
