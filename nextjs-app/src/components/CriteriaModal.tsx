import { useState } from 'react';

interface CriteriaModalProps {
  show: boolean;
  onSave: (name: string) => void;
  onClose: () => void;
  onToast: (msg: string) => void;
  title?: string;
  placeholder?: string;
}

export default function CriteriaModal({ 
  show, 
  onSave, 
  onClose, 
  onToast, 
  title = '添加评分维度',
  placeholder = '例如：早餐质量、泳池、隔音…'
}: CriteriaModalProps) {
  const [name, setName] = useState('');

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      onToast('请输入维度名称');
      return;
    }
    onSave(trimmed);
    setName('');
  };

  return (
    <div className={`modal-overlay ${show ? 'show' : ''}`} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <label>维度名称</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholder}
          autoFocus
        />
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSave}>添加</button>
        </div>
      </div>
    </div>
  );
}
