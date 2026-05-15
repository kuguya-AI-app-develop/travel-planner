import type { Plan, PlanStatus } from '../types';

interface PlanOverviewViewProps {
  plans: Plan[];
  currentPlanId: number;
  onSelectPlan: (planId: number) => void;
}

const STATUS_LABELS: Record<PlanStatus, string> = {
  draft: '草稿',
  active: '进行中',
  confirmed: '已确认',
  traveling: '旅行中',
  done: '已完成',
};

function daysBetween(start: string, end: string) {
  const a = new Date(start);
  const b = new Date(end);
  return Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
}

function getTripDays(trips: Plan['trips']) {
  if (!trips.length) return 0;
  const start = trips.reduce((min, t) => t.start < min ? t.start : min, trips[0].start);
  const end = trips.reduce((max, t) => t.end > max ? t.end : max, trips[0].end);
  return daysBetween(start, end);
}

function calculateBudget(plan: Plan) {
  const flights = plan.flights.filter(f => f.selected).reduce((sum, f) => sum + f.price, 0);
  const hotels = plan.hotels.filter(h => h.selected).reduce((sum, h) => sum + (h.priceNum || 0), 0);
  const expenses = plan.expenses.filter(e => e.selected).reduce((sum, e) => sum + e.amount, 0);
  const nights = getTripDays(plan.trips);
  return { flights, hotels: hotels * nights, expenses, total: flights + hotels * nights + expenses };
}

export default function PlanOverviewView({ plans, currentPlanId, onSelectPlan }: PlanOverviewViewProps) {
  const getProgress = (plan: Plan) => {
    const total = plan.checklist.length;
    if (total === 0) return 0;
    const done = plan.checklist.filter(c => c.done).length;
    return Math.round((done / total) * 100);
  };

  return (
    <div className="section active" id="sec-plan-overview">
      <div className="section-header">
        <h1>
          <span className="header-icon" style={{ background: 'var(--accent-subtle)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="2" width="6" height="5.5" rx="1.5" stroke="var(--accent)" strokeWidth="1.1"/>
              <rect x="9" y="2" width="6" height="5.5" rx="1.5" stroke="var(--accent)" strokeWidth="1.1"/>
              <rect x="1" y="9.5" width="6" height="4.5" rx="1.5" stroke="var(--accent)" strokeWidth="1.1"/>
              <rect x="9" y="9.5" width="6" height="4.5" rx="1.5" stroke="var(--accent)" strokeWidth="1.1"/>
            </svg>
          </span>
          计划总览
        </h1>
        <p>查看所有旅行计划，勾选后可对比关键指标。点击卡片进入该计划</p>
      </div>
      <div className="plan-cards" id="plan-cards">
        {plans.map(plan => {
          const budget = calculateBudget(plan);
          const progress = getProgress(plan);
          const isSelected = plan.id === currentPlanId;
          const days = getTripDays(plan.trips);

          return (
            <div
              key={plan.id}
              className={`plan-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectPlan(plan.id)}
            >
              <div className="plan-card-header">
                <input
                  type="checkbox"
                  className="plan-card-check"
                  checked={isSelected}
                  onChange={(e) => { e.stopPropagation(); onSelectPlan(plan.id); }}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="plan-card-name">{plan.name}</span>
                <span className={`plan-card-status status-${plan.status}`}>{STATUS_LABELS[plan.status]}</span>
              </div>
              <div className="plan-card-body">
                <div className="plan-card-row">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="2" y="3" width="10" height="9" rx="2" stroke="currentColor" strokeWidth="1.1"/>
                    <path d="M2 6h10M5 1v3M9 1v3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                  <span className="label">行程</span>
                  <span className="value">{days}天</span>
                </div>
                <div className="plan-card-row">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1l1.5 3 3.5.5-2.5 2.5.5 3.5L7 9l-3 1.5.5-3.5L2 4.5 5.5 4 7 1z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
                  </svg>
                  <span className="label">目的地</span>
                  <span className="value">{plan.destinations.filter(d => d.selected).length}个</span>
                </div>
                <div className="plan-card-row">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M2 3.5h10M2 10.5h10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity=".5"/>
                  </svg>
                  <span className="label">待办</span>
                  <span className="value">{plan.checklist.filter(c => !c.done).length}项</span>
                </div>
                <div className="plan-card-budget">¥{budget.total.toLocaleString()}</div>
                <div className="plan-card-budget-label">预算</div>
                <div className="plan-card-progress">
                  <div className="plan-card-progress-bar">
                    <div className="plan-card-progress-fill" style={{ width: `${progress}%`, background: progress === 100 ? 'var(--success)' : 'var(--accent)' }} />
                  </div>
                  <div className="plan-card-progress-text">{progress}% 完成</div>
                </div>
              </div>
              <div className="plan-card-footer">
                <button className="plan-card-btn" onClick={(e) => { e.stopPropagation(); onSelectPlan(plan.id); }}>
                  查看详情
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}