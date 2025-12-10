import React from 'react';
import { useAppContext } from '../context/AppContext';

// PUBLIC_INTERFACE
export default function HeaderNav({ route, setRoute }) {
  /** Header with navigation and theme toggle */
  const { state, actions } = useAppContext();

  return (
    <header className="header" role="banner">
      <div className="header-inner">
        <div className="brand" aria-label="Workout Scheduler">
          <span className="brand-badge" />
          Workout Scheduler
        </div>
        <nav className="nav" role="navigation" aria-label="Primary">
          <a
            href="#/"
            onClick={(e) => { e.preventDefault(); setRoute('/'); }}
            className={route === '/' ? 'active' : ''}
          >
            Manual
          </a>
          <a
            href="#/calendar"
            onClick={(e) => { e.preventDefault(); setRoute('/calendar'); }}
            className={route === '/calendar' ? 'active' : ''}
          >
            Calendar
          </a>
          <a
            href="#/reminders"
            onClick={(e) => { e.preventDefault(); setRoute('/reminders'); }}
            className={route === '/reminders' ? 'active' : ''}
          >
            Reminders
          </a>
          <button
            className="btn"
            onClick={() => actions.setTheme(state.theme === 'light' ? 'dark' : 'light')}
            aria-label={`Switch to ${state.theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {state.theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </nav>
      </div>
    </header>
  );
}
```

Explanation: Workout manual view with ability to quickly schedule to a selected date or suggested day
````write file="workout-scheduler-185660-185669/workout_scheduler_frontend/src/components/WorkoutManual.js"
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatDateKey, getStartOfWeek, getWeekDates, getWeekdayLabel } from '../utils/date';

// PUBLIC_INTERFACE
export default function WorkoutManual() {
  /** Displays static manual and allows scheduling a workout into the current week or specific date */
  const { state, actions } = useAppContext();
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));
  const [targetDate, setTargetDate] = useState('');

  const week = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const weekKeys = week.map(d => formatDateKey(d));

  const scheduleToDate = (workoutId, dateKey) => {
    if (!dateKey) return;
    actions.scheduleWorkout(dateKey, workoutId);
  };

  const scheduleToSuggested = (workout) => {
    // find first matching suggested day within shown week
    for (let i = 0; i < week.length; i++) {
      if (workout.suggestedDays.includes(getWeekdayLabel(week[i]))) {
        scheduleToDate(workout.id, formatDateKey(week[i]));
        break;
      }
    }
  };

  const onPrev = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };
  const onNext = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  return (
    <section className="card" aria-labelledby="manual-title">
      <div className="row" style={{justifyContent:'space-between', marginBottom: 8}}>
        <h2 id="manual-title">Workout Manual</h2>
        <div className="row">
          <button className="btn" onClick={onPrev} aria-label="Previous week">←</button>
          <button className="btn" onClick={onNext} aria-label="Next week">→</button>
        </div>
      </div>
      <div className="small" style={{marginBottom: 12}}>
        Week: {weekKeys[0]} to {weekKeys[6]}
      </div>
      {state.manual.map((w) => (
        <article key={w.id} className="manual-item" aria-label={w.name}>
          <div className="row" style={{justifyContent:'space-between'}}>
            <div>
              <strong>{w.name}</strong>
              <div className="small">{w.description}</div>
              <div style={{marginTop:6}}>
                {w.suggestedDays.map(d => <span key={d} className="pill">Suggested: {d}</span>)}
              </div>
              <ul className="small" style={{marginTop:6}}>
                {w.exercises.map((e, idx) => (
                  <li key={idx}>{e.name} — {e.sets}</li>
                ))}
              </ul>
            </div>
            <div className="col" style={{minWidth:220}}>
              <label className="small" htmlFor={`date-${w.id}`}>Pick a date</label>
              <input
                id={`date-${w.id}`}
                className="input"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
              <div className="row">
                <button className="btn primary" onClick={() => scheduleToDate(w.id, targetDate)} disabled={!targetDate}>
                  Schedule
                </button>
                <button className="btn" onClick={() => scheduleToSuggested(w)}>
                  Quick add (suggested)
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
```

Explanation: Weekly scheduler/calendar allowing click to assign workouts and view scheduled items
````write file="workout-scheduler-185660-185669/workout_scheduler_frontend/src/components/SchedulerCalendar.js"
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatDateKey, getStartOfWeek, getWeekDates } from '../utils/date';

// PUBLIC_INTERFACE
export default function SchedulerCalendar() {
  /** Interactive weekly calendar; click a day to assign a workout */
  const { state, actions } = useAppContext();
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));
  const [selectedWorkout, setSelectedWorkout] = useState(state.manual[0]?.id || '');

  const week = useMemo(() => getWeekDates(weekStart), [weekStart]);

  const onPrev = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };
  const onNext = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const addToDay = (dateKey) => {
    if (!selectedWorkout) return;
    actions.scheduleWorkout(dateKey, selectedWorkout);
  };

  return (
    <section className="card" aria-labelledby="calendar-title">
      <div className="row" style={{justifyContent:'space-between', marginBottom: 8}}>
        <h2 id="calendar-title">Weekly Calendar</h2>
        <div className="row">
          <button className="btn" onClick={onPrev} aria-label="Previous week">←</button>
          <button className="btn" onClick={onNext} aria-label="Next week">→</button>
        </div>
      </div>

      <div className="row" style={{marginBottom: 10}}>
        <label className="small" htmlFor="workout-select" style={{minWidth:100}}>Workout</label>
        <select
          id="workout-select"
          className="input"
          value={selectedWorkout}
          onChange={(e) => setSelectedWorkout(e.target.value)}
        >
          {state.manual.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      <div className="calendar" role="grid" aria-label="Weekly calendar">
        {week.map((d) => {
          const key = formatDateKey(d);
          const items = state.schedule[key] || [];
          return (
            <div
              key={key}
              role="gridcell"
              aria-label={`Day ${key}`}
              onClick={() => addToDay(key)}
              className="cal-cell"
            >
              <div className="cal-date">{key}</div>
              <div>
                {items.map((it, idx) => {
                  const w = state.manual.find(m => m.id === it.workoutId);
                  return (
                    <div key={`${it.workoutId}-${idx}`} className="badge">
                      🏋️ {w ? w.name : it.workoutId}
                      <button
                        className="btn"
                        style={{padding:'2px 6px', fontSize:12}}
                        onClick={(e) => { e.stopPropagation(); actions.unscheduleWorkout(key, it.workoutId); }}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
                {!items.length && <div className="small">Click to add</div>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

Explanation: Reminder form to add reminders tied to date and workout
````write file="workout-scheduler-185660-185669/workout_scheduler_frontend/src/components/ReminderForm.js"
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatDateKey } from '../utils/date';

// PUBLIC_INTERFACE
export default function ReminderForm() {
  /** Form for adding a reminder for a scheduled workout on a specific day */
  const { state, actions } = useAppContext();
  const [date, setDate] = useState(formatDateKey(new Date()));
  const [workoutId, setWorkoutId] = useState(state.manual[0]?.id || '');
  const [time, setTime] = useState('07:00');
  const [note, setNote] = useState('');

  const scheduledWorkoutsForDate = useMemo(() => {
    const items = state.schedule[date] || [];
    return items.map(i => i.workoutId);
  }, [state.schedule, date]);

  const selectableWorkouts = useMemo(() => {
    // Allow reminders only for scheduled workouts of that date to avoid orphan reminders
    if (scheduledWorkoutsForDate.length) {
      return state.manual.filter(m => scheduledWorkoutsForDate.includes(m.id));
    }
    // fallback: any workout
    return state.manual;
  }, [state.manual, scheduledWorkoutsForDate]);

  return (
    <div className="card" aria-labelledby="reminder-form-title">
      <h2 id="reminder-form-title">Add Reminder</h2>
      <div className="col">
        <div className="row">
          <div className="col" style={{flex:1}}>
            <label className="small" htmlFor="date">Date</label>
            <input id="date" className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="col" style={{flex:1}}>
            <label className="small" htmlFor="time">Time</label>
            <input id="time" className="input" type="time" value={time} onChange={e => setTime(e.target.value)} />
          </div>
        </div>
        <div className="col">
          <label className="small" htmlFor="workout">Workout</label>
          <select
            id="workout"
            className="input"
            value={workoutId}
            onChange={(e) => setWorkoutId(e.target.value)}
          >
            {selectableWorkouts.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        <div className="col">
          <label className="small" htmlFor="note">Note</label>
          <input id="note" className="input" type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note" />
        </div>
        <div className="row" style={{justifyContent:'flex-end'}}>
          <button
            className="btn primary"
            onClick={() => {
              if (!date || !time || !workoutId) return;
              actions.addReminder(date, workoutId, time, note);
              setNote('');
            }}
          >
            Save reminder
          </button>
        </div>
      </div>
    </div>
  );
}
```

Explanation: Reminders list with edit/delete behaviors
````write file="workout-scheduler-185660-185669/workout_scheduler_frontend/src/components/RemindersList.js"
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatDateKey } from '../utils/date';

// PUBLIC_INTERFACE
export default function RemindersList() {
  /** Manage reminders: list by date, edit time/note, delete */
  const { state, actions } = useAppContext();
  const [date, setDate] = useState(formatDateKey(new Date()));

  const reminders = state.reminders[date] || [];
  const workoutsById = useMemo(() => {
    const map = {};
    state.manual.forEach(w => { map[w.id] = w; });
    return map;
  }, [state.manual]);

  const [editId, setEditId] = useState(null);
  const [editTime, setEditTime] = useState('');
  const [editNote, setEditNote] = useState('');

  const beginEdit = (r) => {
    setEditId(r.id);
    setEditTime(r.time);
    setEditNote(r.note || '');
  };

  const saveEdit = () => {
    if (!editId) return;
    actions.updateReminder(date, editId, editTime, editNote);
    setEditId(null);
  };

  return (
    <div className="card" aria-labelledby="reminders-title">
      <div className="row" style={{justifyContent:'space-between', marginBottom: 8}}>
        <h2 id="reminders-title">Reminders</h2>
        <div className="row">
          <label className="small" htmlFor="rdate">Date</label>
          <input id="rdate" className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
      <div className="list" role="list">
        {reminders.length === 0 && <div className="small">No reminders for this date.</div>}
        {reminders.map((r) => (
          <div key={r.id} className="list-item" role="listitem">
            <div className="col" style={{flex:1}}>
              <div><strong>{workoutsById[r.workoutId]?.name || r.workoutId}</strong></div>
              {editId === r.id ? (
                <>
                  <div className="row">
                    <input className="input" type="time" value={editTime} onChange={e => setEditTime(e.target.value)} />
                    <input className="input" type="text" value={editNote} onChange={e => setEditNote(e.target.value)} placeholder="Note" />
                  </div>
                </>
              ) : (
                <div className="small">⏰ {r.time} {r.note ? `— ${r.note}` : ''}</div>
              )}
            </div>
            <div className="row">
              {editId === r.id ? (
                <>
                  <button className="btn" onClick={() => setEditId(null)}>Cancel</button>
                  <button className="btn primary" onClick={saveEdit}>Save</button>
                </>
              ) : (
                <>
                  <button className="btn" onClick={() => beginEdit(r)}>Edit</button>
                  <button className="btn" onClick={() => actions.deleteReminder(date, r.id)}>Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

Explanation: Upcoming workouts summary for the next 7 days
````write file="workout-scheduler-185660-185669/workout_scheduler_frontend/src/components/UpcomingSummary.js"
import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { next7Days } from '../utils/date';

// PUBLIC_INTERFACE
export default function UpcomingSummary() {
  /** Shows schedule summary for the next 7 days with reminder time if found */
  const { state } = useAppContext();

  const items = useMemo(() => {
    const keys = next7Days(new Date());
    const out = [];
    keys.forEach((k) => {
      const workouts = state.schedule[k] || [];
      workouts.forEach((w) => {
        // find a reminder time if any for this date and workout
        const rem = (state.reminders[k] || []).find(r => r.workoutId === w.workoutId);
        out.push({ date: k, workoutId: w.workoutId, time: rem?.time || null });
      });
    });
    return out;
  }, [state.schedule, state.reminders]);

  return (
    <aside className="card" aria-labelledby="upcoming-title">
      <h2 id="upcoming-title">Next 7 Days</h2>
      <div className="list">
        {items.length === 0 && <div className="small">No upcoming workouts.</div>}
        {items.map((it, idx) => {
          const w = state.manual.find(m => m.id === it.workoutId);
          return (
            <div key={`${it.date}-${idx}`} className="list-item">
              <div>
                <div><strong>{w ? w.name : it.workoutId}</strong></div>
                <div className="small">{it.date} {it.time ? `— ⏰ ${it.time}` : ''}</div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
```

Explanation: Layout container combining views and sidebar
````write file="workout-scheduler-185660-185669/workout_scheduler_frontend/src/components/Layout.js"
import React from 'react';
import WorkoutManual from './WorkoutManual';
import SchedulerCalendar from './SchedulerCalendar';
import ReminderForm from './ReminderForm';
import RemindersList from './RemindersList';
import UpcomingSummary from './UpcomingSummary';

// PUBLIC_INTERFACE
export default function Layout({ route }) {
  /** Main layout switching content by route and including sidebar summary/reminders */
  return (
    <main className="container">
      <div className="layout-grid">
        <div>
          {route === '/' && <WorkoutManual />}
          {route === '/calendar' && <SchedulerCalendar />}
          {route === '/reminders' && <RemindersList />}
        </div>
        {route !== '/calendar' && <SchedulerCalendar />}
        <div className="col" style={{gap:12}}>
          <ReminderForm />
          <UpcomingSummary />
        </div>
      </div>
    </main>
  );
}
```

Explanation: Overwrite App.js to integrate new app structure with provider, header, layout, and theme
````write file="workout-scheduler-185660-185669/workout_scheduler_frontend/src/App.js"
import React, { useEffect, useState } from 'react';
import './styles.css';
import { AppProvider } from './context/AppContext';
import HeaderNav from './components/HeaderNav';
import Layout from './components/Layout';

// PUBLIC_INTERFACE
function AppInner() {
  /** AppInner handles basic hash routing and applies layout */
  const [route, setRoute] = useState(window.location.hash.replace('#', '') || '/');

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace('#', '') || '/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    // keep hash synced
    if ((window.location.hash || '#/') !== `#${route}`) {
      window.location.hash = route;
    }
  }, [route]);

  return (
    <div className="app-shell">
      <HeaderNav route={route} setRoute={setRoute} />
      <Layout route={route} />
    </div>
  );
}

// PUBLIC_INTERFACE
export default function App() {
  /** Root application with AppProvider */
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
