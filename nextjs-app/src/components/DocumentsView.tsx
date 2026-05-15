import { useState } from 'react';
import type { Document, DocStatus } from '../types';

interface DocumentsViewProps {
  documents: Document[];
  onUpdateDocuments: (docs: Document[]) => void;
  onToast: (msg: string) => void;
}

const DOC_TYPES = ['护照', '签证', '身份证', '驾照', '机票', '酒店预订单', '保险单', '其他'];
const STATUS_OPTIONS: { value: DocStatus; label: string }[] = [
  { value: 'valid', label: '有效' },
  { value: 'expiring', label: '即将过期' },
  { value: 'expired', label: '已过期' },
  { value: 'processing', label: '办理中' },
  { value: 'none', label: '无' },
];

const STATUS_CLASS: Record<DocStatus, string> = {
  valid: 'doc-status-valid',
  expiring: 'doc-status-expiring',
  expired: 'doc-status-expired',
  processing: 'doc-status-processing',
  none: 'doc-status-none',
};

const DOC_ICONS: Record<string, string> = {
  '护照': '🛂',
  '签证': '📋',
  '身份证': '🪪',
  '驾照': '🚗',
  '机票': '✈️',
  '酒店预订单': '🏨',
  '保险单': '🛡️',
  '其他': '📄',
};

export default function DocumentsView({ documents, onUpdateDocuments, onToast }: DocumentsViewProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', type: '护照', number: '', expiry: '' });

  const handleAddDoc = () => {
    if (!newDoc.name.trim()) {
      onToast('请输入证件名称');
      return;
    }
    const maxId = Math.max(0, ...documents.map(d => d.id));
    const status: DocStatus = newDoc.expiry ? 'valid' : 'none';
    onUpdateDocuments([...documents, {
      id: maxId + 1,
      name: newDoc.name.trim(),
      type: newDoc.type,
      number: newDoc.number.trim(),
      expiry: newDoc.expiry,
      status,
    }]);
    setAddModalOpen(false);
    setNewDoc({ name: '', type: '护照', number: '', expiry: '' });
    onToast('已添加证件');
  };

  const handleDeleteDoc = (id: number) => {
    onUpdateDocuments(documents.filter(d => d.id !== id));
    onToast('已删除');
  };

  const handleStatusChange = (id: number, status: DocStatus) => {
    onUpdateDocuments(documents.map(d => d.id === id ? { ...d, status } : d));
  };

  return (
    <div className="section active" id="sec-documents">
      <div className="section-header">
        <h1>
          <span className="header-icon" style={{ background: 'var(--purple-subtle)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="2" width="14" height="16" rx="2" stroke="var(--purple)" strokeWidth="1.2"/>
              <path d="M7 6h6M7 9h6M7 12h4" stroke="var(--purple)" strokeWidth="1" strokeLinecap="round" opacity=".5"/>
            </svg>
          </span>
          证件管理
        </h1>
        <p>管理护照、签证等重要证件，记录有效期和状态</p>
      </div>
      <div className="doc-cards" id="doc-cards">
        {documents.map(doc => (
          <div key={doc.id} className="doc-card">
            <div className="doc-card-header">
              <div className="doc-card-icon" style={{ background: 'var(--accent-subtle)' }}>
                {DOC_ICONS[doc.type] || '📄'}
              </div>
              <span className="doc-card-name">{doc.name}</span>
              <select
                className={`doc-card-status ${STATUS_CLASS[doc.status]}`}
                value={doc.status}
                onChange={(e) => handleStatusChange(doc.id, e.target.value as DocStatus)}
                style={{ border: 'none', cursor: 'pointer' }}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            {doc.type && (
              <div className="doc-card-row">
                <span className="doc-label">类型</span>
                <span className="doc-value">{doc.type}</span>
              </div>
            )}
            {doc.number && (
              <div className="doc-card-row">
                <span className="doc-label">编号</span>
                <span className="doc-value">{doc.number}</span>
              </div>
            )}
            {doc.expiry && (
              <div className="doc-card-row">
                <span className="doc-label">有效期</span>
                <span className="doc-value">{doc.expiry}</span>
              </div>
            )}
            <div className="doc-card-actions">
              <button className="doc-card-action danger" onClick={() => handleDeleteDoc(doc.id)}>×</button>
            </div>
          </div>
        ))}
      </div>
      <div className="doc-add-btn" onClick={() => setAddModalOpen(true)}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        添加证件
      </div>

      {addModalOpen && (
        <div className="modal-overlay show" onClick={() => setAddModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>添加证件</h3>
            <label>名称</label>
            <input
              value={newDoc.name}
              onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
              placeholder="例如：护照"
            />
            <label>类型</label>
            <select value={newDoc.type} onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}>
              {DOC_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <label>编号（可选）</label>
            <input
              value={newDoc.number}
              onChange={(e) => setNewDoc({ ...newDoc, number: e.target.value })}
              placeholder="证件号码"
            />
            <label>有效期（可选）</label>
            <input
              type="date"
              value={newDoc.expiry}
              onChange={(e) => setNewDoc({ ...newDoc, expiry: e.target.value })}
            />
            <div className="modal-actions">
              <button className="btn" onClick={() => setAddModalOpen(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleAddDoc}>添加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}