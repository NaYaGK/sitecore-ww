import React, { useState, useEffect } from 'react';
import { useAppState } from './hooks/useAppState';
import { RoadmapView } from './views/RoadmapView';
import { KanbanView } from './views/KanbanView';
import { FocusView } from './views/FocusView';
import { LabsView } from './views/LabsView';
import { CertsView } from './views/CertsView';
import { JobsView } from './views/JobsView';
import { QbankView } from './views/QbankView';
import { StatsView } from './views/StatsView';
import { WeeklyView } from './views/WeeklyView';
import { ReportView } from './views/ReportView';
import { ProjectsView } from './views/ProjectsView';
import { GithubRewriterView } from './views/GithubRewriterView';
import { ResumeView } from './views/ResumeView';
import { MockInterviewView } from './views/MockInterviewView';
import { SkillGapView } from './views/SkillGapView';
import { BuildLogView } from './views/BuildLogView';
import { LinkedInView } from './views/LinkedInView';
import { ReadinessView } from './views/ReadinessView';
import { ReviewsView } from './views/ReviewsView';
import { RoadmapV2View } from './views/RoadmapV2View';
import { PomodoroModal } from './components/PomodoroModal';
import { ANTHROPIC_KEY_STORAGE, getApiKey, saveApiKey } from './components/AIService';

export const App: React.FC = () => {
  const appState = useAppState();
  const { state, incrementPomoSessions, studyHours } = appState;

  const [currentView, setCurrentView] = useState<string>('roadmap');
  const [focusDay, setFocusDay] = useState<string>('0_0');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // Modals visibility
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPomoOpen, setIsPomoOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  // Handle Theme Initialisation
  useEffect(() => {
    const savedTheme = localStorage.getItem('devops90_theme') || 'dark';
    setTheme(savedTheme as any);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('devops90_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleOpenSettings = () => {
    setApiKeyInput(getApiKey());
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = () => {
    saveApiKey(apiKeyInput);
    setIsSettingsOpen(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'roadmap':
        return (
          <RoadmapView
            appState={appState}
            switchView={setCurrentView}
            setFocusDay={setFocusDay}
          />
        );
      case 'roadmap-v2':
        return (
          <RoadmapV2View
            appState={appState}
            switchView={setCurrentView}
          />
        );
      case 'kanban':
        return (
          <KanbanView
            appState={appState}
            switchView={setCurrentView}
            setFocusDay={setFocusDay}
          />
        );
      case 'focus':
        return (
          <FocusView
            appState={appState}
            focusDay={focusDay}
            setFocusDay={setFocusDay}
          />
        );
      case 'labs':
        return <LabsView appState={appState} />;
      case 'certs':
        return <CertsView appState={appState} />;
      case 'jobs':
        return <JobsView appState={appState} />;
      case 'qbank':
        return <QbankView appState={appState} />;
      case 'stats':
        return <StatsView appState={appState} />;
      case 'weekly':
        return <WeeklyView appState={appState} />;
      case 'report':
        return <ReportView appState={appState} />;
      case 'projects':
        return <ProjectsView appState={appState} switchView={setCurrentView} />;
      case 'github-rewriter':
        return <GithubRewriterView appState={appState} />;
      case 'resume':
        return <ResumeView appState={appState} />;
      case 'mock':
        return <MockInterviewView appState={appState} switchView={setCurrentView} />;
      case 'skillgap':
        return (
          <SkillGapView
            appState={appState}
            setFocusDay={setFocusDay}
            switchView={setCurrentView}
          />
        );
      case 'buildlog':
        return <BuildLogView appState={appState} />;
      case 'linkedin':
        return <LinkedInView appState={appState} />;
      case 'readiness':
        return <ReadinessView appState={appState} />;
      case 'reviews':
        return <ReviewsView appState={appState} />;
      default:
        return (
          <RoadmapView
            appState={appState}
            switchView={setCurrentView}
            setFocusDay={setFocusDay}
          />
        );
    }
  };

  const primaryViews = ['roadmap', 'kanban', 'focus', 'labs'];

  const handleNavItemClick = (view: string) => {
    setCurrentView(view);
    setIsDrawerOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Navigation Top Bar */}
      <nav id="nav">
        <button
          id="ham-btn"
          className={isDrawerOpen ? 'open' : ''}
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          aria-label="Menu"
          aria-expanded={isDrawerOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="nav-brand" onClick={() => handleNavItemClick('roadmap')} style={{ cursor: 'pointer' }}>
          <span className="g">DEV</span>
          <span className="p">OPS</span>
          <span className="v">v4</span>
        </div>
        <div className="nav-tabs">
          <button
            className={`nav-tab ${currentView === 'roadmap' ? 'active' : ''}`}
            onClick={() => handleNavItemClick('roadmap')}
          >
            ☑ Roadmap
          </button>
          <button
            className={`nav-tab ${currentView === 'roadmap-v2' ? 'active' : ''}`}
            onClick={() => handleNavItemClick('roadmap-v2')}
            style={{ background: currentView === 'roadmap-v2' ? 'rgba(0,217,160,.15)' : undefined, color: currentView === 'roadmap-v2' ? 'var(--green)' : undefined }}
          >
            💥 v2 Roadmap
          </button>
          <button
            className={`nav-tab ${currentView === 'kanban' ? 'active' : ''}`}
            onClick={() => handleNavItemClick('kanban')}
          >
            ⊞ Kanban
          </button>
          <button
            className={`nav-tab ${currentView === 'focus' ? 'active' : ''}`}
            onClick={() => handleNavItemClick('focus')}
          >
            ◎ Focus
          </button>
          <button
            className={`nav-tab ${currentView === 'labs' ? 'active' : ''}`}
            onClick={() => handleNavItemClick('labs')}
          >
            ⌨ Labs
          </button>
        </div>
        <div className="nav-right">
          <button className="nav-btn hi" onClick={() => setIsPomoOpen(true)}>⏱</button>
          <button className="nav-btn" onClick={toggleTheme}>◑ Theme</button>
          <button className="nav-btn" onClick={handleOpenSettings}>🔑 Keys</button>
        </div>
      </nav>

      {/* Side Hamburger Drawer Backdrop */}
      {isDrawerOpen && (
        <div 
          id="ham-overlay" 
          className="open"
          onClick={() => setIsDrawerOpen(false)}
        ></div>
      )}

      {/* Side Hamburger Drawer */}
      <div 
        id="ham-drawer" 
        className={isDrawerOpen ? 'open' : ''}
        role="dialog" 
        aria-label="Navigation menu"
      >
        <div className="ham-section">
          <div className="ham-label">🔥 AI Tools</div>
          <button className={`ham-item ${currentView === 'roadmap-v2' ? 'active' : ''}`} onClick={() => handleNavItemClick('roadmap-v2')}
            style={{ color: currentView === 'roadmap-v2' ? 'var(--green)' : undefined }}>
            <span>💥</span><span>v2 Roadmap</span>
          </button>
          <button className={`ham-item ${currentView === 'projects' ? 'active' : ''}`} onClick={() => handleNavItemClick('projects')}>
            <span className="ham-ico">🚀</span>Projects
            <span className="ham-badge hot">hot</span>
          </button>
          <button className={`ham-item ${currentView === 'github-rewriter' ? 'active' : ''}`} onClick={() => handleNavItemClick('github-rewriter')}>
            <span className="ham-ico">🐙</span>GitHub
            <span className="ham-badge hot">hot</span>
          </button>
          <button className={`ham-item ${currentView === 'resume' ? 'active' : ''}`} onClick={() => handleNavItemClick('resume')}>
            <span className="ham-ico">📄</span>Resume
            <span className="ham-badge hot">hot</span>
          </button>
          <button className={`ham-item ${currentView === 'mock' ? 'active' : ''}`} onClick={() => handleNavItemClick('mock')}>
            <span className="ham-ico">🎤</span>Mock Interview
            <span className="ham-badge hot">hot</span>
          </button>
          <button className={`ham-item ${currentView === 'skillgap' ? 'active' : ''}`} onClick={() => handleNavItemClick('skillgap')}>
            <span className="ham-ico">🎯</span>Skill Gap
            <span className="ham-badge hot">hot</span>
          </button>
        </div>
        <div className="ham-section">
          <div className="ham-label">📋 Tracking</div>
          <button className={`ham-item ${currentView === 'buildlog' ? 'active' : ''}`} onClick={() => handleNavItemClick('buildlog')}>
            <span className="ham-ico">🔨</span>Build Log
          </button>
          <button className={`ham-item ${currentView === 'reviews' ? 'active' : ''}`} onClick={() => handleNavItemClick('reviews')}>
            <span className="ham-ico">🔁</span>Reviews
          </button>
          <button className={`ham-item ${currentView === 'weekly' ? 'active' : ''}`} onClick={() => handleNavItemClick('weekly')}>
            <span className="ham-ico">🎯</span>Goals
          </button>
          <button className={`ham-item ${currentView === 'report' ? 'active' : ''}`} onClick={() => handleNavItemClick('report')}>
            <span className="ham-ico">📊</span>Report
          </button>
          <button className={`ham-item ${currentView === 'stats' ? 'active' : ''}`} onClick={() => handleNavItemClick('stats')}>
            <span className="ham-ico">◈</span>Stats
          </button>
        </div>
        <div className="ham-section">
          <div className="ham-label">🏆 Career</div>
          <button className={`ham-item ${currentView === 'certs' ? 'active' : ''}`} onClick={() => handleNavItemClick('certs')}>
            <span className="ham-ico">🏆</span>Certs
          </button>
          <button className={`ham-item ${currentView === 'jobs' ? 'active' : ''}`} onClick={() => handleNavItemClick('jobs')}>
            <span className="ham-ico">💼</span>Jobs
          </button>
          <button className={`ham-item ${currentView === 'linkedin' ? 'active' : ''}`} onClick={() => handleNavItemClick('linkedin')}>
            <span className="ham-ico">📢</span>LinkedIn
          </button>
          <button className={`ham-item ${currentView === 'readiness' ? 'active' : ''}`} onClick={() => handleNavItemClick('readiness')}>
            <span className="ham-ico">✅</span>Readiness
          </button>
        </div>
        <div className="ham-section">
          <div className="ham-label">📚 Study</div>
          <button className={`ham-item ${currentView === 'qbank' ? 'active' : ''}`} onClick={() => handleNavItemClick('qbank')}>
            <span className="ham-ico">❓</span>Q-Bank
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{ paddingBottom: '80px' }}>
        {renderView()}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div id="bottom-bar">
        <button 
          className={`btab ${currentView === 'roadmap' ? 'active' : ''}`} 
          onClick={() => handleNavItemClick('roadmap')}
        >
          <span className="bico">☑</span>Map
        </button>
        <button 
          className={`btab ${currentView === 'kanban' ? 'active' : ''}`} 
          onClick={() => handleNavItemClick('kanban')}
        >
          <span className="bico">⊞</span>Kanban
        </button>
        <button 
          className={`btab ${currentView === 'focus' ? 'active' : ''}`} 
          onClick={() => handleNavItemClick('focus')}
        >
          <span className="bico">◎</span>Focus
        </button>
        <button 
          className={`btab ${currentView === 'labs' ? 'active' : ''}`} 
          onClick={() => handleNavItemClick('labs')}
        >
          <span className="bico">⌨</span>Labs
        </button>
        <button 
          className="btab" 
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        >
          <span className="bico">☰</span>More
        </button>
      </div>

      {/* Pomodoro Timer Modal */}
      <PomodoroModal
        isOpen={isPomoOpen}
        onClose={() => setIsPomoOpen(false)}
        pomoSessions={state.pomoSessions}
        incrementSessions={incrementPomoSessions}
        studyHours={studyHours()}
      />

      {/* Settings Modal (Anthropic API Key) */}
      {isSettingsOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 600,
            background: 'rgba(0,0,0,.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            style={{
              background: 'var(--s1)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '22px',
              width: 'min(440px, 96vw)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setIsSettingsOpen(false)}
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sub)', fontSize: '16px' }}
            >
              ✕
            </button>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>
              🔑 API Settings
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label className="v4-label">Anthropic API Key</label>
              <input
                type="password"
                className="v4-input"
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                placeholder="sk-ant-..."
                style={{ width: '100%', background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '13px', padding: '8px 11px', borderRadius: 'var(--r8)', outline: 'none' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--sub)', marginTop: '6px', lineHeight: '1.4' }}>
                Used directly in the browser to connect to Claude. Cleared when you log out. Safe, client-side only.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="v4-btn-secondary" onClick={() => setIsSettingsOpen(false)}>
                Cancel
              </button>
              <button className="v4-btn-primary" onClick={handleSaveSettings} style={{ padding: '8px 16px', background: 'rgba(0,217,160,.1)', border: '1px solid rgba(0,217,160,.4)', color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '10px', borderRadius: 'var(--r8)', cursor: 'pointer' }}>
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
