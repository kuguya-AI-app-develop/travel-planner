import { useCallback } from 'react';
import type { Trip, Flight, Hotel, Destination, Expense, ChecklistItem } from '../types';

function parseDate(s: string) {
  const p = s.split('-');
  return new Date(+p[0], +p[1] - 1, +p[2]);
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

interface SummaryViewProps {
  trips: Trip[];
  flights: Flight[];
  hotels: Hotel[];
  destinations: Destination[];
  expenses: Expense[];
  checklist: ChecklistItem[];
  onUpdateChecklist: (items: ChecklistItem[]) => void;
}

export default function SummaryView({ trips, flights, hotels, destinations, expenses, checklist, onUpdateChecklist }: SummaryViewProps) {
  const selectedFlights = flights.filter(f => f.selected);
  const flightTotal = selectedFlights.reduce((s, f) => s + f.price, 0);

  const selectedHotels = hotels.filter(h => h.selected);
  const hotelTotal = selectedHotels.reduce((s, h) => s + (h.priceNum || 0), 0);

  const selectedExpenses = expenses.filter(e => e.selected);
  const expenseTotal = selectedExpenses.reduce((s, e) => s + e.amount, 0);

  const nights = trips.reduce((s, t) => s + daysBetween(parseDate(t.start), parseDate(t.end)), 0);
  const hotelBudget = hotelTotal * nights;

  const doneCount = checklist.filter(c => c.done).length;

  const toggleCheck = useCallback((id: number) => {
    onUpdateChecklist(checklist.map(c => c.id === id ? { ...c, done: !c.done } : c));
  }, [checklist, onUpdateChecklist]);

  const addCheckItem = useCallback(() => {
    const newItem: ChecklistItem = {
      id: Math.max(0, ...checklist.map(c => c.id)) + 1,
      text: '新待办事项',
      done: false,
    };
    onUpdateChecklist([...checklist, newItem]);
  }, [checklist, onUpdateChecklist]);

  const deleteCheckItem = useCallback((id: number) => {
    onUpdateChecklist(checklist.filter(c => c.id !== id));
  }, [checklist, onUpdateChecklist]);

  const updateCheckText = useCallback((id: number, text: string) => {
    onUpdateChecklist(checklist.map(c => c.id === id ? { ...c, text } : c));
  }, [checklist, onUpdateChecklist]);

  const sortedTrips = [...trips].sort((a, b) => a.start.localeCompare(b.start));
  const selectedDestinations = destinations.filter(d => d.selected);

  return (
    <div className="section active" id="sec-summary">
      <div className="section-header">
        <h1>
          <span className="header-icon" style={{ background: 'var(--success-subtle)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 4h10M3 8h6M3 12h8" stroke="var(--success)" strokeWidth="1.3" strokeLinecap="round"/>
              <circle cx="13" cy="12" r="2" fill="var(--success)" opacity=".2" stroke="var(--success)" strokeWidth="1"/>
            </svg>
          </span>
          预算总结
        </h1>
        <p>汇总所有已勾选项目的费用与待办事项</p>
      </div>
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-card-label">已选航班费用</div>
          <div className="summary-card-value">¥{flightTotal.toLocaleString()}</div>
          <div className="summary-card-note">{selectedFlights.length} / {flights.length} 个航班已选</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">已选酒店费用</div>
          <div className="summary-card-value">¥{hotelBudget.toLocaleString()}</div>
          <div className="summary-card-note">{selectedHotels.length} 家已选 × {nights} 晚</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">其他消费</div>
          <div className="summary-card-value">¥{expenseTotal.toLocaleString()}</div>
          <div className="summary-card-note">{selectedExpenses.length} 项已选</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">行程天数</div>
          <div className="summary-card-value">{nights} 晚</div>
          <div className="summary-card-note">{trips.length} 段行程</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">总预算</div>
          <div className="summary-card-value">¥{(flightTotal + hotelBudget + expenseTotal).toLocaleString()}</div>
          <div className="summary-card-note">机票 + 酒店 + 其他</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">待办进度</div>
          <div className="summary-card-value">{doneCount}/{checklist.length}</div>
          <div className="summary-card-note">{checklist.length > 0 ? Math.round(doneCount / checklist.length * 100) : 0}% 完成</div>
        </div>
      </div>
      {selectedDestinations.length > 0 && (
        <>
          <div className="section-divider"><span>目的地评分</span></div>
          <div className="dest-summary-list">
            {selectedDestinations.map(dest => (
              <div key={dest.id} className="dest-summary-item">
                <div className="dest-summary-name">
                  {dest.name}
                  <span className="dest-summary-country">{dest.country}</span>
                </div>
                {dest.notes && <div className="dest-summary-notes">{dest.notes}</div>}
                <div className="dest-summary-scores">
                  {dest.scores.map((score, i) => (
                    <span key={i} className="dest-score-tag">{score}分</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="section-divider"><span>待办清单</span></div>
      <div className="checklist" id="checklist">
        <div className="checklist-header">
          待办事项
          <button className="btn-sm" onClick={addCheckItem}>+ 添加</button>
        </div>
        <div id="checklist-items">
          {checklist.map(item => (
            <div key={item.id} className={`checklist-item ${item.done ? 'done' : ''}`}>
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggleCheck(item.id)}
              />
              <span
                className="checklist-text"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => updateCheckText(item.id, e.currentTarget.textContent?.trim() || '')}
              >
                {item.text}
              </span>
              <span
                className="checklist-delete"
                onClick={() => deleteCheckItem(item.id)}
              >
                ×
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="itinerary" id="itinerary-summary">
        <h3>行程概览</h3>
        {sortedTrips.map(trip => {
          const dur = daysBetween(parseDate(trip.start), parseDate(trip.end));
          return (
            <div key={trip.id} className="itinerary-day">
              <div
                className="itinerary-day-header"
                style={{ borderLeft: `3px solid ${trip.color}` }}
              >
                {trip.name}
                <span>{trip.start} — {trip.end}（{dur}晚）</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
