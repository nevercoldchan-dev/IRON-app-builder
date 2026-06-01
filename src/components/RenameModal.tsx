import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
  appDescription: string;
  onSave: (newName: string, newDescription: string) => void;
}

export default function RenameModal({
  isOpen,
  onClose,
  appName,
  appDescription,
  onSave,
}: RenameModalProps) {
  const [name, setName] = useState(appName);
  const [description, setDescription] = useState(appDescription);

  // 当打开时同步一下外部的值
  useEffect(() => {
    if (isOpen) {
      setName(appName);
      setDescription(appDescription);
    }
  }, [isOpen, appName, appDescription]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(name.trim(), description.trim());
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/15 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[500px] bg-white border border-[#e6e6eb] rounded-3xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2 className="text-xl font-bold text-slate-900 select-none">Rename app</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="关闭"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4.5 mb-6">
          {/* Name 输入框 */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-800">Name</label>
            <input 
              type="text" 
              maxLength={40}
              className="w-full border border-slate-200 hover:border-slate-300 focus:border-slate-400 rounded-2xl bg-white text-slate-900 text-[13px] h-11 px-4 outline-none transition-all" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入应用名称"
            />
          </div>

          {/* Description 输入框 */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-800">Description</label>
            <textarea 
              className="w-full border border-slate-200 hover:border-slate-300 focus:border-slate-400 rounded-2xl bg-white text-slate-900 text-[13px] p-4 h-28 resize-none leading-relaxed outline-none transition-all" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入应用描述信息"
            />
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-3.5 pt-1">
          <button 
            onClick={onClose}
            className="h-10 px-5 bg-transparent hover:bg-slate-50 text-slate-700 text-[13px] font-semibold rounded-full cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!name.trim()}
            className="h-10 px-6 bg-[#e6e6eb] hover:bg-slate-200 text-slate-800 text-[13px] font-semibold rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
