import { useCallback } from 'react';
import type { Flight } from '../types';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  booked: { label: '已预订', cls: 'pill-booked' },
  pending: { label: '待定', cls: 'pill-pending' },
  compare: { label: '对比中', cls: 'pill-compare' },
};

interface FlightsViewProps {
  flights: Flight[];
  criteria: string[];
  onUpdateFlights: (flights: Flight[]) => void;
  onOpenCriteriaModal: () => void;
  onToast: (msg: string) => void;
}

export default function FlightsView({ flights, criteria, onUpdateFlights, onOpenCriteriaModal, onToast }: FlightsViewProps) {
  const toggleSelect = useCallback((id: number) => {
    onUpdateFlights(flights.map(f => f.id === id ? { ...f, selected: !f.selected } : f));
  }, [flights, onUpdateFlights]);

  const addFlight = useCallback(() => {
    const newFlight: Flight = {
      id: Math.max(0, ...flights.map(f => f.id)) + 1,
      airline: '新航班',
      code: '',
      route: '',
      dep: '',
      arr: '',
      price: 0,
      cls: '经济舱',
      status: 'compare',
      selected: false,
      notes: {},
    };
    onUpdateFlights([...flights, newFlight]);
    onToast('已添加航班');
  }, [flights, onUpdateFlights, onToast]);

  const deleteFlight = useCallback((id: number) => {
    onUpdateFlights(flights.filter(f => f.id !== id));
    onToast('航班已删除');
  }, [flights, onUpdateFlights, onToast]);

  const cycleStatus = useCallback((id: number) => {
    const cycle: Flight['status'][] = ['compare', 'pending', 'booked'];
    onUpdateFlights(flights.map(f => {
      if (f.id === id) {
        return { ...f, status: cycle[(cycle.indexOf(f.status) + 1) % 3] };
      }
      return f;
    }));
  }, [flights, onUpdateFlights]);

  const updateField = useCallback((id: number, field: keyof Flight, value: string | number) => {
    onUpdateFlights(flights.map(f => {
      if (f.id === id) {
        if (field === 'price') {
          const num = typeof value === 'number' ? value : parseInt((value as string).replace(/[^\d]/g, ''), 10) || 0;
          return { ...f, price: num };
        }
        return { ...f, [field]: value };
      }
      return f;
    }));
  }, [flights, onUpdateFlights]);

  const updateNote = useCallback((id: number, criteriaIdx: number, value: string) => {
    onUpdateFlights(flights.map(f => {
      if (f.id === id) {
        return { ...f, notes: { ...f.notes, [criteriaIdx]: value } };
      }
      return f;
    }));
  }, [flights, onUpdateFlights]);

  return (
    <div className="section active" id="sec-flights">
      <div className="section-header">
        <h1>
          <span className="header-icon" style={{ background: 'var(--teal-subtle)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1.5" y="4" width="13" height="8" rx="1.5" stroke="var(--teal)" strokeWidth="1.1"/>
              <path d="M1.5 6.5h13" stroke="var(--teal)" strokeWidth=".8" strokeDasharray="1.5 1.5"/>
              <path d="M10.5 4v8M13 5.5v5M8 5.5v5" stroke="var(--teal)" strokeWidth="1" strokeLinecap="round"/>
            </svg>
          </span>
          机票价格对比
        </h1>
        <p>勾选已确定的航班，价格将计入预算总结。可自定义评估维度</p>
      </div>
      <div className="table-wrap">
        <table id="flights-table-full">
          <thead>
            <tr>
              <th className="select-cell">选定</th>
              <th>航空公司</th>
              <th>航班号</th>
              <th>出发 → 到达</th>
              <th>出发时间</th>
              <th>到达时间</th>
              <th>价格 (¥)</th>
              <th>舱位</th>
              <th>状态</th>
              {criteria.map((c, i) => (
                <th key={i} className="criteria-cell" contentEditable suppressContentEditableWarning>{c}</th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {flights.map(f => (
              <tr key={f.id}>
                <td className="select-cell">
                  <input type="checkbox" checked={f.selected} onChange={() => toggleSelect(f.id)} />
                </td>
                <td contentEditable suppressContentEditableWarning
                  onBlur={(e) => updateField(f.id, 'airline', e.currentTarget.textContent?.trim() || '')}>
                  {f.airline}
                </td>
                <td contentEditable suppressContentEditableWarning
                  onBlur={(e) => updateField(f.id, 'code', e.currentTarget.textContent?.trim() || '')}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  {f.code}
                </td>
                <td contentEditable suppressContentEditableWarning
                  onBlur={(e) => updateField(f.id, 'route', e.currentTarget.textContent?.trim() || '')}>
                  {f.route}
                </td>
                <td contentEditable suppressContentEditableWarning
                  onBlur={(e) => updateField(f.id, 'dep', e.currentTarget.textContent?.trim() || '')}
                  style={{ fontFamily: 'var(--font-mono)' }}>
                  {f.dep}
                </td>
                <td contentEditable suppressContentEditableWarning
                  onBlur={(e) => updateField(f.id, 'arr', e.currentTarget.textContent?.trim() || '')}
                  style={{ fontFamily: 'var(--font-mono)' }}>
                  {f.arr}
                </td>
                <td contentEditable suppressContentEditableWarning
                  onBlur={(e) => updateField(f.id, 'price', e.currentTarget.textContent?.trim() || '')}
                  style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  ¥{f.price.toLocaleString()}
                </td>
                <td contentEditable suppressContentEditableWarning
                  onBlur={(e) => updateField(f.id, 'cls', e.currentTarget.textContent?.trim() || '')}>
                  {f.cls}
                </td>
                <td>
                  <span className={`pill ${STATUS_MAP[f.status].cls}`} onClick={() => cycleStatus(f.id)} style={{ cursor: 'pointer' }}>
                    {STATUS_MAP[f.status].label}
                  </span>
                </td>
                {criteria.map((_, i) => (
                  <td key={i}>
                    <input
                      className="note-input"
                      value={f.notes[i] || ''}
                      onChange={(e) => updateNote(f.id, i, e.target.value)}
                      placeholder="-"
                    />
                  </td>
                ))}
                <td>
                  <span className="btn-danger btn-sm" onClick={() => deleteFlight(f.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px' }}>×</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile flight cards */}
      {flights.map(f => (
        <div key={f.id} className="flight-card">
          <div className="flight-card-head">
            <input type="checkbox" checked={f.selected} onChange={() => toggleSelect(f.id)} />
            <span
              className="flight-card-name"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => updateField(f.id, 'airline', e.currentTarget.textContent?.trim() || '')}
            >
              {f.airline}
            </span>
            <span className={`pill ${STATUS_MAP[f.status].cls}`} onClick={() => cycleStatus(f.id)} style={{ cursor: 'pointer', flexShrink: 0 }}>
              {STATUS_MAP[f.status].label}
            </span>
          </div>
          <div className="flight-card-meta">
            <span contentEditable suppressContentEditableWarning
              onBlur={(e) => updateField(f.id, 'code', e.currentTarget.textContent?.trim() || '')}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              {f.code || '航班号'}
            </span>
            <span contentEditable suppressContentEditableWarning
              onBlur={(e) => updateField(f.id, 'route', e.currentTarget.textContent?.trim() || '')}>
              {f.route || '出发 → 到达'}
            </span>
            <span contentEditable suppressContentEditableWarning
              onBlur={(e) => updateField(f.id, 'dep', e.currentTarget.textContent?.trim() || '')}
              style={{ fontFamily: 'var(--font-mono)' }}>
              {f.dep || '--:--'}
            </span>
            <span style={{ color: 'var(--muted-light)' }}>→</span>
            <span contentEditable suppressContentEditableWarning
              onBlur={(e) => updateField(f.id, 'arr', e.currentTarget.textContent?.trim() || '')}
              style={{ fontFamily: 'var(--font-mono)' }}>
              {f.arr || '--:--'}
            </span>
            <span className="price">¥{f.price.toLocaleString()}</span>
            <span>{f.cls}</span>
          </div>
          {criteria.length > 0 && (
            <div className="flight-card-notes">
              {criteria.map((c, i) => (
                <div key={i} className="flight-card-note">
                  <span className="note-label">{c}</span>
                  <input
                    className="note-input"
                    value={f.notes[i] || ''}
                    onChange={(e) => updateNote(f.id, i, e.target.value)}
                    placeholder="-"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="flight-card-footer">
            <button className="btn-sm" onClick={() => deleteFlight(f.id)} style={{ color: 'var(--danger)', border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', marginLeft: 'auto' }}>删除</button>
          </div>
        </div>
      ))}
      <div className="table-actions">
        <button className="btn-sm" onClick={addFlight}>+ 添加航班</button>
        <button className="btn-sm" onClick={onOpenCriteriaModal}>+ 添加评估维度</button>
      </div>
    </div>
  );
}
