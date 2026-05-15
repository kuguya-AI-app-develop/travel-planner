import { useCallback } from 'react';
import type { Hotel } from '../types';

interface HotelsViewProps {
  hotels: Hotel[];
  criteria: string[];
  onUpdateHotels: (hotels: Hotel[]) => void;
  onUpdateCriteria: (criteria: string[]) => void;
  onOpenCriteriaModal: () => void;
  onToast: (msg: string) => void;
}

export default function HotelsView({
  hotels,
  criteria,
  onUpdateHotels,
  onUpdateCriteria,
  onOpenCriteriaModal,
  onToast,
}: HotelsViewProps) {
  const toggleSelect = useCallback((id: number) => {
    onUpdateHotels(hotels.map(h => h.id === id ? { ...h, selected: !h.selected } : h));
  }, [hotels, onUpdateHotels]);

  const addHotel = useCallback(() => {
    const scores = criteria.map(() => 3);
    const newHotel: Hotel = {
      id: Math.max(0, ...hotels.map(h => h.id)) + 1,
      name: '新酒店',
      location: '',
      price: '',
      priceNum: 0,
      scores,
      selected: false,
    };
    onUpdateHotels([...hotels, newHotel]);
  }, [hotels, criteria, onUpdateHotels]);

  const deleteHotel = useCallback((id: number) => {
    onUpdateHotels(hotels.filter(h => h.id !== id));
  }, [hotels, onUpdateHotels]);

  const rateHotel = useCallback((hotelId: number, criteriaIdx: number, value: number) => {
    onUpdateHotels(hotels.map(h => {
      if (h.id === hotelId) {
        const newScores = [...h.scores];
        newScores[criteriaIdx] = value;
        return { ...h, scores: newScores };
      }
      return h;
    }));
  }, [hotels, onUpdateHotels]);

  const updateField = useCallback((id: number, field: keyof Hotel, value: string) => {
    onUpdateHotels(hotels.map(h => {
      if (h.id === id) {
        if (field === 'price') {
          const num = parseInt(value.replace(/[^\d]/g, ''), 10);
          return { ...h, price: value, priceNum: isNaN(num) ? 0 : num };
        }
        return { ...h, [field]: value };
      }
      return h;
    }));
  }, [hotels, onUpdateHotels]);

  const renameCriteria = useCallback((idx: number, newName: string) => {
    if (newName) {
      const newCriteria = [...criteria];
      newCriteria[idx] = newName;
      onUpdateCriteria(newCriteria);
    }
  }, [criteria, onUpdateCriteria]);

  const deleteCriteria = useCallback((idx: number) => {
    if (criteria.length <= 1) {
      onToast('至少保留一个评分维度');
      return;
    }
    onUpdateCriteria(criteria.filter((_, i) => i !== idx));
    onUpdateHotels(hotels.map(h => ({
      ...h,
      scores: h.scores.filter((_, i) => i !== idx),
    })));
  }, [criteria, hotels, onUpdateCriteria, onUpdateHotels, onToast]);

  const getScoreColor = (avg: number) =>
    avg >= 4 ? 'var(--success)' : avg >= 3 ? 'oklch(70% 0.16 85)' : 'var(--danger)';

  const renderStars = (hotelId: number, critIdx: number, score: number) => (
    <div className="stars">
      {Array.from({ length: 5 }, (_, j) => (
        <span
          key={j}
          className={`star ${j + 1 <= score ? 'filled' : ''}`}
          onClick={() => rateHotel(hotelId, critIdx, j + 1)}
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div className="section active" id="sec-hotels">
      <div className="section-header">
        <h1>
          <span className="header-icon" style={{ background: 'var(--purple-subtle)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="6" width="12" height="7.5" rx="2" stroke="var(--purple)" strokeWidth="1.1"/>
              <path d="M5.5 6V5a2.5 2.5 0 015 0V6" stroke="var(--purple)" strokeWidth="1.1"/>
            </svg>
          </span>
          酒店评分
        </h1>
        <p>勾选最终选择的酒店，价格将计入预算总结。点击星星评分，维度名称可编辑</p>
      </div>
      <div className="table-wrap" style={{ overflowX: 'auto' }}>
        <table id="hotels-table">
          <thead>
            <tr>
              <th className="select-cell">选定</th>
              <th>酒店名称</th>
              <th>位置</th>
              <th>价格</th>
              {criteria.map((c, i) => (
                <th key={i} className="criteria-cell" style={{ textAlign: 'center' }}>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => renameCriteria(i, e.currentTarget.textContent?.trim() || '')}
                    style={{ outline: 'none' }}
                  >
                    {c}
                  </span>
                  <span className="criteria-delete" onClick={() => deleteCriteria(i)}>×</span>
                </th>
              ))}
              <th style={{ textAlign: 'center' }}>综合评分</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {hotels.map(h => {
              const avg = h.scores.reduce((a, b) => a + b, 0) / h.scores.length;
              return (
                <tr key={h.id}>
                  <td className="select-cell">
                    <input
                      type="checkbox"
                      checked={h.selected}
                      onChange={() => toggleSelect(h.id)}
                    />
                  </td>
                  <td
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateField(h.id, 'name', e.currentTarget.textContent?.trim() || '')}
                    style={{ fontWeight: 500 }}
                  >
                    {h.name}
                  </td>
                  <td
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateField(h.id, 'location', e.currentTarget.textContent?.trim() || '')}
                  >
                    {h.location}
                  </td>
                  <td
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateField(h.id, 'price', e.currentTarget.textContent?.trim() || '')}
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {h.price}
                  </td>
                  {h.scores.map((s, i) => (
                    <td key={i} style={{ textAlign: 'center' }}>
                      {renderStars(h.id, i, s)}
                    </td>
                  ))}
                  <td>
                    <div className="score-bar-wrap">
                      <div className="score-bar">
                        <div
                          className="score-bar-fill"
                          style={{
                            width: `${avg * 20}%`,
                            background: getScoreColor(avg),
                          }}
                        />
                      </div>
                      <span className="score-value">{avg.toFixed(1)}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="btn-danger btn-sm"
                      onClick={() => deleteHotel(h.id)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px' }}
                    >
                      ×
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Mobile cards */}
      {hotels.map(h => {
        const avg = h.scores.reduce((a, b) => a + b, 0) / h.scores.length;
        return (
          <div key={h.id} className="hotel-card">
            <div className="hotel-card-head">
              <input
                type="checkbox"
                checked={h.selected}
                onChange={() => toggleSelect(h.id)}
              />
              <span
                className="hotel-card-name"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => updateField(h.id, 'name', e.currentTarget.textContent?.trim() || '')}
              >
                {h.name}
              </span>
            </div>
            <div className="hotel-card-meta">
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => updateField(h.id, 'location', e.currentTarget.textContent?.trim() || '')}
              >
                {h.location || '未设置'}
              </span>
              <span
                className="price"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => updateField(h.id, 'price', e.currentTarget.textContent?.trim() || '')}
              >
                {h.price || '未设置'}
              </span>
            </div>
            <div className="hotel-card-criteria">
              {h.scores.map((s, i) => (
                <div key={i} className="hotel-card-criterion">
                  <span className="criterion-name">{criteria[i]}</span>
                  {renderStars(h.id, i, s)}
                </div>
              ))}
            </div>
            <div className="hotel-card-score">
              <div className="score-bar-wrap" style={{ flex: 1 }}>
                <div className="score-bar">
                  <div
                    className="score-bar-fill"
                    style={{
                      width: `${avg * 20}%`,
                      background: getScoreColor(avg),
                    }}
                  />
                </div>
                <span className="score-value">{avg.toFixed(1)}</span>
              </div>
              <button className="hotel-card-delete" onClick={() => deleteHotel(h.id)}>×</button>
            </div>
          </div>
        );
      })}
      <div className="table-actions">
        <button className="btn-sm" onClick={addHotel}>+ 添加酒店</button>
        <button className="btn-sm" onClick={onOpenCriteriaModal}>+ 添加评分维度</button>
      </div>
    </div>
  );
}
