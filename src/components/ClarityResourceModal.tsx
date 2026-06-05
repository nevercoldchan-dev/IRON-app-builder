import React, { useState } from 'react';
import { 
  Search, 
  X, 
  Check, 
  Building2, 
  Factory, 
  Building, 
  TreePine, 
  Waypoints, 
  BookOpen, 
  FileText, 
  AlertTriangle, 
  Terminal, 
  Sparkles, 
  Accessibility, 
  Compass, 
  Activity, 
  Brain, 
  Music, 
  Map, 
  Cpu, 
  Volume2, 
  Tv, 
  ShieldAlert 
} from 'lucide-react';

interface ClarityResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: { id: string; title: string; desc: string; recommend: boolean; icon: string }[];
  selectedIds: string | string[]; // string for map (single select), string[] for multi-select
  onToggle: (id: string) => void;
  isSingleSelect?: boolean;
}

// 统一将复杂的 Emoji 映射为优雅的简单线性线性图标，满足极简设计
const IconMap: Record<string, any> = {
  '🏛️': Building2,
  '🏢': Factory,
  '🏪': Building,
  '🏞️': TreePine,
  '📡': Waypoints,
  '📚': BookOpen,
  '🖼️': FileText,
  '⚠️': AlertTriangle,
  '⚙️': Terminal,
  '🌟': Sparkles,
  '👋': Accessibility,
  '🧭': Compass,
  '🙇': Activity,
  '🙆': Check,
  '🤔': Brain,
  '💃': Music,
  '🗺️': Map,
  '🔌': Cpu,
  '🗣️': Volume2,
  '🖥️': Tv,
  '🛡️': ShieldAlert
};

export default function ClarityResourceModal({
  isOpen,
  onClose,
  title,
  options,
  selectedIds,
  onToggle,
  isSingleSelect = false
}: ClarityResourceModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // 根据搜索关键字过滤选项
  const filteredOptions = options.filter(opt => 
    opt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    opt.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 辅助函数：判断是否选中
  const isChecked = (id: string) => {
    if (isSingleSelect) {
      return selectedIds === id;
    } else {
      return Array.isArray(selectedIds) && selectedIds.includes(id);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white border border-[#e6e6eb] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部标题与关闭按钮 */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-bold text-slate-800 font-sans tracking-tight">
              {title}
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              共支持检索 {options.length} 个内置核心资源
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer border-0"
            title="关闭窗口"
          >
            <X size={15} />
          </button>
        </div>

        {/* 搜索过滤控制区 */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <Search size={14} />
            </div>
            <input 
              type="text" 
              placeholder="请输入检索关键词或功能描述进行快速定位..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8.5 pl-9 pr-8 bg-white border border-slate-200 rounded-xl text-xs font-sans placeholder-slate-400 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/25 transition-all text-left"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-2 px-1 flex items-center text-slate-450 hover:text-slate-700 cursor-pointer border-0 bg-transparent text-[11px]"
              >
                清除
              </button>
            )}
          </div>
        </div>

        {/* 选项滚动列表视图 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          {filteredOptions.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Search className="w-8 h-8 text-slate-300 stroke-[1.5]" />
              <span className="text-xs font-medium">未搜索到相关资源点</span>
              <span className="text-[10px] text-slate-400">请尝试更换包含模块名或功能的关键词</span>
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const selected = isChecked(opt.id);
              const IconComponent = IconMap[opt.icon] || Sparkles;

              return (
                <div
                  key={opt.id}
                  onClick={() => onToggle(opt.id)}
                  className={`border rounded-2xl p-4 cursor-pointer transition-all flex items-start gap-3.5 select-none text-left hover:bg-slate-50/50 ${
                    selected 
                      ? 'border-slate-800 bg-slate-50/70 ring-1 ring-slate-800/15' 
                      : 'border-slate-200/90 bg-white'
                  }`}
                >
                  {/* 可拓展的简单线性线性图标组件 */}
                  <div className={`p-2 rounded-xl shrink-0 self-start ${
                    selected ? 'bg-slate-800 text-white' : 'bg-slate-50 border border-slate-100 text-slate-500'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>

                  {/* 文本说明 */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-sans leading-none">
                      <span>{opt.title}</span>
                      {opt.recommend && (
                        <span className="bg-blue-50 border border-blue-200/50 text-blue-650 px-1.5 py-[1.5px] rounded text-[8px] font-bold font-sans">
                          推荐标签
                        </span>
                      )}
                    </h4>
                    <p className="text-[10.5px] text-slate-550 mt-1 lines-2 leading-relaxed">
                      {opt.desc}
                    </p>
                  </div>

                  {/* 选择图标，单选用圆圈，多选用方框 */}
                  {isSingleSelect ? (
                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 self-center transition-all ${
                      selected ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
                    }`}>
                      {selected && <div className="w-1.5 h-1.5 rounded-full bg-white animate-scale-up" />}
                    </div>
                  ) : (
                    <div className={`w-4.5 h-4.5 rounded-lg border flex items-center justify-center shrink-0 self-center transition-all ${
                      selected ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-white'
                    }`}>
                      {selected && <Check className="w-3 h-3 stroke-[3px]" />}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 底部确认行动栏 */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-slate-450 font-bold font-mono">
            ID SELECT: {isSingleSelect ? (selectedIds ? '1 TYPE' : '0 TYPE') : `${(selectedIds as string[]).length} TYPES`}
          </span>
          <button
            onClick={onClose}
            className="h-8.5 px-4.5 bg-[#1d1d1f] hover:bg-black text-white text-xs font-bold rounded-xl border-0 cursor-pointer transition-all shrink-0 font-sans shadow-2xs"
          >
            确认并应用配置
          </button>
        </div>
      </div>
    </div>
  );
}
