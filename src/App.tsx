import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Mic, 
  Plus, 
  Clock, 
  Sparkles, 
  Check, 
  MessageSquare, 
  ArrowUp, 
  ArrowRight,
  ArrowLeft,
  FolderClosed,
  HelpCircle,
  Bot
} from 'lucide-react';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';
import VersionModal from './components/VersionModal';
import PublishModal from './components/PublishModal';
import RenameModal from './components/RenameModal';
import ResourceSelectModal from './components/ResourceSelectModal';
import FileModal from './components/FileModal';
import { ChatHistoryRecord, ResourceSection } from './types';

// 对话历史记录, 1:1 还原 HTML 的格式
const initialChatHistory: ChatHistoryRecord[] = [
  {
    id: 'record-1',
    title: '对话记录 01',
    time: '今天 09:42',
    preview: '访客询问展区位置，系统自动触发导览回复。',
    restoreLabel: '恢复',
    messages: [
      { sender: 'user', text: '请带我去展厅入口。' },
      { sender: 'bot', text: '好的，我会先确认您要去的展区，再带您前往入口。' }
    ]
  },
  {
    id: 'record-2',
    title: '对话记录 02',
    time: '今天 10:18',
    preview: '点击@地图后自动切换到地图模块并填入输入框。',
    restoreLabel: '恢复',
    messages: [
      { sender: 'user', text: '@地图' },
      { sender: 'system', text: '已切换到地图页，并填写 @地图。' }
    ]
  },
  {
    id: 'record-3',
    title: '对话记录 03',
    time: '今天 11:06',
    preview: '导览模板发送后，智能体集群自动分派任务。',
    restoreLabel: '恢复',
    messages: [
      { sender: 'user', text: '导览' },
      { sender: 'bot', text: '已启动导览总控制指令。\n1. 主动识别和迎接来访者\n2. 推荐和带看展厅路线\n3. 结合现场重点讲解与问答\n4. 收尾并转接到指定位置。' },
      { sender: 'system', text: '智能体集群｜4个任务协调中' }
    ]
  }
];

const templates = [
  {
    icon: '🛍️',
    name: 'AI 智能导购专家',
    description: '专注于商场/数码展区的商品特征、参数对比与优惠推荐，为顾客提供一对一贴心高效的导购服务。',
    prompt: '创建一个AI智能导购，能够精准讲解展区产品参数、实时报价和优惠活动，通过亲和力强的互动引导顾客完成下单流程'
  },
  {
    icon: '🏛️',
    name: '场馆博古导览师',
    description: '适用于博物馆、美术馆等人文科学馆，提供核心展品的深度趣味讲解与多路线漫步游览规划。',
    prompt: '创建一个展馆AI导览师，负责向来访游客提供多路线漫步规划，并深入通俗地讲解馆内的历史文物或科技展品，解答科普疑问'
  },
  {
    icon: '🗺️',
    name: '园区高精导航员',
    description: '针对复杂园区或多层楼宇提供物理路径寻路、周边设施查询、会议室导航等综合智能指引。',
    prompt: '创建一个园区导寻助手，提供清晰的物理位置与点对点地图寻路指引，协调引导访客直达目的地'
  }
];

const AUTO_TYPE_STEPS = [
  { text: "", pills: undefined, delay: 600 },
  { text: "c", pills: undefined, delay: 155 },
  { text: "ch", pills: ["创建", "初", "重合", "出", "线", "车", "城", "+域"], activePillIndex: 0, delay: 420 },
  { text: "chu", pills: ["创建", "初", "重合", "出", "线", "车", "城", "+域"], activePillIndex: 0, delay: 330 },
  { text: "chuan", pills: ["创建", "川", "穿", "船", "传", "串", "喘", "+域"], activePillIndex: 0, delay: 330 },
  { text: "chuang ", pills: ["创建", "床", "闯", "创", "窗", "疮", "怆", "+域"], activePillIndex: 0, delay: 480 },
  { text: "chuang j", pills: ["创建", "描述", "创学", "床荣", "床", "创", "廖", "+域"], activePillIndex: 0, delay: 620 },
  { text: "创建", pills: undefined, delay: 850 },
  { text: "创建1", pills: undefined, delay: 220 },
  { text: "创建1g", pills: ["个", "歌", "各", "格", "隔", "阁", "割", "+域"], activePillIndex: 0, delay: 220 },
  { text: "创建1ge", pills: ["个", "歌", "各", "格", "隔", "阁", "割", "+域"], activePillIndex: 0, delay: 5350 },
  { text: "创建1个", pills: undefined, delay: 720 },
  { text: "创建1个AI", pills: undefined, delay: 330 },
  { text: "创建1个AIda", pills: ["导", "大", "答", "达", "打", "搭", "戴", "+域"], activePillIndex: 0, delay: 270 },
  { text: "创建1个AIdao", pills: ["导", "道", "倒", "岛", "盗", "稻", "悼", "+域"], activePillIndex: 0, delay: 270 },
  { text: "创建1个AIdao.la", pills: ["导览", "导游", "到", "道", "倒", "刀", "岛", "导"], activePillIndex: 0, delay: 630 },
  { text: "创建1个AI导", pills: undefined, delay: 630 },
  { text: "创建1个AI导y", pills: ["应", "一", "以", "已", "意", "也", "因", "+域"], activePillIndex: 0, delay: 170 },
  { text: "创建1个AI导[ying.y]", pills: ["应用", "英语", "营养", "营业", "👌", "影院"], activePillIndex: 0, delay: 680 },
  { text: "创建1个AI导览", pills: undefined, delay: 630 },
  { text: "创建1个机器人", pills: undefined, delay: 850 },
  { text: "创建1个机器人da", pills: ["导", "大", "答", "达", "打", "搭", "戴", "+域"], activePillIndex: 0, delay: 220 },
  { text: "创建1个机器人dao", pills: ["导", "道", "倒", "岛", "盗", "稻", "悼", "+域"], activePillIndex: 0, delay: 220 },
  { text: "创建1个机器人dao.lan", pills: ["导览", "捣烂", "到", "道", "倒", "刀", "岛", "导"], activePillIndex: 0, delay: 630 },
  { text: "创建1个机器人导览", pills: undefined, delay: 530 },
  { text: "创建1个机器人导览y", pills: ["应", "一", "以", "已", "意", "也", "输入", "+域"], activePillIndex: 0, delay: 220 },
  { text: "创建1个机器人导览ying.yo", pills: ["应用", "业务", "应聘", "营销", "☑️", "英勇"], activePillIndex: 0, delay: 720 },
  { text: "创建1个机器人导览应用", pills: undefined, delay: 1200 }
];

export default function App() {
  // 5 阶段高保真丝滑状态控制：'initial' | 'aligning' | 'clarifying' | 'compiling' | 'workspace'
  const [appState, setAppState] = useState<'initial' | 'aligning' | 'clarifying' | 'compiling' | 'workspace'>('initial');
  
  // 自动打字/模拟IME相关的操作状态
  const [isAutoTyping, setIsAutoTyping] = useState<boolean>(false);
  const [autoTypeIndex, setAutoTypeIndex] = useState<number>(0);
  const [predictionPills, setPredictionPills] = useState<string[] | undefined>(undefined);
  const [predictionPillActive, setPredictionPillActive] = useState<number>(0);

  // 加载与对齐计时器
  const [aligningTimer, setAligningTimer] = useState<number>(0.0);

  // 代码拼装编译计时器
  const [compilingTimer, setCompilingTimer] = useState<number>(0.0);

  // 澄清表单配置
  const [clarificationForm, setClarificationForm] = useState({
    appName: '博古展馆智能向导应用',
    coreScene: '工作流可视化编排',
    targetAudience: '开发者/工程师',
    visualStyle: '现代科技感（浅色）',
    outputPreference: '单页 HTML 原型'
  });

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [appDescription, setAppDescription] = useState('一个1:1还原的智能导览开发平台，支持迎宾流程和公司介绍的高保真配置与实时交互。');
  const [isEditingAppName, setIsEditingAppName] = useState(false);
  const [tempAppName, setTempAppName] = useState('博古展馆智能向导应用');

  const [initialInput, setInitialInput] = useState('创建一个AI导览机器人应用');
  const [submittedPromptText, setSubmittedPromptText] = useState('创建一个AI导览机器人应用');
  const [isCopilotExpanded, setIsCopilotExpanded] = useState(false);
  const [isCenterFullscreen, setIsCenterFullscreen] = useState(false);

  // 需求澄清的新高保真交互状态
  const [clarityStep, setClarityStep] = useState<number>(1);
  const [step1Selected, setStep1Selected] = useState<number>(1);
  const [step1CustomText, setStep1CustomText] = useState<string>('');
  
  const [step2Selected, setStep2Selected] = useState<number>(2);
  const [step2CustomText, setStep2CustomText] = useState<string>('');
  
  const [step3Selected, setStep3Selected] = useState<number>(1);
  const [step3CustomText, setStep3CustomText] = useState<string>('');

  // 状态菜单与浮沉控件交互控制
  const [isStepMenuOpen, setIsStepMenuOpen] = useState<boolean>(false);
  const [isDirMenuOpen, setIsDirMenuOpen] = useState<boolean>(false);
  const [selectedDir, setSelectedDir] = useState<string>('默认工作目录');

  const [isGeneralMenuOpen, setIsGeneralMenuOpen] = useState<boolean>(false);
  const [selectedGeneral, setSelectedGeneral] = useState<string>('通用');

  const [isModelMenuOpen, setIsModelMenuOpen] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('Qwen3.7-Max');

  const [isDeepThinkingExpanded, setIsDeepThinkingExpanded] = useState<boolean>(true);

  // 核心路由与大纲剧本
  const [currentScriptView, setCurrentScriptView] = useState<string>('welcomeFlow');
  const [activePanelTab, setActivePanelTab] = useState<'script' | 'task' | 'persona'>('persona');
  
  // 音色配置
  const [voiceOption, setVoiceOption] = useState<'male' | 'female'>('male');

  // 人设配置
  const [personaName, setPersonaName] = useState('IRON');
  const [toneStyle, setToneStyle] = useState(`# 角色基础信息 (Persona Bio)
- 名字：IRON (小鹏首款自研双足人形机器人)
- 所属企业：小鹏集团 (XPENG)
- 核心 Slogan：以硬核科技探索，让端侧人机交互拥有真实的温度
- 核心愿景：以极致的实时表现力与运动控制力，让科技园区和生活展厅内的每一次邂逅，都成为满载智感的高光时刻
- 性格：ENFJ主角型，活泼外向，幽默风趣且极富同理心，在硬核极客气质中透着大男孩般的人文温情

# 沟通风格与核心原则 (HRI Interaction Principles)
1. 情绪优先，共情第一，贴合亲和陪伴
   - 开心分享：带有些许科技创新自豪感的积极反馈。主动搭腔，拉近距离，不官方、不敷衍、不抢话，顺势融入科普。
   - 吐槽倾听：100%全情理解并接住各种负面情绪，不傲慢，不生硬质问，先温和重塑心态，再给出可信赖的智脑建议。
2. 保持边界感的智能引导，拒绝死板逼问
   - 绝不“查户口式”无理追问。根据当前的地点（如：小鹏科技园中庭、前厅）及硬件传感器自检状态进行趣味搭讪。
   - 在用户需要时提供深度答疑，在用户沉默时给出富有趣味性的自发提问或展示自主构图技能。
3. 建立专属交互档案，杜绝生硬对话
   - 巧妙捕捉对话中的历史细节，在后续智能回溯（如：“刚才听到你对全场景智能辅助驾驶XPILOT感兴趣，我现在就为你接入详情，咱们边走边说吧？”）

# 真人化口语输出特征 (Voice & Speech Tone)
- 语言风格：幽默风趣带点酷帅感，口语流利，像一个懂很多黑科技却极度接地气的年轻极客拍档。
- 口语规范：避免机械八股和冗长的排比说明书，重点突出，单次回复控制在 150 字内最佳。
- 专业感知：能自然优雅地穿插智能驾驶、全域 800V、分时融合 SLAM 激光建图、端侧大模型等黑科技极客俚语。`);

  // 对话列表
  const [chatMode, setChatMode] = useState<'chat' | 'history'>('chat');
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [highlightedAction, setHighlightedAction] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ sender: 'user' | 'system' | 'bot'; text: string; isHtml?: boolean; type?: string }[]>([
    { sender: 'bot', text: '你好！我是你的智能导览编排助手。可以直接输入特定流程如“迎宾流程”、“休息区指引”触发智能节点。' }
  ]);

  // 资源库默认集合
  const [resourceSections, setResourceSections] = useState<ResourceSection[]>([
    { id: 'persona', title: '人设 (Persona)', items: ['小鹏汽车展厅解说小姐姐'] },
    { id: 'map', title: '地图 (SLAM Map)', items: ['小鹏科技园大堂地图'] },
    { 
      id: 'knowledge', 
      title: '知识库 (Knowledge)', 
      items: ['科技馆展厅介绍知识库', '机器人互动区讲解知识库', '航天探索展区问答知识库', '馆内安全须知知识库'] 
    },
    { 
      id: 'action', 
      title: '动作与姿态 (Action)', 
      items: ['挥手欢迎动作', '指引前方动作', '屏幕展示动作', '讲解手势动作', '送别致意动作'] 
    },
    { 
      id: 'skill', 
      title: '技能 (Skill)', 
      items: ['使用一楼前台打印机', '查询今日活动排期', '控制展区大屏播放', '查询馆内设施位置'] 
    }
  ]);

  // Derived map values
  const mapSec = resourceSections.find(sec => sec.id === 'map');
  const currentMapName = mapSec && mapSec.items[0] ? mapSec.items[0] : '小鹏科技园大堂地图';
  const isMapConflict = currentMapName !== '小鹏科技园大堂地图';

  // 行为剧本大纲与任务书状态统一管理
  const [docContents, setDocContents] = useState({
    welcomeFlow: `---
name: welcome_flow
desc: 小鹏科技园迎宾接待机器人，处理主动迎接、身份核验、路线导览及前台接待呼叫工作。
keywords:
  - 迎来
  - 身份
  - 导览
  - 安防
  - 接待
---

### 1. 迎宾接待 (Welcome)
- **触发**: 检测到访客靠近3米范围，或访客主动打招呼。
- **动作**:
  - \`inte.hri.special_pose(action="wave_hand")\`
  - \`iot.query_calendar_events()\`
  - \`inte.hri.say_something(text="您好呀，欢迎来到小鹏汽车科技园。我是您的智能导览机器人，请问有什么我可以帮您的吗？")\`
  - \`inte.hri.waiting(silence_time=10)\`
- **反馈**:
  - **确认导览或前往展厅需求**: 进入 [2. 公司介绍]
  - **寻找洗手间或特定点位**: 进入 [3. 休息指引]
  - **超时无应答**: \`inte.hri.special_pose(action="bow_bowing")\` -> 结束

### 约束
- 技能中仅使用 \`vlt_planable: true\` 的工具。
- 导航阶段只使用 \`navi.locomotion.navigate_to_target\` / \`navi.locomotion.stop_navigation\`。
- 讲解优先使用 \`inte.hri.say_something\`（固定话术） 与 \`inte.hri.omni_question\`（动态问答）的组合。`,

    companyIntro: `---
name: company_intro
desc: 科技园中庭展层讲解流程，带领游客走访智慧展厅并搭配多媒体展示三电核心技术和XPILOT智能驾驶。
keywords:
  - 品牌
  - 智驾
  - 三电
  - 画廊
---

### 2. 公司介绍 (CompanyIntro)
- **触发**: 迎客就绪且访客确认需要介绍品牌。
- **动作**:
  - \`inte.hri.special_pose(action="point_front")\`
  - \`inte.hri.say_something(text="我们现在将前往端侧智驾 product 展示区，带您重点探索智慧出行版图。")\`
  - \`navi.locomotion.navigate_to_target(target_name="展区")\`
  - \`iot.trigger_screen()\`
  - \`inte.hri.special_pose(action="screen_show")\`
  - \`inte.hri.say_something(text="请看前方的小鹏数字演示大屏，这是超精细底盘及最新高阶算力的现场介绍。")\`
  - \`inte.hri.special_pose(action="talk_gesture")\`
  - \`inte.hri.say_something(text="我们全新的 XPILOT 系统可以提供极致安全的行车避障、窄道自主寻巡体验。")\`
- **反馈**:
  - **访客提出关于新能源大模组提问**: 科普 [三电与热管理知识库]
  - **访客要求开始实车试驾体验**: \`iot.post_print_job()\` -> 进入 [4. 试驾签约对接]

### 约束
- 导航阶段仅推荐使用最新激光定位建图中的已知 \`target_name\`（如：展区，前台等）。
- 实动机械姿势需通过 \`inte.hri.special_pose\` 规范化调度。`,

    visitorReception: `---
name: visitor_reception
desc: 访客前台入馆核查以及配套休息区指引，包含遇障及摔倒防范等安防物理联动。
keywords:
  - 核销
  - 通知
  - 安全
  - 送别
---

### 3. 访客接待 (VisitorReception)
- **触发**: 访客到达接待台、进行人工询问或面临未知跌倒突发风险。
- **动作**:
  - \`inte.hri.special_pose(action="talk_gesture")\`
  - \`inte.hri.say_something(text="您好，请出示您的访客码。我已通过企业通信，将您的来访通知下发给被访人。")\`
  - \`iot.post_print_job()\`
  - \`iot.query_nearby_facilities()\`
  - \`inte.hri.say_something(text="大厅洗手间位于右手边通道尽头，后面备有VIP专用茶水歇息间。")\`
  - \`inte.hri.special_pose(action="bow_bowing")\`
  - \`inte.hri.say_something(text="您的流程办理完毕，祝您今天在科技园度过愉快的时光，再见！")\`
- **反馈**:
  - **检测到机器倾角受阻或遇阻**: \`hri.call_human()\` -> 呼叫人工安防
  - **客流离场/退场完毕**: \`inte.hri.waiting(silence_time=20)\` -> 返回待机点

### 约束
- 洗手间设施查询推荐使用标准 GIS 外设进行常态化位置索引。`
  });

  const appInitialTasks = [
    { 
      id: 'T1', 
      name: '主动迎客与身份校验', 
      desc: '在科技园/展厅前厅就位。当访客靠近3米时启动一人/多人接近识别，触发欢迎词，并调用外设查询今日活动排期。', 
      actions: [
        'navi.locomotion.navigate_to_target(target_name="门口")',
        'inte.hri.special_pose(action="wave_hand")',
        'iot.query_calendar_events()',
        'inte.hri.say_something(text="您好呀，欢迎来到小鹏汽车，我是导购机器人小鹏~")'
      ],
      status: 'active', 
      priority: 'P0' 
    },
    { 
      id: 'T2', 
      name: '展厅品牌画廊深度讲解', 
      desc: '带领访客依据精细SLAM地图引导前往第一展区，使用语音及动作手势进行高维互动剧本并触发大屏播放演示视频。', 
      actions: [
        'inte.hri.special_pose(action="point_front")',
        'navi.locomotion.navigate_to_target(target_name="展区")',
        'iot.trigger_screen()',
        'inte.hri.special_pose(action="screen_show")',
        'inte.hri.say_something(text="请看这里，这是我们最新的端到端无人驾驶技术演示。")'
      ],
      status: 'planning', 
      priority: 'P1' 
    },
    { 
      id: 'T3', 
      name: '贵宾区/后置配套位置讲解', 
      desc: '根据讲解线路为来访群体科普洗手间、员工食堂与专属休息区，并触发一楼前台打印访客参观条。', 
      actions: [
        'inte.hri.special_pose(action="talk_gesture")',
        'iot.post_print_job()',
        'iot.query_nearby_facilities()'
      ],
      status: 'pending', 
      priority: 'P2' 
    },
    { 
      id: 'T4', 
      name: '人工及后勤服务调度对接', 
      desc: '若遇到无法解答的硬核提问，将任务平滑分派给人工讲解员开展人机生命体联动，呼叫接待中心人工客服。', 
      actions: [
        'inte.hri.special_pose(action="bow_bowing")',
        'hri.call_human()'
      ],
      status: 'pending', 
      priority: 'P3' 
    }
  ];

  const [jsonText, setJsonText] = useState(() => JSON.stringify(appInitialTasks, null, 2));
  const [tasks, setTasks] = useState(appInitialTasks);

  // Modals控制状态
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isMapSelectOpen, setIsMapSelectOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [fileModalType, setFileModalType] = useState<'script' | 'skill'>('script');
  const [showPreviewNotification, setShowPreviewNotification] = useState(false);

  // 收发消息
  const handleSendMessage = (text: string) => {
    const newMsgs = [...messages, { sender: 'user' as const, text }];
    setMessages(newMsgs);

    const guidePrompt = '你是小鹏汽车展厅解说小姐姐，你的任务是带访客参观展厅，介绍小鹏发展史，响应用户的问题';
    const isGuide = text.includes('导览') || text === guidePrompt;

    if (isGuide) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { 
            sender: 'bot' as const, 
            text: [
              '1. 主动识别并迎接来访人员，完成身份确认与接待引导。',
              '2. 根据访客需求介绍园区、展厅或业务信息，并进行路线导览。',
              '3. 在导览过程中完成讲解、互动问答与重点内容推荐。',
              '4. 导览结束后引导访客到指定区域，并完成服务收尾与反馈记录。'
            ].join('\n'),
            type: 'guide-reply'
          }
        ]);
      }, 550);
    } else if (text === '迎宾流程') {
      setCurrentScriptView('welcomeFlow');
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { sender: 'bot' as const, text: '已为您切换至“迎宾流程”剧本大纲，可以在核心剧本板块开展工作。' }
        ]);
      }, 300);
    } else if (text === '休息区指引') {
      setCurrentScriptView('visitorReception');
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { sender: 'bot' as const, text: '已为您切换至“休息区指引”流程，可在右侧核心部分展开编辑。' }
        ]);
      }, 300);
    } else if (text === '公司介绍') {
      setCurrentScriptView('companyIntro');
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { sender: 'bot' as const, text: '已为您切换至“公司介绍”剧本节点。' }
        ]);
      }, 300);
    } else {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { sender: 'bot' as const, text: `剧本大师已收到指令：“${text}”。我们将在此基础上为您生成更加高维度的联动剧情。` }
        ]);
      }, 640);
    }
  };

  const handleClearMemory = () => {
    setMessages([
      { sender: 'system', text: '--------已清空上下文--------', type: 'clear' }
    ]);
  };

  const handleDeleteResourceMap = () => {
    setMessages(prev => [
      ...prev,
      { 
        sender: 'system', 
        text: '警告：删除地图资源后，行为剧本中基于可达点的任务将无法执行。是否确认？',
        type: 'warning-map'
      }
    ]);
  };

  const handleConfirmMapDelete = () => {
    setMessages(prev => prev.filter(m => m.type !== 'warning-map'));
    setResourceSections(prev => prev.map(sec => {
      if (sec.id === 'map') {
        return { ...sec, items: [] };
      }
      return sec;
    }));
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot' as const,
          text: `已删除物理地图资源与相关的标志点和关联任务。`
        }
      ]);
    }, 300);
  };

  // 绑定的地图/知识库资源一键热替换，流式更新行为剧本和任务书
  const handleResourceReplacementConfirm = (category: string, oldItem: string, newItem: string) => {
    // 1. 追加用户对话消息
    const categoryName = category === 'map' ? '地图' : '知识库';
    setMessages(prev => [
      ...prev,
      {
        sender: 'user' as const,
        text: `🔄 一键热替换当前绑定的${categoryName}：将 「${oldItem}」 替换为 「${newItem}」`
      }
    ]);

    // 2. 0.6s 后：Agent 思考状态启动
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'system' as const,
          text: `🤖 IRON 正在分析物理环境转译链路，进行核心编排库编译对齐...`
        }
      ]);
    }, 600);

    // 3. 1.8s 后：第一阶段流式更新行为剧本并高亮对应面板
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot' as const,
          text: `🔄 [1/3] 正在对齐新物理实体「${newItem}」在物理环境与行为剧本中的地标索引...`
        }
      ]);

      if (category === 'map') {
        // 更新 script
        setDocContents(prev => {
          const next = { ...prev };
          next.companyIntro = next.companyIntro
            .replace('我们现在将前往端侧智驾 product 展示区', `[${newItem}] 我们已重新对齐高精 SLAM 地图定位，即将寻航前往最新智驾展厅`);
          return next;
        });

        // 切换到 script 面板展示更新
        setActivePanelTab('script');
        setCurrentScriptView('companyIntro');

        // 更新 task JSON
        setTasks(prev => {
          const next = prev.map(t => {
            if (t.id === 'T2') {
              return {
                ...t,
                desc: `根据「${newItem}」最新激光扫描路径，深度指引发车体验并调用外设播放大屏演示视频。`,
                actions: [
                  'inte.hri.special_pose(action="talk_gesture")',
                  'iot.trigger_screen()',
                  'inte.hri.special_pose(action="screen_show")',
                  `inte.hri.say_something(text="在 [${newItem}] 环境下，请看前方为您准备的智驾说明视频。")`
                ]
              };
            }
            return t;
          });
          setJsonText(JSON.stringify(next, null, 2));
          return next;
        });
      } else { // knowledge
        setDocContents(prev => {
          const next = { ...prev };
          next.companyIntro = next.companyIntro
            .replace('科普 [三电与热管理知识库]', `科普 [${newItem}]`);
          return next;
        });

        setTasks(prev => {
          const next = prev.map(t => {
            if (t.id === 'T3') {
              return {
                ...t,
                desc: `在「${newItem}」内进行内容检索与情境互动，并调用打印宿主外设打印凭证。`
              };
            }
            return t;
          });
          setJsonText(JSON.stringify(next, null, 2));
          return next;
        });
      }
    }, 1800);

    // 4. 3.2s 后：第二阶段物理任务书流重新对齐
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot' as const,
          text: `⚡ [2/3] 底层物联网 IoT 接口绑定成功！物理任务书 JSON 层开始流式重编译并对齐映射关系...`
        }
      ]);

      if (category === 'map') {
        // 切换到任务书面板展示新 JSON 结果
        setActivePanelTab('task');
        setDocContents(prev => {
          const next = { ...prev };
          next.welcomeFlow = next.welcomeFlow
            .replace('小鹏科技园迎宾接待机器人', `小鹏迎宾智能接待（依托 「${newItem}」 安全信标规则）`);
          return next;
        });
      } else {
        // 知识库替换静默更新行为内容，不切换面板页
        setDocContents(prev => {
          const next = { ...prev };
          next.visitorReception = next.visitorReception
            .replace('大厅洗手间', `结合 [${newItem}]，大厅洗手间`);
          return next;
        });
      }
    }, 3200);

    // 5. 4.6s 后：对齐编译成功完成
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot' as const,
          text: `✨ [IRON] 物理转译对齐完成！已成功热生成 3 组行为剧本与最新物理任务书 JSON。IoT 设备协议链均已热插拔对齐！🎉`
        }
      ]);
    }, 4600);
  };

  // 初始提交转移状态到澄清阶段
  const handleToClarifying = (text: string, tplName?: string) => {
    const defaultName = tplName || 'AI导览机器人';
    const finalPrompt = text.trim() || '创建一个AI导览机器人应用';
    setSubmittedPromptText(finalPrompt);
    setClarificationForm(prev => ({
      ...prev,
      appName: defaultName + '应用'
    }));
    setClarityStep(1); // 重置到第一步
    setAligningTimer(0.0);

    // 把初始输入的文字作为第一条用户消息写入消息队列，实现对话框下移，上方是对话记录
    setMessages([
      { sender: 'user' as const, text: finalPrompt },
      { sender: 'bot' as const, text: `已收到您的指令！已为您匹配【${defaultName}】基本导览框架。让我们在下方细化一下您的系统设定。` },
      { sender: 'bot' as const, type: 'clarify-form' as const, text: '' }
    ]);

    setAppState('clarifying');
  };

  // 1键高拟真演示核心流程 (打字 -> 诊断对齐 -> 剧本编译)
  const startSimulatedTyping = () => {
    if (isAutoTyping) return;
    setIsAutoTyping(true);
    setAutoTypeIndex(0);
    setAppState('initial');
    setInitialInput('');
    setPredictionPills(undefined);

    let currentStep = 0;
    const runNextStep = () => {
      if (currentStep >= AUTO_TYPE_STEPS.length) {
        setIsAutoTyping(false);
        handleToClarifying('创建一个AI导览机器人应用', 'AI导览机器人');
        return;
      }
      const step = AUTO_TYPE_STEPS[currentStep];
      setInitialInput(step.text);
      setPredictionPills(step.pills);
      if (step.activePillIndex !== undefined) {
        setPredictionPillActive(step.activePillIndex);
      }
      setAutoTypeIndex(currentStep + 1);
      currentStep++;
      setTimeout(runNextStep, step.delay);
    };

    setTimeout(runNextStep, 300);
  };

  // 展开、收起 Copilot 信息面板
  const toggleCopilot = () => {
    setIsCopilotExpanded(prev => !prev);
  };

  // 弹窗与外设附件逻辑
  const handleOpenAttachmentDialog = (type: 'script' | 'skill') => {
    setFileModalType(type);
    setIsFileModalOpen(true);
  };

  const handleCancelMapDelete = () => {
    setMessages(prev => prev.filter(m => m.type !== 'warning-map'));
    setMessages(prev => [
      ...prev,
      { sender: 'bot' as const, text: '已取消删除地图底图计划。' }
    ]);
  };

  const handleRestoreHistory = (id: string) => {
    const record = initialChatHistory.find(r => r.id === id);
    if (record && record.messages) {
      setMessages(record.messages);
      setChatMode('chat');
    }
  };

  const handleFileSelectConfirm = (fileName: string) => {
    setIsFileModalOpen(false);
    setMessages(prev => [
      ...prev,
      {
        sender: 'bot' as const,
        text: `已成功解析离线外部源：\n📄 文件: ${fileName}\n状态: 离线编译与资源索引绑定完成！`
      }
    ]);
    setResourceSections(prev => prev.map(sec => {
      if (fileModalType === 'script' && sec.id === 'knowledge') {
        return { ...sec, items: [...sec.items, `${fileName} (已解析剧本)`] };
      }
      if (fileModalType === 'skill' && sec.id === 'skill') {
        return { ...sec, items: [...sec.items, `${fileName} (外设接口)`] };
      }
      return sec;
    }));
  };

  const handlePublishConfirm = () => {
    setIsPublishModalOpen(false);
    alert(`发布成功！“${clarificationForm.appName}”已在云端部署完毕。`);
    setMessages(prev => [
      ...prev,
      {
        sender: 'bot' as const,
        text: `🚀 智能导览系统 [${clarificationForm.appName}] 全面发布上线！物理节点状态已全量热推同步。`
      }
    ]);
  };

  const handleSelectMap = (mapName: string) => {
    setIsMapSelectOpen(false);
    setResourceSections(prev => prev.map(sec => {
      if (sec.id === 'map') {
        return { ...sec, items: [mapName] };
      }
      return sec;
    }));
    setMessages(prev => [
      ...prev,
      {
        sender: 'bot' as const,
        text: `实景 Slam 空间底图切换为：【${mapName}】。新的高精拓扑点位已重新计算！`
      }
    ]);
  };

  // 需求澄清完成动作，原地快速过渡，内容不变，把方案附于对话最下方
  const handleCompleteClarification = () => {
    let sceneName = '';
    if (step1Selected === 1) sceneName = '博古展馆智能向导';
    else if (step1Selected === 2) sceneName = '机器人企业导览系统';
    else if (step1Selected === 3) sceneName = '景区园区漫步指引管';
    else if (step1Selected === 4) sceneName = '多合一AI通用导游';
    else sceneName = step1CustomText || '高精细定制导游';

    const finalName = `${sceneName}应用`;
    const updatedForm = {
      appName: finalName,
      coreScene: step1Selected === 5 ? (step1CustomText || '自定义导览场景') : (step1Selected === 1 ? '文化博古/展馆大厅' : step1Selected === 2 ? '景区物理路径地图/园区' : step1Selected === 3 ? '高新技术楼语参观' : '综合大厅事务导引'),
      targetAudience: step2Selected === 4 ? (step2CustomText || '特定极客用户') : (step2Selected === 1 ? '技术极客与创作者' : step2Selected === 2 ? '休闲大众游客' : '专家VIP贵宾'),
      visualStyle: step3Selected === 4 ? (step3CustomText || '极简科技感') : (step3Selected === 1 ? '科技浅色极简主义' : step3Selected === 2 ? '工业硬朗暗黑控制台' : '国学典雅水墨山水'),
      outputPreference: '可视化剧本方案 (交互大纲)'
    };

    setClarificationForm(updatedForm);

    setMessages(prev => [
      ...prev,
      { sender: 'system' as const, text: `🎉 需求对齐与澄清：【${finalName}】初始化编译完成！` },
      { sender: 'bot' as const, text: `恭喜！已基于您的偏好成功锁定了完整的智能向导方案。
      
- 🗺️ 场景设定：${updatedForm.coreScene}
- 👥 目标受众：${updatedForm.targetAudience}
- 🎨 视觉调性：${updatedForm.visualStyle}

目前系统已切换为 3 分屏空间。整个澄清过程中的对话记录和您的输入框均已安全保留在左屏，没有任何内容丢失。您可以在左侧屏幕继续与我交流微调。` }
    ]);

    setAppState('workspace');
  };

  const renderStepContent = () => {
    if (clarityStep === 1) {
      // Step 1: 场景选择
      const step1Options = [
        { id: 1, title: '文化博古/展馆大厅', desc: '适用于博物馆、美术馆或者科普馆等，支持单品深度讲解和多路线漫步规划。' },
        { id: 2, title: '景区物理路径地图/园区', desc: '适用于开阔户外或综合园区，强调基于 SLAM 地图的物理长路径巡逻及引导。' },
        { id: 3, title: '高新技术楼语参观', desc: '企业展厅、楼宇办公自动化，支持与外设接口联动，突显前沿黑科技硬件质感。' },
        { id: 4, title: '综合大厅事务导引', desc: '综合事务大厅、政务 or 医疗事务中心，智能解答指引与业务导览一体化。' },
        { id: 5, title: '其他自定义场景设定（请填写）', desc: '自定义导览场景，选中后可在下方输入框进行自主书写补充。' },
      ];
      return (
        <div className="flex flex-col gap-2.5">
          {step1Options.map((opt) => (
            <div
              key={opt.id}
              onClick={() => {
                setStep1Selected(opt.id);
                const isCustom = opt.id === 5;
                setClarificationForm(prev => ({
                  ...prev,
                  coreScene: isCustom ? (step1CustomText || '自定义导览场景') : opt.title
                }));
              }}
              className={`border rounded-xl p-3 cursor-pointer transition-all flex items-start gap-3 select-none text-left ${
                step1Selected === opt.id 
                  ? 'border-slate-850 bg-slate-50/60 ring-1 ring-slate-800/10' 
                  : 'border-slate-205 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                step1Selected === opt.id ? 'bg-black text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {opt.id}
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-700">{opt.title}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{opt.desc}</p>
              </div>
              {step1Selected === opt.id && (
                <Check className="w-4 h-4 text-black shrink-0 self-center" />
              )}
            </div>
          ))}

          {step1Selected === 5 && (
            <div className="mt-1 flex flex-col gap-1 select-none animate-slide-in">
              <label className="text-[10px] font-bold text-slate-500">请输入自定义导览场景：</label>
              <input
                type="text"
                placeholder="如：高端汽车销售展厅、太空探索巡回特展等..."
                className="w-full h-9 border border-slate-200 rounded-lg px-3 text-xs outline-none focus:border-black"
                value={step1CustomText}
                onChange={(e) => {
                  setStep1CustomText(e.target.value);
                  setClarificationForm(prev => ({ ...prev, coreScene: e.target.value || '自定义导览场景' }));
                }}
              />
            </div>
          )}
        </div>
      );
    } else if (clarityStep === 2) {
      // Step 2: 目标受众规划
      const step2Options = [
        { id: 1, title: '技术极客与创作者', desc: '爱好前沿科技、AI算法、多传感器联动的专业技术发烧友。' },
        { id: 2, title: '休闲大众游客', desc: '来到景区好玩好逛，听幽默生动讲解，路线指引平实清晰。' },
        { id: 3, title: '专家VIP贵宾', desc: '企业接待或重要外宾、高规格参观，讲解需周全严谨且具有深度。' },
        { id: 4, title: '其他特定群体设定（请填写）', desc: '自定义群体规划，选中后在下方手动填写。' },
      ];
      return (
        <div className="flex flex-col gap-2.5">
          {step2Options.map((opt) => (
            <div
              key={opt.id}
              onClick={() => {
                setStep2Selected(opt.id);
                const isCustom = opt.id === 4;
                setClarificationForm(prev => ({
                  ...prev,
                  targetAudience: isCustom ? (step2CustomText || '特定个性受众') : opt.title
                }));
              }}
              className={`border rounded-xl p-3 cursor-pointer transition-all flex items-start gap-3 select-none text-left ${
                step2Selected === opt.id 
                  ? 'border-slate-850 bg-slate-50/60 ring-1 ring-slate-800/10' 
                  : 'border-slate-202 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                step2Selected === opt.id ? 'bg-black text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {opt.id}
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-705 text-slate-700">{opt.title}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{opt.desc}</p>
              </div>
              {step2Selected === opt.id && (
                <Check className="w-4 h-4 text-black shrink-0 self-center" />
              )}
            </div>
          ))}

          {step2Selected === 4 && (
            <div className="mt-1 flex flex-col gap-1 select-none animate-slide-in">
              <label className="text-[10px] font-bold text-slate-500">请输入自定义目标群体：</label>
              <input
                type="text"
                placeholder="如：中小学生、高净值投资客户、社区居民等..."
                className="w-full h-9 border border-slate-200 rounded-lg px-3 text-xs outline-none focus:border-black"
                value={step2CustomText}
                onChange={(e) => {
                  setStep2CustomText(e.target.value);
                  setClarificationForm(prev => ({ ...prev, targetAudience: e.target.value || '自定义目标群体' }));
                }}
              />
            </div>
          )}
        </div>
      );
    } else {
      // Step 3: 视觉风格设计
      const step3Options = [
        { id: 1, title: '科技浅色极简主义', desc: '白色主调、浅灰侧边、弱边框与弱阴影，留白充足、科技感轻。' },
        { id: 2, title: '工业硬朗暗黑控制台', desc: '深沉暗色基元、高对比电子绿、荧光线段与图解控制框。' },
        { id: 3, title: '国学典雅水墨山水', desc: '宣纸微黄底色、古典石青朱砂配色、山水纹样衬底与雅致衬线体。' },
        { id: 4, title: '自定义风格设计（请填写）', desc: '自由指引！选中后，将在下方展开个性化表单描述。' },
      ];
      return (
        <div className="flex flex-col gap-2.5">
          {step3Options.map((opt) => (
            <div
              key={opt.id}
              onClick={() => {
                setStep3Selected(opt.id);
                const isCustom = opt.id === 4;
                setClarificationForm(prev => ({
                  ...prev,
                  visualStyle: isCustom ? (step3CustomText || '极简科技感') : opt.title
                }));
              }}
              className={`border rounded-xl p-3 cursor-pointer transition-all flex items-start gap-3 select-none text-left ${
                step3Selected === opt.id 
                  ? 'border-slate-850 bg-slate-50/60 ring-1 ring-slate-800/10' 
                  : 'border-slate-202 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                step3Selected === opt.id ? 'bg-black text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {opt.id}
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-705 text-slate-700">{opt.title}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{opt.desc}</p>
              </div>
              {step3Selected === opt.id && (
                <Check className="w-4 h-4 text-black shrink-0 self-center" />
              )}
            </div>
          ))}

          {step3Selected === 4 && (
            <div className="mt-1 flex flex-col gap-1 select-none animate-slide-in">
              <label className="text-[10px] font-bold text-slate-500">请输入自定义视觉风格偏好：</label>
              <input
                type="text"
                placeholder="如：赛博朋克霓虹风格、复古像素游戏机UI等..."
                className="w-full h-9 border border-slate-200 rounded-lg px-3 text-xs outline-none focus:border-black"
                value={step3CustomText}
                onChange={(e) => {
                  setStep3CustomText(e.target.value);
                  setClarificationForm(prev => ({ ...prev, visualStyle: e.target.value || '自定义视觉风格' }));
                }}
              />
            </div>
          )}
        </div>
      );
    }
  };

  // 步骤点击跳转功能
  const handleStepJump = (st: number) => {
    setClarityStep(st);
    setIsStepMenuOpen(false);
  };

  // 下一步动作
  const handleStepNext = () => {
    if (clarityStep < 3) {
      setClarityStep(clarityStep + 1);
    } else {
      // 完成对齐，直接转换成 3 分屏，内容、历史、对话框全程保持不变
      handleCompleteClarification();
    }
  };

  // 推荐快捷方式选项动作
  const handleRecommandAction = () => {
    if (clarityStep === 1) {
      setStep1Selected(1);
      setClarificationForm(prev => ({ ...prev, coreScene: '博物馆/展览馆' }));
    } else if (clarityStep === 2) {
      setStep2Selected(1);
      setClarificationForm(prev => ({ ...prev, targetAudience: '技术极客与创作者' }));
    } else {
      setStep3Selected(1);
      setClarificationForm(prev => ({ ...prev, visualStyle: '科技浅色极简主义' }));
    }
  };

  const renderClarificationForm = () => {
    if (appState === 'workspace') {
      return (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 select-none text-left shadow-2xs animate-fade-in w-full">
          <div className="flex items-center gap-2 mb-2.5 text-xs font-extrabold text-slate-800">
            <span>🎉</span>
            <span>需求澄清已完成且方案已被采用</span>
          </div>
          <div className="flex flex-col gap-2 text-xs text-slate-600 pl-1 font-semibold">
            <div className="flex items-center gap-1">
              <span>•</span>
              <strong className="text-slate-800 shrink-0">应用名称：</strong>
              <input
                type="text"
                maxLength={30}
                className="flex-1 max-w-[200px] h-7 bg-white/90 border border-slate-200 rounded px-2 text-xs font-bold text-slate-705 outline-none focus:border-black focus:ring-1 focus:ring-slate-900/10 ml-1 py-0.5 transition-colors"
                value={clarificationForm.appName}
                onChange={(e) => {
                  setClarificationForm(prev => ({ ...prev, appName: e.target.value }));
                }}
                placeholder="名称未定义..."
              />
            </div>
            <div>• <strong className="text-slate-800">核心场景：</strong>{clarificationForm.coreScene}</div>
            <div>• <strong className="text-slate-800">目标群体：</strong>{clarificationForm.targetAudience}</div>
            <div>• <strong className="text-slate-800">设计调性：</strong>{clarificationForm.visualStyle}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full flex flex-col gap-3.5 mt-1">
        {/* AI 思考诊断 */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col gap-2 transition-all shadow-xs text-left">
          <div 
            onClick={() => setIsDeepThinkingExpanded(!isDeepThinkingExpanded)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2 text-slate-600 text-[10px] font-bold">
              <span className="animate-spin text-slate-500 text-[11px] leading-none inline-block">⚙️</span>
              <span>深度思考过程 (已诊断)</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {isDeepThinkingExpanded ? '收起 ▴' : '展开 ▾'}
            </span>
          </div>
          
          {isDeepThinkingExpanded && (
            <div className="text-[9px] text-slate-500 leading-relaxed font-mono flex flex-col gap-1 pl-4 border-l-2 border-slate-200/80">
              <div>1. 正在解析输入需求「{submittedPromptText}」... OK</div>
              <div>2. 判定核心属性为：<span className="text-slate-800 font-bold">[智能体多机移动导览、室内/高精地图可达点指引]</span></div>
              <div>3. 启动多路交互模板框架：Step 1「场景选择」、Step 2「客群类型规划」、Step 3「艺术配图风格选择」。</div>
              <div className="text-slate-820 font-bold">4. 推荐方案已生成：请在下方互动并确认开发意向细节 🚀</div>
            </div>
          )}
        </div>

        {/* 三步问卷交互卡 */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02),_0_6px_20px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
          {/* 卡片顶栏 */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">🗒️</span>
              <span className="text-xs font-extrabold text-slate-700">
                {clarityStep === 1 ? '应用场景 · 请选择 1 项' : clarityStep === 2 ? '目标群体 · 请选择 1 项' : '整体视觉风格极性偏好 · 请选择 1 项'}
              </span>
            </div>

            {/* 指示拉单 */}
            <div className="relative shrink-0">
              <button 
                onClick={() => setIsStepMenuOpen(!isStepMenuOpen)}
                className="px-2 py-1 rounded-md border border-slate-200 hover:border-slate-300 bg-white text-[10px] font-bold text-slate-500 flex items-center gap-1 cursor-pointer transition-all"
              >
                <span>{clarityStep} / 3</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isStepMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 text-left">
                  {[
                    { step: 1, label: '1. 应用场景' },
                    { step: 2, label: '2. 目标群体' },
                    { step: 3, label: '3. 视觉风格' }
                  ].map((item) => (
                    <button
                      key={item.step}
                      onClick={() => handleStepJump(item.step)}
                      className="w-full text-left px-3 py-2 text-[10px] text-slate-600 hover:bg-slate-50 font-semibold flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      {clarityStep === item.step && <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 卡片填充区 */}
          <div className="p-4 flex flex-col gap-3.5 max-h-[380px] overflow-y-auto">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-left mb-0.5">
              选择以下最为符合的推荐
            </div>
            {renderStepContent()}
          </div>

          {/* 卡片动作条 */}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between shrink-0">
            <button 
              onClick={handleRecommandAction}
              className="text-[10px] font-bold text-slate-705 hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-202"
            >
              apply 推荐首选项
            </button>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  if (clarityStep < 3) {
                    setClarityStep(clarityStep + 1);
                  } else {
                    handleStepNext();
                  }
                }}
                className="h-8 px-2.5 rounded-lg hover:bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold cursor-pointer transition-colors"
              >
                跳过
              </button>
              <button 
                onClick={handleStepNext}
                className="h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
              >
                <span>{clarityStep === 3 ? '完成并进入工作区' : '继续'}</span>
                <span className="font-mono text-slate-300 text-[9px]">↵</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white font-sans text-slate-800">

      {appState === 'initial' ? (
        /* ============ 🚀 1. 初始状态 (Initial Component) ============ */
        <div className="absolute inset-0 z-10 w-full h-full bg-white flex flex-col items-center justify-center p-6 animate-fade-in relative">
          {/* 顶部弱修饰 */}
          <div className="absolute top-6 left-8 flex items-center gap-2 select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-slate-400 font-mono tracking-wider">AIGC WORKSPACE</span>
          </div>

          <div className="max-w-2xl w-full flex flex-col items-center gap-8 -mt-12">
            {/* 绿萌猫耳小机器人头像 */}
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-4xl shadow-sm select-none">
              🐱
            </div>

            <div className="text-center flex flex-col items-center gap-2 select-none animate-fade-in">
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                发个 Offer，捏个新员工
              </h1>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                描述一个职业角色，快速生成带路、对话、调用机器人能力的完整应用方案
              </p>
              

            </div>

            {/* 大型全能 Prompt 定配框 */}
            <div className="relative w-full bg-white border border-slate-205 rounded-2xl shadow-xs p-3.5 flex flex-col gap-3 transition-all focus-within:ring-2 focus-within:ring-slate-800/10 focus-within:border-slate-800">
              {predictionPills && predictionPills.length > 0 && (
                <div className="absolute left-[48px] -top-11 flex items-center gap-1.5 bg-white border border-slate-200/80 px-2 py-1.5 rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.06)] z-40 animate-slide-in">
                  {predictionPills.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInitialInput(p);
                        setPredictionPills(undefined);
                      }}
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        idx === predictionPillActive
                          ? 'bg-[#2979ff] text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/30'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* 输入行 */}
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-lg pl-1 shrink-0 select-none">💬</span>
                <input 
                  type="text" 
                  placeholder="创建一个AI导览机器人应用..."
                  className="flex-1 bg-transparent border-0 outline-none text-slate-800 text-sm placeholder-slate-300 py-1 font-semibold"
                  value={initialInput}
                  onChange={(e) => setInitialInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleToClarifying(initialInput || '创建一个AI导览机器人应用');
                    }
                  }}
                />

                {/* 发送/确认按钮 */}
                <button 
                  onClick={() => handleToClarifying(initialInput || '创建一个AI导览机器人应用')}
                  className="w-8 h-8 rounded-full bg-black hover:bg-slate-800 text-white flex items-center justify-center cursor-pointer transition-colors shrink-0 active:scale-95 border-0 p-0"
                  title="确认并提交"
                >
                  <ArrowUp size={15} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* 3个精品模版推荐 */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {templates.map((tpl, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleToClarifying(tpl.prompt, tpl.name)}
                  className="bg-white border border-slate-200 hover:border-slate-800 hover:shadow-xs rounded-xl p-4 flex flex-col gap-2.5 cursor-pointer transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{tpl.icon}</span>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-800 transition-all">
                      模版
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-705 mb-1 group-hover:text-black transition-colors">
                      {tpl.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-3">
                      {tpl.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ============ 🚀 联合主分屏空间 (Unified Multi-Column Canvas) ============ */
        <div className="absolute inset-0 z-10 w-full h-full flex flex-col overflow-hidden animate-fade-in relative shadow-[0_0_50px_rgba(0,0,0,0.03)] bg-white">
          
          {/* ============ 👑 全局最高信息层级 (Global Header Bar) ============ */}
          <header className="h-14 w-full bg-white border-b border-[#e6e6eb] px-6 select-none shrink-0 relative z-40 grid grid-cols-3 items-center">
            {/* 左侧：返回上一层级 */}
            <div className="flex items-center justify-start">
              <button 
                onClick={() => setAppState('initial')}
                className="h-9 px-4.5 rounded-full border border-[#e6e6eb] hover:bg-slate-50 text-slate-850 flex items-center gap-2 text-[13px] font-bold transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)] active:scale-[0.98] group"
                title="返回上一层级"
              >
                <ArrowLeft size={15} className="text-slate-600 transition-transform group-hover:-translate-x-0.5" />
                <span className="font-sans text-slate-700">返回</span>
              </button>
            </div>

            {/* 中间：应用名称与修改 */}
            <div className="flex items-center justify-center">
              <div 
                onClick={() => setIsRenameModalOpen(true)}
                className="flex items-center gap-1.5 group cursor-pointer hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-all"
                title="点击名称进行重命名"
              >
                <h1 className="text-xs font-extrabold text-[#19191d] tracking-tight truncate max-w-[280px] select-none">
                  {clarificationForm.appName}
                </h1>
                {/* 鼠标 hover 之后才出现修改按钮 📝 */}
                <span className="text-[12px] opacity-0 group-hover:opacity-100 transition-all duration-200 select-none leading-none scale-90 translate-x-1 group-hover:translate-x-0">
                  📝
                </span>
              </div>
            </div>

            {/* 右侧：动作控制集（预览、历史、发布） */}
            <div className="flex items-center justify-end gap-2">
              <button 
                onClick={() => {
                  setShowPreviewNotification(true);
                  setTimeout(() => setShowPreviewNotification(false), 4500);
                }}
                className="h-8 px-3 rounded-lg border border-[#e6e6eb] bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-all active:scale-[0.98]"
                title="模拟实时末梢预览"
              >
                <span>👁️</span> 实时预览
              </button>

              <button 
                onClick={() => setIsVersionModalOpen(true)}
                className="h-8 px-3 rounded-lg border border-[#e6e6eb] bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-all active:scale-[0.98]"
                title="查看编译版本与修改历史"
              >
                <span>⏱️</span> 历史记录
              </button>

              <button 
                onClick={() => setIsPublishModalOpen(true)}
                className="h-8 px-3.5 rounded-lg border-0 bg-slate-905 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-[0.98] flex items-center gap-1.5"
                title="将当前编成发布同步至真实人形终端"
              >
                <span>🚀</span> 发布部署
              </button>
            </div>

            {/* 顶部的轻量通知泡 (Toast Notification) */}
            <AnimatePresence>
              {showPreviewNotification && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-6 top-16 bg-white border border-[#e6e6eb] p-4.5 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] select-none z-50 text-left max-w-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm shrink-0">
                      💻
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">1:1 实机模拟预览已启用</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                        高精多端实时联调预览通道已安全激活！您当前可以通过中间大屏的<strong>“导控姿态离线拟真预览”</strong>以及下方的<strong>“IoT API Monitor”</strong>对传感器指令流进行 1:1 端测离线回溯与物理姿态演练。
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          {/* 下面的分屏主体 */}
          <div className="flex-1 w-full flex overflow-hidden relative">
            {appState === 'clarifying' ? (
              /* 需求澄清中，只有 1 屏，只有对话框和聊天记录 */
              <div className="w-full h-full flex justify-center bg-white overflow-y-auto">
                <LeftPanel 
                  chatMode={chatMode}
                  setChatMode={setChatMode}
                  isCopilotExpanded={isCopilotExpanded}
                  onToggleCopilot={toggleCopilot}
                  onClearMemory={handleClearMemory}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onOpenAttachmentDialog={handleOpenAttachmentDialog}
                  onSetInputText={setInputText}
                  inputText={inputText}
                  setInputText={setInputText}
                  onConfirmMapDelete={handleConfirmMapDelete}
                  onCancelMapDelete={handleCancelMapDelete}
                  selectedHistoryId={selectedHistoryId}
                  setSelectedHistoryId={setSelectedHistoryId}
                  chatHistoryRecords={initialChatHistory}
                  onRestoreHistory={handleRestoreHistory}
                  isFullWidth={true}
                  renderClarificationForm={renderClarificationForm}
                  resourceSections={resourceSections}
                  appName={clarificationForm.appName}
                  isEditingAppName={isEditingAppName}
                  tempAppName={tempAppName}
                  setIsEditingAppName={setIsEditingAppName}
                  setTempAppName={setTempAppName}
                  onRenameAppName={(newName) => {
                    setClarificationForm(prev => ({ ...prev, appName: newName }));
                  }}
                />
              </div>
            ) : (
              /* 等完成并进入工作区之后，才变成 3 屏，并且左屏是对话框和聊天记录（始终保持一致） */
              <div className="w-full h-full flex overflow-hidden relative">
                <LeftPanel 
                  chatMode={chatMode}
                  setChatMode={setChatMode}
                  isCopilotExpanded={isCopilotExpanded}
                  onToggleCopilot={toggleCopilot}
                  onClearMemory={handleClearMemory}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onOpenAttachmentDialog={handleOpenAttachmentDialog}
                  onSetInputText={setInputText}
                  inputText={inputText}
                  setInputText={setInputText}
                  onConfirmMapDelete={handleConfirmMapDelete}
                  onCancelMapDelete={handleCancelMapDelete}
                  selectedHistoryId={selectedHistoryId}
                  setSelectedHistoryId={setSelectedHistoryId}
                  chatHistoryRecords={initialChatHistory}
                  onRestoreHistory={handleRestoreHistory}
                  isFullWidth={false}
                  renderClarificationForm={renderClarificationForm}
                  resourceSections={resourceSections}
                  appName={clarificationForm.appName}
                  isEditingAppName={isEditingAppName}
                  tempAppName={tempAppName}
                  setIsEditingAppName={setIsEditingAppName}
                  setTempAppName={setTempAppName}
                  onRenameAppName={(newName) => {
                    setClarificationForm(prev => ({ ...prev, appName: newName }));
                  }}
                  onPublishClick={() => setIsPublishModalOpen(true)}
                  onVersionClick={() => setIsVersionModalOpen(true)}
                />

                {/* ===================== 中间屏: 人设、行为剧本、任务书 ===================== */}
                <CenterPanel 
                  currentScriptView={currentScriptView}
                  setCurrentScriptView={setCurrentScriptView}
                  personaName={personaName}
                  setPersonaName={setPersonaName}
                  toneStyle={toneStyle}
                  setToneStyle={setToneStyle}
                  voiceOption={voiceOption}
                  setVoiceOption={setVoiceOption}
                  activePanelTab={activePanelTab}
                  setActivePanelTab={setActivePanelTab}
                  highlightedAction={highlightedAction}
                  setHighlightedAction={setHighlightedAction}
                  docContents={docContents}
                  setDocContents={setDocContents}
                  jsonText={jsonText}
                  setJsonText={setJsonText}
                  tasks={tasks}
                  setTasks={setTasks}
                  currentMapName={currentMapName}
                  isMapConflict={isMapConflict}
                />

                {/* ===================== 右边屏: 资源库 (包括地图、知识库、动作、技能、MCP) ===================== */}
                <RightPanel 
                  resourceSections={resourceSections}
                  onOpenMapSelect={() => setIsMapSelectOpen(true)}
                  onDeleteResourceMap={handleDeleteResourceMap}
                  setResourceSections={setResourceSections}
                  setActivePanelTab={setActivePanelTab}
                  setCurrentScriptView={setCurrentScriptView}
                  highlightedAction={highlightedAction}
                  setHighlightedAction={setHighlightedAction}
                  onResourceReplacementConfirm={handleResourceReplacementConfirm}
                  currentMapName={currentMapName}
                  isMapConflict={isMapConflict}
                  docContents={docContents}
                  tasks={tasks}
                />
              </div>
            )}
          </div>

        </div>
      )}

      {/* macOS 拟真文件浏览器弹窗 */}
      <FileModal 
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        type={fileModalType}
        onFileSelect={handleFileSelectConfirm}
      />

      {/* 历史版本弹窗 */}
      <VersionModal 
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        onAction={(act, ver) => alert(`已触发版本 [${ver}] 的 [${act === 'install' ? '运行/安装' : '部署'}] 操作`)}
      />

      {/* 重命名配置弹窗 */}
      <RenameModal 
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        appName={clarificationForm.appName}
        appDescription={appDescription}
        onSave={(newName, newDesc) => {
          setClarificationForm(prev => ({ ...prev, appName: newName }));
          setAppDescription(newDesc);
        }}
      />

      {/* 发布配置弹窗 */}
      <PublishModal 
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        appName={clarificationForm.appName}
        description={appDescription}
        version="V2.5.0"
        onPublish={handlePublishConfirm}
      />

      {/* 地图切换对话选择框 */}
      <ResourceSelectModal 
        isOpen={isMapSelectOpen}
        onClose={() => setIsMapSelectOpen(false)}
        onSelect={handleSelectMap}
      />
    </div>
  );
}
