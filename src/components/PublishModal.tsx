import { X } from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
  description: string;
  version: string;
  onPublish: () => void;
}

export default function PublishModal({ 
  isOpen, 
  onClose, 
  appName, 
  description, 
  version, 
  onPublish 
}: PublishModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/15 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white border border-[#e6e6eb] rounded-3xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-5 pb-3 border-b border-[#e6e6eb]">
          <h2 className="text-lg font-bold text-[#1d1d1f]">发布应用</h2>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#f5f5f7] hover:bg-[#ececf2] text-[#333] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider">应用名</label>
            <input 
              type="text" 
              className="w-full border border-[#e2e2e7] rounded-xl bg-slate-50 text-[#1d1d1f] text-sm h-12 px-4 outline-none read-only:cursor-not-allowed" 
              value={appName}
              readOnly 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider">描述</label>
            <textarea 
              className="w-full border border-[#e2e2e7] rounded-xl bg-slate-50 text-[#1d1d1f] text-sm p-4 h-24 resize-none leading-relaxed outline-none read-only:cursor-not-allowed" 
              value={description}
              readOnly 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider">版本号</label>
            <input 
              type="text" 
              className="w-full border border-[#e2e2e7] rounded-xl bg-slate-50 text-[#1d1d1f] text-sm h-12 px-4 outline-none read-only:cursor-not-allowed" 
              value={version}
              readOnly 
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#e6e6eb] pt-4">
          <button 
            onClick={onClose}
            className="h-9.5 px-5 bg-[#f3f4f7] hover:bg-[#e9ebef] text-slate-700 text-sm font-semibold rounded-full cursor-pointer transition-colors"
          >
            取消
          </button>
          <button 
            onClick={onPublish}
            className="h-9.5 px-5 bg-[#2979ff] hover:bg-[#226ce0] text-white text-sm font-semibold rounded-full shadow-md shadow-[#2979ff]/20 cursor-pointer transition-colors"
          >
            发布
          </button>
        </div>
      </div>
    </div>
  );
}
