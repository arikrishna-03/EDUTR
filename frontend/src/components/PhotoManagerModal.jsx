import React, { useState, useRef, useEffect } from 'react';
import { Camera, Sun, Trash2, RotateCcw, X, Upload, Check, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const DEFAULT_AVATAR_PRESETS = [
  { id: 'sarah', name: 'Dr. Sarah', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4' },
  { id: 'dumbledore', name: 'Albus', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dumbledore&backgroundColor=c0aede' },
  { id: 'alexander', name: 'Alexander', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexander&backgroundColor=d1d4f9' },
  { id: 'sophia', name: 'Sophia', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia&backgroundColor=ffd5dc' },
  { id: 'felix', name: 'Felix', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=ffdfbf' },
  { id: 'minerva', name: 'Minerva', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Minerva&backgroundColor=d1d4f9' },
  { id: 'oliver', name: 'Oliver', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&backgroundColor=c0aede' },
  { id: 'emma', name: 'Emma', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=b6e3f4' },
  { id: 'james', name: 'James', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=ffd5dc' },
  { id: 'maya', name: 'Maya', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya&backgroundColor=ffdfbf' },
];

const PhotoManagerModal = ({ isOpen, onClose, currentAvatar, defaultAvatar, onSave }) => {
  const [previewAvatar, setPreviewAvatar] = useState(currentAvatar || defaultAvatar);
  const [brightness, setBrightness] = useState(100);
  const [zoom, setZoom] = useState(100);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const isCustomImage = previewAvatar.startsWith('data:image');

  useEffect(() => {
    if (isOpen) {
      setPreviewAvatar(currentAvatar || defaultAvatar);
      setBrightness(100);
      setZoom(100);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
      setError('');
    }
  }, [isOpen, currentAvatar, defaultAvatar]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const maxBytes = 40 * 1024; // 40 KB limit
    if (file.size > maxBytes) {
      const fileSizeKb = (file.size / 1024).toFixed(1);
      setError(`Photo size must be under 40 KB. Selected photo is ${fileSizeKb} KB.`);
      e.target.value = '';
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewAvatar(event.target.result);
      setBrightness(100);
      setZoom(100);
      setPosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handlePrevAvatar = () => {
    setError('');
    const currentIdx = DEFAULT_AVATAR_PRESETS.findIndex((p) => p.url === previewAvatar);
    const prevIdx = currentIdx <= 0 ? DEFAULT_AVATAR_PRESETS.length - 1 : currentIdx - 1;
    setPreviewAvatar(DEFAULT_AVATAR_PRESETS[prevIdx].url);
    setBrightness(100);
    setZoom(100);
    setPosition({ x: 0, y: 0 });
  };

  const handleNextAvatar = () => {
    setError('');
    const currentIdx = DEFAULT_AVATAR_PRESETS.findIndex((p) => p.url === previewAvatar);
    const nextIdx = (currentIdx + 1) % DEFAULT_AVATAR_PRESETS.length;
    setPreviewAvatar(DEFAULT_AVATAR_PRESETS[nextIdx].url);
    setBrightness(100);
    setZoom(100);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse / Touch Drag handlers for Hand Cursor Positioning
  const handleMouseDown = (e) => {
    if (!isCustomImage) return;
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !isCustomImage) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheelZoom = (e) => {
    if (!isCustomImage) return;
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 8 : -8;
    setZoom((prev) => Math.min(Math.max(80, prev + zoomDelta), 250));
  };

  const handleResetPosition = () => {
    setPosition({ x: 0, y: 0 });
    setZoom(100);
    setBrightness(100);
  };

  const handleRemovePhoto = () => {
    setError('');
    setPreviewAvatar(defaultAvatar);
    setBrightness(100);
    setZoom(100);
    setPosition({ x: 0, y: 0 });
  };

  const handleSave = () => {
    // Bake hand drag position, zoom, and brightness into canvas for custom uploaded image
    if (isCustomImage) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const targetSize = 300;
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        ctx.filter = `brightness(${brightness}%)`;

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, targetSize, targetSize);

        // Center origin for scaling and positioning
        ctx.translate(targetSize / 2 + position.x, targetSize / 2 + position.y);
        ctx.scale(zoom / 100, zoom / 100);

        // Calculate aspect contain scale so full uploaded photo fits cleanly
        const baseScale = Math.min(targetSize / img.width, targetSize / img.height);
        const dw = img.width * baseScale;
        const dh = img.height * baseScale;

        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);

        const fittedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onSave(fittedDataUrl);
        onClose();
      };
      img.onerror = () => {
        onSave(previewAvatar);
        onClose();
      };
      img.src = previewAvatar;
    } else {
      onSave(previewAvatar);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="bg-[#1a1c23] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Camera size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Adjust Profile Photo</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-xs font-medium text-center animate-in fade-in">
            ⚠️ {error}
          </div>
        )}

        {/* Main Content: Live Preview Frame with Left / Right Navigation Arrows */}
        <div className="my-6 flex flex-col items-center justify-center">
          <div className="flex items-center gap-3 w-full justify-center">
            {/* Left Arrow Button */}
            <button
              type="button"
              onClick={handlePrevAvatar}
              title="Previous Avatar"
              className="p-2.5 rounded-full bg-white/5 hover:bg-indigo-600 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer shadow-lg active:scale-95 flex-shrink-0"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Avatar Frame */}
            <div 
              className={`relative group w-44 h-44 rounded-2xl border-4 border-indigo-500/40 overflow-hidden bg-slate-900 shadow-2xl flex items-center justify-center select-none ${
                isCustomImage ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
              onWheel={handleWheelZoom}
            >
              <img
                src={previewAvatar}
                alt="Profile Preview"
                draggable={false}
                className="w-full h-full transition-transform duration-75 pointer-events-none"
                style={{
                  objectFit: isCustomImage ? 'contain' : 'cover',
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom / 100})`,
                  filter: `brightness(${brightness}%)`
                }}
              />
            </div>

            {/* Right Arrow Button */}
            <button
              type="button"
              onClick={handleNextAvatar}
              title="Next Avatar"
              className="p-2.5 rounded-full bg-white/5 hover:bg-indigo-600 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer shadow-lg active:scale-95 flex-shrink-0"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          <div className="mt-3 text-xs text-slate-400 font-medium">
            {isCustomImage
              ? 'Custom Uploaded Photo'
              : `Preset Avatar ${DEFAULT_AVATAR_PRESETS.findIndex((p) => p.url === previewAvatar) + 1} of ${DEFAULT_AVATAR_PRESETS.length}`}
          </div>
        </div>

        {/* Zoom & Reset Position Controls for Custom Image */}
        {isCustomImage && (
          <div className="space-y-3 bg-[#13151b] p-3.5 rounded-xl border border-white/5 mb-4 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <ZoomIn size={14} /> Zoom & Scale ({zoom}%)
              </span>
              {(position.x !== 0 || position.y !== 0 || zoom !== 100) && (
                <button
                  type="button"
                  onClick={handleResetPosition}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <RotateCcw size={12} /> Reset Position
                </button>
              )}
            </div>
            <input
              type="range"
              min="80"
              max="250"
              step="2"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        )}

        {/* Adjustments: Brightness Control */}
        <div className="space-y-3 bg-[#13151b] p-4 rounded-xl border border-white/5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Sun size={16} /> Brightness
            </span>
            <span>{brightness}%</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="50"
              max="150"
              step="1"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            {brightness !== 100 && (
              <button
                type="button"
                onClick={() => setBrightness(100)}
                title="Reset brightness to 100%"
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons: Upload Custom Photo */}
        <div className="mt-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="w-full py-2.5 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Upload size={15} /> Upload Custom Photo (&lt; 40 KB)
          </button>
        </div>

        {/* Modal Footer: Save / Cancel / Remove */}
        <div className="pt-5 mt-4 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={handleRemovePhoto}
            className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            <Trash2 size={14} /> Remove Photo
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3.5 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-xl text-xs transition-colors border border-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={15} /> Save Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoManagerModal;
