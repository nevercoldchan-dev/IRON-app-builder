import { X } from 'lucide-react';
import { VersionRecord } from '../types';

interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: 'install' | 'deploy', version: string) => void;
}

export const versionRecords: VersionRecord[] = [
  { name: '导览基础版', version: 'V1.0.0', desc: '初始导览模板，包含基础接待、路线说明和常见问题回复。' },
  { name: '展厅增强版', version: 'V1.1.0', desc: '补充展厅入口、讲解点和常见产品问答，适用于日常接待。' },
  { name: '地图联动版', version: 'V1.2.0', desc: '加入地图模块联动，支持 @地图 自动切换和内容填充。' },
  { name: '技能配置版', version: 'V1.3.0', desc: '增加技能模块编辑能力，包含描述、MCP 与 API 三个部分。' },
  { name: '智能体集群版', version: 'V1.4.0', desc: '支持导览后自动分派任务，输出智能体集群状态与任务分工。' },
  { name: '历史记录版', version: 'V1.5.0', desc: '增加对话历史浏览与恢复能力，便于回溯和继续编辑。' },
  { name: '发布优化版', version: 'V2.0.0', desc: '优化页面字号、布局和发布入口，适合当前版本展示。' }
];

export default function VersionModal({ isOpen, onClose, onAction }: VersionModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/15 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl max-h-[82vh] overflow-y-auto bg-white border border-[#e6e6eb] rounded-3xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-5 pb-3 border-b border-[#e6e6eb]">
          <h2 className="text-lg font-bold text-[#1d1d1f]">历史版本</h2>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#f5f5f7] hover:bg-[#ececf2] text-[#333] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {versionRecords.map((record) => (
            <div 
              key={record.version}
              className="group border border-[#e6e6eb] hover:border-blue-300 rounded-2xl bg-white hover:bg-slate-50/50 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs transition-all"
            >
              <div className="min-w-0 flex flex-col gap-1.5">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-sm md:text-base font-bold text-[#1d1d1f]">{record.name}</h3>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{record.version}</span>
                </div>
                <p className="text-xs md:text-sm text-[#4d4d55] max-w-2xl leading-relaxed">{record.desc}</p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 md:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-200">
                <button 
                  onClick={() => onAction('install', record.version)}
                  className="h-8.5 px-4 bg-[#2979ff] hover:bg-[#226ce0] text-white text-xs font-semibold rounded-full shadow-md shadow-[#2979ff]/20 cursor-pointer transition-colors"
                >
                  安装
                </button>
                <button 
                  onClick={() => onAction('deploy', record.version)}
                  className="h-8.5 px-4 bg-white hover:bg-[#f5f5f7] border border-[#e6e6eb] text-slate-700 text-xs font-semibold rounded-full cursor-pointer transition-colors"
                >
                  部署
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
