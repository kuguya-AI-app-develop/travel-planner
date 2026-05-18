import type { ReactElement } from 'react';
import type { TabType, Plan } from '../types';
import PlanSelector from './PlanSelector';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  coverVisible: boolean;
  onToggleCover: () => void;
  isOpen: boolean;
  onClose: () => void;
  plans: Plan[];
  currentPlanId: number;
  onPlanChange: (planId: number) => void;
  onAddPlan: (name: string) => void;
  onRenamePlan: (planId: number, name: string) => void;
  onDeletePlan: (planId: number) => void;
  onLogout: () => void;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  coverVisible,
  onToggleCover,
  isOpen,
  onClose,
  plans,
  currentPlanId,
  onPlanChange,
  onAddPlan,
  onRenamePlan,
  onDeletePlan,
  onLogout,
}: SidebarProps) {
  const tabs: { id: TabType; label: string; icon: ReactElement }[] = [
    {
      id: 'calendar',
      label: '行程日历',
      icon: (
        <svg viewBox="0 0 20 20" fill="none">
          <rect x="3" y="4" width="14" height="13" rx="3" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M3 8.5h14M7 2v4M13 2v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: 'flights',
      label: '机票对比',
      icon: (
        <svg viewBox="0 0 20 20" fill="none">
          <rect x="2" y="5" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M2 8h16" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
          <path d="M13 5v10M16 7v6M10 7v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: 'destinations',
      label: '目的地选择',
      icon: (
        <svg viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M10 11.5L6.5 17h7L10 11.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
          <circle cx="10" cy="8" r="1" fill="currentColor" opacity=".3"/>
        </svg>
      ),
    },
    {
      id: 'hotels',
      label: '酒店评分',
      icon: (
        <svg viewBox="0 0 20 20" fill="none">
          <rect x="3" y="8" width="14" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M7 8V6.5a3 3 0 016 0V8" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="8.5" y="11" width="3" height="3.5" rx="1" fill="currentColor" opacity=".15"/>
        </svg>
      ),
    },
    {
      id: 'expenses',
      label: '其他消费',
      icon: (
        <svg viewBox="0 0 20 20" fill="none">
          <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M3 7h14M7 4v12M13 4v12" stroke="currentColor" strokeWidth="1" opacity=".4"/>
          <text x="10" y="12.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor" opacity=".5">¥</text>
        </svg>
      ),
    },
    {
      id: 'itinerary',
      label: '每日行程',
      icon: (
        <svg viewBox="0 0 20 20" fill="none">
          <path d="M4 4h12M4 8h8M4 12h10M4 16h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <circle cx="16" cy="16" r="2" stroke="currentColor" strokeWidth="1.2"/>
        </svg>
      ),
    },
    {
      id: 'packing',
      label: '行李清单',
      icon: (
        <svg viewBox="0 0 20 20" fill="none">
          <rect x="4" y="6" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M7 6V4.5a3 3 0 016 0V6" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'documents',
      label: '证件管理',
      icon: (
        <svg viewBox="0 0 20 20" fill="none">
          <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M7 6h6M7 9h6M7 12h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity=".5"/>
          <circle cx="14" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.1"/>
        </svg>
      ),
    },
    {
      id: 'plan-overview',
      label: '计划总览',
      icon: (
        <svg viewBox="0 0 20 20" fill="none">
          <rect x="2" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.2"/>
          <rect x="11" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.2"/>
          <rect x="2" y="12" width="7" height="5" rx="2" stroke="currentColor" strokeWidth="1.2"/>
          <rect x="11" y="12" width="7" height="5" rx="2" stroke="currentColor" strokeWidth="1.2"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />
      <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="2" y="2" width="18" height="18" rx="5" fill="var(--accent-subtle)" stroke="var(--accent)" strokeWidth="1.2" />
            <path d="M7 11h8M11 7v8" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          旅行策划
        </div>
        <PlanSelector
          plans={plans}
          currentPlanId={currentPlanId}
          onPlanChange={onPlanChange}
          onAddPlan={onAddPlan}
          onRenamePlan={onRenamePlan}
          onDeletePlan={onDeletePlan}
        />
        <div className="sidebar-label">规划</div>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </div>
        ))}
        <div className="sidebar-divider" />
        <div className="sidebar-label">汇总</div>
        <div
          className={`sidebar-item ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => onTabChange('summary')}
        >
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M4 5h12M4 10h8M4 15h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="16" cy="15" r="2.5" fill="var(--accent)" opacity=".2" stroke="currentColor" strokeWidth="1" />
          </svg>
          预算总结
        </div>
        <div style={{ flex: 1 }} />
        <div className="sidebar-cover-toggle" onClick={onToggleCover}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M1 10l4-3 3 2 3-4 4 5" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
          </svg>
          封面背景
          <div
            className="toggle-track"
            style={{ background: coverVisible ? 'var(--accent)' : 'var(--muted-light)' }}
          >
            <div
              className="toggle-thumb"
              style={{ left: coverVisible ? '18px' : '2px' }}
            />
          </div>
        </div>
        <div className="sidebar-divider" />
        <div className="sidebar-cover-toggle" onClick={() => {
          if (confirm('确定要重置所有数据吗？此操作不可恢复。')) {
            localStorage.clear();
            window.location.reload();
          }
        }} style={{ color: 'var(--danger)', opacity: 0.6 }}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          重置数据
        </div>
        <div className="sidebar-cover-toggle" onClick={onLogout} style={{ color: 'var(--muted)', opacity: 0.6 }}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M6 2H4a1 1 0 00-1 1v10a1 1 0 001 1h2M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          退出登录
        </div>
      </nav>
    </>
  );
}