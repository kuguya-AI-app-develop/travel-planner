import { useState } from 'react';
import type { Trip } from '../types';

interface TripModalProps {
  show: boolean;
  editTrip: Trip | null;
  defaultDate: string;
  onSave: (trip: Omit<Trip, 'id'> & { id?: number }) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
  onToast: (msg: string) => void;
}

const COLOR_OPTIONS = [
  { value: 'oklch(58% 0.19 260)', label: '蓝色' },
  { value: 'oklch(60% 0.18 150)', label: '绿色' },
  { value: 'oklch(68% 0.16 55)', label: '橙色' },
  { value: 'oklch(56% 0.18 300)', label: '紫色' },
  { value: 'oklch(58% 0.2 25)', label: '红色' },
  { value: 'oklch(60% 0.12 190)', label: '青色' },
];

export default function TripModal({ show, editTrip, defaultDate, onSave, onDelete, onClose, onToast }: TripModalProps) {
  const [name, setName] = useState(editTrip?.name ?? '');
  const [start, setStart] = useState(editTrip?.start ?? defaultDate);
  const [end, setEnd] = useState(editTrip?.end ?? defaultDate);
  const [color, setColor] = useState(editTrip?.color ?? COLOR_OPTIONS[0].value);

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      onToast('请输入行程名称');
      return;
    }
    if (!start || !end) {
      onToast('请选择日期');
      return;
    }
    if (editTrip) {
      onSave({ id: editTrip.id, name: trimmedName, start, end, color });
    } else {
      onSave({ name: trimmedName, start, end, color });
    }
  };

  const handleDelete = () => {
    if (editTrip) {
      onDelete(editTrip.id);
    }
  };

  return (
    <div className={`modal-overlay ${show ? 'show' : ''}`} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{editTrip ? '编辑行程' : '添加行程'}</h3>
        <label>行程名称</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：抵达东京"
          autoFocus
        />
        <label>开始日期</label>
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <label>结束日期</label>
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
        <label>颜色标签</label>
        <select value={color} onChange={(e) => setColor(e.target.value)}>
          {COLOR_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="modal-actions">
          {editTrip && (
            <button className="modal-delete-link" onClick={handleDelete}>
              删除此行程
            </button>
          )}
          <button className="btn" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
}
