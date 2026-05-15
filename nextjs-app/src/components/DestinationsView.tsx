import type { Destination } from '../types';

interface DestinationsViewProps {
  destinations: Destination[];
  criteria: string[];
  onUpdateDestinations: (destinations: Destination[]) => void;
  onOpenCriteriaModal: () => void;
  onToast: (msg: string) => void;
}

export default function DestinationsView({
  destinations,
  criteria,
  onUpdateDestinations,
  onOpenCriteriaModal,
  onToast
}: DestinationsViewProps) {
  const handleToggle = (id: number) => {
    onUpdateDestinations(destinations.map(d => 
      d.id === id ? { ...d, selected: !d.selected } : d
    ));
  };

  const handleScoreChange = (destId: number, criteriaIdx: number, score: number) => {
    onUpdateDestinations(destinations.map(d => {
      if (d.id === destId) {
        const newScores = [...d.scores];
        newScores[criteriaIdx] = score;
        return { ...d, scores: newScores };
      }
      return d;
    }));
  };

  const handleDelete = (id: number) => {
    onUpdateDestinations(destinations.filter(d => d.id !== id));
    onToast('目的地已删除');
  };

  const addDestination = () => {
    const newId = Math.max(0, ...destinations.map(d => d.id)) + 1;
    const newDest: Destination = {
      id: newId,
      name: '新目的地',
      country: '国家',
      notes: '',
      scores: criteria.map(() => 3),
      selected: false
    };
    onUpdateDestinations([...destinations, newDest]);
    onToast('已添加目的地');
  };

  const updateDestination = (id: number, field: keyof Destination, value: string | number | boolean) => {
    onUpdateDestinations(destinations.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  return (
    <div className="section active" id="sec-destinations">
      <div className="section-header">
        <h1>
          <span className="header-icon" style={{ background: 'var(--coral-subtle)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="6.5" r="3" stroke="var(--coral)" strokeWidth="1.1"/>
              <path d="M8 9.5L5 14.5h6L8 9.5z" stroke="var(--coral)" strokeWidth="1" strokeLinejoin="round"/>
              <circle cx="8" cy="6.5" r="1" fill="var(--coral)" opacity=".3"/>
            </svg>
          </span>
          目的地选择
        </h1>
        <p>评估各目的地的优缺点，勾选最终选择的目的地</p>
      </div>
      <div className="table-wrap" style={{ overflowX: 'auto' }}>
        <table id="destinations-table">
          <thead>
            <tr>
              <th className="select-cell">选定</th>
              <th>目的地</th>
              <th>国家</th>
              <th>备注</th>
              {criteria.map((c, i) => (
                <th key={i} className="criteria-cell" contentEditable suppressContentEditableWarning>
                  {c}
                </th>
              ))}
              <th>总分</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {destinations.map(dest => {
              const total = dest.scores.reduce((a, b) => a + b, 0);
              return (
                <tr key={dest.id}>
                  <td className="select-cell">
                    <input 
                      type="checkbox" 
                      checked={dest.selected}
                      onChange={() => handleToggle(dest.id)}
                    />
                  </td>
                  <td contentEditable suppressContentEditableWarning
                    onBlur={(e) => updateDestination(dest.id, 'name', e.currentTarget.textContent || '')}
                  >
                    {dest.name}
                  </td>
                  <td contentEditable suppressContentEditableWarning
                    onBlur={(e) => updateDestination(dest.id, 'country', e.currentTarget.textContent || '')}
                  >
                    {dest.country}
                  </td>
                  <td contentEditable suppressContentEditableWarning
                    onBlur={(e) => updateDestination(dest.id, 'notes', e.currentTarget.textContent || '')}
                  >
                    {dest.notes}
                  </td>
                  {dest.scores.map((score, i) => (
                    <td key={i}>
                      <div className="score-bar-wrap">
                        <div className="score-bar">
                          <div 
                            className="score-bar-fill" 
                            style={{ 
                              width: `${(score / 5) * 100}%`,
                              background: 'var(--coral)'
                            }} 
                          />
                        </div>
                        <span 
                          className="score-value" 
                          contentEditable 
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const val = parseInt(e.currentTarget.textContent || '3');
                            if (val >= 1 && val <= 5) {
                              handleScoreChange(dest.id, i, val);
                            }
                          }}
                        >
                          {score}
                        </span>
                      </div>
                    </td>
                  ))}
                  <td><strong>{total}</strong></td>
                  <td>
                    <button 
                      className="hotel-card-delete" 
                      onClick={() => handleDelete(dest.id)}
                      style={{ opacity: 1 }}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="table-actions">
        <button className="btn-sm" onClick={addDestination}>+ 添加目的地</button>
        <button className="btn-sm" onClick={onOpenCriteriaModal}>+ 添加评估维度</button>
      </div>
    </div>
  );
}