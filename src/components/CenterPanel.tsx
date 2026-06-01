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
  CircleDot
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

interface CenterPanelProps {
  currentScriptView: 'welcomeFlow' | 'companyIntro' | 'visitorReception';
  setCurrentScriptView: (view: 'welcomeFlow' | 'companyIntro' | 'visitorReception') => void;
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
  isMapConflict = false
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

  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isJsonEditing, setIsJsonEditing] = useState(false);

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

  // 当外部导航切换至任务书面板时，自动关闭 JSON 编辑模式以确保正常展示高亮内容
  useEffect(() => {
    if (activePanelTab === 'task') {
      setIsJsonEditing(false);
    }
  }, [activePanelTab]);

  // 监听地图冲突状态和面板页签切换，在 DOM 渲染后自动平滑滚动定位到对应的物理位置异常点位/标红线
  useEffect(() => {
    if (isMapConflict) {
      if (activePanelTab === 'task') {
        if (isJsonEditing) {
          setIsJsonEditing(false);
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
      setJsonText(formatted);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(`格式化失败，请检查 JSON 语法: ${err.message}`);
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
                        : 'bg-blue-50/70 border-l-4 border-blue-500 shadow-[0_0_12px_rgba(41,121,255,0.15)] scale-[1.01] origin-left animate-pulse' 
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
                          : 'text-blue-900 font-extrabold bg-blue-50/30 px-1 rounded-sm' 
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

  const renderScriptContent = (text: string) => {
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
                          ? 'bg-purple-50/90 border-purple-500 text-purple-900 shadow-[0_2px_10px_rgba(168,85,247,0.18)] ring-2 ring-purple-500/10'
                          : isHighlightingSemanticPoint
                            ? 'bg-emerald-50/95 border-emerald-500 text-emerald-950 shadow-[0_2px_10px_rgba(16,185,129,0.18)] ring-2 ring-emerald-500/10'
                            : 'bg-blue-50/90 border-blue-500 text-blue-900 shadow-[0_2px_10px_rgba(37,99,235,0.18)] ring-2 ring-blue-500/10'
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
                            : '#eff6ff' 
                        : '#fcfcfd'
                  }}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isMapConflictLine 
                        ? 'bg-red-500 animate-pulse' 
                        : isHighlighted 
                          ? isHighlightingSkill 
                            ? 'bg-purple-500' 
                            : isHighlightingSemanticPoint
                              ? 'bg-emerald-500'
                              : 'bg-blue-500' 
                          : 'bg-slate-300'
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
                                : 'text-blue-955 font-extrabold' 
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
                      <span className={`whitespace-pre-wrap text-left select-all break-all pr-4 ${isMapConflictLine ? 'text-red-950 font-extrabold font-mono text-[11.5px]' : isHighlighted ? isHighlightingSkill ? 'text-purple-950 font-extrabold' : 'text-blue-950 font-extrabold' : 'text-slate-750 font-semibold'}`}>
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
              return <div key={idx} className="text-left text-[10.5px] font-bold text-slate-400 mt-1 mb-1">📋 KEYWORDS:</div>;
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
                <span>{isConstraint ? '📋' : '🎯'}</span>
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
                <span className="text-slate-800 font-bold shrink-0">⚡ 触发：</span>
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
          <div className="px-5 py-4 border-b border-[#f4f4f7] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white shrink-0 font-sans">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] border border-[#e6e6eb] self-start font-sans">
              <button
                onClick={() => setActivePanelTab('persona')}
                className={`h-7.5 px-3.5 rounded-lg border-0 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 font-sans ${
                  activePanelTab === 'persona' ? 'bg-[#1d1d1f] text-white shadow-xs' : 'bg-transparent text-slate-550 hover:text-slate-800'
                }`}
              >
                <span>🤖</span> 人设 (Persona)
              </button>
              <button
                onClick={() => setActivePanelTab('script')}
                className={`h-7.5 px-3.5 rounded-lg border-0 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 font-sans ${
                  activePanelTab === 'script' ? 'bg-[#1d1d1f] text-white shadow-xs' : 'bg-transparent text-slate-550 hover:text-slate-800'
                }`}
              >
                <span>📜</span> 行为剧本 (Script)
              </button>
              <button
                onClick={() => setActivePanelTab('task')}
                className={`h-7.5 px-3.5 rounded-lg border-0 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 font-sans ${
                  activePanelTab === 'task' ? 'bg-[#1d1d1f] text-white shadow-xs' : 'bg-transparent text-slate-550 hover:text-slate-800'
                }`}
              >
                <span>📋</span> 任务书 (JSON)
              </button>
            </div>
          </div>

          {/* Conditional Rendering of Panel Contents */}
          {activePanelTab === 'script' ? (
            <div className="p-5 flex flex-col gap-4 flex-1 min-h-0 overflow-hidden font-sans">
              
              {/* 子级别指示与层级关系切换 */}
              <div className="flex flex-col gap-2 shrink-0 font-sans">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] border border-[#e6e6eb] self-start font-sans">
                  <button 
                    onClick={() => setCurrentScriptView('welcomeFlow')}
                    className={`h-7.5 px-3.5 rounded-lg border-0 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 font-sans ${
                      currentScriptView === 'welcomeFlow' ? 'bg-white text-[#1d1d1f] shadow-xs' : 'bg-transparent text-slate-550 hover:text-slate-800'
                    }`}
                  >
                    迎宾流程
                  </button>
                  <button 
                    onClick={() => setCurrentScriptView('companyIntro')}
                    className={`h-7.5 px-3.5 rounded-lg border-0 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 font-sans ${
                      currentScriptView === 'companyIntro' ? 'bg-white text-[#1d1d1f] shadow-xs' : 'bg-transparent text-slate-550 hover:text-slate-800'
                    }`}
                  >
                    公司介绍
                  </button>
                  <button 
                    onClick={() => setCurrentScriptView('visitorReception')}
                    className={`h-7.5 px-3.5 rounded-lg border-0 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 font-sans ${
                      currentScriptView === 'visitorReception' ? 'bg-white text-[#1d1d1f] shadow-xs' : 'bg-transparent text-slate-550 hover:text-slate-800'
                    }`}
                  >
                    访客接待
                  </button>
                </div>
              </div>

              {/* 剧本原文展示区 - 设定 flex-1 min-h-0 自动拉伸填充 */}
              <div className="flex-1 min-h-0 border border-[#e6e6eb] rounded-2xl bg-[#fafafc] p-6 font-mono text-xs leading-relaxed text-slate-705 select-text overflow-y-auto shadow-inner">
                {renderScriptContent(docContents[currentScriptView] || docContents['welcomeFlow'])}
              </div>
              
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold font-mono shrink-0">
                <span>FORMAT: markdown / structural_script</span>
                <span className="text-blue-600 flex items-center gap-1 cursor-pointer font-sans">
                  <span>⚡ 逻辑检查及动作映射已激活</span>
                </span>
              </div>
            </div>
          ) : activePanelTab === 'task' ? (
            /* ================== 下半段: 任务书主工作台 ================== */
            <div className="p-5 flex flex-col gap-4 flex-1 min-h-0 overflow-hidden font-sans">
              


              {/* 编辑与展示核心区 - 要占满剩余高度 */}
              <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs flex flex-col flex-1 min-h-0 font-sans">
                
                {/* 虚拟 IDE 标题页签 */}
                <div className="h-9.5 px-4 bg-slate-50 border-b border-slate-105 flex items-center justify-between shrink-0 font-sans">
                  <div className="flex items-center gap-1.5 flex-row">
                    <span className="text-[10px] font-extrabold text-blue-500 bg-blue-50 border border-blue-105 px-1.5 py-0.5 rounded uppercase font-mono scale-90">
                      EDITABLE
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 font-mono">/etc/mqtt/task_schedule_blueprint.json</span>
                  </div>

                  {/* 状态切换(唯读/编辑) */}
                  <button
                    onClick={() => setIsJsonEditing(!isJsonEditing)}
                    className={`h-6.5 px-2.5 rounded-lg border transition-all text-[11px] font-bold cursor-pointer flex items-center gap-1 flex-row font-sans ${
                      isJsonEditing 
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                        : 'border-[#e6e6eb] bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {isJsonEditing ? (
                      <>
                        <span>💾 保存锁定</span>
                      </>
                    ) : (
                      <>
                        <span>🖋️ 编辑配置</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 编辑或者高亮代码框 */}
                <div id="task-book-view-container" className="relative flex-1 min-h-0 overflow-y-auto bg-slate-50/30">
                  {isJsonEditing ? (
                    <div className="flex h-full min-h-0">
                      {/* 虚拟行号 */}
                      <div className="w-10 bg-slate-50/50 border-r border-[#e6e6eb] flex flex-col pt-3 pb-3 text-right pr-2 text-slate-350 select-none font-mono text-[11px] leading-relaxed">
                        {jsonText.split('\n').map((_, idx) => (
                          <div key={idx} className="h-[21px]">{idx + 1}</div>
                        ))}
                      </div>
                      
                      {/* 输入区 */}
                      <textarea
                        value={jsonText}
                        onChange={(e) => updateJsonAndTasks(e.target.value)}
                        placeholder="请输入符合规范的标准 JSON 数据数组..."
                        spellCheck="false"
                        className="flex-1 border-0 outline-none p-3 text-xs bg-transparent text-slate-800 font-mono leading-relaxed resize-none focus:ring-0 select-text text-left self-stretch h-full"
                      />
                    </div>
                  ) : (
                    <div>
                      {renderHighlightedJSON(jsonText)}
                    </div>
                  )}
                </div>

                {/* 底部实时状态语法检测反馈 */}
                <div className="h-9 px-4 border-t border-slate-150 flex items-center justify-between text-[11px] font-bold font-mono bg-white shrink-0">
                  {jsonError ? (
                    <div className="text-red-500 flex items-center gap-1.5 py-0.5 animate-pulse text-left flex-row font-sans">
                      <span>❌</span>
                      <span className="truncate max-w-[500px]">{jsonError}</span>
                    </div>
                  ) : (
                    <div className="text-emerald-600 flex items-center gap-1.5 py-0.5 text-left flex-row font-sans">
                      <span>🟢</span>
                      <span>JSON 语法规范验证通过 (Active Array Nodes: {tasks.length})</span>
                    </div>
                  )}
                  <span className="text-slate-400 capitalize hidden sm:inline font-mono">UTF-8 / Space 2</span>
                </div>

              </div>

            </div>
          ) : (
            /* ================== 下半段: 人设编辑与配置模块 ================== */
            <div className="p-6 flex flex-col gap-5 flex-1 min-h-0 font-sans text-left select-text">
              
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

    </div>
  );
}
