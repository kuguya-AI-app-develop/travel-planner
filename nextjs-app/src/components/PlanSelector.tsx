import { useState, useRef, useEffect } from 'react';
import type { Plan, PlanStatus } from '../types';

interface PlanSelectorProps {
  plans: Plan[];
  currentPlanId: number;
  onPlanChange: (planId: number) => void;
  onAddPlan: (name: string) => void;
  onRenamePlan: (planId: number, name: string) => void;
  onDeletePlan: (planId: number) => void;
}

const STATUS_LABELS: Record<PlanStatus, string> = {
  draft: '草稿',
  active: '进行中',
  confirmed: '已确认',
  traveling: '旅行中',
  done: '已完成',
};

export default function PlanSelector({
  plans,
  currentPlanId,
  onPlanChange,
  onAddPlan,
  onRenamePlan,
  onDeletePlan,
}: PlanSelectorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renamePlanId, setRenamePlanId] = useState<number | null>(null);
  const [newPlanName, setNewPlanName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentPlan = plans.find(p => p.id === currentPlanId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddPlan = () => {
    const name = `新计划 ${plans.length + 1}`;
    onAddPlan(name);
    setDropdownOpen(false);
  };

  const handleRename = () => {
    if (renamePlanId && newPlanName.trim()) {
      onRenamePlan(renamePlanId, newPlanName.trim());
      setRenameModalOpen(false);
      setRenamePlanId(null);
      setNewPlanName('');
    }
  };

  const openRenameModal = (planId: number, planName: string) => {
    setRenamePlanId(planId);
    setNewPlanName(planName);
    setRenameModalOpen(true);
    setDropdownOpen(false);
  };

  const handleDelete = (planId: number) => {
    if (plans.length > 1 && confirm('确定要删除这个计划吗？')) {
      onDeletePlan(planId);
      setDropdownOpen(false);
    }
  };

  return (
    <>
      <div className="plan-selector" ref={dropdownRef}>
        <div
          className={`plan-selector-btn ${dropdownOpen ? 'open' : ''}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M5 3V1.5M11 3V1.5M2 6.5h12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
          <span className="plan-name">{currentPlan?.name || '选择计划'}</span>
          <span className="plan-arrow">▼</span>
        </div>
        <div className={`plan-dropdown ${dropdownOpen ? 'show' : ''}`}>
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`plan-dropdown-item ${plan.id === currentPlanId ? 'active' : ''}`}
              onClick={() => { onPlanChange(plan.id); setDropdownOpen(false); }}
            >
              <span className="plan-item-name">{plan.name}</span>
              <span className={`plan-item-status status-${plan.status}`}>{STATUS_LABELS[plan.status]}</span>
            </div>
          ))}
          <div className="plan-dropdown-add" onClick={handleAddPlan}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            添加新计划
          </div>
        </div>
      </div>
      <div className={`plan-rename-overlay ${renameModalOpen ? 'show' : ''}`} onClick={() => setRenameModalOpen(false)}>
        <div className="plan-rename-box" onClick={(e) => e.stopPropagation()}>
          <h3>重命名计划</h3>
          <input
            value={newPlanName}
            onChange={(e) => setNewPlanName(e.target.value)}
            placeholder="计划名称"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          />
          <div className="modal-actions">
            <button className="btn" onClick={() => setRenameModalOpen(false)}>取消</button>
            <button className="btn btn-primary" onClick={handleRename}>保存</button>
          </div>
        </div>
      </div>
    </>
  );
}