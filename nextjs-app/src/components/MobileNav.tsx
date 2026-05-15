import type { ReactElement } from 'react';
import type { TabType } from '../types';

interface MobileNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenSidebar: () => void;
}

const navItems: { id: TabType; label: string; icon: ReactElement }[] = [
  {
    id: 'calendar',
    label: '日历',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <rect x="3" y="4" width="14" height="13" rx="3" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M3 8.5h14M7 2v4M13 2v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'flights',
    label: '机票',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <rect x="2" y="5" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M2 8h16M13 5v10M16 7v6M10 7v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'destinations',
    label: '目的地',
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
    label: '酒店',
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
    label: '消费',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M3 7h14M7 4v12M13 4v12" stroke="currentColor" strokeWidth="1" opacity=".4"/>
        <text x="10" y="12.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor" opacity=".5">¥</text>
      </svg>
    ),
  },
  {
    id: 'summary',
    label: '总结',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M4 5h12M4 10h8M4 15h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="16" cy="15" r="2.5" fill="var(--accent)" opacity=".2" stroke="currentColor" strokeWidth="1"/>
      </svg>
    ),
  },
];

export default function MobileNav({ activeTab, onTabChange, onOpenSidebar }: MobileNavProps) {
  return (
    <>
      <button className="mobile-menu-btn" onClick={onOpenSidebar}>
        <svg viewBox="0 0 20 20" fill="none">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <div className="mobile-nav">
        <div className="mobile-nav-inner">
          {navItems.map(item => (
            <div
              key={item.id}
              className={`mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
