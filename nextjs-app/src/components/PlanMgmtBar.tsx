import type { Plan, PlanStatus } from '../types';

interface PlanMgmtBarProps {
  plan: Plan;
  onStatusChange: (status: PlanStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const STATUS_LABELS: Record<PlanStatus, string> = {
  draft: '草稿',
  active: '进行中',
  confirmed: '已确认',
  traveling: '旅行中',
  done: '已完成',
};

const STATUS_OPTIONS: PlanStatus[] = ['draft', 'active', 'confirmed', 'traveling', 'done'];

export default function PlanMgmtBar({ plan, onStatusChange, onEdit, onDelete, onDuplicate }: PlanMgmtBarProps) {
  return (
    <div className="plan-mgmt-bar" id="plan-mgmt-bar">
      <span className="plan-mgmt-name">{plan.name}</span>
      <select
        className={`plan-mgmt-status status-${plan.status}`}
        value={plan.status}
        onChange={(e) => onStatusChange(e.target.value as PlanStatus)}
        style={{
          border: 'none',
          cursor: 'pointer',
          padding: '3px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '.02em',
        }}
      >
        {STATUS_OPTIONS.map(status => (
          <option key={status} value={status}>{STATUS_LABELS[status]}</option>
        ))}
      </select>
      <button className="plan-mgmt-btn" onClick={onDuplicate} title="复制计划">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
          <path d="M10 2H3a1 1 0 00-1 1v7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
        </svg>
      </button>
      <button className="plan-mgmt-btn" onClick={onEdit} title="编辑计划">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M10 2l2 2-8 8H2V9l2-2 6-5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
        </svg>
      </button>
      <button className="plan-mgmt-btn danger" onClick={onDelete} title="删除计划">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 4h8M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M4 4v7a1 1 0 001 1h4a1 1 0 001-1V4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}