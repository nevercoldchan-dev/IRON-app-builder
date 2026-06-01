import { X } from 'lucide-react';

interface ResourceSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mapName: string) => void;
}

export const mapResourceOptions = [
  '小鹏科技园大堂地图',
  '科技馆一层导览地图',
  '科技馆二层导览地图',
  '小鹏总部展厅路线地图',
  '访客接待动线地图'
];

export default function ResourceSelectModal({ isOpen, onClose, onSelect }: ResourceSelectModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/15 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white border border-[#e6e6eb] rounded-3xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold text-[#1d1d1f]">选择地图</h2>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#f5f5f7] hover:bg-[#ececf2] text-[#333] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs font-semibold text-red-500 leading-relaxed mb-4">
          ⚠️ 切换地图后，基于可达点的任务将无法执行
        </p>

        <div className="flex flex-col gap-2.5">
          {mapResourceOptions.map((name) => (
            <button 
              key={name}
              type="button"
              onClick={() => onSelect(name)}
              className="w-full text-left min-h-[46px] border border-[#e6e6eb] hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1d1d1f] hover:shadow-xs transition-all cursor-pointer"
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
