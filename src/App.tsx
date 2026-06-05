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

export const MAP_OPTIONS = [
  { id: '博物馆/美术馆', title: '博物馆/美术馆', desc: '适用于文化博展，支持精准展品讲解和多重路线导游。', recommend: true, icon: '🏛️' },
  { id: '科技产业园', title: '科技产业园', desc: '适用于户外园区，着重机器人长路径路径寻路与室外避障。', recommend: true, icon: '🏢' },
  { id: '智慧写字楼', title: '智慧写字楼', desc: '高精建模，联动前台迎宾闸机，实现楼层联动巡逻。', recommend: false, icon: '🏪' },
  { id: '历史古镇景区', title: '历史古镇景区', desc: '针对石板路、特色历史景点，提供生动风俗科普和路线引导。', recommend: false, icon: '🏞️' },
  { id: '室内外通用SLAM测试场', title: '室内外通用SLAM测试场', desc: '全地标覆盖，高敏度地标雷达，用于高级运动性能和接口调试。', recommend: false, icon: '📡' },
];

export const KNOWLEDGE_OPTIONS = [
  { id: '常规讲解问答库', title: '常规讲解问答库', desc: '包含日常寒暄、通识问题、系统帮助等高频交互内容。', recommend: true, icon: '📚' },
  { id: '展品/展项背景文案', title: '展品/展项背景文案', desc: '关于特定展览物或高技术设备的深度学术级资料。', recommend: true, icon: '🖼️' },
  { id: '安全应急引导须知', title: '安全应急引导须知', desc: '突发灾害、人流拥挤、避障、离场逃生路线和广播词库。', recommend: false, icon: '⚠️' },
  { id: '关联设备API文档说明', title: '关联设备API文档说明', desc: '智能家居、工控PLC、大屏幕系统外联调用的操作词云手册。', recommend: false, icon: '⚙️' },
  { id: '趣味互动彩蛋语料', title: '趣味互动彩蛋语料', desc: '冷笑话、魔性舞蹈报幕词、幽默段子与情感化机智应对语。', recommend: false, icon: '🌟' },
];

export const ACTION_OPTIONS = [
  { id: 'wave_hand', title: '招手致意 (wave_hand)', desc: '常用于欢迎寒暄与告别致谢，展示亲和力。', recommend: true, icon: '👋' },
  { id: 'point_front', title: '导览指引 (point_front)', desc: '指向前方特定标的或带路指引时的手势动作。', recommend: true, icon: '🧭' },
  { id: 'bow_bowing', title: '鞠躬致谢 (bow_bowing)', desc: '在深鞠躬、表达特别感谢或讲解结束后的高度礼貌手势。', recommend: false, icon: '🙇' },
  { id: 'nod', title: '点头动作 (nod)', desc: '认可、倾听或打招呼时的微幅点头。', recommend: false, icon: '🙆' },
  { id: 'thinking', title: '思考状态 (thinking)', desc: '单手托腮或原地踱步思考，增强AI计算中拟人感。', recommend: false, icon: '🤔' },
  { id: 'dance', title: '随机跳舞 (dance)', desc: '活跃现场气氛时的创意大跨步舞蹈展示。', recommend: false, icon: '💃' },
];

export const SKILL_OPTIONS = [
  { id: 'navigate_to_target', title: '导航寻路能力 (navigate_to_target)', desc: '下发特定点位名称，驱动轮式或双足底盘稳定自主移动可达。', recommend: true, icon: '🗺️' },
  { id: 'iot.device_control', title: 'IoT设备控制 (iot.device_control)', desc: '通过智能网关联控灯光、遮阳帘、大屏幕等多媒体硬件。', recommend: true, icon: '🔌' },
  { id: 'speak', title: '语音播报播放 (speak)', desc: '自研TTS高保真拟人发声、语调语速及情感等级动态可设。', recommend: true, icon: '🗣️' },
  { id: 'screen_show', title: '表情大屏交互 (screen_show)', desc: '在脸部或腹部副屏上投影情感拟人表情动画或PPT内容。', recommend: false, icon: '🖥️' },
  { id: 'obstacle_avoid', title: '避障重规划功能 (obstacle_avoid)', desc: '遇到前方临时障碍物时紧急停障及自研动态巡航绕行。', recommend: false, icon: '🛡️' },
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
  const [selectedMap, setSelectedMap] = useState<string>('博物馆/美术馆'); // 单选
  const [selectedKnowledge, setSelectedKnowledge] = useState<string[]>(['常规讲解问答库', '展品/展项背景文案']); // 多选
  const [selectedActions, setSelectedActions] = useState<string[]>(['wave_hand', 'point_front']); // 多选
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['navigate_to_target', 'iot.device_control', 'speak']); // 多选

  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);
  const [isKnowledgeExpanded, setIsKnowledgeExpanded] = useState<boolean>(false);
  const [isActionsExpanded, setIsActionsExpanded] = useState<boolean>(false);
  const [isSkillsExpanded, setIsSkillsExpanded] = useState<boolean>(false);
  const [clarityModalType, setClarityModalType] = useState<'map' | 'knowledge' | 'action' | 'skill' | null>(null);
  const [inlineSearchQuery, setInlineSearchQuery] = useState<string>('');

  useEffect(() => {
    setInlineSearchQuery('');
  }, [clarityModalType]);

  // 二次确认环节（Step 5）每个资源分类的折叠/展开状态
  const [isConfirmMapOpen, setIsConfirmMapOpen] = useState<boolean>(false);
  const [isConfirmKnowledgeOpen, setIsConfirmKnowledgeOpen] = useState<boolean>(false);
  const [isConfirmActionsOpen, setIsConfirmActionsOpen] = useState<boolean>(false);
  const [isConfirmSkillsOpen, setIsConfirmSkillsOpen] = useState<boolean>(false);

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

  const appInitialTasksFacility = [
    { 
      id: 'T1', 
      name: '区域设施指引与迎新', 
      desc: '引导访客去往前厅咨询。支持大堂周边配套洗手间、VIP茶休室的安全避障路径讲解。', 
      actions: [
        'inte.hri.special_pose(action="wave_hand")',
        'iot.query_nearby_facilities()',
        'inte.hri.say_something(text="您好，欢迎参观！洗手间和茶水歇息间在右侧走廊走到底。需要我带您过去吗？")'
      ],
      status: 'active', 
      priority: 'P0' 
    }
  ];

  const appInitialTasksPatrol = [
    {
      id: 'T1',
      name: '闭馆防盗与安防巡检检测',
      desc: '每日深夜闭馆后的大堂激光巡更，利用红外与视觉测绘，严密防范陌生人侵入大厅。',
      actions: [
        'navi.locomotion.navigate_to_target(target_name="门口")',
        'inte.hri.special_pose(action="thinking")',
        'hri.call_human()'
      ],
      status: 'active',
      priority: 'P0'
    }
  ];

  const [taskContents, setTaskContents] = useState<Record<string, string>>(() => ({
    defaultTask: JSON.stringify(appInitialTasks, null, 2),
    facilityTask: JSON.stringify(appInitialTasksFacility, null, 2),
    nightPatrolTask: JSON.stringify(appInitialTasksPatrol, null, 2)
  }));
  const [currentTaskView, setCurrentTaskView] = useState<string>('defaultTask');

  const [jsonText, setJsonText] = useState(() => taskContents[currentTaskView]);
  const [tasks, setTasks] = useState(appInitialTasks);

  // Synchronize standard single-view states (jsonText and tasks) whenever currentTaskView or local text changes
  useEffect(() => {
    const text = taskContents[currentTaskView] || '';
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === 'object' && parsed !== null) {
        setTasks(Array.isArray(parsed) ? parsed : (parsed.actions || []));
      }
    } catch (e) {
      // ignore
    }
  }, [currentTaskView]);


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
    setResourceSections(prev => prev.map(s => s.id === 'map' ? { ...s, items: [] } : s));
  };

  const handleToClarifying = (prompt: string, tplAppName?: string) => {
    setSubmittedPromptText(prompt);
    if (tplAppName) {
      setClarificationForm(prev => ({ ...prev, appName: tplAppName }));
    }
    
    // 初始化对话记录：保留系统首条消息，追加用户的自然语言指令和智能助手响应，平滑切入需求编排。
    setMessages([
      { sender: 'bot', text: '你好！我是你的智能导览编排助手。可以直接输入特定流程如“迎宾流程”、“休息区指引”触发智能节点。' },
      { sender: 'user', text: prompt },
      { sender: 'bot', text: `已经收到您的部署指令：“${prompt}”。\n\n系统已为您解析了相关的导览属性！请在下方卡片中进行高精地图、讲解知识库等核心资源的装配与确认。确认完成后，我将为您自动生成并编译出初始运行方案。` },
      { sender: 'system' as const, text: '', type: 'clarify-form' }
    ]);

    setAppState('clarifying');
    setClarityStep(1);
  };

  const toggleCopilot = () => {
    setIsCopilotExpanded(prev => !prev);
  };

  const handleOpenAttachmentDialog = (type: 'script' | 'skill') => {
    setFileModalType(type);
    setIsFileModalOpen(true);
  };

  const handleCancelMapDelete = () => {
    setMessages(prev => prev.filter(m => m.type !== 'warning-map'));
  };

  const handleRestoreHistory = (historyId: string) => {
    setSelectedHistoryId(historyId);
    setMessages(prev => [
      ...prev,
      { sender: 'system' as const, text: `成功从历史记录还原状态！已调阅历史记录 #${historyId}。` }
    ]);
  };

  const handleResourceReplacementConfirm = (newItems: any) => {
    setMessages(prev => [
      ...prev,
      { sender: 'system' as const, text: '🎉 资源替换与编译载入完成！' }
    ]);
  };

  const handleFileSelectConfirm = (file: any) => {
    setIsFileModalOpen(false);
    setMessages(prev => [
      ...prev,
      { sender: 'system' as const, text: `成功关联本地文件: ${file.name}` }
    ]);
  };

  const handlePublishConfirm = () => {
    setIsPublishModalOpen(false);
    setMessages(prev => [
      ...prev,
      { sender: 'system' as const, text: '🟢 应用已成功发布，正同步至现场人形终端！' }
    ]);
  };

  const handleSelectMap = (mapName: string) => {
    setIsMapSelectOpen(false);
    setSelectedMap(mapName);
    setMessages(prev => [
      ...prev,
      { sender: 'system' as const, text: `地图底图已切换为: ${mapName}` }
    ]);
  };

  const handleStepJump = (st: number) => {
    setClarityStep(st);
    setIsStepMenuOpen(false);
  };

  const handleCompleteClarification = () => {
    const finalName = `${selectedMap}智能导览系统`;

    const kbText = selectedKnowledge.join('、');
    const actText = selectedActions.map(a => {
      const found = ACTION_OPTIONS.find(o => o.id === a);
      return found ? found.title.split(' ')[0] : a;
    }).join('、');
    const skillText = selectedSkills.map(s => {
      const found = SKILL_OPTIONS.find(o => o.id === s);
      return found ? found.title.split(' ')[0] : s;
    }).join('、');

    const updatedForm = {
      appName: finalName,
      coreScene: `${selectedMap} (知识库: ${kbText})`,
      targetAudience: `搭载动作: ${actText}`,
      visualStyle: `集成技能: ${skillText}`,
      outputPreference: '智能体拓扑开发方案'
    };

    setClarificationForm(updatedForm);

    setResourceSections([
      { id: 'persona', title: '人设 (Persona)', items: ['智能拟人导览管家'] },
      { id: 'map', title: '地图 (SLAM Map)', items: [selectedMap] },
      { id: 'knowledge', title: '知识库 (Knowledge)', items: selectedKnowledge },
      { id: 'action', title: '动作与姿态 (Action)', items: selectedActions.map(a => {
          const found = ACTION_OPTIONS.find(o => o.id === a);
          return found ? found.title : a;
        }) 
      },
      { id: 'skill', title: '技能 (Skill)', items: selectedSkills.map(s => {
          const found = SKILL_OPTIONS.find(o => o.id === s);
          return found ? found.title : s;
        }) 
      }
    ]);

    setMessages(prev => [
      ...prev,
      { sender: 'system' as const, text: `🎉 需求对齐与澄清：【${finalName}】初始化编译完成！` },
      { sender: 'bot' as const, text: `恭喜！已基于您的偏好成功锁定了完整的智能向导方案。
      
- 🗺️ 地图底图：${selectedMap}
- 📚 关联知识：${kbText}
- 👋 动作姿态：${actText}
- 🔌 智能技能：${skillText}

目前系统已切换为 3 分屏空间。整个澄清过程中的对话记录和您的输入框均已安全保留在左屏，没有任何内容丢失。您可以在左侧屏幕继续与我交流微调。` }
    ]);

    setAppState('workspace');
  };

  const renderStepContent = () => {
    if (clarityStep === 1) {
      // Step 1: 地图选择（单选）
      const shownOptions = MAP_OPTIONS.filter(o => o.recommend || selectedMap === o.id);
      return (
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-2.5">
            {shownOptions.map((opt) => {
              const isSelected = selectedMap === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedMap(opt.id)}
                  className={`border rounded-xl p-3 cursor-pointer transition-all flex items-start gap-3 select-none text-left ${
                    isSelected 
                      ? 'border-slate-850 bg-slate-50/60 ring-1 ring-slate-800/10' 
                      : 'border-slate-205 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="text-lg shrink-0 self-start pt-0.5">{opt.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-705 text-slate-700 flex items-center gap-1.5 font-sans">
                      <span>{opt.title}</span>
                      {opt.recommend && (
                        <span className="scale-[0.85] bg-blue-50 border border-blue-200/50 text-blue-600 px-1 py-[1px] rounded font-semibold text-[8px] font-sans">
                          推荐
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{opt.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 self-center ${
                    isSelected ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
                  }`}>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              );
            })}
          </div>

          {MAP_OPTIONS.length > 0 && (
            <button
              onClick={() => setClarityModalType('map')}
              className="mt-1 h-9 rounded-xl border border-dashed border-slate-250 hover:border-slate-400 text-xs text-slate-500 hover:text-slate-850 font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 bg-slate-50/40 hover:bg-slate-50/85 font-sans"
            >
              <span>🔍 检索并管理全部 5 个底图资源</span>
            </button>
          )}
        </div>
      );
    } else if (clarityStep === 2) {
      // Step 2: 知识库选择（多选）
      const shownOptions = KNOWLEDGE_OPTIONS.filter(o => o.recommend || selectedKnowledge.includes(o.id));
      return (
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-2.5">
            {shownOptions.map((opt) => {
              const isSelected = selectedKnowledge.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedKnowledge(selectedKnowledge.filter(id => id !== opt.id));
                    } else {
                      setSelectedKnowledge([...selectedKnowledge, opt.id]);
                    }
                  }}
                  className={`border rounded-xl p-3 cursor-pointer transition-all flex items-start gap-3 select-none text-left ${
                    isSelected 
                      ? 'border-slate-850 bg-slate-50/60 ring-1 ring-slate-800/10' 
                      : 'border-slate-205 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="text-lg shrink-0 self-start pt-0.5">{opt.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-705 text-slate-700 flex items-center gap-1.5 font-sans">
                      <span>{opt.title}</span>
                      {opt.recommend && (
                        <span className="scale-[0.85] bg-blue-50 border border-blue-200/50 text-blue-600 px-1 py-[1px] rounded font-semibold text-[8px] font-sans">
                          推荐
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{opt.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 self-center transition-colors ${
                    isSelected ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-white'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3px]" />}
                  </div>
                </div>
              );
            })}
          </div>

          {KNOWLEDGE_OPTIONS.length > 0 && (
            <button
              onClick={() => setClarityModalType('knowledge')}
              className="mt-1 h-9 rounded-xl border border-dashed border-slate-250 hover:border-slate-400 text-xs text-slate-500 hover:text-slate-850 font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 bg-slate-50/40 hover:bg-slate-50/85 font-sans"
            >
              <span>🔍 检索并管理全部 5 个知识语料资源</span>
            </button>
          )}
        </div>
      );
    } else if (clarityStep === 3) {
      // Step 3: 动作选择（多选）
      const shownOptions = ACTION_OPTIONS.filter(o => o.recommend || selectedActions.includes(o.id));
      return (
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-2.5">
            {shownOptions.map((opt) => {
              const isSelected = selectedActions.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedActions(selectedActions.filter(id => id !== opt.id));
                    } else {
                      setSelectedActions([...selectedActions, opt.id]);
                    }
                  }}
                  className={`border rounded-xl p-3 cursor-pointer transition-all flex items-start gap-3 select-none text-left ${
                    isSelected 
                      ? 'border-slate-850 bg-slate-50/60 ring-1 ring-slate-800/10' 
                      : 'border-slate-205 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="text-lg shrink-0 self-start pt-0.5">{opt.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-705 text-slate-700 flex items-center gap-1.5 font-mono">
                      <span>{opt.title}</span>
                      {opt.recommend && (
                        <span className="scale-[0.85] bg-blue-50 border border-blue-200/50 text-blue-600 px-1 py-[1px] rounded font-semibold text-[8px] font-sans">
                          推荐
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{opt.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 self-center transition-colors ${
                    isSelected ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-white'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3px]" />}
                  </div>
                </div>
              );
            })}
          </div>

          {ACTION_OPTIONS.length > 0 && (
            <button
              onClick={() => setClarityModalType('action')}
              className="mt-1 h-9 rounded-xl border border-dashed border-slate-250 hover:border-slate-400 text-xs text-slate-500 hover:text-slate-850 font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 bg-slate-50/40 hover:bg-slate-50/85 font-sans"
            >
              <span>🔍 检索并管理全部 6 个身体动作资源</span>
            </button>
          )}
        </div>
      );
    } else if (clarityStep === 4) {
      // Step 4: 技能选择（多选）
      const shownOptions = SKILL_OPTIONS.filter(o => o.recommend || selectedSkills.includes(o.id));
      return (
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-2.5">
            {shownOptions.map((opt) => {
              const isSelected = selectedSkills.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedSkills(selectedSkills.filter(id => id !== opt.id));
                    } else {
                      setSelectedSkills([...selectedSkills, opt.id]);
                    }
                  }}
                  className={`border rounded-xl p-3 cursor-pointer transition-all flex items-start gap-3 select-none text-left ${
                    isSelected 
                      ? 'border-slate-850 bg-slate-50/60 ring-1 ring-slate-800/10' 
                      : 'border-slate-205 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="text-lg shrink-0 self-start pt-0.5">{opt.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-705 text-slate-700 flex items-center gap-1.5 font-mono">
                      <span>{opt.title}</span>
                      {opt.recommend && (
                        <span className="scale-[0.85] bg-blue-50 border border-blue-200/50 text-blue-600 px-1 py-[1px] rounded font-semibold text-[8px] font-sans">
                          推荐
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{opt.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 self-center transition-colors ${
                    isSelected ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-white'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3px]" />}
                  </div>
                </div>
              );
            })}
          </div>

          {SKILL_OPTIONS.length > 0 && (
            <button
              onClick={() => setClarityModalType('skill')}
              className="mt-1 h-9 rounded-xl border border-dashed border-slate-250 hover:border-slate-400 text-xs text-slate-500 hover:text-slate-850 font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 bg-slate-50/40 hover:bg-slate-50/85 font-sans"
            >
              <span>🔍 检索并管理全部 5 个智能接口技能</span>
            </button>
          )}
        </div>
      );
    } else {
      // Step 5: 原地二次确认（显示已选资源，支持折叠与单独展开调整）
      return (
        <div className="flex flex-col gap-3 text-left select-none">
          <div className="rounded-xl border border-blue-100 bg-blue-50/20 p-2.5 leading-relaxed text-slate-600 text-[10px] font-medium font-sans">
            💡 已基于前面的步骤智能生成基础方案！您可以直接在下方点击各类资源展开微调。
          </div>

          {/* 地图二次核对 */}
          <div className="border border-slate-205 rounded-xl bg-slate-50/20 p-2.5 flex flex-col gap-2 transition-all">
            <div 
              onClick={() => setIsConfirmMapOpen(prev => !prev)}
              className="flex items-center justify-between cursor-pointer select-none py-0.5"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span>🗺️</span>
                <span>高精底图配置 (单选)</span>
                <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono">
                  1
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isConfirmMapOpen ? 'rotate-180' : ''}`} />
            </div>

            {!isConfirmMapOpen ? (
              <div className="flex flex-wrap gap-1.5 mt-0.5 font-sans">
                {MAP_OPTIONS.filter(opt => selectedMap === opt.id).map(opt => (
                  <div 
                    key={opt.id}
                    onClick={() => setIsConfirmMapOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-slate-700 text-[11px] font-medium transition-all cursor-pointer hover:bg-slate-50 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 mt-0.5 font-sans">
                {MAP_OPTIONS.map(opt => {
                  const isSelected = selectedMap === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedMap(opt.id)}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer select-none transition-all text-[11px] ${
                        isSelected 
                          ? 'border-slate-800 bg-white text-slate-800 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.03)]' 
                          : 'border-slate-200 bg-white/50 hover:bg-white text-slate-500'
                      }`}
                    >
                      <span className="text-base">{opt.icon}</span>
                      <span className="flex-1 truncate text-left">{opt.title}</span>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-slate-800 bg-slate-900' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 讲解知识库二次核对 */}
          <div className="border border-slate-205 rounded-xl bg-slate-50/20 p-2.5 flex flex-col gap-2 transition-all">
            <div 
              onClick={() => setIsConfirmKnowledgeOpen(prev => !prev)}
              className="flex items-center justify-between cursor-pointer select-none py-0.5"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span>📚</span>
                <span>讲解知识库 (多选)</span>
                <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono">
                  {selectedKnowledge.length}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isConfirmKnowledgeOpen ? 'rotate-180' : ''}`} />
            </div>

            {!isConfirmKnowledgeOpen ? (
              <div className="flex flex-wrap gap-1.5 mt-0.5 font-sans">
                {selectedKnowledge.length === 0 ? (
                  <span className="text-[10px] text-slate-400 italic">未配置讲解语料 (点击展开)</span>
                ) : (
                  KNOWLEDGE_OPTIONS.filter(opt => selectedKnowledge.includes(opt.id)).map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => setIsConfirmKnowledgeOpen(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-slate-700 text-[11px] font-medium transition-all cursor-pointer hover:bg-slate-50 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.title}</span>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 mt-0.5 font-sans">
                {KNOWLEDGE_OPTIONS.map(opt => {
                  const isSelected = selectedKnowledge.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedKnowledge(selectedKnowledge.filter(id => id !== opt.id));
                        } else {
                          setSelectedKnowledge([...selectedKnowledge, opt.id]);
                        }
                      }}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer select-none transition-all text-[11px] ${
                        isSelected 
                          ? 'border-slate-800 bg-white text-slate-800 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.03)]' 
                          : 'border-slate-200 bg-white/50 hover:bg-white text-slate-500'
                      }`}
                    >
                      <span className="text-base">{opt.icon}</span>
                      <span className="flex-1 truncate text-left">{opt.title}</span>
                      <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3.5px]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 动作库二次核对 */}
          <div className="border border-slate-205 rounded-xl bg-slate-50/20 p-2.5 flex flex-col gap-2 transition-all">
            <div 
              onClick={() => setIsConfirmActionsOpen(prev => !prev)}
              className="flex items-center justify-between cursor-pointer select-none py-0.5"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span>👋</span>
                <span>肢体动作搭载 (多选)</span>
                <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono">
                  {selectedActions.length}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isConfirmActionsOpen ? 'rotate-180' : ''}`} />
            </div>

            {!isConfirmActionsOpen ? (
              <div className="flex flex-wrap gap-1.5 mt-0.5 font-sans">
                {selectedActions.length === 0 ? (
                  <span className="text-[10px] text-slate-400 italic">未配置肢体动作 (点击展开)</span>
                ) : (
                  ACTION_OPTIONS.filter(opt => selectedActions.includes(opt.id)).map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => setIsConfirmActionsOpen(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-slate-700 text-[11px] font-medium transition-all cursor-pointer hover:bg-slate-50 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.title}</span>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 mt-0.5 font-sans">
                {ACTION_OPTIONS.map(opt => {
                  const isSelected = selectedActions.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedActions(selectedActions.filter(id => id !== opt.id));
                        } else {
                          setSelectedActions([...selectedActions, opt.id]);
                        }
                      }}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer select-none transition-all text-[11px] ${
                        isSelected 
                          ? 'border-slate-800 bg-white text-slate-800 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.03)]' 
                          : 'border-slate-200 bg-white/50 hover:bg-white text-slate-500'
                      }`}
                    >
                      <span className="text-base">{opt.icon}</span>
                      <span className="flex-1 truncate text-left">{opt.title}</span>
                      <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3.5px]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 技能库二次核对 */}
          <div className="border border-slate-205 rounded-xl bg-slate-50/20 p-2.5 flex flex-col gap-2 transition-all">
            <div 
              onClick={() => setIsConfirmSkillsOpen(prev => !prev)}
              className="flex items-center justify-between cursor-pointer select-none py-0.5"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span>🔌</span>
                <span>接口技能装配 (多选)</span>
                <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono">
                  {selectedSkills.length}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isConfirmSkillsOpen ? 'rotate-180' : ''}`} />
            </div>

            {!isConfirmSkillsOpen ? (
              <div className="flex flex-wrap gap-1.5 mt-0.5 font-sans">
                {selectedSkills.length === 0 ? (
                  <span className="text-[10px] text-slate-400 italic">未配置底层接口技能 (点击展开)</span>
                ) : (
                  SKILL_OPTIONS.filter(opt => selectedSkills.includes(opt.id)).map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => setIsConfirmSkillsOpen(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-slate-700 text-[11px] font-medium transition-all cursor-pointer hover:bg-slate-50 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.title}</span>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 mt-0.5 font-sans">
                {SKILL_OPTIONS.map(opt => {
                  const isSelected = selectedSkills.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedSkills(selectedSkills.filter(id => id !== opt.id));
                        } else {
                          setSelectedSkills([...selectedSkills, opt.id]);
                        }
                      }}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer select-none transition-all text-[11px] ${
                        isSelected 
                          ? 'border-slate-800 bg-white text-slate-800 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.03)]' 
                          : 'border-slate-200 bg-white/50 hover:bg-white text-slate-500'
                      }`}
                    >
                      <span className="text-base">{opt.icon}</span>
                      <span className="flex-1 truncate text-left">{opt.title}</span>
                      <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3.5px]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  // 下一步动作
  const handleStepNext = () => {
    if (clarityStep < 5) {
      setClarityStep(clarityStep + 1);
    } else {
      handleCompleteClarification();
    }
  };

  // 推荐快捷方式选项动作
  const handleRecommandAction = () => {
    if (clarityStep === 1) {
      setSelectedMap('博物馆/美术馆');
    } else if (clarityStep === 2) {
      setSelectedKnowledge(['常规讲解问答库', '展品/展项背景文案']);
    } else if (clarityStep === 3) {
      setSelectedActions(['wave_hand', 'point_front']);
    } else if (clarityStep === 4) {
      setSelectedSkills(['navigate_to_target', 'iot.device_control', 'speak']);
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
              <div>3. 启动多路交互模板框架：Step 1「高精SLAM地图底图」、Step 2「关联讲解知识库语料」、Step 3「肢体姿态动作集成」、Step 4「机器人底层智能接口装配」。</div>
              <div className="text-slate-820 font-bold">4. 推荐方案已生成：请在下方互动并确认开发意向细节 🚀</div>
            </div>
          )}
        </div>
 
        {/* 五步问卷交互卡 */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02),_0_6px_20px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col relative">
          {/* 卡片顶栏 */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">🗒️</span>
              <span className="text-xs font-extrabold text-slate-705 text-slate-700">
                {clarityStep === 1 ? '高精地图配置 · 请选择 1 项' : clarityStep === 2 ? '讲解知识库配置 · 请选择(多选)' : clarityStep === 3 ? '动作姿态搭载 · 请选择(多选)' : clarityStep === 4 ? '集成技能装配 · 请选择(多选)' : '方案原地二次核对与调整'}
              </span>
            </div>
 
            {/* 指示拉单 */}
            <div className="relative shrink-0">
              <button 
                onClick={() => setIsStepMenuOpen(!isStepMenuOpen)}
                className="px-2 py-1 rounded-md border border-slate-200 hover:border-slate-300 bg-white text-[10px] font-bold text-slate-500 flex items-center gap-1 cursor-pointer transition-all"
              >
                <span>{clarityStep} / 5</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
 
              {isStepMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 text-left">
                  {[
                    { step: 1, label: '1. SLAM 地图配置' },
                    { step: 2, label: '2. 关联讲解知识库' },
                    { step: 3, label: '3. 肢体动作集成' },
                    { step: 4, label: '4. 底层接口技能' },
                    { step: 5, label: '5. 方案确认核对' }
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
            <div className="text-[9px] font-bold text-slate-405 text-slate-400 uppercase tracking-wider text-left mb-0.5">
              配置应用所需的核心资源
            </div>
            {renderStepContent()}
          </div>
 
          {/* 卡片动作条 */}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between shrink-0">
            <button 
              onClick={handleRecommandAction}
              className="text-[10px] font-bold text-slate-705 hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-202"
            >
              应用 推荐首选项
            </button>
 
            <div className="flex items-center gap-2">
              <button 
                disabled={clarityStep === 1}
                onClick={() => {
                  if (clarityStep > 1) {
                    setClarityStep(clarityStep - 1);
                  }
                }}
                className={`h-8 px-2.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-colors ${
                  clarityStep === 1 
                    ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50/50' 
                    : 'border-slate-202 hover:bg-slate-100 text-slate-500 bg-white'
                }`}
              >
                上一步
              </button>
              <button 
                onClick={handleStepNext}
                className="h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
              >
                <span>{clarityStep === 5 ? '确认方案并开发' : '继续'}</span>
                <span className="font-mono text-slate-300 text-[9px]">↵</span>
              </button>
            </div>
          </div>

          {/* 在原地弹出浮窗进行搜索和选择 */}
          {clarityModalType && (
            <div className="absolute inset-0 bg-white z-40 flex flex-col">
              {/* 标题栏 */}
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between shrink-0">
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-xs font-bold text-slate-805">
                    {clarityModalType === 'map' ? '🗺️ 检索并管理地图底图资源' :
                     clarityModalType === 'knowledge' ? '📚 检索并管理知识库语料资源' :
                     clarityModalType === 'action' ? '👋 检索并管理肢体动作姿态' :
                     '🔌 检索并管理自研接口技能'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium font-sans">
                    进行实时搜索过滤并确认选择
                  </span>
                </div>
                <button 
                  onClick={() => setClarityModalType(null)}
                  className="w-7 h-7 rounded-lg bg-slate-100/80 hover:bg-slate-200/90 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer border-0 p-0 text-xs font-bold"
                  title="关闭搜索"
                >
                  ✕
                </button>
              </div>

              {/* 搜索框 */}
              <div className="p-3 bg-slate-50/20 border-b border-slate-100 shrink-0">
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 text-xs">🔍</span>
                  <input 
                    type="text" 
                    placeholder="输入检索关键词或功能描述..."
                    value={inlineSearchQuery}
                    onChange={(e) => setInlineSearchQuery(e.target.value)}
                    className="w-full h-8 pl-8 pr-12 bg-white border border-slate-200 rounded-lg text-xs placeholder-slate-400 outline-none focus:border-slate-500 hover:border-slate-350 transition-all text-left font-sans"
                  />
                  {inlineSearchQuery && (
                    <button
                      onClick={() => setInlineSearchQuery('')}
                      className="absolute right-3 text-[10px] text-slate-400 hover:text-slate-650 cursor-pointer border-0 bg-transparent font-sans"
                    >
                      清除
                    </button>
                  )}
                </div>
              </div>

              {/* 选项滚动列表 */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
                {(() => {
                  const opts = clarityModalType === 'map' ? MAP_OPTIONS :
                               clarityModalType === 'knowledge' ? KNOWLEDGE_OPTIONS :
                               clarityModalType === 'action' ? ACTION_OPTIONS :
                               SKILL_OPTIONS;
                  const query = inlineSearchQuery.toLowerCase();
                  const filtered = opts.filter(o => 
                    o.title.toLowerCase().includes(query) || 
                    o.desc.toLowerCase().includes(query)
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="py-12 flex flex-col items-center justify-center text-slate-405 gap-1 select-none font-sans">
                        <span className="text-[15px]">🔍</span>
                        <span className="text-[11px] font-medium">无匹配项</span>
                      </div>
                    );
                  }

                  return filtered.map((opt) => {
                    // 判断是否选中
                    let isSelected = false;
                    if (clarityModalType === 'map') {
                      isSelected = selectedMap === opt.id;
                    } else if (clarityModalType === 'knowledge') {
                      isSelected = selectedKnowledge.includes(opt.id);
                    } else if (clarityModalType === 'action') {
                      isSelected = selectedActions.includes(opt.id);
                    } else if (clarityModalType === 'skill') {
                      isSelected = selectedSkills.includes(opt.id);
                    }

                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          if (clarityModalType === 'map') {
                            setSelectedMap(opt.id);
                          } else if (clarityModalType === 'knowledge') {
                            if (isSelected) {
                              setSelectedKnowledge(selectedKnowledge.filter(id => id !== opt.id));
                            } else {
                              setSelectedKnowledge([...selectedKnowledge, opt.id]);
                            }
                          } else if (clarityModalType === 'action') {
                            if (isSelected) {
                              setSelectedActions(selectedActions.filter(id => id !== opt.id));
                            } else {
                              setSelectedActions([...selectedActions, opt.id]);
                            }
                          } else if (clarityModalType === 'skill') {
                            if (isSelected) {
                              setSelectedSkills(selectedSkills.filter(id => id !== opt.id));
                            } else {
                              setSelectedSkills([...selectedSkills, opt.id]);
                            }
                          }
                        }}
                        className={`border rounded-xl p-3 cursor-pointer transition-all flex items-start gap-3 select-none text-left ${
                          isSelected 
                            ? 'border-slate-800 bg-slate-50/70 ring-1 ring-slate-800/10' 
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="text-base shrink-0 self-start">{opt.icon}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-sans leading-none">
                            <span>{opt.title}</span>
                            {opt.recommend && (
                              <span className="bg-blue-50 text-blue-600 px-1 py-[1.5px] rounded text-[8px] border border-blue-100">
                                推荐
                              </span>
                            )}
                          </h4>
                          <p className="text-[10px] text-slate-450 mt-1.5 leading-relaxed font-sans">
                            {opt.desc}
                          </p>
                        </div>
                        {clarityModalType === 'map' ? (
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 self-center ${
                            isSelected ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        ) : (
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 self-center ${
                            isSelected ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-white'
                          }`}>
                            {isSelected && <span className="text-[9px] font-extrabold select-none">✓</span>}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>

              {/* 底部确认栏 */}
              <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0 font-sans">
                <span className="text-[10px] text-slate-450 font-semibold">
                  已装载 {clarityModalType === 'map' ? '1' : 
                          clarityModalType === 'knowledge' ? selectedKnowledge.length :
                          clarityModalType === 'action' ? selectedActions.length :
                          selectedSkills.length} 个配置
                </span>
                <button
                  onClick={() => setClarityModalType(null)}
                  className="h-8 px-4 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl border-0 cursor-pointer transition-all shrink-0 shadow-2xs"
                >
                  确认并更新
                </button>
              </div>
            </div>
          )}
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
                {(() => {
                  const handleUpdateJsonText = (newVal: string) => {
                  setJsonText(newVal);
                  setTaskContents(prev => ({
                    ...prev,
                    [currentTaskView]: newVal
                  }));
                  try {
                    const parsed = JSON.parse(newVal);
                    if (typeof parsed === 'object' && parsed !== null) {
                      setTasks(Array.isArray(parsed) ? parsed : (parsed.actions || []));
                    }
                  } catch (e) {
                    // ignore
                  }
                };

                const handleUpdateTasks = (newTasks: any[]) => {
                  setTasks(newTasks);
                  setTaskContents(prev => {
                    try {
                      const text = prev[currentTaskView] || '[]';
                      const parsed = JSON.parse(text);
                      if (Array.isArray(parsed)) {
                        return { ...prev, [currentTaskView]: JSON.stringify(newTasks, null, 2) };
                      } else if (parsed && typeof parsed === 'object') {
                        parsed.actions = newTasks;
                        return { ...prev, [currentTaskView]: JSON.stringify(parsed, null, 2) };
                      }
                    } catch (e) {}
                    return { ...prev, [currentTaskView]: JSON.stringify(newTasks, null, 2) };
                  });
                };

                return (
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
                    setJsonText={handleUpdateJsonText}
                    tasks={tasks}
                    setTasks={handleUpdateTasks}
                    currentMapName={currentMapName}
                    isMapConflict={isMapConflict}
                    taskContents={taskContents}
                    setTaskContents={setTaskContents}
                    currentTaskView={currentTaskView}
                    setCurrentTaskView={setCurrentTaskView}
                  />
                );
              })()}

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
