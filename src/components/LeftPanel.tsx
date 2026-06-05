import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowUp, 
  X, 
  Plus, 
  FileText, 
  Zap, 
  Clock,
  Map,
  BookOpen,
  Activity,
  Cpu,
  User,
  ChevronLeft,
  Sliders,
  Bot,
  Paperclip,
  Settings,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatHistoryRecord, ResourceSection } from '../types';

interface LeftPanelProps {
  chatMode: 'chat' | 'history';
  setChatMode: (mode: 'chat' | 'history') => void;
  isCopilotExpanded: boolean;
  onToggleCopilot: () => void;
  onClearMemory: () => void;
  messages: { sender: 'user' | 'system' | 'bot'; text: string; isHtml?: boolean; type?: string }[];
  onSendMessage: (text: string) => void;
  onOpenAttachmentDialog: (type: 'script' | 'skill') => void;
  onSetInputText: (text: string) => void;
  inputText: string;
  setInputText: (text: string) => void;
  onConfirmMapDelete: () => void;
  onCancelMapDelete: () => void;
  selectedHistoryId: string | null;
  setSelectedHistoryId: (id: string | null) => void;
  chatHistoryRecords: ChatHistoryRecord[];
  onRestoreHistory: (id: string) => void;
  isFullWidth?: boolean;
  renderClarificationForm?: () => React.ReactNode;
  resourceSections?: ResourceSection[];
  appName?: string;
  isEditingAppName?: boolean;
  tempAppName?: string;
  setIsEditingAppName?: (val: boolean) => void;
  setTempAppName?: (val: string) => void;
  onRenameAppName?: (newName: string) => void;
  onPublishClick?: () => void;
  onVersionClick?: () => void;
}

// 统一的资源详情与图标展示配置
const RESOURCE_METADATA: Record<string, { desc: string; icon: string; categoryName: string }> = {
  // 人设
  '小鹏汽车展厅解说小姐姐': { desc: '精通智能座舱与高阶智驾，亲和力十分出色的年轻女解说员', icon: '👩‍💼', categoryName: '人设 (Persona)' },
  // 地图
  '小鹏科技园大堂地图': { desc: 'SLAM 激光高精图，精准定位，覆盖大堂、前台及服务区', icon: '🗺️', categoryName: '地图 (SLAM Map)' },
  '智能展厅及智驾体验区地图': { desc: 'SLAM 细节级高精图，包含特殊传感器标定及模拟智驾舱', icon: '🚗', categoryName: '地图 (SLAM Map)' },
  '新能源科技馆全景展示地图': { desc: 'SLAM 复式大空间，覆盖一至三层馆内长走廊与实车区', icon: '🏢', categoryName: '地图 (SLAM Map)' },
  '高新技术大厦接待大厅地图': { desc: 'SLAM 接待环境地图，标识了电梯、安全通道和防跌点', icon: '🏨', categoryName: '地图 (SLAM Map)' },
  // 知识库
  '科技馆展厅介绍知识库': { desc: '包含展厅规划布局、品牌发展历程及主推款新能源科技规范', icon: '📚', categoryName: '知识库 (Knowledge)' },
  '机器人互动区讲解知识库': { desc: '含 HRI 肢体律动、表情对齐规范与多媒体动画触发时序细则', icon: '🤖', categoryName: '知识库 (Knowledge)' },
  '航天探索展区问答知识库': { desc: '低空飞行载具及汇天飞车硬件技术规格汇总，含常设讲解词', icon: '🚀', categoryName: '知识库 (Knowledge)' },
  '馆内安全须知知识库': { desc: '突发跌倒险情紧急判断预案、安全通道分布及防滑区域重点', icon: '⚠️', categoryName: '知识库 (Knowledge)' },
  // 动作
  '挥手欢迎动作': { desc: 'wave_hand | 双臂徐徐向上举起左右挥动，微笑俯身迎接', icon: '👋', categoryName: '动作 (Action)' },
  '指引前方动作': { desc: 'point_front | 单手手掌斜向上指引推荐行径方向，身体微转', icon: '👉', categoryName: '动作 (Action)' },
  '屏幕展示动作': { desc: 'screen_show | 手背一侧轻舒拂指，目光引导访客聚焦中央展板', icon: '📺', categoryName: '动作 (Action)' },
  '讲解手势动作': { desc: 'talk_gesture | 伴随讲解声调双手开合比划，富于情感色彩', icon: '👐', categoryName: '动作 (Action)' },
  '送别致意动作': { desc: 'bow_bowing | 躯体前倾15度，双手交叉摇摆款款行礼作别', icon: '🙇', categoryName: '动作 (Action)' },
  // 技能
  '使用一楼前台打印机': { desc: 'post_print_job | 外设控制，支持打印实体导览纸质单、访客登证', icon: '🖨️', categoryName: '技能' },
  '查询今日活动排期': { desc: 'query_calendar_events | 快速查询展区预约信息、重要VIP接待时段安排', icon: '📅', categoryName: '技能' },
  '控制展区大屏播放': { desc: 'trigger_screen | IoT全景智联，一键命令大屏播放智能演播片', icon: '🖥️', categoryName: '技能' },
  '查询馆内设施位置': { desc: 'query_nearby_facilities | 辅助定位，指示休息大厅、洗手间、育婴室坐标', icon: '📍', categoryName: '技能' }
};

// 全平台的资源，不限于应用资源编配中心的绑定内容，满足全量调起需求
const PLATFORM_ALL_RESOURCES: Record<string, string[]> = {
  map: [
    '小鹏科技园大堂地图',
    '智能展厅及智驾体验区地图',
    '新能源科技馆全景展示地图',
    '高新技术大厦接待大厅地图'
  ],
  knowledge: [
    '科技馆展厅介绍知识库',
    '机器人互动区讲解知识库',
    '航天探索展区问答知识库',
    '馆内安全须知知识库'
  ],
  action: [
    '挥手欢迎动作',
    '指引前方动作',
    '屏幕展示动作',
    '讲解手势动作',
    '送别致意动作'
  ],
  skill: [
    '使用一楼前台打印机',
    '查询今日活动排期',
    '控制展区大屏播放',
    '查询馆内设施位置'
  ],
  persona: [
    '小鹏汽车展厅解说小姐姐'
  ]
};

const getCategoryIcon = (categoryId: string, size = 15, className = "text-slate-400 shrink-0") => {
  switch (categoryId) {
    case 'map':
      return <Map size={size} className={className} />;
    case 'knowledge':
      return <BookOpen size={size} className={className} />;
    case 'action':
      return <Activity size={size} className={className} />;
    case 'skill':
      return <Cpu size={size} className={className} />;
    case 'persona':
      return <User size={size} className={className} />;
    default:
      return <Sliders size={size} className={className} />;
  }
};

const getMetadata = (item: string, categoryId: string) => {
  if (RESOURCE_METADATA[item]) {
    return RESOURCE_METADATA[item];
  }
  let defaultIcon = '✨';
  if (categoryId === 'map') defaultIcon = '🗺️';
  else if (categoryId === 'knowledge') defaultIcon = '📚';
  else if (categoryId === 'action') defaultIcon = '💃';
  else if (categoryId === 'skill') defaultIcon = '⚙️';
  else if (categoryId === 'persona') defaultIcon = '👩‍💼';

  return {
    desc: `系统自定义项 | 一级分类：${categoryId === 'map' ? '地图' : categoryId === 'knowledge' ? '知识库' : categoryId === 'action' ? '动作' : categoryId === 'skill' ? '外设控制' : '人设'}`,
    icon: defaultIcon,
    categoryName: categoryId === 'map' ? '地图 (SLAM Map)' : categoryId === 'knowledge' ? '知识库' : categoryId === 'action' ? '动作' : categoryId === 'skill' ? '接口' : '人设'
  };
};

const getCleanDisplayName = (name: string, categoryId: string | null): string => {
  if (!categoryId) return name;
  if (categoryId === 'action' && name.endsWith('动作')) {
    return name.slice(0, -2);
  }
  if (categoryId === 'knowledge' && name.endsWith('知识库')) {
    return name.slice(0, -3);
  }
  if (categoryId === 'map' && name.endsWith('地图')) {
    return name.slice(0, -2);
  }
  return name;
};

export default function LeftPanel({
  chatMode,
  setChatMode,
  isCopilotExpanded,
  onToggleCopilot,
  onClearMemory,
  messages,
  onSendMessage,
  onOpenAttachmentDialog,
  inputText,
  setInputText,
  onConfirmMapDelete,
  onCancelMapDelete,
  selectedHistoryId,
  setSelectedHistoryId,
  chatHistoryRecords,
  onRestoreHistory,
  isFullWidth = false,
  renderClarificationForm,
  resourceSections = [],
  appName,
  isEditingAppName,
  tempAppName,
  setIsEditingAppName,
  setTempAppName,
  onRenameAppName,
  onPublishClick,
  onVersionClick
}: LeftPanelProps) {
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [activePlusCategory, setActivePlusCategory] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 快捷资源弹窗状态
  const [activeCategory, setActiveCategory] = useState<string>('map');
  const [autocompleteLevel, setAutocompleteLevel] = useState<1 | 2>(1);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [manualClose, setManualClose] = useState(false);
  const [lastSlashPos, setLastSlashPos] = useState(-1);
  const [selectedResources, setSelectedResources] = useState<{ name: string; categoryId: string }[]>([]);

  // 1:1 资源分类元数据（不使用 Emoji，使用符合截图 1 风格的描述）
  const autocompleteCategories = [
    { id: 'map', title: '地图资源', desc: '关联的实景 SLAM 空间高精拓扑底图' },
    { id: 'knowledge', title: '知识库组', desc: '包含展厅规划布局、品牌发展历程等多套知识库内容' },
    { id: 'action', title: '动作姿态', desc: '机器人的动作序列姿态、速度控制与肢体展示动作' },
    { id: 'skill', title: '外设控制', desc: '对接打印机、展区大屏播放及今日活动排期等外设接口' },
    { id: 'persona', title: '人设定义', desc: '设定智能机器人的讲解语音调性、人设及亲和力模板' }
  ];

  // 动态分析输入框中的 '/' 触发词
  useEffect(() => {
    const lastSlashIndex = inputText.lastIndexOf('/');
    if (lastSlashIndex === -1) {
      setShowAutocomplete(false);
      setSearchQuery('');
      setManualClose(false);
      setLastSlashPos(-1);
    } else {
      if (lastSlashIndex !== lastSlashPos) {
        setManualClose(false); // 键入全新的 / 时重置手动关闭标记
        setLastSlashPos(lastSlashIndex);
        setAutocompleteLevel(1); // 键入全新的 / 时强制回到一级浮窗
      }
      const textAfterSlash = inputText.substring(lastSlashIndex + 1);
      // 如果斜杠后有空格或换行，自动隐藏浮窗
      if (/[\s\n]/.test(textAfterSlash) || manualClose) {
        setShowAutocomplete(false);
        setSearchQuery('');
      } else {
        setShowAutocomplete(true);
        setSearchQuery(textAfterSlash);
      }
    }
  }, [inputText, manualClose, lastSlashPos]);

  // 点击外部关闭浮窗
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setManualClose(true);
      }
    }
    if (showAutocomplete) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAutocomplete]);

  // 选择资源并将其作为高亮实体注入至对话前缀中（不限于应用资源，同时保持弹窗后退一致性）
  const handleSelectResourceItem = (itemText: string, categoryId: string) => {
    setSelectedResources(prev => {
      if (prev.some(r => r.name === itemText && r.categoryId === categoryId)) return prev;
      return [...prev, { name: itemText, categoryId }];
    });
    const lastSlashIdx = inputText.lastIndexOf('/');
    if (lastSlashIdx !== -1) {
      const prefix = inputText.substring(0, lastSlashIdx);
      setInputText(prefix);
    }
    setManualClose(true); // 关闭并锁定弹窗
    setShowAutocomplete(false);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  // 模糊匹配搜索全平台的资源列表（全平台调起）
  const filteredMatches: Array<{ categoryId: string; item: string }> = [];
  if (searchQuery) {
    const normQuery = searchQuery.toLowerCase();
    Object.entries(PLATFORM_ALL_RESOURCES).forEach(([catId, items]) => {
      items.forEach(item => {
        const meta = getMetadata(item, catId);
        if (item.toLowerCase().includes(normQuery) || meta.desc.toLowerCase().includes(normQuery)) {
          filteredMatches.push({ categoryId: catId, item });
        }
      });
    });
  }

  // 1:1 精确对应的文本模版
  const guidePrompt = '你是小鹏汽车展厅解说小姐姐，你的任务是带访客参观展厅，介绍小鹏发展史，响应用户的问题';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatMode]);

  const handleTemplateClick = (type: string) => {
    if (type === 'guide') {
      setInputText(guidePrompt);
    }
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text && selectedResources.length === 0) return;
    
    let finalMsg = text;
    if (selectedResources.length > 0) {
      const tagsStr = selectedResources.map(r => `[${r.name}]`).join(' ');
      finalMsg = `${tagsStr} ${text}`;
    }
    
    onSendMessage(finalMsg);
    setInputText('');
    setSelectedResources([]); // 发送后自动重置绑定的资源，保证交互流畅
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape' && showAutocomplete) {
      e.preventDefault();
      setManualClose(true);
      return;
    }
    // Delete/Backspace tags when input text is empty
    if ((e.key === 'Backspace' || e.key === 'Delete') && !inputText && selectedResources.length > 0) {
      setSelectedResources(prev => prev.slice(0, -1));
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 1:1 检测是否命中了特定的Token
  const showTokenPreview = ['迎宾流程', '休息区指引', '公司介绍'].includes(inputText.trim());

  return (
    <aside className={`${isFullWidth ? 'w-full max-w-2xl border-none' : 'w-[450px] border-r border-[#e6e6eb]'} shrink-0 flex flex-col bg-white h-full relative z-10 transition-all duration-325 select-none`}>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            setSelectedResources(prev => {
              if (prev.some(r => r.name === files[0].name && r.categoryId === 'file')) return prev;
              return [...prev, { name: files[0].name, categoryId: 'file' }];
            });
            // 清除之前的 '/' 字符
            const lastSlashIdx = inputText.lastIndexOf('/');
            if (lastSlashIdx !== -1) {
              setInputText(inputText.substring(0, lastSlashIdx));
            }
          }
        }} 
      />
      {/* 滚动交互区域 */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4.5 py-5 flex flex-col gap-4">
        {chatMode === 'chat' ? (
          <>
            {/* 对话气泡列表 */}
            <div className="flex flex-col gap-3.5">
              {messages.map((msg, idx) => {
                // 系统清空指示器
                if (msg.sender === 'system' && msg.type === 'clear') {
                  return (
                    <div key={idx} className="py-2 text-[13px] font-semibold text-[#9a9aa2] text-center select-none">
                      {msg.text}
                    </div>
                  );
                }

                // 系统警告（确认删除地图等）
                if (msg.sender === 'system' && msg.type === 'warning-map') {
                  return (
                    <div key={idx} className="border-0 rounded-2.5xl bg-white p-4.5 shadow-[0_1px_2px_rgba(0,0,0,0.02),_0_6px_20px_rgba(0,0,0,0.02)] flex flex-col gap-3.5 animate-slide-in">
                      <div className="text-sm text-[#1d1d1f] font-medium leading-relaxed">{msg.text}</div>
                      <div className="flex items-center gap-2.5">
                        <button 
                          onClick={onConfirmMapDelete}
                          className="h-9 px-4.5 border-0 rounded-full bg-[#eef4ff] text-[#2a5bd7] hover:bg-[#dfeaff] text-xs font-bold cursor-pointer transition-colors"
                        >
                          确认
                        </button>
                        <button 
                          onClick={onCancelMapDelete}
                          className="h-9 px-4.5 border-0 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200/80 text-xs font-bold cursor-pointer transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  );
                }

                if (msg.type === 'clarify-form') {
                  return (
                    <div key={idx} className="w-full flex flex-col gap-3 animate-slide-in">
                      {renderClarificationForm ? renderClarificationForm() : null}
                    </div>
                  );
                }

                // 普通气泡或集群状态
                const isUser = msg.sender === 'user';
                const isSpecialGuide = msg.type === 'guide-reply';
                
                return (
                  <div 
                    key={idx}
                    className={`border-0 rounded-2.5xl px-4.5 py-3 text-sm leading-relaxed shadow-[0_1px_2px_rgba(0,0,0,0.02),_0_6px_20px_rgba(0,0,0,0.02)] transition-all whitespace-pre-wrap ${
                      isUser
                        ? 'bg-[#eaf2ff]/80 text-[#2a5bd7] self-end max-w-[88%]' 
                        : isSpecialGuide 
                          ? 'bg-purple-50/40 text-purple-950 font-medium'
                          : 'bg-white text-[#1d1d1f]'
                    }`}
                  >
                    {msg.text}
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
          </>
        ) : (
          /* 对话历史记录浏览器 */
          <div className="flex flex-col gap-3">
            {chatHistoryRecords.map((record) => {
              const isSelected = selectedHistoryId === record.id;
              return (
                <div 
                  key={record.id}
                  onClick={() => setSelectedHistoryId(record.id)}
                  className={`border rounded-2.5xl p-4 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.05),_0_6px_20px_rgba(0,0,0,0.04)] cursor-pointer transition-all ${
                    isSelected ? 'border-[#8eb8ff] bg-blue-50/20' : 'border-[#e6e6eb] bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-bold text-[#1d1d1f] flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      <span>{record.title}</span>
                    </div>
                    <span className="text-xs text-[#8a8a92] font-semibold">{record.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed truncate">{record.preview}</p>
                  
                  {isSelected && (
                    <div className="flex justify-end pt-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onRestoreHistory(record.id);
                        }}
                        className="h-8.5 px-4.5 border-0 rounded-full bg-[#2979ff] hover:bg-[#226ce0] text-white text-xs font-bold shadow-md shadow-[#2979ff]/15 cursor-pointer transition-colors"
                      >
                        {record.restoreLabel}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 底部输入框与控制区 */}
      <div className="p-4 bg-white shrink-0 border-t border-[#e6e6eb]">
        <div className="border border-[#e6e6eb] hover:border-slate-300 rounded-[20px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_6px_20px_rgba(0,0,0,0.02)] p-3.5 relative transition-all">
          
          {/* '/' 呼起指令资源浮窗 */}
          <AnimatePresence>
            {showAutocomplete && (
              <motion.div
                ref={autocompleteRef}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 right-0 mb-3 bg-white border border-[#e6e6eb] rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.08),_0_2px_8px_rgba(0,0,0,0.02)] z-50 overflow-hidden flex flex-col bg-white"
                style={{ height: '310px' }}
              >
                {searchQuery ? (
                  /* ================= 模糊检索模式 ================= */
                  <div className="flex flex-col h-full bg-white">
                    {/* 纯白通透头部 - 无灰色底色 */}
                    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-100 shrink-0 select-none">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">
                          搜索匹配全平台资源
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-[#1b4cc7] text-[9.5px] font-bold font-mono">
                          "{searchQuery}"
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setManualClose(true)}
                        className="text-slate-400 hover:text-red-500 text-[10.5px] font-bold border-0 bg-transparent cursor-pointer p-0 select-none transition-colors"
                      >
                        关闭
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-[#f4f4f7] bg-white p-1 flex flex-col">
                      {filteredMatches.length > 0 ? (
                        filteredMatches.map(({ categoryId, item }, index) => {
                          const meta = getMetadata(item, categoryId);
                          return (
                            <button
                              key={`${categoryId}-${item}-${index}`}
                              type="button"
                              onClick={() => handleSelectResourceItem(item, categoryId)}
                              className="w-full text-left px-3.5 py-2.5 border-0 rounded-xl hover:bg-slate-50/80 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {getCategoryIcon(categoryId, 14, "text-slate-400 group-hover:scale-110 transition-transform duration-200 shrink-0")}
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-bold text-slate-800 block truncate">
                                    {getCleanDisplayName(item, categoryId)}
                                  </span>
                                </div>
                              </div>
                              <div className="shrink-0 flex items-center gap-4 justify-end">
                                <span className="text-[10px] text-slate-450 font-normal truncate max-w-[160px] text-right">
                                  {meta.desc}
                                </span>
                                <span className="text-[9px] font-bold text-slate-450 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded scale-90 select-none whitespace-nowrap">
                                  {categoryId === 'map' ? '地图' : categoryId === 'knowledge' ? '知识库' : categoryId === 'action' ? '动作' : categoryId === 'skill' ? '接口' : '人设'}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-white select-none">
                          <span className="text-xs font-extrabold text-slate-400">没有找到匹配的资源元素</span>
                          <p className="text-[9.5px] text-slate-400 mt-1">请重试或核对拼写词组</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ================= 非检索: 级联展现模式 ================= */
                  <div className="flex flex-col h-full bg-white select-none">
                    {autocompleteLevel === 1 ? (
                      /* ============ 一级浮窗 (配合指令，去掉顶端灰色大标题栏，通透平铺五大类) ============ */
                      <div className="flex flex-col h-full bg-white">
                        {/* Category Rows with Simple outline icons */}
                        <div className="flex-1 overflow-y-auto divide-y divide-[#ececf2]/60 p-1 flex flex-col">
                          {/* 📎 添加附件 (首选项，亮色背景/轻微激活感) */}
                          <button
                            type="button"
                            onClick={() => {
                              setManualClose(true);
                              fileInputRef.current?.click();
                            }}
                            className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-all flex items-center gap-3.5 group cursor-pointer border-0"
                          >
                            <Paperclip size={14} className="text-slate-500 shrink-0" />
                            <div className="flex-1 min-w-0 flex items-center justify-between gap-1">
                              <span className="text-[12px] font-extrabold text-slate-800 tracking-wide font-sans shrink-0">
                                添加附件
                              </span>
                            </div>
                          </button>

                          {/* 🛠️ 创建skill */}
                          <button
                            type="button"
                            onClick={() => {
                              setManualClose(true);
                              setSelectedResources(prev => {
                                if (prev.some(r => r.name === 'create-skill' && r.categoryId === 'skill')) return prev;
                                return [...prev, { name: 'create-skill', categoryId: 'skill' }];
                              });
                              // 移除输入框中的 '/' 触发词
                              const lastSlashIdx = inputText.lastIndexOf('/');
                              if (lastSlashIdx !== -1) {
                                setInputText(inputText.substring(0, lastSlashIdx));
                              } else {
                                setInputText('');
                              }
                              setTimeout(() => {
                                textareaRef.current?.focus();
                              }, 50);
                            }}
                            className="w-full text-left px-4 py-3 bg-transparent hover:bg-slate-50/80 rounded-xl transition-all flex items-center gap-3.5 group cursor-pointer border-0"
                          >
                            <Wrench size={14} className="text-slate-500 shrink-0" />
                            <div className="flex-1 min-w-0 flex items-center justify-between gap-1">
                              <span className="text-[12px] font-extrabold text-slate-800 tracking-wide font-sans shrink-0">
                                创建skill
                              </span>
                            </div>
                          </button>

                          {autocompleteCategories.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setActiveCategory(cat.id);
                                setAutocompleteLevel(2); // 一级到二级
                              }}
                              className="w-full text-left px-4 py-3.5 border-0 bg-transparent hover:bg-slate-50/80 rounded-xl transition-all flex items-center gap-3.5 group cursor-pointer"
                            >
                              {getCategoryIcon(cat.id, 15, "text-slate-400 group-hover:text-blue-500 transition-colors shrink-0")}
                              <div className="flex-1 min-w-0 flex items-center justify-between gap-1">
                                <span className="text-[12px] font-extrabold text-slate-800 tracking-wide font-sans shrink-0">
                                  {cat.title}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium truncate font-sans text-left flex-1 pl-4.5">
                                  {cat.desc}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* ============ 二级浮窗 (纯白底无灰色边条，支持退出/返回，展示全平台内置所有资源) ============ */
                      <div className="flex flex-col h-full bg-white">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-100 shrink-0 select-none">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setAutocompleteLevel(1)}
                              className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 font-bold text-[10.5px] border-0 bg-transparent cursor-pointer p-0 select-none transition-colors"
                            >
                              <ChevronLeft size={13} />
                              <span>返回</span>
                            </button>
                            <span className="text-slate-200 pointer-events-none text-xs">|</span>
                            <span className="text-xs font-bold text-slate-800">
                              {autocompleteCategories.find(c => c.id === activeCategory)?.title || '资源内容'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setManualClose(true)}
                            className="text-slate-400 hover:text-red-500 text-[10.5px] font-bold border-0 bg-transparent cursor-pointer p-0 transition-colors"
                          >
                            关闭
                          </button>
                        </div>

                        {/* List representation displaying PLATFORM_ALL_RESOURCES */}
                        {(() => {
                          const itemsToShow = PLATFORM_ALL_RESOURCES[activeCategory] || [];
                          
                          if (itemsToShow.length > 0) {
                            return (
                              <div className="flex-1 overflow-y-auto bg-white p-1 divide-y divide-[#f4f4f7] flex flex-col">
                                {itemsToShow.map((item) => {
                                  const meta = getMetadata(item, activeCategory);
                                  return (
                                    <button
                                      key={item}
                                      type="button"
                                      onClick={() => handleSelectResourceItem(item, activeCategory)}
                                      className="w-full text-left px-3.5 py-2.5 border-0 rounded-xl hover:bg-slate-50/80 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                                    >
                                      <div className="flex items-center gap-3 min-w-0 flex-1">
                                        {getCategoryIcon(activeCategory, 14, "text-slate-400 group-hover:scale-110 transition-transform duration-200 shrink-0")}
                                        <div className="flex-1 min-w-0">
                                          <span className="text-xs font-bold text-slate-800 block truncate">
                                            {getCleanDisplayName(item, activeCategory)}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="shrink-0 flex items-center gap-4 justify-end">
                                        <span className="text-[10px] text-slate-450 font-normal truncate max-w-[180px] text-right">
                                          {meta.desc}
                                        </span>

                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          }

                          return (
                            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-white select-none">
                              <span className="text-slate-400 mb-1">
                                {getCategoryIcon(activeCategory, 18)}
                              </span>
                              <span className="text-xs font-bold text-slate-400">目前暂无绑定的子资源</span>
                              <p className="text-[9.5px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                                请在右部系统控制台上进行相应新增或替换配置。
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 选中资源与输入区域（完美同一行展示高保真体验，当多于一行或添加多个且空间不足时自动优雅折行，维持光标和文字的高可读性） */}
          <div 
            onClick={() => textareaRef.current?.focus()}
            className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5 w-full cursor-text"
          >
            {selectedResources.length > 0 && selectedResources.map((res, idx) => (
              <div key={idx} className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 select-none animate-fade-in shrink-0 border ${
                res.categoryId === 'file'
                  ? 'bg-slate-100/90 border-slate-200 text-slate-705 font-bold'
                  : 'bg-slate-50 border-slate-250 text-slate-800 font-extrabold'
              }`}>
                <span className="text-[12px] tracking-wide select-none flex items-center gap-1.5">
                  {res.categoryId === 'file' ? (
                    <Paperclip size={11} className="text-slate-550 shrink-0" />
                  ) : res.categoryId === 'skill' && res.name === 'create-skill' ? (
                    <Wrench size={11} className="text-slate-600 shrink-0" />
                  ) : (
                    getCategoryIcon(res.categoryId, 11, "text-slate-500 shrink-0")
                  )}
                  <span>{getCleanDisplayName(res.name, res.categoryId)}</span>
                </span>
              </div>
            ))}

            <textarea 
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onInput={() => {}}
              onKeyDown={handleKeyDown}
              placeholder="输入对话或指令..."
              className={`flex-1 min-w-[120px] max-h-[70px] border-0 m-0 p-0 text-sm leading-relaxed outline-none resize-none bg-transparent caret-blue-600 text-slate-800 placeholder-slate-400 ${
                showTokenPreview ? 'text-transparent' : ''
              }`}
              style={{ minHeight: '24px', height: '24px', paddingTop: '2px' }}
            />
          </div>

          {/* Token 预展示的水印小胶囊 */}
          {showTokenPreview && (
            <div className="absolute top-[15px] left-[15px] right-[15px] min-h-[22px] pointer-events-none flex items-center animate-pulse">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#dbe9ff] text-[#2a5bd7] text-xs font-bold leading-none">
                {inputText.trim()}
              </span>
            </div>
          )}

          {/* Agent 附件上传二级子面板 (极度精致 1:1 复刻级联面板) */}
          {showAttachmentMenu && (
            <div className="absolute left-3.5 bottom-15 flex items-end select-none animate-fade-in z-50 pointer-events-auto">
              {/* 主菜单 (左边分类) */}
              <div className="w-[130px] bg-white border border-[#e6e6eb]/80 rounded-2xl shadow-[0_12px_28px_rgba(0,0,0,0.11)] p-1.5 flex flex-col gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setActivePlusCategory(activePlusCategory === 'skill' ? null : 'skill')}
                  className={`h-9 border-0 rounded-xl flex items-center justify-between px-2.5 text-left text-xs font-extrabold cursor-pointer transition-all duration-150 w-full ${
                    activePlusCategory === 'skill' ? 'bg-slate-50 text-blue-600 scale-[1.02]' : 'bg-transparent text-[#1d1d1f] hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Cpu size={14} className={activePlusCategory === 'skill' ? "text-blue-600 shrink-0" : "text-slate-500 shrink-0"} />
                    <span>技能库</span>
                  </div>
                  <span className="text-[9px] text-slate-400/85">{activePlusCategory === 'skill' ? '◂' : '❯'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePlusCategory(activePlusCategory === 'knowledge' ? null : 'knowledge')}
                  className={`h-9 border-0 rounded-xl flex items-center justify-between px-2.5 text-left text-xs font-extrabold cursor-pointer transition-all duration-150 w-full ${
                    activePlusCategory === 'knowledge' ? 'bg-slate-50 text-blue-600 scale-[1.02]' : 'bg-transparent text-[#1d1d1f] hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className={activePlusCategory === 'knowledge' ? "text-blue-600 shrink-0" : "text-slate-500 shrink-0"} />
                    <span>知识库</span>
                  </div>
                  <span className="text-[9px] text-slate-400/85">{activePlusCategory === 'knowledge' ? '◂' : '❯'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePlusCategory(activePlusCategory === 'action' ? null : 'action')}
                  className={`h-9 border-0 rounded-xl flex items-center justify-between px-2.5 text-left text-xs font-extrabold cursor-pointer transition-all duration-150 w-full ${
                    activePlusCategory === 'action' ? 'bg-slate-50 text-blue-600 scale-[1.02]' : 'bg-transparent text-[#1d1d1f] hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Activity size={14} className={activePlusCategory === 'action' ? "text-blue-600 shrink-0" : "text-slate-500 shrink-0"} />
                    <span>动作库</span>
                  </div>
                  <span className="text-[9px] text-slate-400/85">{activePlusCategory === 'action' ? '◂' : '❯'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePlusCategory(activePlusCategory === 'map' ? null : 'map')}
                  className={`h-9 border-0 rounded-xl flex items-center justify-between px-2.5 text-left text-xs font-extrabold cursor-pointer transition-all duration-150 w-full ${
                    activePlusCategory === 'map' ? 'bg-slate-50 text-blue-600 scale-[1.02]' : 'bg-transparent text-[#1d1d1f] hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Map size={14} className={activePlusCategory === 'map' ? "text-blue-600 shrink-0" : "text-slate-500 shrink-0"} />
                    <span>地图库</span>
                  </div>
                  <span className="text-[9px] text-slate-400/85">{activePlusCategory === 'map' ? '◂' : '❯'}</span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={() => {
                    setShowAttachmentMenu(false);
                    fileInputRef.current?.click();
                  }}
                  className="h-9 border-0 rounded-xl bg-transparent hover:bg-slate-50 flex items-center gap-2 px-2.5 text-left text-xs font-extrabold text-[#1d1d1f] cursor-pointer transition-all w-full"
                >
                  <Paperclip size={14} className="text-slate-550 shrink-0" />
                  <span>添加附件</span>
                </button>
              </div>

              {/* 二级菜单 (在旁边向右平铺展开) */}
              {activePlusCategory && (
                <div 
                  className="w-[260px] bg-white border border-[#e6e6eb]/80 rounded-2xl shadow-[0_12px_28px_rgba(0,0,0,0.11)] p-1.5 ml-1 flex flex-col animate-fade-in relative"
                  style={{ maxHeight: '230px' }}
                >
                  <div className="flex-1 overflow-y-auto flex flex-col gap-0.5 max-h-[175px] pr-0.5">
                    {(PLATFORM_ALL_RESOURCES[activePlusCategory] || []).map((item) => {
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setSelectedResources(prev => {
                              if (prev.some(r => r.name === item && r.categoryId === activePlusCategory)) return prev;
                              return [...prev, { name: item, categoryId: activePlusCategory }];
                            });
                            setShowAttachmentMenu(false);
                            setTimeout(() => {
                              textareaRef.current?.focus();
                            }, 50);
                          }}
                          className="w-full h-9 border-0 bg-transparent hover:bg-slate-50 flex items-center gap-2 px-2.5 text-left text-xs font-extrabold text-[#1d1d1f] hover:bg-slate-50 cursor-pointer transition-all duration-150"
                        >
                          <span className="shrink-0 transition-colors text-slate-500">
                            {getCategoryIcon(activePlusCategory, 14, "text-slate-500 shrink-0")}
                          </span>
                          <span className="truncate flex-1">
                            {getCleanDisplayName(item, activePlusCategory)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* 二级菜单底部管理，居左，去颜色，icon+管理 */}
                  <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center shrink-0 w-full px-1">
                    <button
                      type="button"
                      className="w-full h-8 border-0 bg-transparent hover:bg-slate-50 flex items-center justify-start gap-2 px-1.5 rounded-xl text-xs font-extrabold text-[#1d1d1f] hover:bg-slate-50 cursor-pointer select-none transition-all"
                    >
                      <Settings size={14} className="text-slate-500 shrink-0" />
                      <span>管理{activePlusCategory === 'skill' ? '技能' : activePlusCategory === 'knowledge' ? '知识库' : activePlusCategory === 'action' ? '动作' : '地图'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 状态动作栏 */}
          <div className="flex items-center justify-between mt-3">
            <div className="relative group">
              {/* Tooltip: 添加文件等 / */}
              <div className="absolute bottom-11 left-1.5 mb-1.5 hidden group-hover:flex items-center gap-2 bg-white border border-slate-200/90 px-3 py-1.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.08)] z-40 animate-fade-in whitespace-nowrap select-none">
                <span className="text-[11.5px] font-bold text-slate-705">添加文件等</span>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#f0f2f5] text-slate-500 text-[10px] font-medium font-sans">
                  /
                </span>
              </div>
              
              <button 
                onClick={() => {
                  setShowAttachmentMenu(!showAttachmentMenu);
                  if (!showAttachmentMenu) {
                    setActivePlusCategory(null); // 打开时默认折叠二级，符合点击 1 级后再展示 2 级的要求
                  }
                }}
                className="w-9 h-9 border-0 rounded-full bg-[#f0f2f5] hover:bg-[#e4e6eb] text-slate-500 hover:text-slate-700 flex items-center justify-center font-bold text-lg cursor-pointer transition-colors"
                aria-label="添加附件"
              >
                <Plus size={16} strokeWidth={2.2} />
              </button>
            </div>
            <button 
              onClick={handleSend}
              className="w-8 h-8 rounded-full bg-black hover:bg-slate-800 text-white flex items-center justify-center cursor-pointer transition-colors border-0 p-0 shadow-xs"
              aria-label="发送"
            >
              <ArrowUp size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
