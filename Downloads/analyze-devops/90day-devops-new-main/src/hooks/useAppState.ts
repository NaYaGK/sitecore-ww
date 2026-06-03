import { useState, useEffect, useCallback } from 'react';
import { PHASES } from '../data/phases';
import { PROJECTS } from '../data/projects';
import { QBANK } from '../data/qbank';
import { LABS } from '../data/labs';

// Interfaces
export interface Job {
  id: number;
  company: string;
  role: string;
  source: string;
  notes: string;
  status: 'applied' | 'phone' | 'technical' | 'offer';
  createdAt: string;
  updatedAt?: string;
}

export interface BuildLog {
  id: number;
  date: string;
  tool: string;
  project: string;
  what: string;
  broke?: string;
  learned?: string;
  github?: string;
}

export interface MockAnswer {
  q: string;
  cat: string;
  score: number;
  timedOut?: boolean;
}

export interface MockResult {
  id: number;
  date: string;
  questions: number;
  avg: number;
  answers: MockAnswer[];
  cat: string;
}

export interface SavedJD {
  id: number;
  company: string;
  jd: string;
  analysed: string;
}

export interface SRData {
  nextReview: number;
  interval: number;
  conf: number;
}

export interface AppState {
  completedTasks: Record<string, boolean>;
  notes: Record<string, string>;
  confidences: Record<string, number>;
  labdone: Record<string, boolean>;
  projdone: Record<string, boolean>;
  phaseOpen: Record<string, boolean>;
  dayOpen: Record<string, boolean>;
  pomoSessions: number;
  history: Record<string, number>;
  lastDay: string;
  streak: number;
  streakFreezeUsedOn: string;
  freezeUsedWeek: string;
  jobs: Job[];
  ghUser: string;
  qdone: Record<string, boolean>;
  savedJDs: SavedJD[];
  buildLogs: BuildLog[];
  mockHistory: MockResult[];
  weekGoal: number;
}

const LOCAL_STORAGE_KEY = 'devops90_v4';
const XP_MAP = { concept: 10, code: 25, quiz: 20, project: 50 };
export const LEVELS = [
  { min: 0,    title: 'Apprentice',     color: '#7d8fa8' },
  { min: 200,  title: 'Junior DevOps',  color: '#4fa8ff' },
  { min: 600,  title: 'DevOps Engineer', color: '#00d9a0' },
  { min: 1200, title: 'Senior DevOps',  color: '#ffc850' },
  { min: 2000, title: 'Platform Eng.',  color: '#c084fc' },
  { min: 3000, title: 'SRE',            color: '#f97316' },
  { min: 4500, title: 'Staff Engineer', color: '#ff5f5f' },
  { min: 6000, title: 'Principal',      color: '#38bdf8' },
];

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Parse completed tasks, notes, confidences, and specific keys
        const completedTasks: Record<string, boolean> = {};
        const notes: Record<string, string> = {};
        const confidences: Record<string, number> = {};
        const labdone: Record<string, boolean> = {};
        const projdone: Record<string, boolean> = {};
        const phaseOpen: Record<string, boolean> = {};
        const dayOpen: Record<string, boolean> = {};
        
        Object.keys(parsed).forEach(key => {
          if (key.startsWith('p') && key.includes('d') && key.includes('t')) {
            completedTasks[key] = !!parsed[key];
          } else if (key.startsWith('note_')) {
            notes[key] = parsed[key] || '';
          } else if (key.startsWith('conf_')) {
            confidences[key] = Number(parsed[key]) || 0;
          } else if (key.startsWith('labdone_')) {
            labdone[key] = !!parsed[key];
          } else if (key.startsWith('proj_done_')) {
            projdone[key] = !!parsed[key];
          } else if (key.startsWith('po')) {
            phaseOpen[key] = parsed[key] !== false;
          } else if (key.startsWith('do')) {
            dayOpen[key] = parsed[key] !== false;
          }
        });

        return {
          completedTasks,
          notes,
          confidences,
          labdone,
          projdone,
          phaseOpen,
          dayOpen,
          pomoSessions: Number(parsed._pomoSessions) || 0,
          history: parsed._history || {},
          lastDay: parsed._lastDay || '',
          streak: Number(parsed._streak) || 0,
          streakFreezeUsedOn: parsed._streakFreezeUsedOn || '',
          freezeUsedWeek: parsed._freezeUsedWeek || '',
          jobs: parsed._jobs || [],
          ghUser: parsed._ghUser || '',
          qdone: parsed._qdone || {},
          savedJDs: parsed._savedJDs || [],
          buildLogs: parsed._buildLogs || [],
          mockHistory: parsed._mockHistory || [],
          weekGoal: Number(parsed._weekGoal) || 35,
        };
      }
    } catch (_) {}
    return {
      completedTasks: {},
      notes: {},
      confidences: {},
      labdone: {},
      projdone: {},
      phaseOpen: {},
      dayOpen: {},
      pomoSessions: 0,
      history: {},
      lastDay: '',
      streak: 0,
      streakFreezeUsedOn: '',
      freezeUsedWeek: '',
      jobs: [],
      ghUser: '',
      qdone: {},
      savedJDs: [],
      buildLogs: [],
      mockHistory: [],
      weekGoal: 35,
    };
  });

  // Helper function to save to localStorage
  const saveStateToStorage = (updated: AppState) => {
    try {
      // Re-map state structure to legacy flat JSON structure
      const flat: Record<string, unknown> = {
        _pomoSessions: updated.pomoSessions,
        _history: updated.history,
        _lastDay: updated.lastDay,
        _streak: updated.streak,
        _streakFreezeUsedOn: updated.streakFreezeUsedOn,
        _freezeUsedWeek: updated.freezeUsedWeek,
        _jobs: updated.jobs,
        _ghUser: updated.ghUser,
        _qdone: updated.qdone,
        _savedJDs: updated.savedJDs,
        _buildLogs: updated.buildLogs,
        _mockHistory: updated.mockHistory,
        _weekGoal: updated.weekGoal,
      };

      Object.assign(flat, updated.completedTasks);
      Object.assign(flat, updated.notes);
      Object.assign(flat, updated.confidences);
      Object.assign(flat, updated.labdone);
      Object.assign(flat, updated.projdone);
      Object.assign(flat, updated.phaseOpen);
      Object.assign(flat, updated.dayOpen);

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(flat));
    } catch (_) {}
  };

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(prev => {
      const next = updater(prev);
      saveStateToStorage(next);
      return next;
    });
  };

  // Task ID generator
  const tid = (pi: number, di: number, ti: number) => `p${pi}d${di}t${ti}`;

  // Get all task IDs
  const allIds = useCallback(() => {
    const out: string[] = [];
    PHASES.forEach((ph, pi) => {
      ph.data.forEach((d, di) => {
        d.tasks.forEach((_, ti) => {
          out.push(tid(pi, di, ti));
        });
      });
    });
    return out;
  }, []);

  const cntDone = useCallback(() => {
    return allIds().filter(id => !!state.completedTasks[id]).length;
  }, [allIds, state.completedTasks]);

  const cntTotal = useCallback(() => {
    return allIds().length;
  }, [allIds]);

  const dayDone = useCallback((pi: number, di: number) => {
    const day = PHASES[pi]?.data[di];
    if (!day) return 0;
    return day.tasks.filter((_, ti) => !!state.completedTasks[tid(pi, di, ti)]).length;
  }, [state.completedTasks]);

  const dayTotal = useCallback((pi: number, di: number) => {
    return PHASES[pi]?.data[di]?.tasks.length || 0;
  }, []);

  const dayPct = useCallback((pi: number, di: number) => {
    const t = dayTotal(pi, di);
    return t ? Math.round((dayDone(pi, di) / t) * 100) : 0;
  }, [dayDone, dayTotal]);

  const dayStatus = useCallback((pi: number, di: number) => {
    const d = dayDone(pi, di);
    const t = dayTotal(pi, di);
    if (d === 0) return 'backlog';
    if (d === t) return 'done';
    if (d / t >= 0.5) return 'review';
    return 'inprogress';
  }, [dayDone, dayTotal]);

  // Note actions
  const noteKey = (pi: number, di: number) => `note_${pi}_${di}`;
  const getNote = (pi: number, di: number) => state.notes[noteKey(pi, di)] || '';
  const setNote = (pi: number, di: number, val: string) => {
    updateState(prev => ({
      ...prev,
      notes: { ...prev.notes, [noteKey(pi, di)]: val },
    }));
  };
  const hasNote = (pi: number, di: number) => !!(getNote(pi, di) && getNote(pi, di).trim());

  // Confidence rating
  const confKey = (pi: number, di: number, ti: number) => `conf_${pi}_${di}_${ti}`;
  const getConf = (pi: number, di: number, ti: number) => state.confidences[confKey(pi, di, ti)] || 0;
  const setConf = (pi: number, di: number, ti: number, val: number) => {
    updateState(prev => ({
      ...prev,
      confidences: { ...prev.confidences, [confKey(pi, di, ti)]: val },
    }));
  };

  const dayAvgConf = (pi: number, di: number) => {
    const tasks = PHASES[pi]?.data[di]?.tasks || [];
    const rated = tasks.map((_, ti) => getConf(pi, di, ti)).filter(v => v > 0);
    if (!rated.length) return 0;
    return rated.reduce((a, b) => a + b, 0) / rated.length;
  };

  const lowConfTasks = () => {
    const out: { ph: typeof PHASES[0]; pi: number; d: typeof PHASES[0]['data'][0]; di: number; task: typeof PHASES[0]['data'][0]['tasks'][0]; ti: number; conf: number }[] = [];
    PHASES.forEach((ph, pi) => {
      ph.data.forEach((d, di) => {
        d.tasks.forEach((task, ti) => {
          const c = getConf(pi, di, ti);
          if (c > 0 && c <= 2) out.push({ ph, pi, d, di, task, ti, conf: c });
        });
      });
    });
    return out;
  };

  // Task types distributions
  const typeCounts = useCallback(() => {
    const tot = { concept: 0, code: 0, quiz: 0, project: 0 };
    const don = { concept: 0, code: 0, quiz: 0, project: 0 };
    PHASES.forEach((ph, pi) => {
      ph.data.forEach((d, di) => {
        d.tasks.forEach((task, ti) => {
          const k = task.k as keyof typeof tot;
          tot[k] = (tot[k] || 0) + 1;
          if (state.completedTasks[tid(pi, di, ti)]) {
            don[k] = (don[k] || 0) + 1;
          }
        });
      });
    });
    return { tot, don };
  }, [state.completedTasks]);

  const studyHours = useCallback(() => {
    return ((state.pomoSessions * 25) / 60).toFixed(1);
  }, [state.pomoSessions]);

  const readinessScore = useCallback(() => {
    const { tot, don } = typeCounts();
    const qP = tot.quiz ? don.quiz / tot.quiz : 0;
    const prP = tot.project ? don.project / tot.project : 0;
    const cP = tot.code ? don.code / tot.code : 0;
    const coP = tot.concept ? don.concept / tot.concept : 0;
    const lowConf = lowConfTasks().length;
    const confPenalty = Math.min(lowConf * 0.5, 10);
    return Math.max(0, Math.round((qP * .30 + prP * .30 + cP * .25 + coP * .15) * 100 - confPenalty));
  }, [typeCounts]);

  const calcETA = () => {
    const done = cntDone();
    const total = cntTotal();
    const left = total - done;
    const hist = state.history || {};
    const days = Object.keys(hist).filter(k => hist[k] > 0);
    if (days.length < 2 || done === 0) return null;
    const recent = days.slice(-7);
    let tasksDone = 0;
    recent.forEach(k => { tasksDone += (hist[k] || 0); });
    const avgPerDay = tasksDone / recent.length;
    if (avgPerDay <= 0) return null;
    const daysLeft = Math.ceil(left / avgPerDay);
    const eta = new Date();
    eta.setDate(eta.getDate() + daysLeft);

    // ETA band: best week vs worst week
    const allWeeklyAvgs: number[] = [];
    for (let i = 0; i < days.length - 6; i += 7) {
      const slice = days.slice(i, i + 7);
      const sum = slice.reduce((a, k) => a + (hist[k] || 0), 0);
      if (sum > 0) allWeeklyAvgs.push(sum / slice.length);
    }
    let etaBest: string | null = null;
    let etaWorst: string | null = null;
    if (allWeeklyAvgs.length >= 2) {
      const best = Math.max(...allWeeklyAvgs);
      const worst = Math.min(...allWeeklyAvgs);
      const dBest = new Date();
      dBest.setDate(dBest.getDate() + Math.ceil(left / best));
      const dWorst = new Date();
      dWorst.setDate(dWorst.getDate() + Math.ceil(left / worst));
      etaBest = dBest.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      etaWorst = dWorst.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }

    return {
      daysLeft,
      eta: eta.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      avgPerDay: avgPerDay.toFixed(1),
      etaBest,
      etaWorst
    };
  };

  const recordToday = useCallback((tasksCount: number) => {
    const today = new Date().toDateString();
    updateState(prev => {
      const nextHistory = { ...prev.history, [today]: tasksCount };
      let streak = prev.streak || 0;
      let lastDay = prev.lastDay;

      if (lastDay !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const hadFreeze = prev.streakFreezeUsedOn === yesterday;
        if (lastDay === yesterday || hadFreeze) {
          streak += 1;
        } else if (lastDay) {
          streak = 1;
        } else {
          streak = 1;
        }
        lastDay = today;
      }
      return {
        ...prev,
        history: nextHistory,
        streak,
        lastDay,
      };
    });
  }, []);

  const weekDataOffset = (offsetWeeks: number) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() - offsetWeeks * 7);
    startOfWeek.setHours(0, 0, 0, 0);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hist = state.history || {};
    return days.map((name, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const key = d.toDateString();
      return {
        name,
        date: key,
        count: hist[key] || 0,
        isFuture: d > now,
      };
    });
  };

  const getWeekKey = () => {
    const now = new Date();
    const d = new Date(now);
    d.setDate(now.getDate() - now.getDay());
    return d.toDateString();
  };

  const getFreezesAvail = () => {
    const used = state.freezeUsedWeek || '';
    const thisWeek = getWeekKey();
    if (used === thisWeek) return 0;
    return 1;
  };

  const useFreeze = () => {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    updateState(prev => ({
      ...prev,
      streakFreezeUsedOn: yesterday,
      freezeUsedWeek: getWeekKey(),
    }));
  };

  // XP / Levels
  const calcXP = useCallback(() => {
    let xp = 0;
    PHASES.forEach((ph, pi) => {
      ph.data.forEach((d, di) => {
        d.tasks.forEach((task, ti) => {
          if (state.completedTasks[tid(pi, di, ti)]) {
            xp += (XP_MAP[task.k as keyof typeof XP_MAP] || 10);
          }
        });
      });
    });
    return xp;
  }, [state.completedTasks]);

  const getLevelInfo = useCallback(() => {
    const xp = calcXP();
    let lvl = LEVELS[0];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].min) {
        lvl = LEVELS[i];
        break;
      }
    }
    const idx = LEVELS.indexOf(lvl);
    const next = LEVELS[idx + 1] || null;
    const pct = next ? Math.round(((xp - lvl.min) / (next.min - lvl.min)) * 100) : 100;
    return { lvl, next, pct, idx, xp };
  }, [calcXP]);

  // Spaced Repetition (SR)
  const srKey = (pi: number, di: number, ti: number) => `sr_${pi}_${di}_${ti}`;
  const getSRData = (pi: number, di: number, ti: number) => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed[srKey(pi, di, ti)] as SRData || null;
      } catch (_) {}
    }
    return null;
  };

  const scheduleSR = (pi: number, di: number, ti: number, conf: number) => {
    const now = Date.now();
    const intervals = [3, 7, 14, 30]; // days
    const interval = intervals[Math.min(conf - 1, intervals.length - 1)] || 3;
    const nextReview = now + interval * 24 * 60 * 60 * 1000;
    
    // Write directly to local storage to maintain legacy structure, and sync it
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY) || '{}';
      const parsed = JSON.parse(stored);
      parsed[srKey(pi, di, ti)] = { nextReview, interval, conf };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
    } catch (_) {}
  };

  const getDueReviews = useCallback(() => {
    const now = Date.now();
    const out: { ph: typeof PHASES[0]; pi: number; d: typeof PHASES[0]['data'][0]; di: number; task: typeof PHASES[0]['data'][0]['tasks'][0]; ti: number; sr: SRData }[] = [];
    PHASES.forEach((ph, pi) => {
      ph.data.forEach((d, di) => {
        d.tasks.forEach((task, ti) => {
          const sr = getSRData(pi, di, ti);
          if (sr && sr.nextReview <= now) {
            out.push({ ph, pi, d, di, task, ti, sr });
          }
        });
      });
    });
    return out;
  }, []);

  const markSRReviewed = (pi: number, di: number, ti: number, newConf: number) => {
    scheduleSR(pi, di, ti, newConf);
  };

  // Jobs
  const addJob = (job: Omit<Job, 'id' | 'status' | 'createdAt'>) => {
    updateState(prev => ({
      ...prev,
      jobs: [
        {
          ...job,
          id: Date.now(),
          status: 'applied',
          createdAt: new Date().toDateString(),
        },
        ...prev.jobs,
      ],
    }));
  };

  const deleteJob = (id: number) => {
    updateState(prev => ({
      ...prev,
      jobs: prev.jobs.filter(j => j.id !== id),
    }));
  };

  const moveJob = (id: number, status: Job['status']) => {
    updateState(prev => ({
      ...prev,
      jobs: prev.jobs.map(j => j.id === id ? { ...j, status, updatedAt: new Date().toDateString() } : j),
    }));
  };

  // QBank
  const qDone = (qId: string) => !!state.qdone[qId];
  const toggleQ = (qId: string) => {
    updateState(prev => ({
      ...prev,
      qdone: { ...prev.qdone, [qId]: !prev.qdone[qId] },
    }));
  };

  // savedJDs
  const addSavedJD = (company: string, jd: string) => {
    updateState(prev => {
      const items = [
        { id: Date.now(), company, jd, analysed: new Date().toLocaleDateString('en-IN') },
        ...prev.savedJDs,
      ];
      return { ...prev, savedJDs: items.slice(0, 10) };
    });
  };

  const deleteSavedJD = (id: number) => {
    updateState(prev => ({
      ...prev,
      savedJDs: prev.savedJDs.filter(j => j.id !== id),
    }));
  };

  // buildLogs
  const addBuildLog = (log: Omit<BuildLog, 'id' | 'date'>) => {
    updateState(prev => ({
      ...prev,
      buildLogs: [
        {
          ...log,
          id: Date.now(),
          date: new Date().toLocaleDateString('en-IN'),
        },
        ...prev.buildLogs,
      ],
    }));
  };

  const deleteBuildLog = (id: number) => {
    updateState(prev => ({
      ...prev,
      buildLogs: prev.buildLogs.filter(l => l.id !== id),
    }));
  };

  // mockHistory
  const addMockResult = (res: Omit<MockResult, 'id'>) => {
    updateState(prev => {
      const hist = [
        { ...res, id: Date.now() },
        ...prev.mockHistory,
      ];
      return { ...prev, mockHistory: hist.slice(0, 50) };
    });
  };

  const getWeakTopics = () => {
    const scores: Record<string, { sum: number; count: number }> = {};
    state.mockHistory.forEach(h => {
      h.answers.forEach(ans => {
        if (!scores[ans.cat]) scores[ans.cat] = { sum: 0, count: 0 };
        scores[ans.cat].sum += ans.score;
        scores[ans.cat].count += 1;
      });
    });

    return Object.entries(scores)
      .map(([cat, val]) => ({ cat, avg: Math.round(val.sum / val.count) }))
      .filter(topic => topic.avg < 70)
      .sort((a, b) => a.avg - b.avg);
  };

  // Smart Next task
  const getSmartNext = useCallback(() => {
    let weakestPi = 0;
    let weakestPct = 100;
    PHASES.forEach((ph, pi) => {
      const tot = ph.data.reduce((a, _d, di) => a + dayTotal(pi, di), 0);
      const don = ph.data.reduce((a, _d, di) => a + dayDone(pi, di), 0);
      const pct = tot ? (don / tot) * 100 : 100;
      if (pct < weakestPct) {
        weakestPct = pct;
        weakestPi = pi;
      }
    });

    let result: { pi: number; di: number; d: typeof PHASES[0]['data'][0]; ph: typeof PHASES[0] } | null = null;
    PHASES[weakestPi].data.forEach((d, di) => {
      if (result) return;
      if (dayDone(weakestPi, di) < dayTotal(weakestPi, di)) {
        result = { pi: weakestPi, di, d, ph: PHASES[weakestPi] };
      }
    });

    if (!result) {
      PHASES.forEach((ph, pi) => {
        if (result) return;
        ph.data.forEach((d, di) => {
          if (result) return;
          if (dayDone(pi, di) < dayTotal(pi, di)) {
            result = { pi, di, d, ph };
          }
        });
      });
    }

    return result;
  }, [dayDone, dayTotal]);

  const checkPhaseJustCompleted = (pi: number) => {
    const ph = PHASES[pi];
    const tot = ph.data.reduce((a, _d, di) => a + dayTotal(pi, di), 0);
    const don = ph.data.reduce((a, _d, di) => a + dayDone(pi, di), 0);
    const key = `_phaseComp${pi}`;
    
    // Read directly from storage to get actual phase check
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY) || '{}';
      const parsed = JSON.parse(stored);
      if (don === tot && tot > 0 && !parsed[key]) {
        parsed[key] = true;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
        return true;
      }
    } catch (_) {}
    return false;
  };

  const getWeekDone = () => {
    const wd = weekDataOffset(0);
    return wd.reduce((a, d) => a + d.count, 0);
  };

  const getWeekPct = () => {
    return Math.min(100, Math.round((getWeekDone() / state.weekGoal) * 100));
  };

  const checkBounceback = () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toDateString();
    const todayCount = state.history[today] || 0;
    const yestCount = state.history[yesterday] || 0;
    const twoDaysCount = state.history[twoDaysAgo] || 0;
    
    // Read from storage for claims status
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY) || '{}';
      const parsed = JSON.parse(stored);
      return todayCount > 0 && yestCount === 0 && twoDaysCount === 0 && !parsed._bounceback_claimed;
    } catch (_) {}
    return false;
  };

  const claimBounceback = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY) || '{}';
      const parsed = JSON.parse(stored);
      parsed._bounceback_claimed = true;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
    } catch (_) {}
  };

  const toggleTask = (pi: number, di: number, ti: number) => {
    const id = tid(pi, di, ti);
    const wasDone = !!state.completedTasks[id];
    updateState(prev => {
      const updatedTasks = { ...prev.completedTasks, [id]: !wasDone };
      return {
        ...prev,
        completedTasks: updatedTasks,
      };
    });

    if (!wasDone) {
      const conf = getConf(pi, di, ti);
      scheduleSR(pi, di, ti, conf || 3);
    }
  };

  const togglePhaseCollapse = (pi: number) => {
    const key = `po${pi}`;
    updateState(prev => {
      const current = prev.phaseOpen[key] !== false;
      return {
        ...prev,
        phaseOpen: { ...prev.phaseOpen, [key]: !current }
      };
    });
  };

  const toggleDayCollapse = (pi: number, di: number) => {
    const key = `do${pi}_${di}`;
    updateState(prev => {
      const current = prev.dayOpen[key] !== false;
      return {
        ...prev,
        dayOpen: { ...prev.dayOpen, [key]: !current }
      };
    });
  };

  const isPhaseOpen = (pi: number) => {
    return state.phaseOpen[`po${pi}`] !== false;
  };

  const isDayOpen = (pi: number, di: number) => {
    return state.dayOpen[`do${pi}_${di}`] !== false;
  };

  const bulkMarkDay = (pi: number, di: number, type: 'concept' | 'code' | 'all') => {
    updateState(prev => {
      const updatedTasks = { ...prev.completedTasks };
      const tasks = PHASES[pi]?.data[di]?.tasks || [];
      tasks.forEach((task, ti) => {
        if (type === 'all' || task.k === type) {
          updatedTasks[tid(pi, di, ti)] = true;
        }
      });
      return {
        ...prev,
        completedTasks: updatedTasks,
      };
    });
  };

  const incrementPomoSessions = () => {
    updateState(prev => ({
      ...prev,
      pomoSessions: prev.pomoSessions + 1,
    }));
  };

  const updateWeekGoal = (goal: number) => {
    updateState(prev => ({
      ...prev,
      weekGoal: goal,
    }));
  };

  const updateGHUser = (user: string) => {
    updateState(prev => ({
      ...prev,
      ghUser: user,
    }));
  };

  const isProjectCompleted = useCallback((projId: string) => {
    return !!state.projdone[`proj_done_${projId}`];
  }, [state.projdone]);

  const toggleProjectCompleted = (projId: string) => {
    const key = `proj_done_${projId}`;
    updateState(prev => ({
      ...prev,
      projdone: { ...prev.projdone, [key]: !prev.projdone[key] }
    }));
  };

  const setCompletedProjectsLegacy = (projId: string) => {
    const key = `proj_done_${projId}`;
    updateState(prev => ({
      ...prev,
      projdone: { ...prev.projdone, [key]: true }
    }));
  };

  const labDoneKey = (dayKey: string, exId: string) => `labdone_${dayKey}_${exId}`;

  const isLabDone = useCallback((dayKey: string, exId: string) => {
    return !!state.labdone[labDoneKey(dayKey, exId)];
  }, [state.labdone]);

  const markLabDone = (dayKey: string, exId: string) => {
    updateState(prev => ({
      ...prev,
      labdone: { ...prev.labdone, [labDoneKey(dayKey, exId)]: true }
    }));
  };

  const labDayDone = useCallback((dayKey: string) => {
    const lab = LABS[dayKey];
    if (!lab) return 0;
    return lab.exercises.filter(ex => isLabDone(dayKey, ex.id)).length;
  }, [isLabDone]);

  return {
    state,
    cntDone,
    cntTotal,
    dayDone,
    dayTotal,
    dayPct,
    dayStatus,
    getNote,
    setNote,
    hasNote,
    getConf,
    setConf,
    dayAvgConf,
    lowConfTasks,
    typeCounts,
    studyHours,
    readinessScore,
    calcETA,
    recordToday,
    weekData: weekDataOffset,
    getFreezesAvail,
    useFreeze,
    calcXP,
    getLevelInfo,
    getDueReviews,
    markSRReviewed,
    addJob,
    deleteJob,
    moveJob,
    qDone,
    toggleQ,
    addSavedJD,
    deleteSavedJD,
    addBuildLog,
    deleteBuildLog,
    addMockResult,
    getWeakTopics,
    getSmartNext,
    checkPhaseJustCompleted,
    getWeekDone,
    getWeekPct,
    checkBounceback,
    claimBounceback,
    toggleTask,
    togglePhaseCollapse,
    toggleDayCollapse,
    isPhaseOpen,
    isDayOpen,
    bulkMarkDay,
    incrementPomoSessions,
    updateWeekGoal,
    updateGHUser,
    isProjectCompleted,
    toggleProjectCompleted,
    setCompletedProjectsLegacy,
    isLabDone,
    markLabDone,
    labDayDone
  };
}
export type UseAppStateReturnType = ReturnType<typeof useAppState>;
