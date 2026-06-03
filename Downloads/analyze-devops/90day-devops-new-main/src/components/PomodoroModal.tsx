import React, { useState, useEffect, useRef } from 'react';
import { showToast } from './Toast';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  pomoSessions: number;
  incrementSessions: () => void;
  studyHours: string;
}

type TimerMode = 'focus' | 'short' | 'long';

export const PomodoroModal: React.FC<PomodoroModalProps> = ({
  isOpen,
  onClose,
  pomoSessions,
  incrementSessions,
  studyHours,
}) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // default 25 mins
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getDuration = (m: TimerMode) => {
    if (m === 'focus') return 25 * 60;
    if (m === 'short') return 5 * 60;
    return 15 * 60;
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(getDuration(newMode));
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            
            // Finished session!
            if (mode === 'focus') {
              incrementSessions();
              showToast('🏆 Focus session complete! Time for a break.', 'rgba(0,217,160,.12)');
            } else {
              showToast('⏱ Break finished! Ready to focus?', 'rgba(79,168,255,.12)');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, incrementSessions]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // SVG ring variables
  const r = 70;
  const circ = 2 * Math.PI * r; // ~439.8
  const totalDur = getDuration(mode);
  const strokeDashoffset = circ - (timeLeft / totalDur) * circ;

  return (
    <div 
      className={`modal ${isOpen ? 'open' : ''}`} 
      id="pomo-modal"
      style={{ display: isOpen ? 'flex' : 'none' }}
    >
      <div className="modal-box">
        <button className="modal-close" id="pomo-close" onClick={onClose}>✕</button>
        <div className="modal-title">⏱ Focus Timer</div>
        
        <div className="pomo-mode-row">
          <button 
            className={`pomo-mode-btn ${mode === 'focus' ? 'active' : ''}`} 
            onClick={() => handleModeChange('focus')}
          >
            25m
          </button>
          <button 
            className={`pomo-mode-btn ${mode === 'short' ? 'active' : ''}`} 
            onClick={() => handleModeChange('short')}
          >
            5m
          </button>
          <button 
            className={`pomo-mode-btn ${mode === 'long' ? 'active' : ''}`} 
            onClick={() => handleModeChange('long')}
          >
            15m
          </button>
        </div>

        <div className="pomo-ring">
          <svg className="pomo-svg" width="140" height="140" viewBox="0 0 170 170">
            <circle className="pomo-track" cx="85" cy="85" r={r} />
            <circle 
              className="pomo-prog" 
              id="pomo-prog" 
              cx="85" 
              cy="85" 
              r={r} 
              style={{
                strokeDasharray: `${circ}`,
                strokeDashoffset: `${strokeDashoffset}`
              }}
            />
          </svg>
          <div className="pomo-time">
            <div className="pomo-time-num" id="pomo-num">
              {formatTime(timeLeft)}
            </div>
            <div className="pomo-time-lbl" id="pomo-lbl">
              {mode === 'focus' ? 'FOCUS' : 'BREAK'}
            </div>
          </div>
        </div>

        <div className="pomo-controls">
          <button className="pomo-ctrl-btn reset" id="pomo-reset" onClick={resetTimer}>↺</button>
          <button className="pomo-ctrl-btn main" id="pomo-play" onClick={toggleTimer}>
            {isRunning ? '⏸' : '▶'}
          </button>
        </div>

        <div className="pomo-sessions" id="pomo-sessions">
          Sessions: {pomoSessions} · {studyHours} hrs
        </div>
      </div>
    </div>
  );
};
export default PomodoroModal;
