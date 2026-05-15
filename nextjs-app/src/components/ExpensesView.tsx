import type { Expense } from '../types';

const EXPENSE_CATEGORIES = ['门票', '餐饮', '设备租赁', '交通', '购物', '其他'];

interface ExpensesViewProps {
  expenses: Expense[];
  onUpdateExpenses: (expenses: Expense[]) => void;
  onToast: (msg: string) => void;
}

export default function ExpensesView({
  expenses,
  onUpdateExpenses,
  onToast
}: ExpensesViewProps) {
  const handleToggle = (id: number) => {
    onUpdateExpenses(expenses.map(e => 
      e.id === id ? { ...e, selected: !e.selected } : e
    ));
  };

  const handleDelete = (id: number) => {
    onUpdateExpenses(expenses.filter(e => e.id !== id));
    onToast('消费已删除');
  };

  const addExpense = () => {
    const newId = Math.max(0, ...expenses.map(e => e.id)) + 1;
    const newExpense: Expense = {
      id: newId,
      name: '新消费',
      category: '其他',
      amount: 0,
      note: '',
      selected: false
    };
    onUpdateExpenses([...expenses, newExpense]);
    onToast('已添加消费');
  };

  const updateExpense = (id: number, field: keyof Expense, value: string | number | boolean) => {
    onUpdateExpenses(expenses.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const totalSelected = expenses.filter(e => e.selected).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="section active" id="sec-expenses">
      <div className="section-header">
        <h1>
          <span className="header-icon" style={{ background: 'var(--warn-subtle)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="10" rx="2" stroke="var(--warn)" strokeWidth="1.1"/>
              <path d="M2 6h12" stroke="var(--warn)" strokeWidth=".8"/>
              <text x="8" y="11" textAnchor="middle" fontSize="6" fontWeight="700" fill="var(--warn)" opacity=".6">¥</text>
            </svg>
          </span>
          其他消费
        </h1>
        <p>记录门票、餐饮、设备租赁等消费，勾选后计入预算总结</p>
      </div>
      <div className="table-wrap">
        <table id="expenses-table">
          <thead>
            <tr>
              <th className="select-cell">选定</th>
              <th>项目名称</th>
              <th>类别</th>
              <th>金额 (¥)</th>
              <th>备注</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(expense => (
              <tr key={expense.id}>
                <td className="select-cell">
                  <input 
                    type="checkbox" 
                    checked={expense.selected}
                    onChange={() => handleToggle(expense.id)}
                  />
                </td>
                <td contentEditable suppressContentEditableWarning
                  onBlur={(e) => updateExpense(expense.id, 'name', e.currentTarget.textContent || '')}
                >
                  {expense.name}
                </td>
                <td>
                  <select 
                    value={expense.category}
                    onChange={(e) => updateExpense(expense.id, 'category', e.target.value)}
                    style={{ 
                      padding: '4px 8px', 
                      border: '1px solid var(--border)', 
                      borderRadius: '6px',
                      fontSize: '12px',
                      background: 'var(--surface)'
                    }}
                  >
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </td>
                <td contentEditable suppressContentEditableWarning
                  onBlur={(e) => {
                    const val = parseInt(e.currentTarget.textContent || '0');
                    if (!isNaN(val)) {
                      updateExpense(expense.id, 'amount', val);
                    }
                  }}
                >
                  {expense.amount}
                </td>
                <td contentEditable suppressContentEditableWarning
                  onBlur={(e) => updateExpense(expense.id, 'note', e.currentTarget.textContent || '')}
                >
                  {expense.note}
                </td>
                <td>
                  <button 
                    className="expense-card-delete" 
                    onClick={() => handleDelete(expense.id)}
                    style={{ opacity: 1 }}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {expenses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
          暂无消费记录
        </div>
      )}
      <div className="table-actions">
        <button className="btn-sm" onClick={addExpense}>+ 添加消费</button>
      </div>
    </div>
  );
}