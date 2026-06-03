import React from 'react';
import { UseAppStateReturnType } from '../hooks/useAppState';
import { showToast } from '../components/Toast';

interface WeeklyViewProps {
  appState: UseAppStateReturnType;
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({ appState }) => {
  const {
    state,
    getWeekDone,
    getWeekPct,
    checkBounceback,
    claimBounceback,
    updateWeekGoal,
    weekData
  } = appState;

  const weekDone = getWeekDone();
  const goal = state.weekGoal;
  const pct = getWeekPct();
  const bounce = checkBounceback();

  const handleClaimBounceback = () => {
    claimBounceback();
    showToast('🚀 2× XP activated for today!', 'rgba(255,200,80,.12)');
  };

  const handleNotificationEnable = () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then(p => {
        if (p === 'granted') {
          showToast('✓ Notifications enabled! You\'ll be reminded when reviews are due.', 'rgba(0,217,160,.1)');
        }
      });
    }
  };

  const wd = weekData(0);
  const maxDay = Math.max(1, ...wd.map(d => d.count));

  const hasNotificationPermission = 'Notification' in window && Notification.permission === 'granted';

  return (
    <div className="wrap">
      <div style={{ marginBottom: '14px' }}>
        <div className="eyebrow">Weekly system</div>
        <h2 className="page-title">Weekly Goals</h2>
        <p className="page-sub">Miss a day — still win the week. Return after a gap — earn 2× XP.</p>
      </div>

      {/* Bounce-back Banner */}
      {bounce && (
        <div
          style={{
            background: 'linear-gradient(135deg,rgba(255,200,80,.08),rgba(0,217,160,.08))',
            border: '1px solid rgba(255,200,80,.3)',
            borderRadius: 'var(--r12)',
            padding: '14px 16px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <span style={{ fontSize: '28px' }}>🚀</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>Bounce-back bonus!</div>
            <div style={{ fontSize: '13px', color: 'var(--sub)', marginTop: '2px' }}>
              You were away for 2+ days but you're back. Earn <strong style={{ color: 'var(--amber)' }}>2× XP</strong> for every task completed today.
            </div>
          </div>
          <button
            onClick={handleClaimBounceback}
            style={{
              background: 'rgba(255,200,80,.12)',
              border: '1px solid rgba(255,200,80,.4)',
              color: 'var(--amber)',
              fontFamily: 'var(--mono)',
              fontSize: '11px',
              padding: '7px 14px',
              borderRadius: 'var(--r8)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Activate 2× XP
          </button>
        </div>
      )}

      {/* Main Goal Card */}
      <div style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r16)', padding: '20px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--green)', marginBottom: '4px' }}>
              WEEKLY GOAL
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--text)' }}>
              {weekDone} <span style={{ fontSize: '16px', color: 'var(--sub)' }}>/ {goal} tasks</span>
            </div>
          </div>
          <div style={{ fontSize: '36px' }}>{pct >= 100 ? '🏆' : pct >= 70 ? '💪' : pct >= 40 ? '📚' : '🎯'}</div>
        </div>
        <div style={{ height: '12px', background: 'var(--s3)', borderRadius: '6px', overflow: 'hidden', marginBottom: '10px' }}>
          <div
            style={{
              height: '100%',
              borderRadius: '6px',
              background: 'linear-gradient(90deg,var(--green),var(--blue))',
              width: `${pct}%`,
              transition: 'width .6s ease'
            }}
          ></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--sub)' }}>
          <span>{pct}% of weekly goal</span>
          <span>{goal - weekDone > 0 ? `${goal - weekDone} tasks left this week` : '🎉 Goal smashed!'}</span>
        </div>

        {/* Goal adjuster */}
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--sub)' }}>Adjust weekly goal:</span>
          {[20, 35, 50, 70, 90].map(g => (
            <button
              key={g}
              style={{
                background: g === goal ? 'rgba(0,217,160,.12)' : 'var(--s2)',
                border: `1px solid ${g === goal ? 'var(--green)' : 'var(--border)'}`,
                color: g === goal ? 'var(--green)' : 'var(--sub)',
                fontFamily: 'var(--mono)',
                fontSize: '11px',
                padding: '4px 11px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all .2s'
              }}
              onClick={() => updateWeekGoal(g)}
            >
              {g}/wk
            </button>
          ))}
        </div>
      </div>

      {/* Day by Day breakdown */}
      <div style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '16px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '12px' }}>
          This week
        </div>
        {wd.map((day, idx) => {
          const isToday = day.date === new Date().toDateString();
          const widthPct = day.isFuture ? 0 : Math.round((day.count / maxDay) * 100);

          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '7px' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', width: '32px', color: isToday ? 'var(--green)' : 'var(--sub)' }}>
                {day.name}
                {isToday && ' ←'}
              </span>
              <div style={{ flex: 1, height: '10px', background: 'var(--s3)', borderRadius: '5px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: isToday ? 'var(--green)' : 'var(--blue)',
                    borderRadius: '5px',
                    width: `${widthPct}%`,
                    transition: 'width .4s'
                  }}
                ></div>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--sub)', width: '55px', textAlign: 'right' }}>
                {day.isFuture ? '—' : `${day.count} tasks`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Notification Card */}
      <div style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '16px', marginTop: '12px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '10px' }}>
          Push Notifications for Spaced Repetition
        </div>
        <div style={{ fontSize: '13px', color: 'var(--sub)', marginBottom: '12px' }}>
          Get notified when reviews are due. Works in Chrome and Edge on desktop/Android.
        </div>
        <button
          onClick={handleNotificationEnable}
          style={{
            background: hasNotificationPermission ? 'rgba(0,217,160,.08)' : 'var(--s2)',
            border: `1px solid ${hasNotificationPermission ? 'var(--green)' : 'var(--border)'}`,
            color: hasNotificationPermission ? 'var(--green)' : 'var(--text)',
            fontFamily: 'var(--mono)',
            fontSize: '12px',
            padding: '8px 16px',
            borderRadius: 'var(--r8)',
            cursor: 'pointer',
            transition: 'all .2s'
          }}
        >
          {hasNotificationPermission ? '✓ Notifications enabled' : '🔔 Enable review notifications'}
        </button>
      </div>
    </div>
  );
};
export default WeeklyView;
