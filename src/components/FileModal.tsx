import { useState } from 'react';
import { 
  Clock, 
  FolderOpen, 
  CreditCard, 
  FileText, 
  Home, 
  Cloud, 
  HardDrive, 
  ChevronLeft, 
  ChevronRight, 
  Layout, 
  Grid, 
  Search, 
  Folder, 
  Image as ImageIcon, 
  Maximize2 
} from 'lucide-react';

interface FileModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'script' | 'skill';
  onFileSelect: (fileName: string) => void;
}

export default function FileModal({ isOpen, onClose, type, onFileSelect }: FileModalProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [sidebarActive, setSidebarActive] = useState<string>('desktop');

  if (!isOpen) return null;

  const files = [
    { name: '20260513-183159.jpg', type: 'image', dim: true },
    { name: '应用 AI 生成文件夹', type: 'folder', dim: false },
    { name: 'app-generator-site', type: 'folder', dim: false },
    { name: 'awesome-design-md', type: 'folder', dim: false },
    { name: 'ChatGPT Im...5_07_52.png', type: 'image', dim: true },
    { name: 'design', type: 'folder', dim: false },
    { name: 'important', type: 'folder', dim: false },
    { name: 'product-tren...searcher.md', type: 'md', dim: true },
    { name: 'QQoder', type: 'folder', dim: false },
    { name: 'screenshot-...-162851.png', type: 'image', dim: true },
    { name: 'SDK', type: 'folder', dim: false },
  ];

  const handleFileClick = (file: typeof files[0]) => {
    if (file.dim) return; // 模拟系统不可选不可用的灰色文件
    setSelectedFile(file.name);
  };

  const handleOpen = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-xs flex items-start justify-center z-50 p-6 md:pt-14 transition-all"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-6xl h-[640px] max-h-[85vh] bg-white border border-[#cfcfd4] rounded-3xl shadow-2xl flex overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* macOS Finder Sidebar */}
        <aside className="w-60 shrink-0 border-right border-[#e5e5ea] bg-slate-50/50 p-4.5 flex flex-col gap-2 overflow-y-auto">
          <button 
            onClick={() => setSidebarActive('recent')}
            className={`h-10 border-0 rounded-xl flex items-center gap-3 px-3.5 text-[14px] font-semibold transition-colors text-left cursor-pointer ${
              sidebarActive === 'recent' ? 'bg-[#f1f2f4] text-blue-600' : 'bg-transparent text-[#1d1d1f] hover:bg-slate-100/60'
            }`}
          >
            <Clock size={16} className="text-slate-500" />
            <span>最近使用</span>
          </button>
          
          <button 
            onClick={() => setSidebarActive('shared')}
            className={`h-10 border-0 rounded-xl flex items-center gap-3 px-3.5 text-[14px] font-semibold transition-colors text-left cursor-pointer ${
              sidebarActive === 'shared' ? 'bg-[#f1f2f4] text-blue-600' : 'bg-transparent text-[#1d1d1f] hover:bg-slate-100/60'
            }`}
          >
            <FolderOpen size={16} className="text-slate-500" />
            <span>共享</span>
          </button>

          <div className="mx-3.5 mt-3 mb-1 text-[11px] font-bold text-[#8a8a92] tracking-wider uppercase">个人收藏</div>
          
          <button 
            onClick={() => setSidebarActive('apps')}
            className={`h-10 border-0 rounded-xl flex items-center gap-3 px-3.5 text-[14px] font-semibold transition-colors text-left cursor-pointer ${
              sidebarActive === 'apps' ? 'bg-[#f1f2f4] text-blue-600' : 'bg-transparent text-[#1d1d1f] hover:bg-slate-100/60'
            }`}
          >
            <Layout size={16} className="text-slate-500" />
            <span>应用程序</span>
          </button>

          <button 
            onClick={() => setSidebarActive('desktop')}
            className={`h-10 border-0 rounded-xl flex items-center gap-3 px-3.5 text-[14px] font-semibold transition-colors text-left cursor-pointer ${
              sidebarActive === 'desktop' ? 'bg-[#e5e5ea] text-blue-700' : 'bg-transparent text-[#1d1d1f] hover:bg-slate-100/60'
            }`}
          >
            <CreditCard size={16} className="text-slate-500" />
            <span>桌面</span>
          </button>

          <button 
            onClick={() => setSidebarActive('docs')}
            className={`h-10 border-0 rounded-xl flex items-center gap-3 px-3.5 text-[14px] font-semibold transition-colors text-left cursor-pointer ${
              sidebarActive === 'docs' ? 'bg-[#f1f2f4] text-blue-600' : 'bg-transparent text-[#1d1d1f] hover:bg-slate-100/60'
            }`}
          >
            <FileText size={16} className="text-slate-500" />
            <span>文稿</span>
          </button>

          <button 
            onClick={() => setSidebarActive('summer')}
            className={`h-10 border-0 rounded-xl flex items-center gap-3 px-3.5 text-[14px] font-semibold transition-colors text-left cursor-pointer ${
              sidebarActive === 'summer' ? 'bg-[#f1f2f4] text-blue-600' : 'bg-transparent text-[#1d1d1f] hover:bg-slate-100/60'
            }`}
          >
            <Home size={16} className="text-slate-500" />
            <span>summer</span>
          </button>

          <div className="mx-3.5 mt-3 mb-1 text-[11px] font-bold text-[#8a8a92] tracking-wider uppercase">位置</div>

          <button 
            onClick={() => setSidebarActive('icloud')}
            className={`h-10 border-0 rounded-xl flex items-center gap-3 px-3.5 text-[14px] font-semibold transition-colors text-left cursor-pointer ${
              sidebarActive === 'icloud' ? 'bg-[#f1f2f4] text-blue-600' : 'bg-transparent text-[#1d1d1f] hover:bg-slate-100/60'
            }`}
          >
            <Cloud size={16} className="text-slate-500" />
            <span>iCloud 云盘</span>
          </button>

          <button 
            onClick={() => setSidebarActive('mac')}
            className={`h-10 border-0 rounded-xl flex items-center gap-3 px-3.5 text-[14px] font-semibold transition-colors text-left cursor-pointer ${
              sidebarActive === 'mac' ? 'bg-[#f1f2f4] text-blue-600' : 'bg-transparent text-[#1d1d1f] hover:bg-slate-100/60'
            }`}
          >
            <HardDrive size={16} className="text-slate-500" />
            <span>Macintosh HD</span>
          </button>
        </aside>

        {/* macOS Finder Web Shell */}
        <section className="flex-1 min-w-0 flex flex-col bg-white">
          {/* Toolbar */}
          <div className="h-20 border-b border-[#e5e5ea] px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="h-10 bg-[#f5f5f7] border border-[#ececf1] rounded-xl flex items-center gap-2.5 px-3">
                <ChevronLeft size={16} className="text-slate-400" />
                <ChevronRight size={16} className="text-slate-400" />
              </div>
              <div className="h-10 bg-[#f5f5f7] border border-[#ececf1] rounded-xl flex items-center gap-2 px-3">
                <Maximize2 size={15} className="text-slate-500" />
                <ChevronRight size={12} className="text-slate-400 rotate-90" />
              </div>
              <div className="h-10 bg-[#f5f5f7] border border-[#ececf1] rounded-xl flex items-center gap-2 px-3">
                <Grid size={15} className="text-slate-500" />
                <ChevronRight size={12} className="text-slate-400 rotate-90" />
              </div>
              <div className="h-10 bg-[#f5f5f7] border border-[#ececf1] rounded-xl flex items-center gap-2 px-3.5 font-semibold text-sm">
                <FolderOpen size={16} className="text-sky-400" />
                <span>{type === 'skill' ? '技能文件' : '剧本文件'}</span>
                <ChevronRight size={12} className="text-slate-400 rotate-90" />
              </div>
            </div>

            {/* Finder Search */}
            <div className="w-56 h-10 border border-[#ececf1] rounded-xl flex items-center gap-2.5 px-3.5 bg-[#fefefe]">
              <Search size={15} className="text-[#8a8a92]" />
              <span className="text-xs text-[#8a8a92] font-medium selection:bg-blue-100">搜索</span>
            </div>
          </div>

          {/* Files List Layout */}
          <div className="flex-1 min-height-0 flex">
            <div className="w-96 shrink-0 border-r border-[#e5e5ea] px-3.5 py-3 overflow-y-auto flex flex-col gap-0.5">
              {files.map((file) => {
                const isSelected = selectedFile === file.name;
                return (
                  <button 
                    key={file.name}
                    type="button"
                    onClick={() => handleFileClick(file)}
                    className={`h-9.5 border-0 rounded-lg flex items-center gap-3 px-3 text-left text-sm font-medium transition-colors cursor-pointer w-full ${
                      file.dim 
                        ? 'text-slate-300 pointer-events-none' 
                        : isSelected 
                          ? 'bg-blue-500 text-white font-semibold' 
                          : 'text-[#1d1d1f] hover:bg-slate-100/60'
                    }`}
                  >
                    {file.type === 'folder' ? (
                      <Folder size={15} className={isSelected ? 'text-white' : 'text-sky-400'} />
                    ) : file.type === 'image' ? (
                      <ImageIcon size={15} className={isSelected ? 'text-white' : 'text-purple-400'} />
                    ) : (
                      <FileText size={15} className={isSelected ? 'text-white' : 'text-amber-500'} />
                    )}
                    <span className="truncate">{file.name}</span>
                    {file.type === 'folder' && (
                      <span className={`ml-auto text-xs ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                        ›
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Preview space */}
            <div className="flex-1 bg-slate-50/20 p-6 flex flex-col items-center justify-center text-center">
              {selectedFile ? (
                <div className="max-w-xs flex flex-col items-center gap-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 shadow-sm border border-sky-200">
                    <FolderOpen size={30} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1d1d1f] truncate max-w-[200px]">{selectedFile}</h4>
                    <p className="text-xs text-slate-400 mt-1">文件夹 / 12 个项目</p>
                  </div>
                </div>
              ) : (
                <div className="text-[#8e8e93] text-sm">选择一个项目进行预览</div>
              )}
            </div>
          </div>

          {/* Finder Footer */}
          <div className="h-20 border-t border-[#e5e5ea] px-6 flex items-center justify-between bg-slate-50/10">
            <button className="h-10 bg-[#f5f5f7] border border-[#ececf1] rounded-xl px-4.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
              显示选项
            </button>
            <div className="flex items-center gap-3">
              <button 
                onClick={onClose}
                className="h-10 bg-[#f1f2f4] hover:bg-slate-200/80 text-slate-700 px-6 text-sm font-semibold rounded-xl cursor-pointer transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleOpen}
                disabled={!selectedFile}
                className={`h-10 px-6 text-sm font-semibold rounded-xl transition-all ${
                  selectedFile 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:shadow-md' 
                    : 'bg-[#ececef] text-[#b8bcc4] cursor-not-allowed'
                }`}
              >
                打开
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
