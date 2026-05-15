import { useState, useCallback, useRef, type ReactNode } from 'react';
import type { Trip } from '../types';

interface TripDetailModalProps {
  trip: Trip | null;
  onClose: () => void;
}

function TripDetailModal({ trip, onClose }: TripDetailModalProps) {
  if (!trip) return null;
  return (
    <div className={`trip-name-detail ${trip ? 'show' : ''}`} onClick={onClose}>
      <div className="trip-name-detail-box" onClick={(e) => e.stopPropagation()}>
        <div className="trip-name-detail-title">{trip.name}</div>
        <div className="trip-name-detail-dates">{trip.start} — {trip.end}</div>
        <button className="trip-name-detail-close" onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}

const TODAY = new Date(2026, 4, 9);
const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
const DAY_NAMES = ['日','一','二','三','四','五','六'];

function parseDate(s: string) {
  const p = s.split('-');
  return new Date(+p[0], +p[1] - 1, +p[2]);
}

function fmtDate(d: Date) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

interface CalendarViewProps {
  trips: Trip[];
  onUpdateTrips: (trips: Trip[]) => void;
  onAddTrip: (date: string) => void;
  onEditTrip: (trip: Trip) => void;
  onDeleteTrip: (id: number) => void;
  onToast: (msg: string) => void;
}

interface CalendarDay {
  date: Date;
  dateStr: string;
  dayNum: number;
  isOtherMonth: boolean;
  isToday: boolean;
}

export default function CalendarView({ trips, onUpdateTrips, onAddTrip, onEditTrip, onDeleteTrip, onToast }: CalendarViewProps) {
  const [calYear, setCalYear] = useState(TODAY.getFullYear());
  const [calMonth, setCalMonth] = useState(TODAY.getMonth());
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const dragDataRef = useRef<{ tripId: number } | null>(null);

  const nav = useCallback((d: number) => {
    setCalMonth((prev) => {
      let newMonth = prev + d;
      let newYear = calYear;
      if (newMonth < 0) { newMonth = 11; newYear--; }
      if (newMonth > 11) { newMonth = 0; newYear++; }
      setCalYear(newYear);
      return newMonth;
    });
  }, [calYear]);

  const goToday = useCallback(() => {
    setCalYear(TODAY.getFullYear());
    setCalMonth(TODAY.getMonth());
  }, []);

  const buildCalendarDays = (): CalendarDay[] => {
    const first = new Date(calYear, calMonth, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const prevDays = new Date(calYear, calMonth, 0).getDate();
    const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
    const days: CalendarDay[] = [];

    for (let i = 0; i < totalCells; i++) {
      let d: number;
      let isOtherMonth = false;
      let date: Date;

      if (i < startDay) {
        d = prevDays - startDay + 1 + i;
        isOtherMonth = true;
        date = new Date(calYear, calMonth - 1, d);
      } else if (i >= startDay + daysInMonth) {
        d = i - startDay - daysInMonth + 1;
        isOtherMonth = true;
        date = new Date(calYear, calMonth + 1, d);
      } else {
        d = i - startDay + 1;
        date = new Date(calYear, calMonth, d);
      }

      days.push({
        date,
        dateStr: fmtDate(date),
        dayNum: d,
        isOtherMonth,
        isToday: !isOtherMonth && calYear === TODAY.getFullYear() && calMonth === TODAY.getMonth() && d === TODAY.getDate(),
      });
    }
    return days;
  };

  const calendarDays = buildCalendarDays();

  const handleDragStart = useCallback((e: React.DragEvent, tripId: number) => {
    dragDataRef.current = { tripId };
    e.dataTransfer.setData('text/plain', String(tripId));
    e.dataTransfer.effectAllowed = 'move';
    // Add dragging class after a tick to avoid it being applied to the drag image
    setTimeout(() => {
      const el = e.target as HTMLElement;
      el.classList.add('dragging');
    }, 0);
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.target as HTMLElement).classList.remove('dragging');
    dragDataRef.current = null;
    setDragOverDate(null);
  }, []);

  const handleDayDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDayDragEnter = useCallback((dateStr: string) => {
    setDragOverDate(dateStr);
  }, []);

  const handleDayDragLeave = useCallback(() => {
    setDragOverDate(null);
  }, []);

  const handleDayDrop = useCallback((targetDate: string) => {
    setDragOverDate(null);
    const tripId = dragDataRef.current?.tripId;
    if (!tripId) return;
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    const diff = daysBetween(parseDate(trip.start), parseDate(targetDate));
    const newEnd = new Date(parseDate(trip.end));
    newEnd.setDate(newEnd.getDate() + diff);
    const updatedTrips = trips.map(t =>
      t.id === tripId ? { ...t, start: targetDate, end: fmtDate(newEnd) } : t
    );
    onUpdateTrips(updatedTrips);
    onToast('行程已移动');
  }, [trips, onUpdateTrips, onToast]);

  const handleDayDoubleClick = useCallback((dateStr: string) => {
    onAddTrip(dateStr);
  }, [onAddTrip]);

  // Render trip bars for a specific day
  const getTripBarsForDay = (day: CalendarDay) => {
    const bars: ReactNode[] = [];
    const dayOfWeek = day.date.getDay();
    let barTopOffset = 0;

    trips.forEach((trip) => {
      const tStart = parseDate(trip.start);
      const tEnd = parseDate(trip.end);
      const current = day.date;

      if (current >= tStart && current <= tEnd) {
        const span = Math.min(6 - dayOfWeek, daysBetween(current, tEnd)) + 1;
        const barClass = span === 1 ? 'trip-single' :
          dayOfWeek === 0 ? 'trip-start' : 'trip-mid';

        bars.push(
          <div
            key={`${trip.id}-${day.dateStr}`}
            className={`cal-trip-bar ${barClass}`}
            draggable
            style={{
              background: trip.color,
              top: `${26 + barTopOffset}px`,
            }}
            onDragStart={(e) => handleDragStart(e, trip.id)}
            onDragEnd={handleDragEnd}
            onClick={(e) => {
              e.stopPropagation();
              onEditTrip(trip);
            }}
          >
            <span style={{ pointerEvents: 'none' }}>{trip.name}</span>
            <span
              className="trip-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTrip(trip.id);
              }}
            >
              ×
            </span>
          </div>
        );
        barTopOffset += 26;
      }
    });

    return bars;
  };

  // Timeline
  const monthStart = new Date(calYear, calMonth, 1);
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const monthEnd = new Date(calYear, calMonth + 1, 0);

  const timelineSegments = trips
    .filter(trip => {
      const tStart = parseDate(trip.start);
      const tEnd = parseDate(trip.end);
      return !(tEnd < monthStart || tStart > monthEnd);
    })
    .map(trip => {
      const tStart = parseDate(trip.start);
      const tEnd = parseDate(trip.end);
      const visStart = tStart < monthStart ? monthStart : tStart;
      const visEnd = tEnd > monthEnd ? monthEnd : tEnd;
      const leftPct = (daysBetween(monthStart, visStart) / daysInMonth * 100);
      const widthPct = ((daysBetween(visStart, visEnd) + 1) / daysInMonth * 100);
      return { trip, leftPct, widthPct };
    });

  const timelineLabels: string[] = [];
  for (let i = 1; i <= daysInMonth; i += 7) {
    timelineLabels.push(i + '日');
  }
  timelineLabels.push(daysInMonth + '日');

  return (
    <div className="section active" id="sec-calendar">
      <div className="section-header">
        <h1>
          <span className="header-icon" style={{ background: 'var(--accent-subtle)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="10" rx="2" stroke="var(--accent)" strokeWidth="1.2"/>
              <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </span>
          行程日历
        </h1>
        <p>拖拽行程条调整日期，单击行程条编辑，双击空白日期添加新行程</p>
      </div>
      <div className="cal-toolbar">
        <button onClick={() => nav(-1)}>← 上月</button>
        <h2 id="cal-month-label">{calYear}年 {MONTH_NAMES[calMonth]}</h2>
        <button onClick={() => nav(1)}>下月 →</button>
        <button onClick={goToday}>今天</button>
        <div className="cal-legend" id="cal-legend">
          {trips.map(t => (
            <div key={t.id} className="cal-legend-item">
              <div className="cal-legend-color" style={{ background: t.color }} />
              {t.name}
            </div>
          ))}
        </div>
      </div>
      <div className="cal-grid" id="cal-grid">
        {DAY_NAMES.map(d => (
          <div key={d} className="cal-header">{d}</div>
        ))}
        {calendarDays.map((day) => (
          <div
            key={day.dateStr}
            className={
              `cal-day${day.isOtherMonth ? ' other-month' : ''}` +
              `${day.isToday ? ' today' : ''}` +
              `${dragOverDate === day.dateStr ? ' drag-over' : ''}`
            }
            onDragOver={handleDayDragOver}
            onDragEnter={() => handleDayDragEnter(day.dateStr)}
            onDragLeave={handleDayDragLeave}
            onDrop={(e) => { e.preventDefault(); handleDayDrop(day.dateStr); }}
            onDoubleClick={() => handleDayDoubleClick(day.dateStr)}
          >
            <div className="cal-date">{day.dayNum}</div>
            {getTripBarsForDay(day)}
          </div>
        ))}
      </div>
      <div className="timeline" id="timeline">
        <h3>时间轴</h3>
        <div className="timeline-bar" id="timeline-bar">
          {timelineSegments.map(({ trip, leftPct, widthPct }) => (
            <div
              key={trip.id}
              className="timeline-segment"
              style={{
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                background: trip.color,
              }}
              onClick={() => setSelectedTrip(trip)}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{trip.name}</span>
            </div>
          ))}
        </div>
        <div className="timeline-labels" id="timeline-labels">
          {timelineLabels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
        <div className="timeline-vertical" id="timeline-vertical">
          {trips.map(trip => (
            <div key={trip.id} className="timeline-vertical-item" onClick={() => setSelectedTrip(trip)}>
              <div className="timeline-vertical-dot" style={{ background: trip.color }} />
              <div className="timeline-vertical-content">
                <div className="timeline-vertical-name">{trip.name}</div>
                <div className="timeline-vertical-dates">{trip.start} — {trip.end}</div>
              </div>
            </div>
          ))}
        </div>
        <TripDetailModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
      </div>
    </div>
  );
}
