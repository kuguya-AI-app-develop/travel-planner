import { useState } from 'react';
import type { PackingCategory, PackingItem } from '../types';

interface PackingViewProps {
  categories: PackingCategory[];
  onUpdateCategories: (categories: PackingCategory[]) => void;
  onToast: (msg: string) => void;
}

const DEFAULT_CATEGORIES = [
  { name: '证件', icon: '📄' },
  { name: '电子产品', icon: '📱' },
  { name: '衣物', icon: '👕' },
  { name: '洗漱用品', icon: '🧴' },
  { name: '药品', icon: '💊' },
  { name: '其他', icon: '📦' },
];

export default function PackingView({ categories, onUpdateCategories, onToast }: PackingViewProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addCategoryId, setAddCategoryId] = useState<number | null>(null);
  const [newItemText, setNewItemText] = useState('');

  const allItems = categories.flatMap(c => c.items);
  const doneCount = allItems.filter(i => i.done).length;
  const totalCount = allItems.length;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const handleToggleItem = (categoryId: number, itemId: number) => {
    onUpdateCategories(categories.map(cat => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        items: cat.items.map(item => item.id === itemId ? { ...item, done: !item.done } : item),
      };
    }));
  };

  const handleAddItem = () => {
    if (!addCategoryId || !newItemText.trim()) {
      onToast('请输入物品名称');
      return;
    }
    const maxItemId = Math.max(0, ...allItems.map(i => i.id));
    onUpdateCategories(categories.map(cat => {
      if (cat.id !== addCategoryId) return cat;
      return {
        ...cat,
        items: [...cat.items, { id: maxItemId + 1, text: newItemText.trim(), done: false }],
      };
    }));
    setAddModalOpen(false);
    setNewItemText('');
    onToast('已添加物品');
  };

  const handleDeleteItem = (categoryId: number, itemId: number) => {
    onUpdateCategories(categories.map(cat => {
      if (cat.id !== categoryId) return cat;
      return { ...cat, items: cat.items.filter(i => i.id !== itemId) };
    }));
    onToast('已删除');
  };

  const handleAddCategory = () => {
    const existingNames = categories.map(c => c.name);
    const availableCat = DEFAULT_CATEGORIES.find(c => !existingNames.includes(c.name));
    if (availableCat) {
      const maxId = Math.max(0, ...categories.map(c => c.id));
      onUpdateCategories([...categories, { id: maxId + 1, name: availableCat.name, items: [] }]);
      onToast(`已添加分类：${availableCat.name}`);
    } else {
      onToast('所有分类已添加');
    }
  };

  const progressColor = progress === 100 ? 'var(--success)' : 'var(--accent)';

  return (
    <div className="section active" id="sec-packing">
      <div className="section-header">
        <h1>
          <span className="header-icon" style={{ background: 'var(--success-subtle)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="5" width="10" height="8.5" rx="1.5" stroke="var(--success)" strokeWidth="1.1"/>
              <path d="M5.5 5V3.5a2.5 2.5 0 015 0V5" stroke="var(--success)" strokeWidth="1.1"/>
              <path d="M5.5 9l2 2 3.5-3.5" stroke="var(--success)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          行李清单
        </h1>
        <p>出发前逐项检查，已打包的物品会自动标记</p>
      </div>
      <div className="packing-progress" id="packing-progress">
        <div className="packing-progress-bar">
          <div className="packing-progress-fill" style={{ width: `${progress}%`, background: progressColor }} />
        </div>
        <div className="packing-progress-text">已打包 {doneCount}/{totalCount} ({progress}%)</div>
      </div>
      <div id="packing-categories">
        {categories.map(cat => (
          <div key={cat.id} className="packing-category">
            <div className="packing-category-header">
              <span>{cat.name}</span>
              <span className="packing-category-count">{cat.items.filter(i => i.done).length}/{cat.items.length}</span>
            </div>
            {cat.items.map(item => (
              <div key={item.id} className={`packing-item ${item.done ? 'done' : ''}`}>
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => handleToggleItem(cat.id, item.id)}
                  style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
                />
                <span className="packing-text">{item.text}</span>
                <span className="packing-delete" onClick={() => handleDeleteItem(cat.id, item.id)}>×</span>
              </div>
            ))}
            <div className="packing-add-row">
              <input
                className="packing-add-input"
                placeholder="添加物品..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setAddCategoryId(cat.id);
                    setNewItemText((e.target as HTMLInputElement).value);
                    setAddModalOpen(true);
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    setAddCategoryId(cat.id);
                    setNewItemText(e.target.value);
                    setAddModalOpen(true);
                  }
                }}
              />
            </div>
          </div>
        ))}
        <button className="btn-sm" onClick={handleAddCategory} style={{ marginTop: 10 }}>+ 添加分类</button>
      </div>

      {addModalOpen && (
        <div className="modal-overlay show" onClick={() => setAddModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>添加物品</h3>
            <input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="物品名称"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            />
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