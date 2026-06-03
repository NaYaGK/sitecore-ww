import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppState } from '../hooks/useAppState';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useAppState State Hook Tests', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAppState());
    expect(result.current.state.pomoSessions).toBe(0);
    expect(result.current.state.streak).toBe(0);
    expect(result.current.state.jobs).toEqual([]);
    expect(result.current.cntDone()).toBe(0);
  });

  it('should toggle tasks and calculate XP correctly', () => {
    const { result } = renderHook(() => useAppState());
    
    // Toggle first task (Day 1 Task 1)
    act(() => {
      result.current.toggleTask(0, 0, 0);
    });

    expect(result.current.cntDone()).toBe(1);
    expect(result.current.calcXP()).toBeGreaterThan(0);
    
    const levelInfo = result.current.getLevelInfo();
    expect(levelInfo.lvl.title).toBe('Apprentice');
  });

  it('should manage job applications correctly', () => {
    const { result } = renderHook(() => useAppState());

    // Add a job
    act(() => {
      result.current.addJob({
        company: 'Google',
        role: 'SRE',
        source: 'Referral',
        notes: 'Tech stack: Kubernetes, GCP',
      });
    });

    expect(result.current.state.jobs.length).toBe(1);
    expect(result.current.state.jobs[0].company).toBe('Google');
    expect(result.current.state.jobs[0].status).toBe('applied');

    // Move job
    const jobId = result.current.state.jobs[0].id;
    act(() => {
      result.current.moveJob(jobId, 'phone');
    });

    expect(result.current.state.jobs[0].status).toBe('phone');

    // Delete job
    act(() => {
      result.current.deleteJob(jobId);
    });

    expect(result.current.state.jobs.length).toBe(0);
  });
});
