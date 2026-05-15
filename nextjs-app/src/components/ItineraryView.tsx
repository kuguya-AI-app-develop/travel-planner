import { useState } from 'react';
import type { ItineraryItem, Trip } from '../types';

interface ItineraryViewProps {
  itinerary: ItineraryItem[];
  trips: Trip[];
  onUpdateItinerary: (items: ItineraryItem[]) => void;
  onToast: (msg: string) => void;
}

const TYPE_OPTIONS = [
  { value: 'sight', label: '景点', color: 'var(--accent)' },
  { value: 'food', label: '餐饮', color: 'oklch(48% 0.12 75)' },
  { value: 'transport', label: '交通', color: 'var(--teal)' },
  { value: 'hotel', label: '住宿', color: 'var(--purple)' },
  { value: 'other', label: '其他', color: 'var(--muted)' },
];

function parseDate(s: string) {
  const p = s.split('-');
  return new Date(+p[0], +p[1] - 1, +p[2]);
}

function fmtDate(d: Date) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function getDatesBetween(start: string, end: string): string[] {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  const dates: string[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(fmtDate(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export default function ItineraryView({ itinerary, trips, onUpdateItinerary, onToast }: ItineraryViewProps) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalDate, setAddModalDate] = useState('');
  const [newItem, setNewItem] = useState({ time: '09:00', type: 'sight' as const, title: '', meta: '' });

  const allDates = trips.flatMap(t => getDatesBetween(t.start, t.end));
  const uniqueDates = [...new Set(allDates)].sort();

  const getItemsForDate = (date: string) => itinerary.filter(i => i.date === date).sort((a, b) => a.time.localeCompare(b.time));

  const toggleDay = (date: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const handleAddItem = () => {
    if (!addModalDate || !newItem.title.trim()) {
      onToast('请填写时间和标题');
      return;
    }
    const maxId = Math.max(0, ...itinerary.map(i => i.id));
    const newItineraryItem: ItineraryItem = {
      id: maxId + 1,
      date: addModalDate,
      time: newItem.time,
      type: newItem.type,
      title: newItem.title.trim(),
      meta: newItem.meta.trim(),
      order: getItemsForDate(addModalDate).length,
    };
    onUpdateItinerary([...itinerary, newItineraryItem]);
    setAddModalOpen(false);
    setNewItem({ time: '09:00', type: 'sight', title: '', meta: '' });
    onToast('已添加行程');
  };

  const handleDeleteItem = (id: number) => {
    onUpdateItinerary(itinerary.filter(i => i.id !== id));
    onToast('已删除');
  };

  const formatDate = (dateStr: string) => {
    const d = parseDate(dateStr);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
  };

  return (
    <div className="section active" id="sec-itinerary">
      <div className="section-header">
        <h1>
          <span className="header-icon" style={{ background: 'var(--accent-subtle)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3h10M3 7h6M3 11h8M3 15h4" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </span>
          每日行程
        </h1>
        <p>规划每天的具体安排，点击日期展开查看，拖拽排序活动</p>
      </div>
      <div id="itinerary-days">
        {uniqueDates.map(date => {
          const items = getItemsForDate(date);
          const isExpanded = expandedDays.has(date);
          return (
            <div key={date} className="itinerary-day-card">
              <div className="itinerary-day-header" onClick={() => toggleDay(date)}>
                {formatDate(date)}
                <span className="day-date">{items.length}个活动</span>
                <span className={`day-toggle ${isExpanded ? 'open' : ''}`}>▼</span>
              </div>
              <div className={`itinerary-day-body ${isExpanded ? '' : 'collapsed'}`}>
                {items.map(item => {
                  const typeInfo = TYPE_OPTIONS.find(t => t.value === item.type);
                  return (
                    <div key={item.id} className="itinerary-item">
                      <div className="itinerary-time">{item.time}</div>
                      <div className="itinerary-dot" style={{ background: typeInfo?.color || 'var(--muted)' }} />
                      <div className="itinerary-content">
                        <div className="itinerary-title">{item.title}</div>
                        {item.meta && <div className="itinerary-meta">{item.meta}</div>}
                      </div>
                      <span className={`itinerary-type-badge type-${item.type}`}>{typeInfo?.label}</span>
                      <div className="itinerary-actions">
                        <button className="itinerary-action danger" onClick={() => handleDeleteItem(item.id)}>×</button>
                      </div>
                    </div>
                  );
                })}
                <div className="itinerary-add" onClick={() => { setAddModalDate(date); setAddModalOpen(true); }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  添加活动
                </div>
              </div>
            </div>
          );
        })}
        {uniqueDates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
            请先在行程日历中添加行程
          </div>
        )}
      </div>

      {addModalOpen && (
        <div className="modal-overlay show" onClick={() => setAddModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>添加活动</h3>
            <label>时间</label>
            <input type="time" value={newItem.time} onChange={(e) => setNewItem({ ...newItem, time: e.target.value })} />
            <label>类型</label>
            <select value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}>
              {TYPE_OPTIONS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <label>标题</label>
            <input placeholder="活动名称" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
            <label>备注</label>
            <input placeholder="地址、联系方式等" value={newItem.meta} onChange={(e) => setNewItem({ ...newItem, meta: e.target.value })} />
            <div className="modal-actions">
              <button className="btn" onClick={() => setAddModalOpen(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleAddItem}>添加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}