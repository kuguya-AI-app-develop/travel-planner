import { useRef, useCallback, useState } from 'react';

interface CoverImageProps {
  visible: boolean;
  onToast: (msg: string) => void;
}

export default function CoverImage({ visible, onToast }: CoverImageProps) {
  const [coverSrc, setCoverSrc] = useState(() => localStorage.getItem('tp-cover') || '');
  const [coverPos, setCoverPos] = useState(() => {
    const saved = localStorage.getItem('tp-cover-pos');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return { x: 50, y: 50 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, startPosX: 50, startPosY: 50 });
  const coverRef = useRef<HTMLDivElement>(null);

  const hasImage = !!coverSrc;

  const updateObjectPosition = useCallback((x: number, y: number) => {
    const img = coverRef.current?.querySelector('img');
    if (img) {
      img.style.objectPosition = `${x}% ${y}%`;
    }
  }, []);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const newPos = { x: 50, y: 50 };
      localStorage.setItem('tp-cover', result);
      localStorage.setItem('tp-cover-pos', JSON.stringify(newPos));
      setCoverSrc(result);
      setCoverPos(newPos);
      updateObjectPosition(newPos.x, newPos.y);
      onToast('封面已更新');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [onToast, updateObjectPosition]);

  const removeCover = useCallback(() => {
    setCoverSrc('');
    localStorage.removeItem('tp-cover');
    localStorage.removeItem('tp-cover-pos');
    onToast('封面已移除');
  }, [onToast]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.cover-actions') ||
        (e.target as HTMLElement).closest('label') ||
        (e.target as HTMLElement).closest('button')) return;
    if (!hasImage) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, startPosX: coverPos.x, startPosY: coverPos.y };
    setIsDragging(true);
    e.preventDefault();
  }, [hasImage, coverPos]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !coverRef.current) return;
    const rect = coverRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(100, dragRef.current.startPosX + (e.clientX - dragRef.current.startX) / rect.width * 100));
    const newY = Math.max(0, Math.min(100, dragRef.current.startPosY + (e.clientY - dragRef.current.startY) / rect.height * 100));
    setCoverPos({ x: newX, y: newY });
    updateObjectPosition(newX, newY);
  }, [isDragging, updateObjectPosition]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem('tp-cover-pos', JSON.stringify(coverPos));
    }
  }, [isDragging, coverPos]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.cover-actions') ||
        (e.target as HTMLElement).closest('label') ||
        (e.target as HTMLElement).closest('button')) return;
    if (!hasImage) return;
    const t = e.touches[0];
    dragRef.current = { startX: t.clientX, startY: t.clientY, startPosX: coverPos.x, startPosY: coverPos.y };
    setIsDragging(true);
    e.preventDefault();
  }, [hasImage, coverPos]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !coverRef.current) return;
    e.preventDefault();
    const t = e.touches[0];
    const rect = coverRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(100, dragRef.current.startPosX + (t.clientX - dragRef.current.startX) / rect.width * 100));
    const newY = Math.max(0, Math.min(100, dragRef.current.startPosY + (t.clientY - dragRef.current.startY) / rect.height * 100));
    setCoverPos({ x: newX, y: newY });
    updateObjectPosition(newX, newY);
  }, [isDragging, updateObjectPosition]);

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem('tp-cover-pos', JSON.stringify(coverPos));
    }
  }, [isDragging, coverPos]);

  return (
    <div className={`cover-wrapper ${visible ? '' : 'hidden'}`}>
      <div
        ref={coverRef}
        className={`cover ${hasImage ? 'has-image' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {hasImage && (
          <img
            src={coverSrc}
            alt=""
            draggable={false}
            style={{ objectPosition: `${coverPos.x}% ${coverPos.y}%` }}
          />
        )}
        <div className="cover-overlay" />
        <div className="cover-hint">拖动图片调整显示区域</div>
        <div className="cover-actions">
          <label className="cover-btn" style={{ cursor: 'pointer' }}>
            更换图片
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleUpload}
            />
          </label>
          {hasImage && (
            <button className="cover-btn danger" onClick={removeCover}>
              移除封面
            </button>
          )}
        </div>
      </div>
      {!hasImage && (
        <div className="cover-empty">
          <label className="cover-add" style={{ cursor: 'pointer' }}>
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            添加封面图片
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleUpload}
            />
          </label>
        </div>
      )}
    </div>
  );
}
