import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  Trash2, 
  ArrowRight, 
  Clock, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  ShieldAlert, 
  User, 
  AudioLines, 
  Compass, 
  CheckCircle2, 
  CircleDot, 
  Smile, 
  Zap, 
  Heading, 
  Bold, 
  Italic, 
  Strikethrough, 
  Link, 
  List, 
  ListOrdered, 
  ListTodo, 
  Send, 
  Minus, 
  Code, 
  Code2,
  Undo2,
  Redo2,
  Plus,
  History,
  X,
  FileText,
  BookOpen
} from 'lucide-react';
import { ResourceSection } from '../types';

export const PRESET_ACTIONS = [
  { id: 'wave_hand', label: '挥手欢迎动作', icon: '👋', desc: '双臂缓慢向上抬起，面带标准拟人微笑，躯干微前倾 5 度持续致意' },
  { id: 'point_front', label: '指引前方动作', icon: '👉', desc: '单手手掌斜向上方伸出，眼睛注视访客并轻轻转头看向推荐参观路径' },
  { id: 'screen_show', label: '屏幕展示动作', icon: '📺', desc: '侧身朝向大音视频播放屏幕，手背朝屏幕由下至上轻拂示意内容' },
  { id: 'talk_gesture', label: '讲解手势动作', icon: '👐', desc: '双手在胸前进行有节奏的开合交互摆动，展现解说事物时的拟真情感起伏' },
  { id: 'bow_bowing', label: '送别致意动作', icon: '🙇', desc: '伴随15度微微躬声，双手摆起并缓速摇动，表达诚挚谢意与再次光临的祝愿' },
  { id: 'nod', label: '点头肯定与赞同动作', icon: '✨', desc: '在人声输入空闲或需要表示认可时，轻快点头两次，头部伴随2度倾斜' },
  { id: 'dance', label: '极客扭转跳舞动作序列', icon: '💃', desc: '伴随迎宾背景音乐进行的高难度、多关节机械街舞及酷炫交互循环展示律动' },
  { id: 'thinking', label: '抱臂思考微表情手势', icon: '🤔', desc: '双臂抱于胸前，头部斜倾 8 度，双目做微缩对焦状，动作伴随呼吸起伏' }
];

const PRESET_TASK_SNIPPETS = [
  { 
    label: '肢体动作节点', 
    desc: '插入特殊肢体致意动作',
    type: 'pose',
    obj: {
      action: "inte.hri.special_pose",
      description: "迎宾致意姿态手势",
      params: { action: "wave_hand" }
    }
  },
  { 
    label: '语音对话发音', 
    desc: '播报固定话术与讲解词',
    type: 'audio',
    obj: {
      action: "inte.hri.say_something",
      description: "语音合成固定对话解说",
      params: { text: "您好，欢迎莅临小鹏总部，请随我前往智驾长廊参观体验。" }
    }
  },
  { 
    label: '高精激光导航', 
    desc: '规划车辆展区安全路径点',
    type: 'navi',
    obj: {
      action: "navi.locomotion.navigate_to_target",
      description: "高精激光SLAM制导前往目标点",
      params: { target_name: "门口", timeout: 300 }
    }
  },
  { 
    label: '物理大屏幕联动', 
    desc: '控制馆内多媒体广播播放',
    type: 'screen',
    obj: {
      action: "iot.trigger_screen",
      description: "联动机电及多媒体演示屏广播",
      params: { command: "play_video" }
    }
  }
];

interface CenterPanelProps {
  currentScriptView: string;
  setCurrentScriptView: (view: string) => void;
  personaName: string;
  setPersonaName: (name: string) => void;
  toneStyle: string;
  setToneStyle: (tone: string) => void;
  voiceOption: 'male' | 'female';
  setVoiceOption: (voice: 'male' | 'female') => void;
  activePanelTab: 'script' | 'task' | 'persona';
  setActivePanelTab: (tab: 'script' | 'task' | 'persona') => void;
  highlightedAction?: string | null;
  setHighlightedAction?: (act: string | null) => void;
  docContents?: Record<string, string>;
  setDocContents?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  jsonText?: string;
  setJsonText?: (text: string) => void;
  tasks?: any[];
  setTasks?: (tasks: any[]) => void;
  currentMapName?: string;
  isMapConflict?: boolean;
  taskContents?: Record<string, string>;
  setTaskContents?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  currentTaskView?: string;
  setCurrentTaskView?: (view: string) => void;
}

const ACTION_TO_KEYWORD: Record<string, string> = {
  '挥手欢迎动作': 'wave_hand',
  '指引前方动作': 'point_front',
  '屏幕展示动作': 'screen_show',
  '讲解手势动作': 'talk_gesture',
  '送别致意动作': 'bow_bowing',
  '深度弯腰鞠躬动作': 'bow_bowing',
  '点头肯定与赞同动作': 'nod'
};

const SKILL_TO_KEYWORDS: Record<string, string[]> = {
  '使用一楼前台打印机': ['post_print_job', 'T3', '打印', 'print'],
  '查询今日活动排期': ['calendar', 'T1', '排期', '活动'],
  '控制展区大屏播放': ['screen', 'T2', '大屏', '播放'],
  '查询馆内设施位置': ['nearby', 'T3', '设施', '位置']
};

export default function CenterPanel({
  currentScriptView,
  setCurrentScriptView,
  personaName,
  setPersonaName,
  toneStyle,
  setToneStyle,
  voiceOption,
  setVoiceOption,
  activePanelTab,
  setActivePanelTab,
  highlightedAction = '挥手欢迎动作',
  setHighlightedAction,
  docContents: propDocContents,
  setDocContents: propSetDocContents,
  jsonText: propJsonText,
  setJsonText: propSetJsonText,
  tasks: propTasks,
  setTasks: propSetTasks,
  currentMapName = '小鹏科技园大堂地图',
  isMapConflict = false,
  taskContents: propTaskContents,
  setTaskContents: propSetTaskContents,
  currentTaskView: propCurrentTaskView,
  setCurrentTaskView: propSetCurrentTaskView
}: CenterPanelProps) {

  // 任务书默认行动（actions类型）保持高品质动作
  const initialTasks = [
    {
      action: "inte.hri.special_pose",
      description: "挥手打招呼，吸引访客注意",
      params: { action: "wave_hand" }
    },
    {
      action: "inte.hri.say_something",
      description: "迎宾问候，询问目标车型",
      params: { text: "您好，欢迎光临小鹏汽车总部！我是您的智能导购助手Iron，请问您想了解哪款车型？" }
    },
    {
      action: "inte.hri.waiting",
      description: "等待用户告知目标车型或需求",
      params: { slience_time: 30 }
    },
    {
      action: "inte.hri.say_something",
      description: "引导用户前往目标展区",
      params: { text: "好的，请跟我前往展区，我来为您详细介绍。" }
    },
    {
      action: "navi.locomotion.navigate_to_target",
      description: "导航到目标车型展区",
      params: { target_name: "展区", timeout: 300 }
    },
    {
      action: "inte.hri.say_something",
      description: "到达展区后的引导语",
      params: { text: "我们到了，让我为您介绍这款车的亮点。" }
    },
    {
      action: "inte.hri.special_pose",
      description: "面向用户准备讲解",
      params: { action: "speak_front" }
    },
    {
      action: "inte.hri.omni_question",
      description: "围绕当前车型进行亮点讲解并互动提问",
      params: { question: "围绕当前车型做30秒核心亮点讲解：外观设计、智能座舱、XNGP智能驾驶、续航与补能，保持专业导购语气，并补充一条互动提问以了解用户看法" }
    },
    {
      action: "inte.hri.waiting",
      description: "等待用户提问或反馈",
      params: { slience_time: 60 }
    },
    {
      action: "inte.hri.say_something",
      description: "结束语，感谢用户到访",
      params: { text: "本次导购就到这里，感谢您莅临小鹏汽车总部！希望您对心仪的车型有了更深入的了解。再见！" }
    },
    {
      action: "navi.locomotion.navigate_to_target",
      description: "导购结束，机器人返回门口",
      params: { target_name: "门口", timeout: 300 }
    },
    {
      action: "inte.hri.wait_trigger",
      description: "以鞠躬手势结束本次服务",
      params: { gesture_type: "bowing", timeout: 30 }
    }
  ];

  const defaultTaskJson = `{
  "task_name": "小鹏总部导购",
  "actions": [
    {
      "action": "inte.hri.special_pose",
      "description": "挥手打招呼，吸引访客注意",
      "params": {
        "action": "wave_hand"
      }
    },
    {
      "action": "inte.hri.say_something",
      "description": "迎宾问候，询问目标车型",
      "params": {
        "text": "您好，欢迎光临小鹏汽车总部！我是您的智能导购助手Iron，请问您想了解哪款车型？"
      }
    },
    {
      "action": "inte.hri.waiting",
      "description": "等待用户告知目标车型或需求",
      "params": {
        "slience_time": 30
      }
    },
    {
      "action": "inte.hri.say_something",
      "description": "引导用户前往目标展区",
      "params": {
        "text": "好的，请跟我前往展区，我来为您详细介绍。"
      }
    },
    {
      "action": "navi.locomotion.navigate_to_target",
      "description": "导航到目标车型展区",
      "params": {
        "target_name": "展区",
        "timeout": 300
      }
    },
    {
      "action": "inte.hri.say_something",
      "description": "到达展区后的引导语",
      "params": {
        "text": "我们到了，让我为您介绍这款车的亮点。"
      }
    },
    {
      "action": "inte.hri.special_pose",
      "description": "面向用户准备讲解",
      "params": {
        "action": "speak_front"
      }
    },
    {
      "action": "inte.hri.omni_question",
      "description": "围绕当前车型进行亮点讲解并互动提问",
      "params": {
        "question": "围绕当前车型做30秒核心亮点讲解：外观设计、智能座舱、XNGP智能驾驶、续航与补能，保持专业导购语气，并补充一条互动提问以了解用户看法"
      }
    },
    {
      "action": "inte.hri.waiting",
      "description": "等待用户提问或反馈",
      "params": {
        "slience_time": 60
      }
    },
    {
      "action": "inte.hri.say_something",
      "description": "结束语，感谢用户到访",
      "params": {
        "text": "本次导购就到这里，感谢您莅临小鹏汽车总部！希望您对心仪的车型有了更深入的了解。再见！"
      }
    },
    {
      "action": "navi.locomotion.navigate_to_target",
      "description": "导购结束，机器人返回门口",
      "params": {
        "target_name": "门口",
        "timeout": 300
      }
    },
    {
      "action": "inte.hri.wait_trigger",
      "description": "以鞠躬手势结束本次服务",
      "params": {
        "gesture_type": "bowing",
        "timeout": 30
      }
    }
  ]
}`;

  const [localJsonText, setLocalJsonText] = useState(() => defaultTaskJson);
  const [localTasks, setLocalTasks] = useState(initialTasks);
  const [localDocContents, setLocalDocContents] = useState({
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
  - \`inte.hri.waiting(slience_time=10)\`
- **反馈**:
  - **确认导览或前往展厅需求**: 进入 [2. 公司介绍]
  - **寻找洗手间或特定点位**: 进入 [3. 休息指引]
  - **超时无应答**: \`inte.hri.special_pose(action="bow_bowing")\` -> 结束

### 约束
- 技能中仅使用 \`vlt_planable: true\` 的工具。
- 导航阶段只使用 \`navi.locomotion.navigate_to_target\` / \`navi.locomotion.stop_navigation\`。
- 讲解优先使用 \`inte.hri.say_something\`（固定话术） 与 \`inte.hri.omni_question\`（动态问答） 的组合。`,

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
  - \`navi.locomotion.navigate_to_target(target_name="门口")\`
  - \`iot.post_print_job()\`
  - \`iot.query_nearby_facilities()\`
  - \`inte.hri.say_something(text="大厅洗手间位于右手边通道尽头，后面备有VIP专用茶水歇息间。")\`
  - \`inte.hri.special_pose(action="bow_bowing")\`
  - \`inte.hri.say_something(text="您的流程办理完毕，祝您今天在科技园度过愉快的时光，再见！")\`
- **反馈**:
  - **检测到机器倾角受阻或遇阻**: \`hri.call_human()\` -> 呼叫人工安防
  - **客流离场/退场完毕**: \`inte.hri.waiting(slience_time=20)\` -> 返回待机点

### 约束
- 洗手间设施查询推荐使用标准 GIS 外设进行常态化位置索引。`
  });

  const jsonText = propJsonText !== undefined ? propJsonText : localJsonText;
  const setJsonText = propSetJsonText !== undefined ? propSetJsonText : setLocalJsonText;
  const tasks = propTasks !== undefined ? propTasks : localTasks;
  const setTasks = propSetTasks !== undefined ? propSetTasks : setLocalTasks;
  const docContents = propDocContents !== undefined ? propDocContents : localDocContents;

  const [localTaskContents, setLocalTaskContents] = useState<Record<string, string>>(() => ({
    defaultTask: defaultTaskJson
  }));
  const [localCurrentTaskView, setLocalCurrentTaskView] = useState<string>('defaultTask');

  const taskContents = propTaskContents !== undefined ? propTaskContents : localTaskContents;
  const setTaskContents = propSetTaskContents !== undefined ? propSetTaskContents : setLocalTaskContents;
  const currentTaskView = propCurrentTaskView !== undefined ? propCurrentTaskView : localCurrentTaskView;
  const setCurrentTaskView = propSetCurrentTaskView !== undefined ? propSetCurrentTaskView : setLocalCurrentTaskView;

  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isJsonEditing, setIsJsonEditing] = useState(true);

  // Undo / Redo & Snapshot history states for JSON editing
  const [taskUndoStack, setTaskUndoStack] = useState<Record<string, string[]>>({});
  const [taskRedoStack, setTaskRedoStack] = useState<Record<string, string[]>>({});
  const lastUndoPushRef = React.useRef<number>(0);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [newSnapshotNote, setNewSnapshotNote] = useState('');

  // 任务书版本快照 (Per-task snapshots)
  const [taskSnapshots, setTaskSnapshots] = useState<Record<string, { id: string; timestamp: string; text: string; note: string; nodeCount: number }[]>>(() => ({
    defaultTask: [
      { id: '1', timestamp: '2026-06-04 15:30:12', text: defaultTaskJson, note: '系统预设 首页大堂导购流程', nodeCount: 12 }
    ],
    facilityTask: [
      { id: '1', timestamp: '2026-06-04 15:35:00', text: taskContents?.facilityTask || '', note: '初始化贵宾指引与配套洗手间路线', nodeCount: 1 }
    ],
    nightPatrolTask: [
      { id: '1', timestamp: '2026-06-04 15:40:00', text: taskContents?.nightPatrolTask || '', note: '初始化夜间防盗安全雷达巡更', nodeCount: 1 }
    ]
  }));

  // 行为剧本相关的新状态
  const [scriptEditMode, setScriptEditMode] = useState<'edit' | 'preview'>('edit'); // 默认展示可修改的编辑状态
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const highlightOverlayRef = React.useRef<HTMLDivElement>(null);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);

  // 动作和技能的预设描述，用于快捷浮层/二级气泡展示与插入
  const INS_ACTIONS = [
    { id: 'wave_hand', label: '挥手欢迎', code: 'inte.hri.special_pose(action="wave_hand")', desc: '缓慢抬起双臂致意，展现人形智能体亲和感' },
    { id: 'point_front', label: '指引前方', code: 'inte.hri.special_pose(action="point_front")', desc: '伸出单手侧身向前，引导参观建议路径' },
    { id: 'screen_show', label: '屏幕展示', code: 'inte.hri.special_pose(action="screen_show")', desc: '配合多媒体演示做擦拂手势指示对应内容' },
    { id: 'talk_gesture', label: '讲解手势', code: 'inte.hri.special_pose(action="talk_gesture")', desc: '胸前小幅度摆动手部，传达讲解情感温度' },
    { id: 'bow_bowing', label: '送别致意', code: 'inte.hri.special_pose(action="bow_bowing")', desc: '微微礼貌欠身躬行致以离场感谢' },
    { id: 'nod', label: '点头肯定', code: 'inte.hri.special_pose(action="nod")', desc: '听赏期间轻快点头两次表示认同和接收' },
    { id: 'thinking', label: '抱臂思考', code: 'inte.hri.special_pose(action="thinking")', desc: '双臂交叠，头部微偏，展示生动思考表情' },
    { id: 'dance', label: '极客跳舞', code: 'inte.hri.special_pose(action="dance")', desc: '伴随迎宾背景音乐进行趣味拟人机械舞律动' },
  ];

  const INS_SKILLS = [
    { id: 'post_print', label: '物联打印', code: 'iot.post_print_job()', desc: '调用物理打印机，冲印画册相纸或参观凭证' },
    { id: 'query_calendar', label: '活动日历', code: 'iot.query_calendar_events()', desc: '查询当日园区班次特展，更新多轮对话排期' },
    { id: 'trigger_screen', label: '大屏播放', code: 'iot.trigger_screen()', desc: '联动本地物理屏幕，自动触发宣传视频等多媒体展示' },
    { id: 'query_nearby', label: '位置检索', code: 'iot.query_nearby_facilities()', desc: '调用高精导航测算大堂及周边设施，智能最短路线指引' },
  ];

  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      // 如果没有聚焦，直接拼在当前正在编辑文档的内容尾端
      const currentVal = docContents[currentScriptView] || '';
      const newVal = currentVal + (currentVal ? '\n' : '') + textToInsert;
      if (propSetDocContents) {
        propSetDocContents(prev => ({ ...prev, [currentScriptView]: newVal }));
      }
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newValue = before + textToInsert + after;
    
    if (propSetDocContents) {
      propSetDocContents(prev => ({ ...prev, [currentScriptView]: newValue }));
    }

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
    }, 50);
  };

  // 🆕 斜杠快捷菜单 (Slash menu) 相关状态与处理
  const [slashMenu, setSlashMenu] = useState<{
    isOpen: boolean;
    searchQuery: string;
    cursorPosition: number;
  } | null>(null);

  const [slashActiveCategory, setSlashActiveCategory] = useState<'action' | 'skill'>('action');
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);

  // 动作库和技能库
  const filteredActions = React.useMemo(() => {
    const query = slashMenu?.searchQuery.toLowerCase().trim() || '';
    if (!query) return INS_ACTIONS.map(a => ({ ...a, type: 'action' as const }));
    return INS_ACTIONS.filter(item => 
      item.label.toLowerCase().includes(query) || 
      item.code.toLowerCase().includes(query)
    ).map(a => ({ ...a, type: 'action' as const }));
  }, [slashMenu?.searchQuery, INS_ACTIONS]);

  const filteredSkills = React.useMemo(() => {
    const query = slashMenu?.searchQuery.toLowerCase().trim() || '';
    if (!query) return INS_SKILLS.map(s => ({ ...s, type: 'skill' as const }));
    return INS_SKILLS.filter(item => 
      item.label.toLowerCase().includes(query) || 
      item.code.toLowerCase().includes(query)
    ).map(s => ({ ...s, type: 'skill' as const }));
  }, [slashMenu?.searchQuery, INS_SKILLS]);

  const activeLevel2Items = React.useMemo(() => {
    return slashActiveCategory === 'action' ? filteredActions : filteredSkills;
  }, [slashActiveCategory, filteredActions, filteredSkills]);

  // 当搜索框输入变化或分类切换时，将高亮项复位为第一项
  useEffect(() => {
    setSlashSelectedIndex(0);
  }, [slashMenu?.searchQuery, slashActiveCategory]);

  const handleSelectSlashItem = (item: { code: string }) => {
    const textarea = textareaRef.current;
    if (!textarea || !slashMenu) return;

    const { cursorPosition } = slashMenu;
    const text = textarea.value;
    const currentSelectionStart = textarea.selectionStart;

    // 替换从 / 开始到现在输入的所有内容
    const textBefore = text.substring(0, cursorPosition);
    const textAfter = text.substring(currentSelectionStart);

    const textToInsert = `\`${item.code}\``;
    const newValue = textBefore + textToInsert + textAfter;

    if (propSetDocContents) {
      propSetDocContents(prev => ({ ...prev, [currentScriptView]: newValue }));
    }

    setSlashMenu(null);
    
    setTimeout(() => {
      textarea.focus();
      const newCursor = cursorPosition + textToInsert.length;
      textarea.selectionStart = textarea.selectionEnd = newCursor;
    }, 50);
  };

  const getCaretCoordinates = () => {
    const textarea = textareaRef.current;
    if (!textarea || !slashMenu) return { top: 20, left: 20 };

    const val = textarea.value;
    const cursor = slashMenu.cursorPosition;
    const textBefore = val.substring(0, cursor);

    const lines = textBefore.split('\n');
    const rowIndex = lines.length - 1;
    const lastLineText = lines[rowIndex];

    const textareaWidth = textarea.clientWidth || 500;
    const paddingX = 40; 
    const charWidth = 7.1; 
    const lineHeight = 19.5; 

    const maxChars = Math.max(15, Math.floor((textareaWidth - paddingX) / charWidth));

    let totalRows = 0;
    for (let i = 0; i < rowIndex; i++) {
      const len = lines[i].length;
      totalRows += 1 + Math.floor(len / maxChars);
    }

    const currentLineLen = lastLineText.length;
    totalRows += Math.floor(currentLineLen / maxChars);
    const colPosition = currentLineLen % maxChars;

    const scrollTop = textarea.scrollTop || 0;

    let calculatedTop = 20 + (totalRows * lineHeight) - scrollTop;
    let calculatedLeft = 20 + (colPosition * charWidth);

    const menuWidth = 240; 
    const menuHeight = 160; 

    const textareaHeight = textarea.clientHeight || 300;

    // Check bottom boundary & wrap coordinates
    if (calculatedLeft + menuWidth > textareaWidth - 20) {
      calculatedLeft = Math.max(20, textareaWidth - menuWidth - 30);
    }

    if (calculatedTop + menuHeight > textareaHeight - 15) {
      if (calculatedTop - menuHeight - 10 > 10) {
        calculatedTop = calculatedTop - menuHeight - 15;
      } else {
        calculatedTop = Math.max(10, textareaHeight - menuHeight - 20);
      }
    }

    return {
      top: Math.max(10, calculatedTop),
      left: Math.max(15, calculatedLeft)
    };
  };

  const handleAddNewScript = () => {
    const newKey = `customScript_${Date.now()}`;
    const defaultValue = `---
name: 自定义剧本
desc: 自定义流程步骤与安防、技能联控说明
---

### 1. 新设立流程步骤 (Step)
- **触发**: 系统或智能体检测到特定事件。
- **动作**:
  - \`inte.hri.special_pose(action="wave_hand")\`
  - \`inte.hri.say_something(text="您好，请问有什么可以帮助您的？")\`
`;
    if (propSetDocContents) {
      propSetDocContents(prev => ({
        ...prev,
        [newKey]: defaultValue
      }));
    }
    setCurrentScriptView(newKey);
    setScriptEditMode('edit');
  };

  const handleDeleteScript = (keyToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (propSetDocContents) {
      propSetDocContents(prev => {
        const copy = { ...prev };
        delete copy[keyToDelete];
        
        // 切换到现有的另外一个剧本
        const remainingKeys = Object.keys(copy);
        if (remainingKeys.length > 0) {
          if (currentScriptView === keyToDelete) {
            setCurrentScriptView(remainingKeys[0]);
          }
        } else {
          // 如果全部被删完了，极佳的处理方式是自动生成一份新的默认剧本
          const fallbackKey = 'welcomeFlow';
          copy[fallbackKey] = `---\nname: 迎宾流程\ndesc: 参观机器人进行多模态迎宾\n---\n\n### 1. 迎宾致意\n- **动作**:\n  - \`inte.hri.special_pose(action="wave_hand")\`\n`;
          setCurrentScriptView(fallbackKey);
        }
        return copy;
      });
    }
  };

  const getScriptName = (key: string, content: string) => {
    const r = /^\s*name:\s*(.*?)\s*$/m;
    const match = content.match(r);
    let displayName = '';
    
    if (match && match[1]) {
      displayName = match[1].trim();
    } else {
      if (key === 'welcomeFlow') displayName = '迎宾流程';
      else if (key === 'companyIntro') displayName = '公司介绍';
      else if (key === 'visitorReception') displayName = '访客接待';
      else displayName = '自定义剧本';
    }

    // 将默认行为剧本的英文名/标志符转换为中文
    if (
      displayName === 'welcome_flow' || 
      displayName === 'welcomeFlow' || 
      key === 'welcomeFlow'
    ) {
      return '迎宾流程';
    }
    if (
      displayName === 'company_intro' || 
      displayName === 'companyIntro' || 
      key === 'companyIntro'
    ) {
      return '公司介绍';
    }
    if (
      displayName === 'visitor_reception' || 
      displayName === 'visitorReception' || 
      key === 'visitorReception'
    ) {
      return '访客接待';
    }
    
    return displayName;
  };

  // 原位动作点击编辑浮窗状态
  const [activeActionEdit, setActiveActionEdit] = useState<{
    type: 'script' | 'json';
    lineIndex: number;
    oldValue: string;
    originalLine: string;
  } | null>(null);

  const syncActionAcrossViews = (oldVal: string, newVal: string) => {
    // 1. 同步行为剧本
    if (propSetDocContents && docContents) {
      propSetDocContents(prev => {
        const nextDocs = { ...prev };
        for (const k of Object.keys(nextDocs)) {
          let text = nextDocs[k] || '';
          text = text.replace(new RegExp(`action="${oldVal}"`, 'g'), `action="${newVal}"`);
          text = text.replace(new RegExp(`action='${oldVal}'`, 'g'), `action='${newVal}'`);
          nextDocs[k] = text;
        }
        return nextDocs;
      });
    }

    // 2. 同步 JSON 任务书
    let nextJsonText = jsonText || '';
    nextJsonText = nextJsonText
      .replace(new RegExp(`action=\\\\?"${oldVal}\\\\?"`, 'g'), `action=\\"${newVal}\\"`)
      .replace(new RegExp(`action='${oldVal}'`, 'g'), `action='${newVal}'`);

    updateJsonAndTasks(nextJsonText);
  };

  // 当外部导航切换至任务书面板时，自动开启并保持 JSON 编辑模式
  useEffect(() => {
    if (activePanelTab === 'task') {
      setIsJsonEditing(true);
    }
  }, [activePanelTab]);

  // 监听地图冲突状态和面板页签切换，在 DOM 渲染后自动平滑滚动定位到对应的物理位置异常点位/标红线
  useEffect(() => {
    if (isMapConflict) {
      if (activePanelTab === 'task') {
        if (isJsonEditing) {
          // 始终允许用户在此编辑 JSON 配置文件，不再退回至高亮纯展示模式
          return;
        }
        const timer = setTimeout(() => {
          const jsonConflictItem = document.getElementById('map-conflict-json-item');
          if (jsonConflictItem) {
            jsonConflictItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
        return () => clearTimeout(timer);
      } else if (activePanelTab === 'script') {
        const timer = setTimeout(() => {
          const scriptConflictItem = document.getElementById('map-conflict-script-item');
          if (scriptConflictItem) {
            scriptConflictItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [activePanelTab, isMapConflict, currentScriptView, isJsonEditing]);

  // 监听常规动作高亮项及面板、视图切换，在 DOM 渲染后自动平滑滚动定位到对应高亮项
  useEffect(() => {
    if (highlightedAction) {
      const timer = setTimeout(() => {
        if (activePanelTab === 'script') {
          const scriptItem = document.getElementById('highlighted-script-item');
          if (scriptItem) {
            scriptItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else if (activePanelTab === 'task') {
          const jsonItem = document.getElementById('highlighted-json-item');
          if (jsonItem) {
            jsonItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [highlightedAction, activePanelTab, currentScriptView]);

  const updateJsonAndTasks = (text: string) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === 'object' && parsed !== null) {
        // Handle standard wrapper schema {"task_name": ..., "actions": [...]} or raw array
        const list = Array.isArray(parsed) ? parsed : (parsed.actions || []);
        setTasks(list);
        setJsonError(null);
      } else {
        setJsonError('格式错误：根节点必须为对象形式 { ... } 或 数组形式 [ ... ]');
      }
    } catch (err: any) {
      setJsonError(`语法解析错误: ${err.message}`);
    }
  };

  const handlePrettifyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      updateJsonAndTasksWithHistory(formatted, true);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(`格式化失败，请检查 JSON 语法: ${err.message}`);
    }
  };

  const getTaskBookName = (key: string, content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        if (!Array.isArray(parsed) && parsed.task_name) {
          return parsed.task_name;
        }
        if (Array.isArray(parsed) && parsed[0] && parsed[0].name) {
          return parsed[0].name;
        }
      }
    } catch (e) {
      // ignore
    }
    if (key === 'defaultTask') return '小鹏总部导购';
    if (key === 'facilityTask') return '区域设施指引';
    if (key === 'nightPatrolTask') return '夜间安全巡检';
    return '自定义任务书';
  };

  const handleAddNewTaskBook = () => {
    const currentCount = Object.keys(taskContents).length;
    if (currentCount >= 10) {
      alert("最多只能支持创建 10 个任务书！");
      return;
    }
    const newKey = `taskBook_${Date.now()}`;
    const defaultValue = `[
  {
    "id": "T1",
    "name": "自定义迎宾流程_${currentCount + 1}",
    "desc": "新设立的任务书，包含自定义的迎宾机器人和多功能智驾讲解序列。",
    "actions": [
      "inte.hri.special_pose(action=\\"wave_hand\\")",
      "inte.hri.say_something(text=\\"您好，自定义任务书已经成功加载并执行！\\")"
    ],
    "status": "planning",
    "priority": "P2"
  }
]`;
    if (propSetTaskContents) {
      propSetTaskContents(prev => ({
        ...prev,
        [newKey]: defaultValue
      }));
    }
    if (propSetCurrentTaskView) {
      propSetCurrentTaskView(newKey);
    }
    setIsJsonEditing(true);
  };

  const handleDeleteTaskBook = (keyToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (propSetTaskContents) {
      propSetTaskContents(prev => {
        const copy = { ...prev };
        delete copy[keyToDelete];
        
        const remainingKeys = Object.keys(copy);
        if (remainingKeys.length > 0) {
          if (currentTaskView === keyToDelete && propSetCurrentTaskView) {
            propSetCurrentTaskView(remainingKeys[0]);
          }
        } else {
          const fallbackKey = 'defaultTask';
          copy[fallbackKey] = defaultTaskJson;
          if (propSetCurrentTaskView) {
            propSetCurrentTaskView(fallbackKey);
          }
        }
        return copy;
      });
    }
  };

  // Undo / Redo history tracking for JSON Editor
  const updateJsonAndTasksWithHistory = (newText: string, forceHistoryGroup = false) => {
    const prevText = jsonText;
    updateJsonAndTasks(newText);

    const now = Date.now();
    // Group edits within 1.5s, or force group on format/minifying/snippet actions
    if (forceHistoryGroup || now - lastUndoPushRef.current > 1500) {
      if (prevText !== newText) {
        setTaskUndoStack(prev => {
          const currentStack = prev[currentTaskView] || [];
          return {
            ...prev,
            [currentTaskView]: [...currentStack, prevText]
          };
        });
        setTaskRedoStack(prev => ({
          ...prev,
          [currentTaskView]: []
        }));
        lastUndoPushRef.current = now;
      }
    }
  };

  const handleUndo = () => {
    const currentStack = taskUndoStack[currentTaskView] || [];
    if (currentStack.length === 0) return;

    const previousText = currentStack[currentStack.length - 1];
    const newStack = currentStack.slice(0, -1);

    setTaskUndoStack(prev => ({
      ...prev,
      [currentTaskView]: newStack
    }));

    setTaskRedoStack(prev => {
      const currentRedo = prev[currentTaskView] || [];
      return {
        ...prev,
        [currentTaskView]: [...currentRedo, jsonText]
      };
    });

    updateJsonAndTasks(previousText);
    lastUndoPushRef.current = Date.now();
  };

  const handleRedo = () => {
    const currentRedo = taskRedoStack[currentTaskView] || [];
    if (currentRedo.length === 0) return;

    const nextText = currentRedo[currentRedo.length - 1];
    const newRedo = currentRedo.slice(0, -1);

    setTaskRedoStack(prev => ({
      ...prev,
      [currentTaskView]: newRedo
    }));

    setTaskUndoStack(prev => {
      const currentUndo = prev[currentTaskView] || [];
      return {
        ...prev,
        [currentTaskView]: [...currentUndo, jsonText]
      };
    });

    updateJsonAndTasks(nextText);
    lastUndoPushRef.current = Date.now();
  };

  const handleCreateSnapshot = () => {
    const noteText = newSnapshotNote.trim() || '手动保存快照';
    let nodes = 0;
    try {
      const parsed = JSON.parse(jsonText);
      if (typeof parsed === 'object' && parsed !== null) {
        nodes = Array.isArray(parsed) ? parsed.length : (parsed.actions?.length || 0);
      }
    } catch (e) {}

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newSnap = {
      id: String(Date.now()),
      timestamp: timeStr,
      text: jsonText,
      note: noteText,
      nodeCount: nodes
    };

    setTaskSnapshots(prev => {
      const list = prev[currentTaskView] || [];
      return {
        ...prev,
        [currentTaskView]: [newSnap, ...list]
      };
    });
    setNewSnapshotNote('');
  };

  const handleInsertSnippet = (snippetObj: any) => {
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) {
        const updated = [...parsed, snippetObj];
        updateJsonAndTasksWithHistory(JSON.stringify(updated, null, 2), true);
        return;
      } else if (parsed && typeof parsed === 'object') {
        const actions = parsed.actions || [];
        const updatedActions = [...actions, snippetObj];
        const updated = { ...parsed, actions: updatedActions };
        updateJsonAndTasksWithHistory(JSON.stringify(updated, null, 2), true);
        return;
      }
    } catch (e) {
      // ignore
    }

    // Fallback caret insertion
    const textarea = document.getElementById('task-textarea') as HTMLTextAreaElement;
    if (!textarea) {
      updateJsonAndTasksWithHistory(jsonText + '\n' + JSON.stringify(snippetObj, null, 2), true);
      return;
    }

    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const text = textarea.value;
    const insertStr = ',\n' + JSON.stringify(snippetObj, null, 2);
    const newVal = text.substring(0, start) + insertStr + text.substring(end);
    updateJsonAndTasksWithHistory(newVal, true);
  };

  const handleMinifyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const minified = JSON.stringify(parsed);
      updateJsonAndTasksWithHistory(minified, true);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(`压缩失败，需要标准合规的 JSON 开创节点: ${err.message}`);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const renderHighlightedJSON = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="font-mono text-xs leading-relaxed select-text min-h-[220px] py-2">
        {lines.map((line, idx) => {
          let highlighted = line
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

          // Highlight keys `"key":`
          highlighted = highlighted.replace(/"([^"]+)":/g, '<span class="text-blue-600 font-bold font-mono">"$1"</span>:');

          // Highlight string values except keys
          highlighted = highlighted.replace(/: \s*"([^"]*)"/g, ': <span class="text-emerald-700 font-semibold font-mono">"$1"</span>');

          // Highlight numbers and booleans
          highlighted = highlighted.replace(/: \s*(true|false|null|\d+)/g, ': <span class="text-purple-600 font-bold font-mono">$1</span>');

          // Highlight dynamic statuses
          highlighted = highlighted.replace(/"active"/g, '"<span class="text-emerald-700 font-extrabold bg-emerald-50 px-1 rounded-sm font-mono font-bold">active</span>"');
          highlighted = highlighted.replace(/"planning"/g, '"<span class="text-blue-600 font-extrabold bg-blue-50 px-1 rounded-sm font-mono font-bold">planning</span>"');
          highlighted = highlighted.replace(/"pending"/g, '"<span class="text-slate-500 font-extrabold bg-slate-100 px-1 rounded font-mono font-bold">pending</span>"');

          // Detect map point conflicts
          let isMapConflictLine = false;
          let conflictReason = '';
          if (isMapConflict) {
            const trimmedLine = line.trim();
            if (trimmedLine.includes('展区') || trimmedLine.includes('门口')) {
              isMapConflictLine = true;
              conflictReason = trimmedLine.includes('展区') ? '展区' : '门口';
            }
          }

          if (isMapConflictLine) {
            highlighted = highlighted.replace(/展区/g, '<span class="text-red-600 font-extrabold underline decoration-red-400 bg-red-100/80 px-1.5 py-0.5 rounded border border-red-200">展区 (已失效点位)</span>');
            highlighted = highlighted.replace(/门口/g, '<span class="text-red-600 font-extrabold underline decoration-red-400 bg-red-100/80 px-1.5 py-0.5 rounded border border-red-200">门口 (已失效点位)</span>');
          }

          // 匹配与 highlightedAction 对应的动作/Skill/物联语义 关键字
          let isJsonLineHighlighted = false;
          let isHighlightingSkill = false;
          let isHighlightingSemanticPoint = false;
          if (highlightedAction) {
            const keyword = ACTION_TO_KEYWORD[highlightedAction];
            if (keyword && line.includes(keyword)) {
              isJsonLineHighlighted = true;
            } else {
              const skillKws = SKILL_TO_KEYWORDS[highlightedAction];
              if (skillKws && skillKws.some(kw => line.includes(kw))) {
                isJsonLineHighlighted = true;
                isHighlightingSkill = true;
              } else if (line.includes(highlightedAction)) {
                isJsonLineHighlighted = true;
                isHighlightingSemanticPoint = true;
              }
            }
          }

          const actionMatchInJson = line.match(/(action\\?=["'])(wave_hand|point_front|screen_show|talk_gesture|bow_bowing|nod|dance|thinking)(\\?["'])/);

          return (
            <div 
              key={idx} 
              id={isMapConflictLine ? "map-conflict-json-item" : isJsonLineHighlighted ? "highlighted-json-item" : undefined}
              className={`flex transition-all duration-300 py-[3px] px-4 font-mono ${
                isMapConflictLine
                  ? 'bg-red-50/95 border-l-4 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.22)] scale-[1.01] origin-left animate-pulse'
                  : isJsonLineHighlighted 
                    ? isHighlightingSkill 
                      ? 'bg-purple-50/70 border-l-4 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.15)] scale-[1.01] origin-left animate-pulse'
                      : isHighlightingSemanticPoint
                        ? 'bg-emerald-50/70 border-l-4 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.15)] scale-[1.01] origin-left animate-pulse'
                        : 'bg-amber-50/70 border-l-4 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.15)] scale-[1.01] origin-left animate-pulse' 
                    : 'hover:bg-slate-50/70'
              }`}
            >
              <span className={`w-8 shrink-0 select-none text-right pr-3 font-mono text-[11px] border-r ${isMapConflictLine ? 'text-red-400 border-red-200' : 'text-slate-300 border-slate-100'}`}>
                {idx + 1}
              </span>
              <span 
                className={`flex-1 whitespace-pre-wrap break-all pl-3 text-left font-mono font-semibold ${
                  isMapConflictLine
                    ? 'text-red-955 font-extrabold bg-red-50/30 px-1 rounded-sm'
                    : isJsonLineHighlighted 
                      ? isHighlightingSkill 
                        ? 'text-purple-900 font-extrabold bg-purple-50/30 px-1 rounded-sm' 
                        : isHighlightingSemanticPoint
                          ? 'text-emerald-955 font-extrabold bg-emerald-50/40 px-1 rounded-sm text-emerald-900'
                          : 'text-amber-900 font-extrabold bg-amber-50/30 px-1 rounded-sm' 
                      : 'text-slate-755'
                }`}
              >
                {actionMatchInJson ? (
                  <>
                    <span className="text-emerald-700 font-semibold">{line.substring(0, line.indexOf(actionMatchInJson[0]))}{actionMatchInJson[1]}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveActionEdit({
                          type: 'json',
                          lineIndex: idx,
                          oldValue: actionMatchInJson[2],
                          originalLine: line
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 mx-0.5 rounded-md text-[11px] font-bold border cursor-pointer select-none transition-all duration-250 bg-amber-50 border-amber-300 hover:bg-amber-100 text-amber-800 hover:scale-[1.03] active:scale-95 shadow-2xs group relative inline-flex font-mono"
                      title="点击原位直接修改动作 ID"
                    >
                      <span className="text-[12px]">{(PRESET_ACTIONS.find(a => a.id === actionMatchInJson[2]) || { icon: '🤖' }).icon}</span>
                      <span className="underline decoration-dashed decoration-amber-400 font-mono">"{actionMatchInJson[2]}"</span>
                      <span className="scale-[0.8] opacity-70 border border-amber-300 px-1 rounded bg-white text-[9px] font-sans font-medium">✏️ 改</span>
                    </button>
                    <span className="text-emerald-700 font-semibold">{actionMatchInJson[3]}{line.substring(line.indexOf(actionMatchInJson[0]) + actionMatchInJson[0].length)}</span>
                  </>
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: highlighted }} />
                )}
              </span>
              {isMapConflictLine && (
                <div className="shrink-0 flex items-center justify-center pl-2">
                  <span className="text-[8.5px] font-extrabold text-white bg-red-600 border border-red-500 px-2 py-[2px] rounded uppercase tracking-wider animate-bounce select-none font-sans">
                    ⚠️ 点位失效
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const getHighlightedHtml = (text: string) => {
    if (!text) {
      return `<span style="color: #94a3b8; font-family: sans-serif; font-size: 12px; pointer-events: none; line-height: 1.5;">编写属于您的智能体 Markdown 解析剧本... (输入 / 快速唤起动作与技能)</span>`;
    }
    const escapeHtml = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    let html = escapeHtml(text);
    
    // 1. 匹配并特殊高亮动作（黄色/橘色色系）
    html = html.replace(/(inte\.hri\.[a-zA-Z0-9_\.]+(?:\([^\)\n]*\))?)/g, (match) => {
      return `<span style="background-color: #fef08a; color: #854d0e; padding: 1px 4px; border-radius: 4px; border: 1px solid #fde047; font-weight: 600; font-family: monospace;">${match}</span>`;
    });

    // 2. 匹配并特殊高亮技能（紫色色系）
    html = html.replace(/((?:iot\.|navi\.)[a-zA-Z0-9_\.]+(?:\([^\)\n]*\))?)/g, (match) => {
      return `<span style="background-color: #f3e8ff; color: #6b21a8; padding: 1px 4px; border-radius: 4px; border: 1px solid #e9d5ff; font-weight: 600; font-family: monospace;">${match}</span>`;
    });

    if (html.endsWith('\n')) {
      html += ' ';
    }
    return html;
  };

  const renderScriptContent = (text: string | undefined | null) => {
    if (!text) {
      return (
        <div className="flex flex-col items-center justify-center text-slate-400 py-16 gap-2 select-none">
          <p className="text-xs">📂 当前剧本无内容或已被清空</p>
          <p className="text-[10px] text-slate-405">请切换或点击 ➕ 创建新剧本</p>
        </div>
      );
    }
    const lines = text.split('\n');
    return (
      <div className="flex flex-col gap-2.5 font-sans justify-start select-text leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          
          // 判断是不是需要转代码格式的 API 调用行 (expanded to handle navi.)
          const isActionLine = trimmed.startsWith('* inte.hri.') || 
                               trimmed.startsWith('inte.hri.') || 
                               trimmed.startsWith('*  inte.hri.') || 
                               trimmed.startsWith('* `inte.hri.') || 
                               trimmed.includes('inte.hri.') || 
                               trimmed.includes('iot.') || 
                               trimmed.includes('hri.call') ||
                               trimmed.includes('navi.') ||
                               trimmed.startsWith('- `') ||
                               trimmed.startsWith('-  `');
          
          if (isActionLine) {
            let cleanLine = trimmed;
            if (cleanLine.startsWith('*')) {
              cleanLine = cleanLine.substring(1).trim();
            }
            if (cleanLine.startsWith('-')) {
              cleanLine = cleanLine.substring(1).trim();
            }
            cleanLine = cleanLine.replace(/`/g, ''); // 去除反引号
            
            // Check for map point configurations
            let isMapConflictLine = false;
            let conflictReason = '';
            if (isMapConflict) {
              if (cleanLine.includes('target_name="展区"') || cleanLine.includes('target_name="门口"') || cleanLine.includes('展区') || cleanLine.includes('门口')) {
                if (cleanLine.includes('navigate_to_target') || cleanLine.includes('navi.')) {
                   isMapConflictLine = true;
                  conflictReason = cleanLine.includes('展区') ? '展区' : '门口';
                }
              }
            }

            const isRowAction = cleanLine.includes('inte.hri.');
            const isRowSkill = cleanLine.includes('iot.') || cleanLine.includes('navi.');

            let isHighlighted = false;
            let isHighlightingSkill = false;
            let isHighlightingSemanticPoint = false;
            if (!isMapConflictLine && highlightedAction) {
              const kw = ACTION_TO_KEYWORD[highlightedAction];
              const skillKws = SKILL_TO_KEYWORDS[highlightedAction];
              if (kw && cleanLine.includes(kw)) {
                isHighlighted = true;
              } else if (skillKws && skillKws.some(k => cleanLine.includes(k))) {
                isHighlighted = true;
                isHighlightingSkill = true;
              } else if (cleanLine.includes(highlightedAction)) {
                isHighlighted = true;
                isHighlightingSemanticPoint = true;
              }
            }

            const actionMatch = cleanLine.match(/(action\s*=\s*["'])(wave_hand|point_front|screen_show|talk_gesture|bow_bowing|nod|dance|thinking)(["'])/);
            
            return (
              <div 
                key={idx}
                id={isMapConflictLine ? "map-conflict-script-item" : isHighlighted ? "highlighted-script-item" : undefined}
                className={`pl-5 my-[2px] transition-all duration-500 font-mono ${
                  isMapConflictLine || isHighlighted 
                    ? 'scale-[1.012] origin-left' 
                    : ''
                }`}
              >
                <div 
                  className={`py-2 px-3 border rounded-xl font-mono text-[11px] leading-relaxed transition-all duration-300 flex items-center justify-between gap-3 shadow-2xs relative ${
                    isMapConflictLine
                      ? 'bg-red-50 border-red-400 text-red-955 shadow-[0_2px_10px_rgba(239,68,68,0.18)] ring-2 ring-red-500/10'
                      : isHighlighted
                        ? isHighlightingSkill
                          ? 'bg-purple-100/90 border-purple-500 text-purple-900 shadow-[0_2px_15px_rgba(168,85,247,0.22)] ring-2 ring-purple-500/15'
                          : isHighlightingSemanticPoint
                            ? 'bg-emerald-50/95 border-emerald-500 text-emerald-950 shadow-[0_2px_10px_rgba(16,185,129,0.18)] ring-2 ring-emerald-500/10'
                            : 'bg-amber-100/90 border-amber-500 text-amber-900 shadow-[0_2px_15px_rgba(245,158,11,0.22)] ring-2 ring-amber-500/15'
                        : isRowAction
                          ? 'bg-amber-50/50 border-amber-200 text-amber-950 hover:bg-amber-50 hover:border-amber-300/80 transition-colors'
                          : isRowSkill
                            ? 'bg-purple-50/50 border-purple-200 text-purple-950 hover:bg-purple-50 hover:border-purple-300/80 transition-colors'
                            : 'bg-[#fafafc] border-[#eeeff2] text-slate-700'
                  }`}
                  style={{
                    backgroundColor: isMapConflictLine 
                      ? '#fef2f2' 
                      : isHighlighted 
                        ? isHighlightingSkill 
                          ? '#faf5ff' 
                          : isHighlightingSemanticPoint
                            ? '#f0fdf4'
                            : '#fefbf0' 
                        : isRowAction
                          ? '#fefcf3'
                          : isRowSkill
                            ? '#faf7fe'
                            : '#fcfcfd'
                  }}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isMapConflictLine 
                        ? 'bg-red-500 animate-pulse' 
                        : isHighlighted 
                          ? isHighlightingSkill 
                            ? 'bg-purple-500 shadow-xs' 
                            : isHighlightingSemanticPoint
                              ? 'bg-emerald-500 shadow-xs'
                              : 'bg-amber-500 shadow-xs' 
                          : isRowAction
                            ? 'bg-amber-500'
                            : isRowSkill
                              ? 'bg-purple-500'
                              : 'bg-slate-350'
                    }`} />
                    {actionMatch ? (
                      <span className={`whitespace-pre-wrap text-left select-all break-all pr-4 ${
                        isMapConflictLine 
                          ? 'text-red-955 font-extrabold font-mono text-[11.5px]' 
                          : isHighlighted 
                            ? isHighlightingSkill 
                              ? 'text-purple-955 font-extrabold' 
                              : isHighlightingSemanticPoint
                                ? 'text-emerald-955 font-extrabold text-emerald-900'
                                : 'text-amber-955 font-extrabold' 
                            : isRowAction
                              ? 'text-amber-900 font-semibold'
                              : isRowSkill
                                ? 'text-purple-900 font-semibold'
                                : 'text-slate-755 font-semibold'
                      }`}>
                        <span>{cleanLine.substring(0, cleanLine.indexOf(actionMatch[0]))}{actionMatch[1]}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveActionEdit({
                              type: 'script',
                              lineIndex: idx,
                              oldValue: actionMatch[2],
                              originalLine: line
                            });
                          }}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 mx-0.5 rounded-md text-[11px] font-bold border cursor-pointer select-none transition-all duration-250 bg-amber-50 border-amber-300 hover:bg-amber-100 text-amber-800 hover:scale-[1.03] active:scale-95 shadow-2xs group relative inline-flex font-mono"
                          title="点击原位直接修改动作 ID"
                        >
                          <span className="text-[12px]">{(PRESET_ACTIONS.find(a => a.id === actionMatch[2]) || { icon: '🤖' }).icon}</span>
                          <span className="underline decoration-dashed decoration-amber-400 font-mono">"{actionMatch[2]}"</span>
                          <span className="scale-[0.8] opacity-70 border border-amber-300 px-1 rounded bg-white text-[9px] font-sans font-medium">✏️ 改</span>
                        </button>
                        <span>{actionMatch[3]}{cleanLine.substring(cleanLine.indexOf(actionMatch[0]) + actionMatch[0].length)}</span>
                      </span>
                    ) : (
                      <span className={`whitespace-pre-wrap text-left select-all break-all pr-4 ${isMapConflictLine ? 'text-red-950 font-extrabold font-mono text-[11.5px]' : isHighlighted ? isHighlightingSkill ? 'text-purple-950 font-extrabold' : 'text-amber-950 font-extrabold' : isRowAction ? 'text-amber-900 font-semibold' : isRowSkill ? 'text-purple-900 font-semibold' : 'text-slate-750 font-semibold'}`}>
                        {isMapConflictLine ? (
                          <span>
                            {cleanLine.includes('展区') ? (
                              <span>
                                navi.locomotion.navigate_to_target(target_name="
                                <span className="text-red-600 font-extrabold underline decoration-red-400 bg-red-100 px-1 py-0.5 rounded-md">
                                  展区 (失效点位)
                                </span>
                                ")
                              </span>
                            ) : (
                              <span>
                                navi.locomotion.navigate_to_target(target_name="
                                <span className="text-red-600 font-extrabold underline decoration-red-400 bg-red-100 px-1 py-0.5 rounded-md">
                                  门口 (失效点位)
                                </span>
                                ")
                              </span>
                            )}
                          </span>
                        ) : (
                          cleanLine
                        )}
                      </span>
                    )}
                  </div>
                  {isMapConflictLine && (
                    <span className="shrink-0 text-[8px] font-extrabold border bg-red-600 border-red-500/10 text-white px-2 py-[2px] rounded uppercase tracking-wider animate-bounce select-none font-sans absolute right-3 top-2.5">
                      ❌ 失效位置: {conflictReason}
                    </span>
                  )}
                </div>
              </div>
            );
          }


          if (trimmed.startsWith('name:')) {
            return (
              <div key={idx} className="text-left font-sans text-xs text-slate-500 font-bold mb-1 border-b border-slate-105 pb-1.5">
                <span className="text-slate-400">NAME: </span>{trimmed.replace('name:', '').trim()}
              </div>
            );
          }
          if (trimmed.startsWith('desc:')) {
            return (
              <div key={idx} className="text-left font-sans text-xs text-slate-500 font-medium mb-2 leading-relaxed">
                <span className="text-slate-400 font-bold">DESC: </span>{trimmed.replace('desc:', '').trim()}
              </div>
            );
          }
          if (trimmed.startsWith('keywords:') || trimmed.match(/^- \S+/)) {
            if (trimmed.startsWith('keywords:')) {
              return <div key={idx} className="text-left text-[10.5px] font-bold text-slate-400 mt-1 mb-1">KEYWORDS:</div>;
            }
            return (
              <span key={idx} className="inline-block bg-slate-100/75 text-slate-500 text-[10px] font-extrabold px-2 py-0.5 rounded border border-slate-200/50 mr-1.5 my-0.5 self-start scale-95 font-sans">
                {trimmed.replace('-', '').trim()}
              </span>
            );
          }
          if (trimmed.startsWith('###')) {
            const isConstraint = trimmed.includes('约束');
            return (
              <h3 key={idx} className={`text-sm font-extrabold mt-5 mb-2.5 text-left font-sans tracking-tight flex items-center gap-1.5 ${isConstraint ? 'text-slate-700' : 'text-[#1d1d1f]'}`}>
                <span>{isConstraint ? '约束条件' : '目标说明'}</span>
                <span>{trimmed.replace(/^###\s*/, '')}</span>
              </h3>
            );
          }
          if (trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ')) {
            return (
              <h3 key={idx} className="text-xs font-bold text-slate-800 mt-4 mb-2 text-left font-sans tracking-tight">
                {trimmed}
              </h3>
            );
          }
          if (trimmed.startsWith('- **触发**:') || trimmed.startsWith('* 触发:') || trimmed.startsWith('* 触发：')) {
            const textVal = trimmed.replace(/^(- \*\*触发\*\*:\s*|\*\s*触发:\s*|\*\s*触发：\s*)/, '').trim();
            return (
              <div key={idx} className="my-2.5 text-left font-sans text-xs text-slate-650 flex items-start gap-1">
                <span className="text-slate-800 font-bold shrink-0">触发：</span>
                <span className="text-slate-600 font-semibold">{textVal}</span>
              </div>
            );
          }
          if (trimmed.startsWith('- **动作**:') || trimmed.startsWith('* 动作:') || trimmed.startsWith('* 动作：')) {
            return (
              <div key={idx} className="mt-3.5 text-left font-sans text-xs text-slate-800 font-extrabold border-b border-slate-100 pb-1 w-full">
                🤖 动作与姿势序列：
              </div>
            );
          }
          if (trimmed.startsWith('- **反馈**:') || trimmed.startsWith('* 分支:') || trimmed.startsWith('* 分支：')) {
            return (
              <div key={idx} className="mt-4.5 text-left font-sans text-xs text-slate-800 font-extrabold">
                🔀 运行逻辑分支：
              </div>
            );
          }

          if (trimmed.startsWith('- **') && !trimmed.startsWith('- **触发**:') && !trimmed.startsWith('- **动作**:') && !trimmed.startsWith('- **反馈**:')) {
            let cleanIf = trimmed.replace(/^-\s*/, '').trim();
            
            let isHighlighted = false;
            let isHighlightingSkill = false;
            if (highlightedAction) {
              const kw = ACTION_TO_KEYWORD[highlightedAction];
              const skillKws = SKILL_TO_KEYWORDS[highlightedAction];
              if (kw && cleanIf.includes(kw)) {
                isHighlighted = true;
              } else if (skillKws && skillKws.some(k => cleanIf.includes(k))) {
                isHighlighted = true;
                isHighlightingSkill = true;
              }
            }
            
            return (
              <div 
                key={idx} 
                className={`pl-4 py-1.5 rounded-lg my-1 text-left font-sans text-xs flex items-start gap-1 transition-all duration-300 ${
                  isHighlighted 
                    ? isHighlightingSkill
                      ? 'bg-purple-50 border-l-4 border-purple-500 pl-3 shadow-[0_1px_5px_rgba(168,85,247,0.08)] font-bold'
                      : 'bg-blue-50 border-l-4 border-blue-500 pl-3 shadow-[0_1px_5px_rgba(37,99,235,0.08)] font-bold' 
                    : 'text-slate-650'
                }`}
              >
                <span className="text-blue-500 font-extrabold shrink-0">🔹</span>
                <span className={`leading-relaxed font-semibold flex-1 ${isHighlighted ? 'text-blue-900 font-extrabold' : 'text-slate-600'}`}>
                  {cleanIf.split('**').map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-slate-800 font-bold">{part}</strong> : part)}
                </span>
              </div>
            );
          }

          if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
            const cleanText = trimmed.replace(/^[-*]\s*/, '').trim();
            return (
              <div key={idx} className="pl-4 my-1 text-left font-sans text-xs text-slate-500 flex items-start gap-1.5 leading-relaxed">
                <span className="text-slate-400">▪</span>
                <span className="flex-1 font-medium text-slate-600">
                  {cleanText.split('`').map((part, pIdx) => pIdx % 2 === 1 ? <code key={pIdx} className="font-mono bg-slate-50 px-1.5 py-0.5 border border-slate-150 rounded text-[10.5px] text-blue-600">{part}</code> : part)}
                </span>
              </div>
            );
          }

          if (!trimmed) return <div key={idx} className="h-1.5" />;

          return (
            <p key={idx} className="text-left text-xs leading-relaxed text-slate-550 my-1 font-sans font-semibold">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-[#fafafc] h-full overflow-hidden">

      {/* 统一高度占满主体，去除外部原生滚动，内部组件自适应缩放 */}
      <div className="px-6 pb-6 pt-3 flex flex-col h-full max-w-4xl mx-auto w-full select-text min-h-0">
        
        {/* ================== 统一编排工作台 (Behavior Script & Task JSON Tabs) ================== */}
        <section id="integrated-scheduler" className="bg-white border border-[#e6e6eb] rounded-2.5xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col flex-1 min-h-0">
          {/* Main Integrated Tab Switcher Header */}
          <div className="px-5 pt-3.5 pb-2 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white shrink-0 font-sans">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] border border-[#e6e6eb] self-start font-sans">
              <button
                onClick={() => setActivePanelTab('persona')}
                className={`h-7.5 px-3.5 rounded-lg border-0 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 font-sans ${
                  activePanelTab === 'persona' ? 'bg-[#1d1d1f] text-white shadow-xs' : 'bg-transparent text-slate-550 hover:text-slate-800'
                }`}
              >
                <User className="w-3.5 h-3.5" /> 人设
              </button>
              <button
                onClick={() => setActivePanelTab('script')}
                className={`h-7.5 px-3.5 rounded-lg border-0 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 font-sans ${
                  activePanelTab === 'script' ? 'bg-[#1d1d1f] text-white shadow-xs' : 'bg-transparent text-slate-550 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> 行为剧本
              </button>
              <button
                onClick={() => setActivePanelTab('task')}
                className={`h-7.5 px-3.5 rounded-lg border-0 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 font-sans ${
                  activePanelTab === 'task' ? 'bg-[#1d1d1f] text-white shadow-xs' : 'bg-transparent text-slate-550 hover:text-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> 任务书
              </button>
            </div>
          </div>

          {/* Conditional Rendering of Panel Contents */}
          {activePanelTab === 'script' ? (
            <div className="px-5 pb-4 pt-1 flex flex-col gap-3.5 flex-1 min-h-0 overflow-hidden font-sans relative">
              
              {/* 控制：行为剧本 Tabs (包括新增/删除) + 编辑与预览切换 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 font-sans border-b border-slate-100 pb-2">
                
                {/* 左边：多剧本 Tabs 的动态排布区 */}
                <div className="flex items-center gap-1.5 bg-slate-105 p-1 rounded-xl shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.03)] border border-[#e6e6eb] flex-wrap max-w-full">
                  {Object.keys(docContents).map((key, index) => {
                    const isPreset = key === 'welcomeFlow' || key === 'companyIntro' || key === 'visitorReception';
                    const isActive = currentScriptView === key;
                    const displayName = getScriptName(key, docContents[key] || '');
                    
                    return (
                      <div 
                        key={key}
                        onClick={() => setCurrentScriptView(key)}
                        className={`h-7 px-3 rounded-lg text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1.5 select-none relative ${
                          isActive 
                            ? 'bg-[#1d1d1f] text-white shadow-xs border border-transparent font-extrabold shadow-[0_2px_4px_rgba(0,0,0,0.15)]' 
                            : 'bg-transparent text-slate-550 hover:bg-white/50 hover:text-slate-800'
                        }`}
                      >
                        <span className="truncate max-w-[95px]">{index + 1}. {displayName}</span>
                        
                        {/* 允许删除每一个行为剧本 */}
                        <span 
                          onClick={(e) => handleDeleteScript(key, e)}
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all font-extrabold text-[8px] leading-none shrink-0 ${
                            isActive
                              ? 'bg-white/20 hover:bg-red-500 hover:text-white text-white/80'
                              : 'bg-slate-200/50 hover:bg-red-500 hover:text-white text-slate-500'
                          }`}
                          title="删除此剧本"
                        >
                          ×
                        </span>
                      </div>
                    );
                  })}

                  {/* 新增剧本按钮 */}
                  <button 
                    onClick={handleAddNewScript}
                    className="h-7 w-7 rounded-lg border-0 bg-transparent text-slate-555 hover:bg-white hover:text-black flex items-center justify-center transition-all cursor-pointer font-bold text-xs"
                    title="可在行为剧本中新增一个空白 markdown 白皮书"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* 核心展示/编辑工作台 - 填充所有剩余高度 */}
              <div className="flex-1 min-h-0 flex flex-col gap-2.5">
                {scriptEditMode === 'edit' ? (
                  /* ================== A. 富文本编辑区 ================== */
                  <div className="flex-1 min-h-0 flex flex-col gap-2 relative">
                    
                    {/* 富文本插入工具栏 - 极简线性风格 */}
                    <div className="flex flex-wrap items-center justify-start gap-1 bg-white border border-[#e6e6eb] rounded-xl p-1 select-none relative shrink-0">
                      {/* Left: Dropdowns & Formatting buttons with linear icons */}
                      <div className="flex flex-wrap items-center gap-1 relative">
                        
                        {/* 肢体动作 Dropdown */}
                        <div className="relative">
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowActionDropdown(!showActionDropdown);
                              setShowSkillDropdown(false);
                            }}
                            className="h-7 px-2 rounded-lg text-[11px] font-semibold text-slate-650 hover:text-black hover:bg-slate-100 flex items-center gap-1 transition-colors border-0 bg-transparent cursor-pointer"
                            title="肢体动作"
                          >
                            <Smile size={14} className="text-slate-500" />
                            <span>肢体动作 ▾</span>
                          </button>
                          {showActionDropdown && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setShowActionDropdown(false)} />
                              <div className="absolute left-0 mt-1 w-32 bg-white border border-slate-200/90 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] py-1 z-45 animate-fade-in select-none text-left">
                                {INS_ACTIONS.map(act => (
                                  <button
                                    key={act.id}
                                    type="button"
                                    onClick={() => {
                                      insertTextAtCursor(`\`${act.code}\``);
                                      setShowActionDropdown(false);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-[11px] text-slate-700 hover:text-black hover:bg-slate-50 font-medium border-0 bg-transparent transition-colors cursor-pointer"
                                  >
                                    <span>{act.label}</span>
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        {/* 环境技能 Dropdown */}
                        <div className="relative">
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowSkillDropdown(!showSkillDropdown);
                              setShowActionDropdown(false);
                            }}
                            className="h-7 px-2 rounded-lg text-[11px] font-semibold text-slate-650 hover:text-black hover:bg-slate-100 flex items-center gap-1 transition-colors border-0 bg-transparent cursor-pointer"
                            title="联动技能"
                          >
                            <Zap size={14} className="text-slate-500" />
                            <span>联动技能 ▾</span>
                          </button>
                          {showSkillDropdown && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setShowSkillDropdown(false)} />
                              <div className="absolute left-0 mt-1 w-32 bg-white border border-slate-200/90 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] py-1 z-45 animate-fade-in select-none text-left">
                                {INS_SKILLS.map(sk => (
                                  <button
                                    key={sk.id}
                                    type="button"
                                    onClick={() => {
                                      insertTextAtCursor(`\`${sk.code}\``);
                                      setShowSkillDropdown(false);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-[11px] text-slate-700 hover:text-black hover:bg-slate-50 font-medium border-0 bg-transparent transition-colors cursor-pointer"
                                  >
                                    <span>{sk.label}</span>
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        {/* 分割线 */}
                        <div className="w-[1px] h-3.5 bg-slate-200 mx-1 shrink-0" />

                        {/* Heading */}
                        <button
                          type="button"
                          onClick={() => insertTextAtCursor('\n### ')}
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center border-0 bg-transparent"
                          title="三级标题"
                        >
                          <Heading size={14} />
                        </button>

                        {/* Bold */}
                        <button
                          type="button"
                          onClick={() => insertTextAtCursor('**加粗**')}
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center border-0 bg-transparent font-bold"
                          title="加粗"
                        >
                          <Bold size={14} />
                        </button>

                        {/* Italic */}
                        <button
                          type="button"
                          onClick={() => insertTextAtCursor('*斜体*')}
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center border-0 bg-transparent"
                          title="斜体"
                        >
                          <Italic size={14} />
                        </button>

                        {/* Strikethrough */}
                        <button
                          type="button"
                          onClick={() => insertTextAtCursor('~~删除线~~')}
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center border-0 bg-transparent"
                          title="删除线"
                        >
                          <Strikethrough size={14} />
                        </button>

                        {/* Link */}
                        <button
                          type="button"
                          onClick={() => insertTextAtCursor('[链接文字](https://example.com)')}
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center border-0 bg-transparent"
                          title="插入链接"
                        >
                          <Link size={14} />
                        </button>

                        {/* 分割线 */}
                        <div className="w-[1px] h-3.5 bg-slate-200 mx-1 shrink-0" />

                        {/* Unordered List */}
                        <button
                          type="button"
                          onClick={() => insertTextAtCursor('\n- ')}
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center border-0 bg-transparent"
                          title="无序列表"
                        >
                          <List size={14} />
                        </button>

                        {/* Ordered List */}
                        <button
                          type="button"
                          onClick={() => insertTextAtCursor('\n1. ')}
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center border-0 bg-transparent"
                          title="有序列表"
                        >
                          <ListOrdered size={14} />
                        </button>

                        {/* List Todo */}
                        <button
                          type="button"
                          onClick={() => insertTextAtCursor('\n- [ ] ')}
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center border-0 bg-transparent"
                          title="任务列表"
                        >
                          <ListTodo size={14} />
                        </button>

                        {/* 分割线 */}
                        <div className="w-[1px] h-3.5 bg-slate-200 mx-1 shrink-0" />

                        {/* Trigger Template */}
                        <button
                          type="button"
                          onClick={() => insertTextAtCursor('\n- **触发**: \n- **执行**: \n')}
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center border-0 bg-transparent"
                          title="触法执行模板"
                        >
                          <Send size={14} />
                        </button>

                        {/* Separator Line */}
                        <button
                          type="button"
                          onClick={() => insertTextAtCursor('\n---\n')}
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center border-0 bg-transparent"
                          title="分割线"
                        >
                          <Minus size={14} />
                        </button>

                        {/* Code */}
                        <button
                          type="button"
                          onClick={() => insertTextAtCursor('`代码行`')}
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center border-0 bg-transparent"
                          title="单行代码"
                        >
                          <Code size={14} />
                        </button>

                        {/* Code2 block */}
                        <button
                          type="button"
                          onClick={() => insertTextAtCursor('\n```yaml\n\n```')}
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center border-0 bg-transparent"
                          title="代码块"
                        >
                          <Code2 size={14} />
                        </button>

                      </div>
                    </div>

                    <div className={`relative flex-1 min-h-0 border rounded-2xl bg-white shadow-inner overflow-hidden flex flex-col transition-all duration-200 ${
                      isTextareaFocused 
                        ? 'ring-2 ring-slate-900/10 border-slate-800' 
                        : 'border-[#e6e6eb]'
                    }`}>
                      {/* ⚙️ 底层语法高亮显示板，仅作背景视觉层 */}
                      <div 
                        ref={highlightOverlayRef}
                        className="absolute inset-0 w-full h-full p-5 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all overflow-y-auto pointer-events-none select-none text-left"
                        style={{
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none'
                        }}
                        dangerouslySetInnerHTML={{ 
                          __html: getHighlightedHtml(docContents[currentScriptView] || '') 
                        }}
                      />

                      {/* ⚙️ 顶层透明的活动输入 TextArea 层 */}
                      <textarea
                        ref={textareaRef}
                        className="absolute inset-0 w-full h-full p-5 font-mono text-xs leading-relaxed bg-transparent text-transparent caret-slate-800 focus:outline-none select-text resize-none overflow-y-auto"
                        placeholder=""
                        value={docContents[currentScriptView] || ''}
                        onScroll={(e) => {
                          if (highlightOverlayRef.current) {
                            highlightOverlayRef.current.scrollTop = e.currentTarget.scrollTop;
                          }
                        }}
                        onFocus={() => setIsTextareaFocused(true)}
                        onBlur={() => setIsTextareaFocused(false)}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (propSetDocContents) {
                            propSetDocContents(prev => ({ ...prev, [currentScriptView]: val }));
                          }
                          setTimeout(() => {
                            if (textareaRef.current && highlightOverlayRef.current) {
                              highlightOverlayRef.current.scrollTop = textareaRef.current.scrollTop;
                            }
                          }, 0);

                          const selStart = e.target.selectionStart;
                          if (!slashMenu) {
                            // 1. 如果斜杠菜单当时没有开启，只要刚输入的字符前一个是 '/'
                            const charBefore = val.substring(selStart - 1, selStart);
                            if (charBefore === '/') {
                              setSlashMenu({
                                isOpen: true,
                                searchQuery: '',
                                cursorPosition: selStart - 1
                              });
                            }
                          } else {
                            // 2. 如果当前已经开启了
                            const { cursorPosition } = slashMenu;
                            // 检查 / 字符是否还在 cursorPosition
                            if (val[cursorPosition] !== '/') {
                              setSlashMenu(null);
                            } else {
                              const query = val.substring(cursorPosition + 1, selStart);
                              if (selStart <= cursorPosition || /\s/.test(query)) {
                                setSlashMenu(null);
                              } else {
                                setSlashMenu({
                                  isOpen: true,
                                  searchQuery: query,
                                  cursorPosition
                                });
                              }
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === '/') {
                            const selStart = e.currentTarget.selectionStart;
                            if (!slashMenu) {
                              setSlashMenu({
                                isOpen: true,
                                searchQuery: '',
                                cursorPosition: selStart
                              });
                            }
                          }

                          if (slashMenu && slashMenu.isOpen) {
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setSlashSelectedIndex(prev => (prev + 1) % (activeLevel2Items.length || 1));
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setSlashSelectedIndex(prev => (prev - 1 + (activeLevel2Items.length || 1)) % (activeLevel2Items.length || 1));
                            } else if (e.key === 'Tab' || e.key === 'ArrowRight') {
                              e.preventDefault();
                              setSlashActiveCategory(prev => prev === 'action' ? 'skill' : 'action');
                              setSlashSelectedIndex(0);
                            } else if (e.key === 'ArrowLeft') {
                              e.preventDefault();
                              setSlashActiveCategory(prev => prev === 'skill' ? 'action' : 'skill');
                              setSlashSelectedIndex(0);
                            } else if (e.key === 'Enter') {
                              e.preventDefault();
                              if (activeLevel2Items[slashSelectedIndex]) {
                                handleSelectSlashItem(activeLevel2Items[slashSelectedIndex]);
                              }
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              setSlashMenu(null);
                            }
                          }
                        }}
                      />

                      {/* ⚙️ 原地斜杠浮窗组件 */}
                      {slashMenu && slashMenu.isOpen && (
                        <div 
                          style={{ top: `${getCaretCoordinates().top}px`, left: `${getCaretCoordinates().left}px` }}
                          className="absolute w-[240px] bg-white rounded-xl border border-[#e6e6eb] shadow-[0_10px_30px_rgba(0,0,0,0.15)] z-50 flex overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150"
                        >
                          {/* 一级菜单: 动作库 & 技能库 */}
                          <div className="w-[85px] bg-slate-50 border-r border-[#f0f0f5] flex flex-col p-1 gap-0.5 shrink-0 select-none text-[11px] font-semibold text-slate-600">
                            <div
                              onMouseEnter={() => setSlashActiveCategory('action')}
                              onClick={() => setSlashActiveCategory('action')}
                              className={`px-2 py-1.5 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                                slashActiveCategory === 'action'
                                  ? 'bg-slate-200/60 text-slate-900 font-bold'
                                  : 'hover:bg-slate-100 text-slate-500'
                              }`}
                            >
                              <span>动作库</span>
                              <span className="text-[9px] text-slate-400">›</span>
                            </div>
                            
                            <div
                              onMouseEnter={() => setSlashActiveCategory('skill')}
                              onClick={() => setSlashActiveCategory('skill')}
                              className={`px-2 py-1.5 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                                slashActiveCategory === 'skill'
                                  ? 'bg-slate-200/60 text-slate-900 font-bold'
                                  : 'hover:bg-slate-100 text-slate-500'
                              }`}
                            >
                              <span>技能库</span>
                              <span className="text-[9px] text-slate-400">›</span>
                            </div>
                          </div>

                          {/* 二级菜单: 展开的列表内容 */}
                          <div className="flex-1 overflow-y-auto p-1 max-h-[160px] flex flex-col gap-0.5 min-w-0 bg-white">
                            {activeLevel2Items.length === 0 ? (
                              <div className="py-8 text-center text-slate-400 text-[10px] font-sans font-medium">
                                无匹配
                              </div>
                            ) : (
                              activeLevel2Items.map((item, index) => {
                                const isSelected = index === slashSelectedIndex;
                                return (
                                  <div
                                    key={item.id}
                                    onClick={() => handleSelectSlashItem(item)}
                                    onMouseEnter={() => setSlashSelectedIndex(index)}
                                    className={`w-full text-left px-2 py-1 text-[11px] flex items-center justify-between transition-all duration-75 cursor-pointer rounded-lg select-none ${
                                      isSelected 
                                        ? 'bg-[#1a1a1c] text-white shadow-xs font-semibold' 
                                        : 'hover:bg-slate-50 text-slate-700 font-medium'
                                    }`}
                                  >
                                    <span className="truncate flex-1 pr-1">{item.label}</span>
                                    <span className={`text-[8px] px-1 py-0.2 rounded font-mono scale-90 shrink-0 ${
                                      isSelected 
                                        ? 'bg-white/20 text-white font-extrabold' 
                                        : item.type === 'action' 
                                          ? 'bg-blue-50/70 text-blue-600 border border-blue-100 font-bold' 
                                          : 'bg-indigo-50/70 text-indigo-600 border border-indigo-100 font-bold'
                                    }`}>
                                      {item.type === 'action' ? '动作' : '技能'}
                                    </span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ================== B. 真实 Markdown 渲染预览区 ================== */
                  <div className="flex-1 min-h-0 border border-[#e6e6eb] rounded-2xl bg-[#fafafc] p-6 font-mono text-xs leading-relaxed text-slate-705 select-text overflow-y-auto shadow-inner">
                    {renderScriptContent(docContents[currentScriptView] || docContents['welcomeFlow'])}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold font-mono shrink-0">
                <span>FORMAT: markdown / structural_script</span>
                <span className="text-blue-600 flex items-center gap-1 cursor-pointer font-sans" onClick={() => setScriptEditMode('edit')}>
                  <span>⚡ 逻辑检查及动作映射已激活 (支持打字和一键富文本)</span>
                </span>
              </div>
            </div>
          ) : activePanelTab === 'task' ? (
            /* ================== 下半段: 任务书主工作台 ================== */
            <div className="px-5 pb-4 pt-1 flex flex-col gap-3 flex-1 min-h-0 overflow-hidden font-sans">
              
              {/* 1. 任务书动态 Tabs 排布排控制区 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 font-sans border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.03)] border border-[#e6e6eb] flex-wrap max-w-full">
                  {Object.keys(taskContents || {}).map((key, index) => {
                    const isActive = currentTaskView === key;
                    const displayName = getTaskBookName(key, (taskContents && taskContents[key]) || '');
                    
                    return (
                      <div 
                        key={key}
                        onClick={() => {
                          if (setCurrentTaskView) {
                            setCurrentTaskView(key);
                          }
                        }}
                        className={`h-7 px-3 rounded-lg text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1.5 select-none relative ${
                          isActive 
                            ? 'bg-[#1d1d1f] text-white shadow-xs border border-transparent font-extrabold shadow-[0_2px_4px_rgba(0,0,0,0.15)]' 
                            : 'bg-transparent text-slate-500 hover:bg-white/50 hover:text-slate-800'
                        }`}
                      >
                        <span className="truncate max-w-[130px]">{index + 1}. {displayName}</span>
                        
                        {/* 删除当前任务书 */}
                        <span 
                          onClick={(e) => handleDeleteTaskBook(key, e)}
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all font-extrabold text-[8px] leading-none shrink-0 ${
                            isActive
                              ? 'bg-white/20 hover:bg-red-500 hover:text-white text-white/80'
                              : 'bg-slate-200/50 hover:bg-red-500 hover:text-white text-slate-500'
                          }`}
                          title="删除此任务书"
                        >
                          ×
                        </span>
                      </div>
                    );
                  })}

                  {/* 新增任务书 */}
                  <button 
                    onClick={handleAddNewTaskBook}
                    className="h-7 w-7 rounded-lg border-0 bg-transparent text-slate-500 hover:bg-white hover:text-black flex items-center justify-center transition-all cursor-pointer font-bold text-xs"
                    title="可在任务书中新增一个 JSON 配置文件"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 2. 编辑与展示、历史记录核心区 */}
              <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs flex flex-col flex-1 min-h-0 font-sans">
                
                {/* 虚拟 IDE 标题页签与高级控制栏 */}
                <div className="h-10 px-4 bg-slate-50 border-b border-slate-105 flex items-center justify-between shrink-0 font-sans gap-4 overflow-x-auto scrollbar-none flex-nowrap">
                  <div className="flex items-center gap-2 flex-row shrink-0">
                    <span className="text-[10px] font-extrabold text-blue-500 bg-blue-50 border border-blue-105 px-1.5 py-0.5 rounded uppercase font-mono scale-90">
                      EDITABLE
                    </span>
                    <span className="text-[11px] font-extrabold text-slate-600 font-mono italic truncate max-w-[120px] md:max-w-[180px]">
                      /etc/mqtt/{currentTaskView}.json
                    </span>
                  </div>

                  {/* 历史撤销、重做、格式化、插入行动的核心工具栏 */}
                  <div className="flex items-center gap-1.5 shrink-0 flex-row flex-nowrap">
                    {/* Undo / Redo */}
                    <button
                      onClick={handleUndo}
                      disabled={(!taskUndoStack || !taskUndoStack[currentTaskView] || taskUndoStack[currentTaskView].length === 0)}
                      className="h-6.5 px-2 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:hover:bg-white border border-[#e6e6eb] rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-all shrink-0"
                      title="撤销 (Undo)"
                    >
                      <Undo2 className="w-3 h-3" /> 撤销
                    </button>
                    <button
                      onClick={handleRedo}
                      disabled={(!taskRedoStack || !taskRedoStack[currentTaskView] || taskRedoStack[currentTaskView].length === 0)}
                      className="h-6.5 px-2 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:hover:bg-white border border-[#e6e6eb] rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-all shrink-0"
                      title="重做 (Redo)"
                    >
                      <Redo2 className="w-3 h-3" /> 重做
                    </button>

                    <div className="h-4 w-[1px] bg-slate-200 shrink-0" />

                    {/* Format / Minify */}
                    <button
                      onClick={handlePrettifyJson}
                      className="h-6.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-[#e6e6eb] rounded-lg text-[10px] font-bold cursor-pointer transition-all shrink-0"
                      title="自动排版美化 JSON"
                    >
                      <Sparkles className="w-3 h-3" /> 格式化
                    </button>
                    <button
                      onClick={handleMinifyJson}
                      className="h-6.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-[#e6e6eb] rounded-lg text-[10px] font-bold cursor-pointer transition-all shrink-0 hidden sm:inline-block"
                      title="极致压缩清除空白符"
                    >
                      <Minimize2 className="w-3 h-3" /> 压缩
                    </button>

                    <div className="h-4 w-[1px] bg-slate-200 hidden sm:inline-block shrink-0" />

                    {/* Quick snippet insertion dropdown */}
                    <div className="relative group/snippet font-sans shrink-0">
                      <button className="h-6.5 px-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1">
                        <Plus className="w-3 h-3" /> 插入节点 <ChevronDown className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] py-1 hidden group-hover/snippet:block hover:block z-45 text-left font-sans">
                        <div className="px-2.5 py-1 text-[9px] uppercase font-bold text-slate-400 border-b border-slate-50 mb-1">
                          快速流插桩模板
                        </div>
                        {PRESET_TASK_SNIPPETS.map((snip, sIdx) => {
                          const IconComponent = 
                            snip.type === 'pose' ? Smile :
                            snip.type === 'audio' ? AudioLines :
                            snip.type === 'navi' ? Compass :
                            Zap;
                          
                          return (
                            <div
                              key={sIdx}
                              onClick={() => handleInsertSnippet(snip.obj)}
                              className="px-3 py-1.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-center gap-2"
                            >
                              <div className="w-5.5 h-5.5 rounded bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                <IconComponent className="w-3 h-3 text-slate-500" />
                              </div>
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="text-[11px] font-bold text-slate-800 leading-none">{snip.label}</span>
                                <span className="text-[9px] text-slate-400 leading-none truncate">{snip.desc}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="h-4 w-[1px] bg-slate-200 shrink-0" />

                    {/* Version History panel toggle button */}
                    <button
                      onClick={() => setShowHistorySidebar(!showHistorySidebar)}
                      className={`h-6.5 px-2 rounded-lg border transition-all text-[10px] font-bold cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        showHistorySidebar 
                          ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100' 
                          : 'border-[#e6e6eb] bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <History className="w-3 h-3" /> 历史版本 ({(taskSnapshots[currentTaskView] || []).length})
                    </button>
                  </div>
                </div>

                {/* 主代码区和历史侧边栏组合 */}
                <div className="flex-1 min-h-0 flex flex-row overflow-hidden relative">
                  
                  {/* Left: Code Editor Container */}
                  <div className="flex-1 min-h-0 flex flex-col bg-slate-50/20 relative">
                    <div id="task-book-view-container" className="flex-1 min-h-0 overflow-y-auto w-full">
                      {isJsonEditing ? (
                        <div className="flex h-full min-h-0">
                          {/* 虚拟行号 */}
                          <div className="w-9 bg-slate-50 border-r border-[#e6e6eb]/80 flex flex-col pt-3 pb-3 text-right pr-2 text-slate-350 select-none font-mono text-[10px] leading-relaxed shrink-0">
                            {jsonText.split('\n').map((_, idx) => (
                              <div key={idx} className="h-[21px]">{idx + 1}</div>
                            ))}
                          </div>
                          
                          {/* 输入区 textarea */}
                          <textarea
                            id="task-textarea"
                            value={jsonText}
                            onChange={(e) => updateJsonAndTasksWithHistory(e.target.value)}
                            placeholder="请输入符合规范的标准 JSON 数据数组..."
                            spellCheck="false"
                            className="flex-1 border-0 outline-none p-3 text-xs bg-transparent text-slate-800 font-mono leading-relaxed resize-none focus:ring-0 select-text text-left self-stretch h-full min-h-[400px] font-sans"
                          />
                        </div>
                      ) : (
                        <div>
                          {renderHighlightedJSON(jsonText)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: History Version Sidebar Drawer with smooth animation */}
                  {showHistorySidebar && (
                    <div className="w-68 border-l border-slate-200 bg-slate-50 flex flex-col min-h-0 shrink-0 font-sans animate-fade-in">
                      {/* Sidebar Header */}
                      <div className="p-3 border-b border-slate-200 bg-slate-105 flex items-center justify-between shrink-0">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-slate-500 shrink-0" /> 历史备份快照
                        </span>
                        <button 
                          onClick={() => setShowHistorySidebar(false)}
                          className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer text-xs p-1"
                        >
                          ×
                        </button>
                      </div>

                      {/* Manual backup form */}
                      <div className="p-3 border-b border-slate-200 bg-white shrink-0 flex flex-col gap-1.5">
                        <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">创建新的备份快照</span>
                        <div className="flex gap-1">
                          <input 
                            type="text" 
                            placeholder="如: 修改迎宾动作" 
                            value={newSnapshotNote}
                            onChange={(e) => setNewSnapshotNote(e.target.value)}
                            className="flex-1 text-[11px] px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-slate-400 font-sans"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCreateSnapshot();
                            }}
                          />
                          <button 
                            onClick={handleCreateSnapshot}
                            className="px-2.5 py-1 bg-[#1d1d1f] hover:bg-black text-white text-[11px] font-bold rounded-lg border-0 cursor-pointer transition-all shrink-0"
                          >
                            备份
                          </button>
                        </div>
                      </div>

                      {/* Backup Timeline scroll region */}
                      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-slate-50/50">
                        {(taskSnapshots[currentTaskView] || []).length === 0 ? (
                          <div className="text-center py-8 text-slate-400 text-[10px] italic">
                            暂无历史版本记录
                          </div>
                        ) : (
                          (taskSnapshots[currentTaskView] || []).map((backup) => (
                            <div 
                              key={backup.id} 
                              className="p-2.5 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)] flex flex-col gap-1 text-left relative"
                            >
                              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono shrink-0">
                                <span className="font-semibold">{backup.timestamp}</span>
                                <span className="bg-slate-100 px-1 py-0.2 rounded font-extrabold text-[9px] text-slate-500 font-mono">
                                  {backup.nodeCount} 节点
                                </span>
                              </div>
                              <p className="text-[11px] font-bold text-slate-700 m-0 leading-normal truncate font-sans">
                                {backup.note}
                              </p>
                              
                              <div className="flex justify-end gap-1 mt-1.5">
                                <button
                                  onClick={() => {
                                    updateJsonAndTasksWithHistory(backup.text, true);
                                  }}
                                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border-0 rounded text-[10px] font-semibold text-slate-600 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                                  title="将当前 JSON 编辑器回滚至此版本"
                                >
                                  <Undo2 className="w-3 h-3 text-slate-550 shrink-0" /> 恢复此版本
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                </div>

                {/* 底部实时状态语法检测反馈 */}
                <div className="h-9 px-4 border-t border-slate-150 flex items-center justify-between text-[11px] font-bold font-mono bg-white shrink-0">
                  {jsonError ? (
                    <div className="text-red-500 flex items-center gap-1.5 py-0.5 animate-pulse text-left flex-row font-sans">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span className="truncate max-w-[500px]">{jsonError}</span>
                    </div>
                  ) : (
                    <div className="text-emerald-600 flex items-center gap-1.5 py-0.5 text-left flex-row font-sans">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>JSON 语法规范验证通过 (Active Array Nodes: {tasks.length})</span>
                    </div>
                  )}
                  <span className="text-slate-400 capitalize hidden sm:inline font-mono">UTF-8 / Space 2</span>
                </div>

              </div>

            </div>
          ) : (
            /* ================== 下半段: 人设编辑与配置模块 ================== */
            <div className="px-5 pb-5 pt-1 flex flex-col gap-3.5 flex-1 min-h-0 font-sans text-left select-text">
              
              {/* 发音人音色 */}
              <div className="flex flex-col gap-1.5 text-left shrink-0">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-left">匹配发音人音色</label>
                <div className="flex bg-slate-50 border border-[#e6e6eb] rounded-xl p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] justify-between gap-1 h-10 items-center max-w-sm">
                  <button 
                    onClick={() => setVoiceOption('male')}
                    className={`h-8 flex-1 border-0 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      voiceOption === 'male' ? 'bg-[#1d1d1f] text-white shadow-xs' : 'bg-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    👨 男声 (硬核沉稳)
                  </button>
                  <button 
                    onClick={() => setVoiceOption('female')}
                    className={`h-8 flex-1 border-0 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      voiceOption === 'female' ? 'bg-[#1d1d1f] text-white shadow-xs' : 'bg-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    👩 女声 (甜美自然)
                  </button>
                </div>
              </div>

              {/* 表达风格与情感大输入区 */}
              <div className="flex flex-col gap-1.5 text-left flex-1 min-h-0 font-mono">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-left">人设 Prompt 说明已定义</label>
                <textarea 
                  value={toneStyle}
                  onChange={(e) => setToneStyle(e.target.value)}
                  className="flex-1 w-full border border-[#e6e6eb] rounded-xl p-3.5 text-xs text-slate-800 focus:border-slate-800 outline-none resize-none bg-white font-medium text-left shadow-2xs leading-relaxed min-h-[160px] overflow-y-auto"
                  placeholder="请输入风格调性 Prompt，例如：友好、专业、自然且具有物理科技亲和感..."
                />
              </div>

            </div>
          )}
        </section>

      </div>

      {/* 5. 动作原位修改浮窗模态框 - Exhibits preset actions list */}
      <AnimatePresence>
        {activeActionEdit && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs flex items-center justify-center z-[100] p-4 transition-all"
            onClick={() => setActiveActionEdit(null)}
          >
            <motion.div 
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="bg-white border border-[#e6e6eb] rounded-2.5xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col text-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4.5 border-b border-[#f4f4f7] flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2 text-left">
                  <span className="text-lg">🤖</span>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#1d1d1f]">原位修改目标动作角色</h4>
                    <span className="text-[10px] text-slate-400 font-medium font-sans">
                      正在将第 {activeActionEdit.lineIndex + 1} 行的动作进行重新规划与对齐
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveActionEdit(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center border-0 cursor-pointer text-slate-450 text-xs font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Action List Selector */}
              <div className="p-4 flex flex-col gap-2 max-h-[385px] overflow-y-auto">
                <div className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider mb-1 pl-1 text-left">
                  选择新的姿势动作 (PRESET MOTIONS)
                </div>
                {PRESET_ACTIONS.map((act) => {
                  const isCurrent = act.id === activeActionEdit.oldValue;
                  return (
                    <button
                      key={act.id}
                      onClick={() => {
                        syncActionAcrossViews(activeActionEdit.oldValue, act.id);
                        setActiveActionEdit(null);
                      }}
                      className={`w-full p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 relative ${
                        isCurrent 
                          ? 'border-amber-400 bg-amber-50/20 shadow-xs' 
                          : 'border-slate-100 hover:border-slate-350 bg-white hover:shadow-2xs'
                      }`}
                    >
                      <span className="text-2xl mt-0.5 shrink-0">{act.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[11.5px] font-bold text-slate-800">{act.label}</span>
                          <span className="text-[9.5px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-104">
                            {act.id}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                          {act.desc}
                        </p>
                      </div>
                      
                      {isCurrent && (
                        <span className="absolute right-3.5 top-3.5 text-xs text-amber-600 bg-amber-100/50 px-1 border border-amber-200 rounded text-[9.5px] font-extrabold uppercase scale-90">
                          当前
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#f4f4f7] bg-slate-50/50 flex justify-end gap-2.5">
                <button
                  onClick={() => setActiveActionEdit(null)}
                  className="h-9.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl border-0 cursor-pointer transition-colors"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. 高阶肢体/技能二级全屏大插入浮窗模态框 */}
      {showInsertModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[110] p-4 animate-fade-in select-none">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden flex flex-col text-slate-800 animate-slide-in select-none max-h-[85vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5 text-left">
                <span className="text-xl leading-none">🔮</span>
                <div>
                  <h3 className="text-[12.5px] font-bold text-slate-800">行为剧本智能插桩：添加机器人动作与物联技能</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">选择推荐的功能要素，瞬间一键注入至当前编辑器的光标位置</p>
                </div>
              </div>
              <button 
                onClick={() => setShowInsertModal(false)}
                className="w-7 h-7 rounded-full border border-slate-201 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-300 flex items-center justify-center transition-colors text-xs font-bold shadow-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            {/* Modal Body with 2-column list */}
            <div className="p-5 overflow-y-auto flex-1 flex flex-col md:flex-row gap-5 min-h-0 text-left">
              {/* Left Column: Actions */}
              <div className="flex-1 flex flex-col gap-3 min-h-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 border-b border-slate-100 pb-2 shrink-0">
                  <span>👋</span>
                  <span>推荐动作库 (Actions Library)</span>
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1 bg-slate-50/10 p-1 rounded-xl">
                  {INS_ACTIONS.map(act => (
                    <div 
                      key={act.id}
                      onClick={() => {
                        insertTextAtCursor(`\`${act.code}\``);
                        setShowInsertModal(false);
                      }}
                      className="group border border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-50/40 p-2.5 rounded-xl cursor-pointer transition-all active:scale-[0.98] select-none text-left"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-extrabold text-slate-800 group-hover:text-black">{act.label}</span>
                        <span className="font-mono text-[9px] text-slate-400 group-hover:text-slate-600 bg-slate-50 px-1 py-0.5 border border-slate-150 rounded scale-[0.9]">+ {act.id}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{act.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Right Column: Skills */}
              <div className="flex-1 flex flex-col gap-3 min-h-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 border-b border-slate-100 pb-2 shrink-0">
                  <span>🔌</span>
                  <span>推荐技能库 (Skills Library)</span>
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1 bg-slate-50/10 p-1 rounded-xl">
                  {INS_SKILLS.map(sk => (
                    <div 
                      key={sk.id}
                      onClick={() => {
                        insertTextAtCursor(`\`${sk.code}\``);
                        setShowInsertModal(false);
                      }}
                      className="group border border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-50/40 p-2.5 rounded-xl cursor-pointer transition-all active:scale-[0.98] select-none text-left"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-extrabold text-slate-800 group-hover:text-black">{sk.label}</span>
                        <span className="font-mono text-[9px] text-slate-400 group-hover:text-slate-600 bg-slate-50 px-1 py-0.5 border border-slate-150 rounded scale-[0.9]">+ {sk.id}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{sk.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[10px] text-slate-400 font-bold">
              <span>💡 小贴士：点击上方任何功能卡片即可马上对齐插桩到当前光标原位</span>
              <button 
                onClick={() => setShowInsertModal(false)}
                className="px-4 py-1.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold cursor-pointer transition-colors border-0 text-xs shadow-xs"
              >
                就绪关闭
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
