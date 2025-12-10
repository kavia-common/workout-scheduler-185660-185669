import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

// PUBLIC_INTERFACE
export const FEATURE_FLAGS = (() => {
  /** Parse feature flags from env string JSON or query params; defaults enabled */
  const env = process.env.REACT_APP_FEATURE_FLAGS;
  let parsed = {};
  try {
    if (env) parsed = JSON.parse(env);
  } catch {
    parsed = {};
  }
  const defaults = {
    enableLocalStorage: true,
  };
  // Allow ?enableLocalStorage=false override for quick dev toggles
  const params = new URLSearchParams(window.location.search);
  if (params.has('enableLocalStorage')) {
    defaults.enableLocalStorage = params.get('enableLocalStorage') !== 'false';
  }
  return { ...defaults, ...parsed };
})();

const initialState = {
  theme: 'light',
  // manual: array of workouts with suggested days
  manual: [
    {
      id: 'w1',
      name: 'Full Body A',
      description: 'Compound lifts: Squat, Bench, Row',
      suggestedDays: ['Mon', 'Thu'],
      exercises: [
        { name: 'Back Squat', sets: '3x5' },
        { name: 'Bench Press', sets: '3x5' },
        { name: 'Barbell Row', sets: '3x8' },
      ],
    },
    {
      id: 'w2',
      name: 'Full Body B',
      description: 'Deadlift focus + presses',
      suggestedDays: ['Tue', 'Fri'],
      exercises: [
        { name: 'Deadlift', sets: '1x5' },
        { name: 'Overhead Press', sets: '3x5' },
        { name: 'Pull-ups', sets: '3xAMRAP' },
      ],
    },
    {
      id: 'w3',
      name: 'Conditioning',
      description: 'Intervals and core',
      suggestedDays: ['Sat'],
      exercises: [
        { name: 'Sprints', sets: '8x100m' },
        { name: 'Plank', sets: '3x60s' },
        { name: 'Farmer Carry', sets: '3x60m' },
      ],
    },
  ],
  // schedule: { '2025-12-10': [{workoutId, time?}] }
  schedule: {},
  // reminders: { '2025-12-10': [{id, workoutId, time, note}] }
  reminders: {},
};

const STORAGE_KEY = 'workout_scheduler_state_v1';

function reducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    case 'SCHEDULE_WORKOUT': {
      const { date, workoutId, time } = action.payload;
      const dayItems = state.schedule[date] ? [...state.schedule[date]] : [];
      dayItems.push({ workoutId, time: time || null });
      return { ...state, schedule: { ...state.schedule, [date]: dayItems } };
    }
    case 'UNSCHEDULE_WORKOUT': {
      const { date, workoutId } = action.payload;
      const dayItems = (state.schedule[date] || []).filter(w => w.workoutId !== workoutId);
      const next = { ...state.schedule };
      if (dayItems.length) next[date] = dayItems;
      else delete next[date];
      return { ...state, schedule: next };
    }
    case 'ADD_REMINDER': {
      const { date, workoutId, time, note, id } = action.payload;
      const list = state.reminders[date] ? [...state.reminders[date]] : [];
      list.push({ id, workoutId, time, note: note || '' });
      return { ...state, reminders: { ...state.reminders, [date]: list } };
    }
    case 'UPDATE_REMINDER': {
      const { date, id, time, note } = action.payload;
      const list = (state.reminders[date] || []).map(r => (r.id === id ? { ...r, time, note } : r));
      return { ...state, reminders: { ...state.reminders, [date]: list } };
    }
    case 'DELETE_REMINDER': {
      const { date, id } = action.payload;
      const list = (state.reminders[date] || []).filter(r => r.id !== id);
      const next = { ...state.reminders };
      if (list.length) next[date] = list;
      else delete next[date];
      return { ...state, reminders: next };
    }
    default:
      return state;
  }
}

const AppContext = createContext(null);

// PUBLIC_INTERFACE
export function useAppContext() {
  /** Hook to access app-level state and actions */
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return ctx;
}

// PUBLIC_INTERFACE
export function AppProvider({ children }) {
  /** App provider with state persistence and env-aware features */
  const [state, dispatch] = useReducer(reducer, initialState);

  // load from localStorage
  useEffect(() => {
    if (!FEATURE_FLAGS.enableLocalStorage) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist to localStorage
  useEffect(() => {
    if (!FEATURE_FLAGS.enableLocalStorage) return;
    try {
      const toSave = { theme: state.theme, schedule: state.schedule, reminders: state.reminders };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // ignore
    }
  }, [state.theme, state.schedule, state.reminders]);

  const actions = useMemo(
    () => ({
      // PUBLIC_INTERFACE
      setTheme: (theme) => dispatch({ type: 'SET_THEME', payload: theme }),
      // PUBLIC_INTERFACE
      scheduleWorkout: (date, workoutId, time) =>
        dispatch({ type: 'SCHEDULE_WORKOUT', payload: { date, workoutId, time } }),
      // PUBLIC_INTERFACE
      unscheduleWorkout: (date, workoutId) =>
        dispatch({ type: 'UNSCHEDULE_WORKOUT', payload: { date, workoutId } }),
      // PUBLIC_INTERFACE
      addReminder: (date, workoutId, time, note) =>
        dispatch({
          type: 'ADD_REMINDER',
          payload: { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, date, workoutId, time, note },
        }),
      // PUBLIC_INTERFACE
      updateReminder: (date, id, time, note) =>
        dispatch({ type: 'UPDATE_REMINDER', payload: { date, id, time, note } }),
      // PUBLIC_INTERFACE
      deleteReminder: (date, id) => dispatch({ type: 'DELETE_REMINDER', payload: { date, id } }),
    }),
    []
  );

  const value = useMemo(
    () => ({
      state,
      actions,
      env: {
        apiBase: process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || '',
        frontendUrl: process.env.REACT_APP_FRONTEND_URL || '',
        wsUrl: process.env.REACT_APP_WS_URL || '',
        nodeEnv: process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || 'development',
        logLevel: process.env.REACT_APP_LOG_LEVEL || 'info',
      },
      flags: FEATURE_FLAGS,
    }),
    [state]
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme === 'dark' ? 'dark' : 'light');
  }, [state.theme]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
