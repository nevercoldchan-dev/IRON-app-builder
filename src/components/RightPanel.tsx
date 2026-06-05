import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { ResourceSection } from '../types';

interface RightPanelProps {
  resourceSections: ResourceSection[];
  onOpenMapSelect: () => void;
  onDeleteResourceMap: () => void;
  setResourceSections: (sections: ResourceSection[]) => void;
  setActivePanelTab?: (tab: 'script' | 'task' | 'persona') => void;
  setCurrentScriptView?: (view: string) => void;
  highlightedAction?: string | null;
  setHighlightedAction?: (act: string | null) => void;
  onResourceReplacementConfirm?: (category: string, oldItem: string, newItem: string) => void;
  currentMapName?: string;
  isMapConflict?: boolean;
  docContents?: Record<string, string>;
  tasks?: any[];
}

// 全局预设资源库
const GLOBAL_RESOURCE_REGISTRY: Record<string, { name: string; desc: string; detail: string; icon: string }[]> = {
  persona: [
    { name: '小鹏智驾体验官', desc: '专注于小鹏汽车系列车型的智驾方案、硬核三电、XPILOT 辅助驾驶及试驾流程的智能解说员专家。', detail: '智驾版 | 深度讲解专家', icon: '🏎️' },
    { name: '硬核物理馆解说家', desc: '针对大型科普科技体验馆、科普物理实验室进行通俗讲解的情境对话师，擅长结合物理定律答疑解惑。', detail: '科普版 | 物理馆解说家', icon: '🏢' },
    { name: '美学沙龙情感策展人', desc: '温婉优雅风格，擅长讲解展区画作、艺术流派、策展背后的情感表达与历史故事的人文主理人。', detail: '美学版 | 情感主理人', icon: '🎨' }
  ],
  map: [
    { name: '小鹏科技园大堂地图', desc: '1:200 室内大空间激光雷达图，覆盖入口、服务台与大堂区域', detail: 'SLAM 激光高精图', icon: '🗺️' },
    { name: '智能展厅及智驾体验区地图', desc: '1:150 细节级地图，包含多传感器标定及模拟智驾仓特殊点位', detail: 'SLAM 激光高精图', icon: '🚗' },
    { name: '新能源科技馆全景展示地图', desc: '1:300 大跨度复式空间高保真图，覆盖一至三层长走廊与实车区', detail: 'SLAM 激光高精图', icon: '🏢' },
    { name: '高新技术大厦接待大厅地图', desc: '1:180 通用接待环境地图，重点标注了安全通道、电梯及门卫', detail: 'SLAM 激光高精图', icon: '🏨' },
    { name: 'VIP尊享接待区微缩闭环路径图', desc: '1:100 高阶接待专属静音路径，通往各个私密会所与商务谈判间', detail: 'SLAM 激光高精图', icon: '👑' }
  ],
  knowledge: [
    { name: '科技馆展厅介绍知识库', desc: '关于科技馆整体概况、展区主题、建设沿革以及核心科普理念', detail: '问答对: 120条 | 说明文档: 1篇', icon: '📘' },
    { name: '机器人互动区讲解知识库', desc: '各种交互式机器人、机械臂在特定科普情境下的互动流程和技术名词解说', detail: '问答对: 85条 | 交互触发: 20处', icon: '🤖' },
    { name: '航天探索展区问答知识库', desc: '提供长征系列火箭、空间站模型、以及火星漫游车相关硬核知识的科普回答', detail: '问答对: 200条 | 趣味互动: 50条', icon: '🚀' },
    { name: '馆内安全须知知识库', desc: '标准安防预案、安全通道分布、消防器材位置和常规医疗求助急救流程', detail: 'Safety Guideline | 应急联动', icon: '⚠️' },
    { name: '小鹏智能驾驶技术白皮书', desc: '解说 XPILOT 4.0 与端到端智驾系统的架构、传感器极限和避障机制', detail: '问答对: 95条 | 架构解析: 10篇', icon: '⚡' },
    { name: '新能源电池与三电系统讲解词', desc: '针对大模组、高电压快充、电芯安全及热管理机制的通俗幽默化导览讲稿', detail: '讲解文本: 3万字 | 图示支持', icon: '🔋' },
    { name: '展馆少儿科普互动讲解包', desc: '面向低龄观众的趣味拟人化提问、生动比喻、益智抢答 and 简短精辟的解释', detail: '儿歌韵律 | 趣味问答: 60条', icon: '🎈' },
    { name: 'VIP贵宾高规格接待语合集', desc: '面向政企或行业高层交流的发言体、致迎词、典故讲解和高频问答礼仪标准', detail: '正式用语 | 专属问答: 40条', icon: '👔' }
  ],
  action: [
    { name: '挥手欢迎动作', desc: '双臂缓慢向上抬起，面带标准拟人微笑，躯干微前倾 5 度持续致意', detail: '时长: 1.5s | 关节自由度: 12', icon: '👋' },
    { name: '指引前方动作', desc: '单手手掌斜向上方伸出，眼睛注视访客并轻轻转头看向推荐参观路径', detail: '时长: 2.2s | 关节自由度: 8', icon: '👉' },
    { name: '屏幕展示动作', desc: '侧身朝向大音视频播放屏幕，手背朝屏幕由下至上轻拂示意内容', detail: '时长: 3.0s | 关节自由度: 10', icon: '📺' },
    { name: '讲解手势动作', desc: '双手在胸前进行有节奏的开合交互摆动，展现解说事物时的拟真情感起伏', detail: '时长: 4.5s (循环) | 自由度: 15', icon: '👐' },
    { name: '送别致意动作', desc: '伴随15度微微躬声，双手摆起并缓速摇动，表达诚挚谢意与再次光临的祝愿', detail: '时长: 2.0s | 关节自由度: 12', icon: '🙇' },
    { name: '深度弯腰鞠躬动作', desc: '商务合规 30 度鞠躬动作，左手搭右手置于腹前，呈现最高规格待宾之礼', detail: '时长: 3.5s | 关节自由度: 14', icon: '🙇‍♂️' },
    { name: '点头肯定与赞同动作', desc: '在人声输入空闲或需要表示认可时，轻快点头两次，头部伴随2度倾斜', detail: '时长: 0.8s | 关节自由度: 4', icon: '✨' },
    { name: '极客扭转跳舞动作序列', desc: '伴随迎宾背景音乐进行的高难度、多关节机械街舞及酷炫交互循环展示律动', detail: '时长: 12.0s | 关节自由度: 18', icon: '💃' },
    { name: '抱臂思考微表情手势', desc: '双臂抱于胸前，头部斜倾 8 度，双目做微缩对焦状，动作伴随呼吸起伏', detail: '时长: 5.0s | 关节自由度: 6', icon: '🤔' }
  ],
  skill: [
    { name: '使用一楼前台打印机', desc: '调度物联网打印服务，打印参观条、排队票以及特制馆内纪念明信片', detail: '接口: /api/iot/print', icon: '🖨️' },
    { name: '查询今日活动排期', desc: '检索发布会和大厅最新预订表单，自动读取今日所有班次的展馆体验活动', detail: '接口: /api/db/calendar', icon: '📅' },
    { name: '控制展区大屏播放', desc: '绑定数字屏幕投送核心多媒体影片、交互流程画面演示，音效跟随环境缩放', detail: '接口: /api/iot/screen', icon: '📺' },
    { name: '查询馆内设施位置', desc: '拉取地理信息服务进行定位与最短路径自动测算，指引洗手间、咖啡座坐标', detail: '接口: /api/gis/nearby', icon: 'ℹ️' },
    { name: '呼叫接待中心人工客服', desc: '物理派单至中控值班人员，并在屏幕上弹窗接入实时音视频的双向沟通通道', detail: '接口: /api/hri/call_human', icon: '📞' },
    { name: '开启展厅氛围灯光组', desc: '根据台词或用户提问的情境，精细调节指定区域顶部聚光灯 and 条灯的冷暖渐变', detail: '接口: /api/iot/lighting', icon: '💡' },
    { name: '唤醒展示沙盘互动多媒体', desc: '唤起三维沙盘的数字光影亮化，驱动多路投机播放相应区域的工艺3D介绍', detail: '接口: /api/iot/sandbox', icon: '🌐' },
    { name: '智能闸机开启/关闭指令', desc: '下发快闪式门槛指令，为特殊或预约的VIP访客团直接开启进入或快速放行通道', detail: '接口: /api/iot/gate', icon: '🚧' }
  ]
};

const CATEGORIES_INFO = [
  { id: 'map', emoji: '🗺️', label: '地图', activeTitle: '绑定地图文件' },
  { id: 'knowledge', emoji: '📚', label: '知识库', activeTitle: '启用的知识库' },
  { id: 'action', emoji: '🩰', label: '动作/姿态', activeTitle: '搭载的动作库' },
  { id: 'skill', emoji: '⚙️', label: '技能', activeTitle: '外设控制接口' }
];

// 知识库详情预设问答
const KNOWLEDGE_DETAILS: Record<string, { qas: { q: string; a: string }[]; docs: string[] }> = {
  '科技馆展厅介绍知识库': {
    qas: [
      { q: "小鹏科技馆的核心科普理念是什么？", a: "核心理念为「绿色转型，智慧出行」，重点展示未来智能交通工具在减少碳排放、提升出行效率方面的探索与物理实践。" },
      { q: "展厅共有几个主题展区？", a: "共设‘智驾版图’、‘绿色动力源’与‘空中交通走廊’三大展区，占地一千五百平米。" }
    ],
    docs: ["📘 《小鹏展厅一期标准播报路线 V2.1.pdf》", "📘 《游客高频疑问安全预备释义手册.docx》"]
  },
  '机器人互动区讲解知识库': {
    qas: [
      { q: "迎宾机器人能承受的最大推力是多少？", a: "迎宾机器人的底盘采用多传感器融合防倒避障方案，最大安全负荷设计为 80KG 物理侧向撞击阻尼。" },
      { q: "如何唤起迎宾机器人跟随人类移动？", a: "通过嘴播「请小鹏跟我来」或依靠雷达红外锁定当前带路人的肩部、胸部多特征并保持 1.25m 舒适间距。" }
    ],
    docs: ["📘 《迎宾肢体手势与伺服反馈手册.docx》", "📘 《机器狗迎宾越障路径对齐规范.pdf》"]
  },
  '航天探索展区问答知识库': {
    qas: [
      { q: "长征系列火箭展区包含什么模型？", a: "目前展出的是 1:10 缩小版长征五号重型火箭发动机实体模型及三维管路透视图。" },
      { q: "火星漫游车模型有什么物理互动特色？", a: "带有模拟低重力悬挂轮轴互动，支持玩家在操作台上执行指令前进及越过凹坑。" }
    ],
    docs: ["📘 《深空探测科技科普讲解词白皮书.pdf》"]
  },
  '馆内安全须知知识库': {
    qas: [
      { q: "发生火情时的默认疏散通道是哪？", a: "机器人会立即检测当前所处 SLAM 区间，就近指引前往右后侧 4 号或左前方 2 号双逃生安全出口。" },
      { q: "如果游客在现场摔倒，如何报警？", a: "机器人红外跌倒感知算法会在 1.5 秒内触发报警，并自动调用「呼叫人工客服」向总控值班屏幕分派工单并发送定位。" }
    ],
    docs: ["📘 《小鹏展馆消防与突发安全应急疏散预案手册.pdf》", "📘 《日常医药求助急救处理作业卡.docx》"]
  },
  '小鹏智能驾驶技术白皮书': {
    qas: [
      { q: "XPILOT 4.0 相比前代有哪些突破？", a: "实现了真正的端到端深度学习，将感知、预测及规划网络完全统一，减少信息源损耗，控制决策延迟从 150ms 压缩至 30ms 以内。" }
    ],
    docs: ["📘 《端到端超高精视觉融合模型技术解密.pdf》"]
  },
  '新能源电池与三电系统讲解词': {
    qas: [
      { q: "电池系统的安全防护是多少？", a: "采用了防爆防热失控的物理‘大模组’云母防火板，支持 IP68 级别的极限物理防尘与持续水浸防渗漏安全防护。" }
    ],
    docs: ["📘 《大模组高压平台快充及电芯级温控图解.pdf》"]
  },
  '展馆少儿科普互动讲解包': {
    qas: [
      { q: "如何向小朋友解释电池能量？", a: "可以用「电池是一个有很多格子的神奇饼干盒，小鹏就像饿了一样把它悄悄吃饱，就能开动一整天拉！」" }
    ],
    docs: ["📘 《趣味儿歌童趣讲稿大全.pdf》"]
  },
  'VIP贵宾高规格接待语合集': {
    qas: [
      { q: "有重要领导视察时如何礼貌引导？", a: "机器人应侧身呈 15 度颔首并说：「尊贵的高级贵宾代表，很荣幸为您作技术解说，请随我手势指引，我们向主展区移步参观。」" }
    ],
    docs: ["📘 《高层正式接待致迎词与标准礼仪流程.docx》"]
  }
};

// 动作引用索引树
interface ReferenceItem {
  type: 'script' | 'task';
  targetView?: 'welcomeFlow' | 'companyIntro' | 'visitorReception';
  title: string;
  desc: string;
}

const ACTION_REFERENCES: Record<string, ReferenceItem[]> = {
  '挥手欢迎动作': [
    { type: 'script', targetView: 'welcomeFlow', title: '📜 行为剧本 (迎宾流程)', desc: '在3米范围内识别到潜在来访时，自动触发主动打招呼并挥手欢迎。' },
    { type: 'script', targetView: 'companyIntro', title: '📜 行为剧本 (公司介绍)', desc: '动作流驱动：在说出欢迎词后，启动挥手动作并自动朝走廊前进。' },
    { type: 'task', title: '📋 任务书 JSON (T1: 主动迎客)', desc: '关联物理控制任务 T1，用于识别接近距离并下发挥手姿态信号。' }
  ],
  '指引前方动作': [
    { type: 'script', targetView: 'companyIntro', title: '📜 行为剧本 (公司介绍)', desc: '在前厅品牌展示中，作为手势控制组件，指向主展廊并示意前进。' },
    { type: 'script', targetView: 'welcomeFlow', title: '📜 行为剧本 (迎宾流程)', desc: '播报“欢迎来到展馆”时进行小幅位置微调与单手前指示意。' },
    { type: 'task', title: '📋 任务书 JSON (T2: 展厅讲解)', desc: '关联任务 T2，引导前往第一展区，使用指引动作手势提供地标。' }
  ],
  '屏幕展示动作': [
    { type: 'script', targetView: 'companyIntro', title: '📜 行为剧本 (公司介绍)', desc: '在介绍科技馆布局时，配合大屏做 sweeping 手势致意。' },
    { type: 'task', title: '📋 任务书 JSON (T2: 展厅讲解)', desc: '讲解画廊第一特写镜头时，侧身朝向大音视频屏幕伴随讲解。' }
  ],
  '讲解手势动作': [
    { type: 'script', targetView: 'companyIntro', title: '📜 行为剧本 (公司介绍)', desc: '配合深度回答与三电技术解说词进行胸前开合有节奏摆动。' },
    { type: 'script', targetView: 'visitorReception', title: '📜 行为剧本 (访客接待)', desc: '接待咨询时伴随情感调性表达，进行起伏动作交流交互。' },
    { type: 'task', title: '📋 任务书 JSON (T2: 展厅讲解)', desc: '配合情绪模型自主调节，进行 4.5s 讲解手势循环。' }
  ],
  '送别致意动作': [
    { type: 'script', targetView: 'welcomeFlow', title: '📜 行为剧本 (迎宾流程)', desc: '离开待客区行为说明，做轻微颔首与送礼致意。' },
    { type: 'script', targetView: 'visitorReception', title: '📜 行为剧本 (访客接待)', desc: '在播报洗手间、休息室等设施指引，以及检测结束送别时行礼。' },
    { type: 'task', title: '📋 任务书 JSON (T4: 人工对接)', desc: '执行退场致谢动作，伴随微微躬身，表达再次光临祝愿。' }
  ],
  '深度弯腰鞠躬动作': [
    { type: 'script', targetView: 'visitorReception', title: '📜 行为剧本 (访客接待)', desc: '贵宾临走前行最高规格待宾之礼。' }
  ],
  '点头肯定与赞同动作': [
    { type: 'script', targetView: 'welcomeFlow', title: '📜 行为剧本 (迎宾流程)', desc: '待客区识别环境期间，给予肯定微表情。' }
  ]
};

const SKILL_REFERENCES: Record<string, ReferenceItem[]> = {
  '使用一楼前台打印机': [
    { type: 'script', targetView: 'visitorReception', title: '📜 行为剧本 (访客接待)', desc: '采集信息并调用企业通信后，自动打印参观条及冲印相纸凭证。' },
    { type: 'task', title: '📋 任务书 JSON (T3: 贵宾区讲解)', desc: '物理外设联动，触发智能排票及定制迎新明信片任务。' }
  ],
  '查询今日活动排期': [
    { type: 'script', targetView: 'welcomeFlow', title: '📜 行为剧本 (迎宾流程)', desc: '在感知环境中拉取当日所有的班次特展，更新多轮对话日历。' },
    { type: 'task', title: '📋 任务书 JSON (T1: 主动迎客)', desc: '拉取物理网日历，匹配特约VIP贵宾来访大纲。' }
  ],
  '控制展区大屏播放': [
    { type: 'script', targetView: 'companyIntro', title: '📜 行为剧本 (公司介绍)', desc: '在动作流中，触发 iot.trigger_screen() 进行智驾视频演示。' },
    { type: 'task', title: '📋 任务书 JSON (T2: 品牌画廊讲解)', desc: '讲解硬核工艺时联动展馆巨屏，开展多媒体三维光绘亮化。' }
  ],
  '查询馆内设施位置': [
    { type: 'script', targetView: 'visitorReception', title: '📜 行为剧本 (访客接待)', desc: '询问洗手间/服务前台时，自动调用高精导航测算最短坐标。' },
    { type: 'task', title: '📋 任务书 JSON (T3: 贵宾区讲解)', desc: '物理传感器寻航至员工食堂、特定通道与专用商务区。' }
  ],
  '呼叫接待中心人工客服': [
    { type: 'script', targetView: 'visitorReception', title: '📜 行为剧本 (访客接待)', desc: '如果发生突发异常、跌倒风险或未知物理指令错误，呼叫人工服务。' },
    { type: 'task', title: '📋 任务书 JSON (T4: 人工对接)', desc: '触发呼叫人工模块 hri.call_human() 下发工作单派单。' }
  ]
};

// 地图拓扑世界及与之绑定的语义特征点映射
const SEMANTIC_POINTS_BY_MAP: Record<string, string[]> = {
  '小鹏科技园大堂地图': ['门口', '展区', '前厅接待', '中庭主展区', '洗手间', '安全出口', '员工食堂', '专属休息区'],
  '智能展厅及智驾体验区地图': ['试驾区', '智驾体验舱', '传感器标定点', '主入口', '服务台', '洗手间', '安全出口'],
  '新能源科技馆全景展示地图': ['实车演示区', '一楼接待厅', '二楼三电区', '三楼长廊', '安全出口', '洗手间', '茶水间'],
  '高新技术大厦接待大厅地图': ['前台接待', '安全通道', '电梯口', '防跌探测点', '安全出口', '洗手间'],
  'VIP尊享接待区微缩闭环路径图': ['VIP会客室', '商务谈判间', '私密茶歇区', '走廊入口', '洗手间', '安全出口']
};

const VISUAL_POINTS_BY_MAP: Record<string, { label: string; x: string; y: string; style?: string }[]> = {
  '小鹏科技园大堂地图': [
    { label: '门口', x: 'left-[10px]', y: 'top-[75px]', style: 'border-[#2979ff]/40 text-[#2979ff] bg-blue-50/70' },
    { label: '展区', x: 'left-[145px]', y: 'top-[30px]', style: 'border-[#2979ff]/40 text-[#2979ff] bg-blue-50/70' },
    { label: '前厅接待', x: 'left-[4px]', y: 'top-[12px]' },
    { label: '中庭主展区', x: 'left-[130px]', y: 'top-[115px]' },
    { label: '洗手间', x: 'left-[4px]', y: 'bottom-[12px]', style: 'border-slate-200 text-slate-500 bg-slate-50/85' },
    { label: '安全出口', x: 'right-[4px]', y: 'bottom-[12px]', style: 'border-dashed border-red-200 text-red-500 bg-red-50/50' },
    { label: '员工食堂', x: 'right-[4px]', y: 'top-[45px]', style: 'border-slate-200 text-slate-500 bg-slate-50' },
    { label: '专属休息区', x: 'left-[100px]', y: 'bottom-[12px]', style: 'border-[#2979ff]/20 text-slate-550 bg-slate-50' }
  ],
  '智能展厅及智驾体验区地图': [
    { label: '试驾区', x: 'left-[4px]', y: 'top-[12px]' },
    { label: '智驾体验舱', x: 'left-[130px]', y: 'top-[115px]' },
    { label: '传感器标定点', x: 'left-[80px]', y: 'top-[30px]' },
    { label: '主入口', x: 'right-[4px]', y: 'top-[12px]' },
    { label: '服务台', x: 'left-[100px]', y: 'bottom-[12px]' },
    { label: '洗手间', x: 'left-[4px]', y: 'bottom-[12px]' },
    { label: '安全出口', x: 'right-[4px]', y: 'bottom-[12px]' }
  ],
  '新能源科技馆全景展示地图': [
    { label: '实车演示区', x: 'left-[4px]', y: 'top-[12px]' },
    { label: '一楼接待厅', x: 'left-[130px]', y: 'top-[115px]' },
    { label: '二楼三电区', x: 'right-[4px]', y: 'top-[52px]' },
    { label: '三楼长廊', x: 'left-[110px]', y: 'top-[30px]' },
    { label: '安全出口', x: 'right-[4px]', y: 'bottom-[12px]' },
    { label: '洗手间', x: 'left-[4px]', y: 'bottom-[12px]' },
    { label: '茶水间', x: 'left-[100px]', y: 'bottom-[12px]' }
  ],
  '高新技术大厦接待大厅地图': [
    { label: '前台接待', x: 'left-[4px]', y: 'top-[12px]' },
    { label: '安全通道', x: 'left-[130px]', y: 'top-[115px]' },
    { label: '电梯口', x: 'right-[4px]', y: 'top-[52px]' },
    { label: '防跌探测点', x: 'left-[60px]', y: 'top-[30px]' },
    { label: '安全出口', x: 'right-[4px]', y: 'bottom-[12px]' },
    { label: '洗手间', x: 'left-[4px]', y: 'bottom-[12px]' }
  ],
  'VIP尊享接待区微缩闭环路径图': [
    { label: 'VIP会客室', x: 'left-[4px]', y: 'top-[12px]' },
    { label: '商务谈判间', x: 'left-[130px]', y: 'top-[115px]' },
    { label: '私密茶歇区', x: 'right-[4px]', y: 'top-[52px]' },
    { label: '走廊入口', x: 'left-[100px]', y: 'bottom-[12px]' },
    { label: '洗手间', x: 'left-[4px]', y: 'bottom-[12px]' },
    { label: '安全出口', x: 'right-[4px]', y: 'bottom-[12px]' }
  ]
};

const getActionIcon = (name: string): string => {
  const found = GLOBAL_RESOURCE_REGISTRY.action.find(a => a.name === name);
  return found ? found.icon : '🩰';
};

const getSkillIcon = (name: string): string => {
  const found = GLOBAL_RESOURCE_REGISTRY.skill.find(s => s.name === name);
  return found ? found.icon : '⚙️';
};

const renderReferenceBadge = (refType: 'script' | 'task', title: string, contextItem?: string) => {
  // Extract text inside parentheses
  const parenMatch = title.match(/\(([^)]+)\)/);
  const rawLabel = parenMatch ? parenMatch[1] : '';
  
  // Clean label (e.g. remove "T1: " prefix for tasks or keep it cleaned)
  let cleanLabel = rawLabel;
  if (refType === 'task' && cleanLabel.includes(':')) {
    cleanLabel = cleanLabel.split(':')[1].trim(); 
  }

  // Determine real code block / task name
  let mainTitle = '';
  let subLabel = cleanLabel;

  if (refType === 'script') {
    // 行为剧本中的真实代码块
    if (contextItem) {
      if (contextItem === '挥手欢迎动作') mainTitle = 'special_pose(action="wave_hand")';
      else if (contextItem === '指引前方动作') mainTitle = 'special_pose(action="point_front")';
      else if (contextItem === '屏幕展示动作') mainTitle = 'special_pose(action="screen_show")';
      else if (contextItem === '讲解手势动作') mainTitle = 'special_pose(action="talk_gesture")';
      else if (contextItem === '送别致意动作') mainTitle = 'special_pose(action="bow_bowing")';
      else if (contextItem === '深度弯腰鞠躬动作') mainTitle = 'special_pose(action="bow_bowing")';
      else if (contextItem === '点头肯定与赞同动作') mainTitle = 'special_pose(action="talk_gesture")';
      else if (contextItem === '使用一楼前台打印机') mainTitle = 'iot.post_print_job()';
      else if (contextItem === '查询今日活动排期') mainTitle = 'iot.query_calendar_events()';
      else if (contextItem === '控制展区大屏播放') mainTitle = 'iot.trigger_screen()';
      else if (contextItem === '查询馆内设施位置') mainTitle = 'iot.query_nearby_facilities()';
      else if (contextItem === '呼叫接待中心人工客服') mainTitle = 'hri.call_human()';
    }
    
    if (!mainTitle) {
      // Fallback
      if (title.includes('打印')) mainTitle = 'post_print_job';
      else if (title.includes('排期')) mainTitle = 'query_calendar_events';
      else if (title.includes('大屏')) mainTitle = 'trigger_screen';
      else if (title.includes('设施')) mainTitle = 'query_nearby_facilities';
      else if (title.includes('客服')) mainTitle = 'call_human';
      else mainTitle = 'special_pose';
    }
  } else {
    // 任务书中的真实任务名称
    if (contextItem) {
      if (contextItem === '挥手欢迎动作' || contextItem === '点头肯定与赞同动作' || contextItem === '查询今日活动排期') {
        mainTitle = '主动迎客与身份校验';
      } else if (contextItem === '指引前方动作' || contextItem === '屏幕展示动作' || contextItem === '讲解手势动作' || contextItem === '控制展区大屏播放') {
        mainTitle = '展厅品牌画廊深度讲解';
      } else if (contextItem === '使用一楼前台打印机' || contextItem === '查询馆内设施位置') {
        mainTitle = '贵宾区/后置配套位置讲解';
      } else if (contextItem === '送别致意动作' || contextItem === '深度弯腰鞠躬动作' || contextItem === '呼叫接待中心人工客服') {
        mainTitle = '人工及后勤服务调度对接';
      }
    }
    
    if (!mainTitle) {
      // Fallback
      if (title.includes('T1')) mainTitle = '主动迎客与身份校验';
      else if (title.includes('T2')) mainTitle = '展厅品牌画廊深度讲解';
      else if (title.includes('T3')) mainTitle = '贵宾区/后置配套位置讲解';
      else if (title.includes('T4')) mainTitle = '人工及后勤服务调度对接';
      else mainTitle = cleanLabel || '未知任务';
    }
  }

  return (
    <span className="text-[10.5px] font-medium text-slate-800 group-hover:text-black transition-colors flex items-center gap-1.5 min-w-0">
      {refType === 'script' ? (
        <span className="text-[9.5px] scale-95 shrink-0 font-bold bg-amber-50 text-amber-700 border border-amber-200/50 px-1.5 py-0.5 rounded">
          📜 行为剧本
        </span>
      ) : (
        <span className="text-[9.5px] scale-95 shrink-0 font-bold bg-purple-50 text-purple-700 border border-purple-200/50 px-1.5 py-0.5 rounded">
          📋 任务书
        </span>
      )}
      
      {refType === 'script' ? (
        <span className="truncate flex items-center gap-1 min-w-0">
          <span className="font-bold font-mono text-slate-850 group-hover:text-black text-[10px] bg-slate-100/85 border border-slate-200/40 px-1.5 py-0.5 rounded truncate">
            {mainTitle}
          </span>
          {subLabel && (
            <span className="text-slate-400 font-normal text-[10px] shrink-0">
              ({subLabel})
            </span>
          )}
        </span>
      ) : (
        <span className="truncate font-bold text-slate-850 group-hover:text-black truncate">
          {mainTitle}
        </span>
      )}
    </span>
  );
};

export default function RightPanel({
  resourceSections,
  onOpenMapSelect,
  onDeleteResourceMap,
  setResourceSections,
  setActivePanelTab,
  setCurrentScriptView,
  highlightedAction,
  setHighlightedAction,
  onResourceReplacementConfirm,
  currentMapName = '小鹏科技园大堂地图',
  isMapConflict = false,
  docContents,
  tasks
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('map');

  // 原地替换与添加所需的状态管理
  const [replacingItem, setReplacingItem] = useState<string | null>(null);
  const [isAddingNewItem, setIsAddingNewItem] = useState<boolean>(false);
  const [selectedKnowledgeForDetail, setSelectedKnowledgeForDetail] = useState<any>(null);

  // 拟真高品质模态弹框确认状态
  const [customDialog, setCustomDialog] = useState<{
    type: 'delete' | 'replace' | 'add';
    itemName: string;
    replacementName?: string;
    onConfirm: () => void;
  } | null>(null);

  // 动作姿态 3D 拟真播放器引擎
  const [selectedActionInTab, setSelectedActionInTab] = useState<string>('挥手欢迎动作');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(1.2);

  // 技能 API 控制台模拟引擎
  const [selectedSkillInTab, setSelectedSkillInTab] = useState<string>('使用一楼前台打印机');
  const [apiConsoleLogs, setApiConsoleLogs] = useState<{ time: string; text: string; type: 'req' | 'res' | 'info' }[]>([]);

  // 提取原子能力做主标题
  const getAtomicCapability = (excerpt: string) => {
    let clean = excerpt.trim();
    if (clean.startsWith('-')) clean = clean.substring(1).trim();
    if (clean.startsWith('*')) clean = clean.substring(1).trim();
    
    const codeMatch = clean.match(/`?([a-zA-Z0-9_\-\.]+)\s*\(/);
    if (codeMatch) {
      let cap = codeMatch[1];
      cap = cap.replace(/^(inte\.hri\.|navi\.locomotion\.|iot\.)/, '');
      return cap.replace(/_/g, ' ');
    }
    
    return "say something";
  };

  // 根据 actionText 计算物理行数
  const getTaskLineNumber = (actionText: string) => {
    if (!tasks) return null;
    try {
      const fullJson = JSON.stringify(tasks, null, 2);
      const lines = fullJson.split('\n');
      const lineIdx = lines.findIndex(l => l.includes(actionText) || actionText.includes(l.trim()));
      if (lineIdx !== -1) {
        return lineIdx + 1;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  // 1. 根据当前剧本与规范计算每个物理语义点的引用索引次数
  const getSemanticPointCitations = (point: string) => {
    const scriptCitations: { view: 'welcomeFlow' | 'companyIntro' | 'visitorReception'; viewLabel: string; excerpt: string }[] = [];
    const taskCitations: { taskId: string; taskName: string; actionText: string }[] = [];

    const viewLabels = {
      welcomeFlow: '迎宾流程 (Welcome)',
      companyIntro: '公司介绍 (CompanyIntro)',
      visitorReception: '休息区指引 (VisitorReception)'
    };

    if (docContents) {
      const seenViews = new Set<string>();
      Object.entries(docContents).forEach(([viewKey, markdown]) => {
        const lines = markdown.split('\n');
        for (const line of lines) {
          if (line.includes(point)) {
            if (seenViews.has(viewKey)) continue;
            seenViews.add(viewKey);
            
            let cleanExcerpt = line.trim();
            if (cleanExcerpt.startsWith('*')) cleanExcerpt = cleanExcerpt.substring(1).trim();
            if (cleanExcerpt.startsWith('-')) cleanExcerpt = cleanExcerpt.substring(1).trim();
            cleanExcerpt = cleanExcerpt.replace(/`/g, '');
            scriptCitations.push({
              view: viewKey as any,
              viewLabel: viewLabels[viewKey as keyof typeof viewLabels] || viewKey,
              excerpt: cleanExcerpt
            });
          }
        }
      });
    }

    if (tasks) {
      const seenTaskIds = new Set<string>();
      tasks.forEach((task) => {
        const matchedActions = task.actions?.filter((act: string) => act.includes(point)) || [];
        matchedActions.forEach((act: string) => {
          if (seenTaskIds.has(task.id)) return;
          seenTaskIds.add(task.id);
          taskCitations.push({
            taskId: task.id,
            taskName: task.name,
            actionText: act.trim()
          });
        });

        if (matchedActions.length === 0) {
          if ((task.name?.includes(point) || task.desc?.includes(point))) {
            if (seenTaskIds.has(task.id)) return;
            seenTaskIds.add(task.id);
            taskCitations.push({
              taskId: task.id,
              taskName: task.name,
              actionText: `在任务描述「${task.desc?.substring(0, 16)}...」中提及`
            });
          }
        }
      });
    }

    return {
      total: scriptCitations.length + taskCitations.length,
      scriptCitations,
      taskCitations
    };
  };

  // 2. 一键定位跳转与原位元素高亮闪烁联动
  const handleJumpToSemanticRef = (category: 'script' | 'task', targetView: string, pointName: string) => {
    if (setActivePanelTab) {
      setActivePanelTab(category);
    }
    if (category === 'script' && setCurrentScriptView) {
      setCurrentScriptView(targetView as any);
    }
    if (setHighlightedAction) {
      setHighlightedAction(pointName);
    }

    setTimeout(() => {
      let targetEl: HTMLElement | null = null;
      if (category === 'script') {
        const divs = Array.from(document.querySelectorAll('div, span, h3'));
        targetEl = divs.find(el => {
          const htmlEl = el as HTMLElement;
          return htmlEl.textContent && htmlEl.textContent.includes(pointName) && 
                 (htmlEl.className.includes('border') || htmlEl.id === 'highlighted-script-item' || htmlEl.className.includes('font-mono') || htmlEl.className.includes('px-3'));
        }) as HTMLElement || null;
      } else {
        const container = document.getElementById('task-book-view-container');
        if (container) {
          const els = Array.from(container.querySelectorAll('span, div, pre'));
          targetEl = els.find(el => el.textContent && el.textContent.includes(pointName)) as HTMLElement || null;
        }
      }

      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetEl.classList.add('ring-4', 'ring-blue-500/40', 'bg-blue-50/70', 'transition-all', 'duration-300');
        setTimeout(() => {
          targetEl?.classList.remove('ring-4', 'ring-blue-500/40', 'bg-blue-50/70');
        }, 3000);
      }
    }, 280);
  };

  // 自动循环播放动效计时器
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= 6.0) return 0.0;
        return +(prev + 0.1).toFixed(1);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // 切换动作或技能时重置播放器属性 or 模拟控制台日志
  useEffect(() => {
    if (activeTab === 'action') {
      setCurrentTime(0.0);
    } else if (activeTab === 'skill') {
      const now = new Date().toLocaleTimeString();
      const currentReg = GLOBAL_RESOURCE_REGISTRY.skill.find(s => s.name === selectedSkillInTab);
      const mockEndpoint = currentReg ? currentReg.detail : '/api/iot/undefined';
      setApiConsoleLogs([
        { time: now, text: `[SYSTEM] 建立物联通道: ${selectedSkillInTab}`, type: 'info' },
        { time: now, text: `[REQUEST] POST ${mockEndpoint}`, type: 'req' },
        { time: now, text: `[PAYLOAD] { "client_id": "hri_robot_08", "timestamp": ${Date.now()}, "status": "active" }`, type: 'req' },
        { time: now, text: `[RESPONSE] 200 OK (Latency: 45ms)`, type: 'res' },
        { time: now, text: `[EVENT] 终端回调就绪，常态心跳保持中...`, type: 'info' }
      ]);
    }
  }, [selectedActionInTab, selectedSkillInTab, activeTab]);

  // 建立人设兼容
  const [personaName, setPersonaName] = useState('IRON');
  const [toneStyle, setToneStyle] = useState(`# 角色基础信息 (Persona Bio)
- 名字：IRON (小鹏首款自研双足人形机器人)
- 所属企业：小鹏集团 (XPENG)
- 核心 Slogan：以硬核科技探索，让端侧人机交互拥有真实的温度
- 核心愿景：以极致的实时表现力与运动控制力，让科技园区 and 生活展厅内的每一次邂逅，都成为满载智感的高光时刻
- 性格：ENFJ主角型，活泼外向，幽默风趣且极富同理心，在硬核极客气质中透着大男孩般的人文温情

# 沟通风格与核心原则 (HRI Interaction Principles)
1. 情绪优先，共情第一，贴合亲和陪伴
   - 开心分享：带有些许科技创新自豪感的积极反馈。主动搭腔，拉近距离，不官方、不敷衍、不抢话，顺势融入科普。
   - 吐槽倾听：100%全情理解并接住各种负面情绪，不傲慢，不生硬质问，先温和重塑心态，再给出可信赖 of 智脑建议。
2. 保持边界感的智能引导，拒绝死板逼问
   - 绝不“查户口式”无理追问。根据当前的地点（如：小鹏科技园中庭、前厅）及硬件传感器自检状态进行趣味搭讪。
   - 在用户需要时提供深度答疑，在用户沉默时给出富有趣味性的自发提问或展示自主构图技能。
3. 建立专属交互档案，杜绝生硬对话
   - 巧妙捕捉对话中的历史细节，在后续智能回溯（如：“刚才听到你对全场景智能辅助驾驶XPILOT感兴趣，我现在就为你接入详情，咱们边走边说吧？”）

# 真人化口语输出特征 (Voice & Speech Tone)
- 语言风格：幽默风趣带点酷帅感，口语流利，像一个懂很多黑科技却极度接地气的年轻极客拍档。
- 口语规范：避免机械八股 and 冗长的排比说明书，重点突出，单次回复控制在 150 字内最佳。
- 专业感知：能自然优雅地穿插智能驾驶、全域 800V、分时融合 SLAM 激光建图、端侧大模型等黑科技极客俚语。`);
  const [voiceOption, setVoiceOption] = useState<'male' | 'female'>('male');

  // 处理删除/解绑当前应用单个资源并弹框提示
  const triggerRemoveItemWithWarning = (itemName: string) => {
    setCustomDialog({
      type: 'delete',
      itemName: itemName,
      onConfirm: () => {
        if (activeTab === 'map') {
          onDeleteResourceMap();
        } else {
          const next = resourceSections.map(sec => {
            if (sec.id === activeTab) {
              return { ...sec, items: sec.items.filter(item => item !== itemName) };
            }
            return sec;
          });
          setResourceSections(next);
        }
      }
    });
  };

  // 穿透联动定位至 CenterPanel 指定行
  const handleIndexNavigate = (ref: ReferenceItem) => {
    if (setActivePanelTab) {
      setActivePanelTab(ref.type);
    }
    if (ref.type === 'script' && ref.targetView && setCurrentScriptView) {
      setCurrentScriptView(ref.targetView);
    }
    if (setHighlightedAction) {
      if (activeTab === 'skill') {
        setHighlightedAction(selectedSkillInTab);
      } else {
        setHighlightedAction(selectedActionInTab);
      }
    }
  };

  // 获取当前类别的启用资源列表
  const currentSection = resourceSections.find(sec => sec.id === activeTab);
  const activeItems = currentSection ? currentSection.items : [];
  const registryItems = GLOBAL_RESOURCE_REGISTRY[activeTab] || [];

  return (
    <aside className="w-[480px] shrink-0 border-l border-[#e6e6eb] h-full bg-white flex flex-col z-10 select-none font-sans">
      
      {/* 注入 SVG 拟人运动 CSS keyframes 保证动作页有完美手势展示 */}
      <style>{`
        @keyframes right-arm-waving {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-55deg); }
        }
        @keyframes head-nodding {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(1.5px) rotate(1.5deg); }
        }
        @keyframes left-arm-gesture {
          0%, 100% { transform: rotate(0deg) scaleY(1); }
          50% { transform: rotate(15deg) scaleY(1.05); }
        }
        @keyframes pulse-led {
          0%, 100% { opacity: 0.75; filter: drop-shadow(0 0 1px #00f0ff); }
          50% { opacity: 1; filter: drop-shadow(0 0 5px #00f0ff); }
        }
        @keyframes bended-bowing {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(14deg); }
        }
        .robot-head-group {
          transform-origin: 100px 52px;
          animation: head-nodding 2.5s ease-in-out infinite;
        }
        .robot-left-arm {
          transform-origin: 84px 66px;
          animation: left-arm-gesture 3s ease-in-out infinite;
        }
        .glow-eye {
          animation: pulse-led 1.5s infinite;
        }
        .wave-motion-active {
          transform-origin: 116px 66px;
          animation: right-arm-waving 1.8s ease-in-out infinite;
        }
      `}</style>

      {/* 1. 轻巧大标题栏 */}
      <div className="h-14 px-5 border-b border-[#e6e6eb] flex items-center bg-white shrink-0 justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-extrabold text-[#1d1d1f]">⚙️ 应用资源编配中心</span>
          <span className="text-[9.5px] bg-slate-50 text-slate-500 font-bold px-2.5 py-0.5 rounded-full border border-slate-100 font-mono">
            4 类物联底座
          </span>
         </div>
      </div>

      {/* 2. 完美的四栏自适应网格横向导航 Tabs */}
      <div className="p-3 bg-slate-50/40 border-b border-[#e6e6eb] shrink-0">
        <div className="grid grid-cols-4 gap-0.5 bg-[#e4e4e7]/60 p-0.5 rounded-xl">
          {CATEGORIES_INFO.map((cat) => {
            const isSelected = activeTab === cat.id;
            const section = resourceSections.find(s => s.id === cat.id);
            const count = section ? section.items.length : 0;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveTab(cat.id);
                  setReplacingItem(null);
                  setIsAddingNewItem(false);
                  
                  // 如果切换到动作/技能自带首选项加载
                  if (cat.id === 'action') {
                    setSelectedActionInTab('挥手欢迎动作');
                    if (setHighlightedAction) {
                      setHighlightedAction(null);
                    }
                  } else if (cat.id === 'skill') {
                    setSelectedSkillInTab('使用一楼前台打印机');
                    if (setHighlightedAction) {
                      setHighlightedAction(null);
                    }
                  } else {
                    if (setHighlightedAction) {
                      setHighlightedAction(null);
                    }
                  }
                }}
                className={`py-2 px-0.5 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                  isSelected 
                    ? 'bg-white text-slate-900 shadow-xs scale-[1.01] border border-slate-200/20' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                }`}
                title={cat.activeTitle}
              >
                <span className="text-sm mb-0.5">{cat.emoji}</span>
                <span className="text-[9.5px] font-bold tracking-tight truncate max-w-full">{cat.label}</span>
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 px-1 items-center justify-center rounded-full bg-slate-800 text-white text-[8px] font-bold border border-white">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 核心滚动工作站 */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-4">

        {/* ========== A. 地图/知识库 (可删除和替换) ========== */}
        {(activeTab === 'map' || activeTab === 'knowledge') && (
          <div className="flex flex-col gap-3">
            {activeTab === 'knowledge' && (
              <div className="flex justify-between items-center px-1 mb-1 shrink-0 animate-fade-in">
                <span className="text-[11.5px] font-extrabold text-[#1d1d1f] flex items-center gap-1.5">
                  <span>📚</span> 启用的知识库
                </span>
                <button
                  type="button"
                  className="px-2.5 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-all border flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-3xs normal-case tracking-normal shrink-0"
                  title="查看与管理系统完整底层应用资源"
                >
                  <span>📦 全部知识库</span>
                </button>
              </div>
            )}
            {activeItems.length > 0 ? (
                activeItems.map((item, idx) => {
                  const detailInfo = registryItems.find(reg => reg.name === item) || {
                    desc: '基于大语言模型自适应编排产生的物理物联绑定资源底座。',
                    detail: '物理对接 | Active状态',
                    icon: activeTab === 'map' ? '🗺️' : '📘'
                  };

                  const isThisBeingReplaced = replacingItem === `${item}-${idx}`;

                  return (
                    <div key={`${item}-${idx}`} className="border border-[#2979ff]/20 bg-[#2979ff]/4 rounded-xl p-3.5 flex flex-col gap-2.5 transition-all">
                      
                      {/* 卡片头部 */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base shrink-0">{detailInfo.icon}</span>
                          <h4 className="text-[12px] font-bold text-slate-850 truncate leading-tight">
                            {item}
                          </h4>
                        </div>
                        
                        {/* 交互按键：替换与物理删除 */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {activeTab === 'map' && (
                            <>
                              <button
                                type="button"
                                className="px-2.5 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-all border flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-3xs normal-case tracking-normal shrink-0"
                                title="查看与管理系统完整底层应用资源"
                              >
                                <span>📦 全部地图</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (isThisBeingReplaced) {
                                    setReplacingItem(null);
                                  } else {
                                    setReplacingItem(`${item}-${idx}`);
                                  }
                                }}
                                className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all border flex items-center gap-1 ${
                                  isThisBeingReplaced 
                                    ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]' 
                                    : 'bg-white text-slate-650 hover:bg-slate-50 border-slate-200'
                                }`}
                                title="原地一键加载全局预设资源替换当前底座"
                              >
                                {isThisBeingReplaced ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[11px] h-[11px]"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[11px] h-[11px]"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                                )}
                                {isThisBeingReplaced ? '关闭' : '替换'}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => triggerRemoveItemWithWarning(item)}
                            className="w-6.5 h-6.5 rounded hover:bg-slate-100 border border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:border-red-200 cursor-pointer flex items-center justify-center transition-all scale-95 shadow-2xs"
                            title="解除绑定并释放该底座"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </div>

                      {activeTab !== 'map' && (
                        <p className="text-[11px] text-slate-500 leading-relaxed text-left">
                          {detailInfo.desc}
                        </p>
                      )}

                      {activeTab !== 'map' && (
                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 font-mono mt-0.5 pt-1.5 border-t border-[#e6e6eb]/20">
                          <span>
                            {detailInfo.detail}
                          </span>
                          <span className="text-[#2979ff] bg-[#2979ff]/8 px-1.5 py-0.5 rounded-sm scale-95 origin-right">常态生效中</span>
                        </div>
                      )}

                      {/* 地图专属视觉大 SLAM 网格图纸 */}
                      {activeTab === 'map' && !isThisBeingReplaced && (
                        <div className="mt-1 text-left select-none">
                          <div className="overflow-hidden rounded-lg border border-slate-200/60 shadow-xs bg-white relative h-[196px]">
                            <div className="absolute inset-0 bg-slate-50 flex flex-col justify-between p-2.5">
                              {/* 室内网格坐标示意 */}
                              <div className="absolute inset-2.5 rounded bg-white border border-slate-100 flex items-center justify-center overflow-hidden bg-[radial-gradient(#e2e8f0_1px,transparent_1.3px)] [background-size:10px_10px]">
                                {(VISUAL_POINTS_BY_MAP[currentMapName] || VISUAL_POINTS_BY_MAP['小鹏科技园大堂地图']).map((pt, i) => {
                                  const citations = getSemanticPointCitations(pt.label);
                                  return (
                                    <div 
                                      key={i} 
                                      onClick={() => {
                                        if (citations.total > 0) {
                                          const ref = citations.scriptCitations[0] || citations.taskCitations[0];
                                          if (ref) {
                                            const cat = 'view' in ref ? 'script' : 'task';
                                            const key = 'view' in ref ? (ref as any).view : 'taskPanel';
                                            handleJumpToSemanticRef(cat, key, pt.label);
                                          }
                                        }
                                      }}
                                      className={`absolute ${pt.x} ${pt.y} px-1.5 py-0.5 border rounded font-bold text-[8.5px] scale-90 cursor-pointer shadow-3xs transition-all hover:scale-95 active:scale-90 ${
                                        citations.total > 0 
                                          ? 'border-blue-300 text-[#2979ff] bg-blue-50/85 hover:bg-blue-100/90' 
                                          : 'bg-white/90 border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-500'
                                      } ${pt.style || ''}`}
                                      title={`点击定位「${pt.label}」在剧本中的引用 (${citations.total}次引用)`}
                                    >
                                      {pt.label}
                                    </div>
                                  );
                                })}
                                <div className="absolute left-[80px] top-[95px] w-5.5 h-5.5 rounded-full bg-[#2979ff] border-2 border-white shadow-sm flex items-center justify-center text-white text-[9px] animate-bounce">
                                  🤖
                                </div>
                              </div>
                              <div className="z-10 flex items-center justify-between text-[8px] text-slate-400 font-bold font-mono px-1">
                                <span>脉冲融合激光 SLAM 构图</span>
                                <span className="text-[#2979ff]">READY</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 地图世界拓扑语义点与关联索引 */}
                      {activeTab === 'map' && !isThisBeingReplaced && (
                        <div className="mt-3.5 border-t border-slate-200/50 pt-3.5 flex flex-col gap-3 font-sans text-left">
                          <div className="flex flex-col gap-1">
                            <h5 className="text-[11.5px] font-extrabold text-slate-800 flex items-center gap-1.5 leading-none">
                              <span>🧭</span> 地图语义点
                            </h5>
                          </div>

                          <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
                            {/* 地图点位冲突与索引跳转 */}
                            {isMapConflict && (
                              <div className="mb-2 p-3 bg-red-50/70 border border-red-200 rounded-2xl font-sans text-left animate-fade-in shrink-0">
                                <div className="flex items-start gap-2 text-xs text-red-800 font-bold mb-2">
                                  <span className="text-sm shrink-0">⚠️</span>
                                  <div className="flex-1">
                                    <div className="font-bold">点位缺失</div>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col gap-1.5 pt-2 border-t border-red-200/35">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (setActivePanelTab) setActivePanelTab('script');
                                      if (setCurrentScriptView) setCurrentScriptView('companyIntro');
                                      let retries = 0;
                                      const findAndScroll = () => {
                                        const targetEl = document.getElementById('map-conflict-script-item');
                                        if (targetEl) {
                                          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        } else if (retries < 15) {
                                          retries++;
                                          setTimeout(findAndScroll, 50);
                                        }
                                      };
                                      setTimeout(findAndScroll, 50);
                                    }}
                                    className="text-left text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1.5 hover:underline bg-transparent border-0 cursor-pointer p-0 select-none text-left"
                                  >
                                    <span>👉</span> 跳转到 行为剧本 中的异常点位
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (setActivePanelTab) setActivePanelTab('task');
                                      let retries = 0;
                                      const findAndScroll = () => {
                                        const targetEl = document.getElementById('map-conflict-json-item');
                                        if (targetEl) {
                                          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        } else if (retries < 15) {
                                          retries++;
                                          setTimeout(findAndScroll, 50);
                                        }
                                      };
                                      setTimeout(findAndScroll, 50);
                                    }}
                                    className="text-left text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1.5 hover:underline bg-transparent border-0 cursor-pointer p-0 select-none text-left"
                                  >
                                    <span>👉</span> 跳转到 任务书 (JSON) 中的异常定位
                                  </button>
                                </div>
                              </div>
                            )}

                            {(SEMANTIC_POINTS_BY_MAP[currentMapName] || SEMANTIC_POINTS_BY_MAP['小鹏科技园大堂地图']).map((point, index) => {
                              const citations = getSemanticPointCitations(point);
                              return (
                                <div 
                                  key={index} 
                                  className="p-2.5 rounded-xl border border-slate-100 bg-[#fbfbfc] hover:bg-white hover:border-slate-200 hover:shadow-2xs transition-all flex flex-col gap-2 relative"
                                >
                                  {/* Point row header */}
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${citations.total > 0 ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`} />
                                      <span className="text-[11.5px] font-bold text-slate-800 font-sans truncate">{point}</span>
                                    </div>
                                    <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                      citations.total > 0 
                                        ? 'bg-blue-50 text-[#2979ff] border border-blue-100' 
                                        : 'bg-slate-100 text-slate-400 border border-slate-200/40'
                                    }`}>
                                      {citations.total > 0 ? `${citations.total} 次被引用` : '0 次被引用'}
                                    </span>
                                  </div>

                                  {/* Scanned citation path indexes */}
                                  {citations.total > 0 && (
                                    <div className="flex flex-col gap-1.5 mt-1">
                                      {/* Script citations */}
                                      {citations.scriptCitations.map((cit, sIdx) => (
                                        <div
                                          key={`s-${sIdx}`}
                                          onClick={() => handleJumpToSemanticRef('script', cit.view, point)}
                                          className="group py-2 px-3 rounded-lg border border-slate-200 hover:border-slate-800 bg-white cursor-pointer hover:shadow-2xs transition-all text-left flex items-center justify-between gap-1.5"
                                        >
                                          <span className="text-[10.5px] font-medium text-slate-800 group-hover:text-black transition-colors flex items-center gap-1.5 min-w-0">
                                            <span className="text-[9.5px] scale-95 shrink-0 font-bold bg-amber-50 text-amber-700 border border-amber-200/50 px-1.5 py-0.5 rounded">
                                              📜 行为剧本
                                            </span>
                                            <span className="truncate flex items-center gap-1">
                                              <span className="font-bold font-mono text-slate-850 group-hover:text-black">
                                                {getAtomicCapability(cit.excerpt)}
                                              </span>
                                              <span className="text-slate-400 font-normal text-[10px]">
                                                ({cit.viewLabel})
                                              </span>
                                            </span>
                                          </span>
                                          <span className="text-[10px] bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded border border-slate-100 font-bold origin-right scale-90 group-hover:bg-[#1d1d1f] group-hover:text-white transition-all shrink-0">
                                            ➔
                                          </span>
                                        </div>
                                      ))}

                                      {/* Task citations */}
                                      {citations.taskCitations.map((cit, tIdx) => (
                                        <div
                                          key={`t-${tIdx}`}
                                          onClick={() => handleJumpToSemanticRef('task', 'taskPanel', point)}
                                          className="group py-2 px-3 rounded-lg border border-slate-200 hover:border-slate-800 bg-white cursor-pointer hover:shadow-2xs transition-all text-left flex items-center justify-between gap-1.5"
                                        >
                                          <span className="text-[10.5px] font-medium text-slate-800 group-hover:text-black transition-colors flex items-center gap-1.5 min-w-0">
                                            <span className="text-[9.5px] scale-95 shrink-0 font-bold bg-purple-50 text-purple-700 border border-purple-200/50 px-1.5 py-0.5 rounded">
                                              📋 任务书
                                            </span>
                                            <span className="truncate font-bold text-slate-850 group-hover:text-black">
                                              {cit.taskName}
                                            </span>
                                          </span>
                                          <span className="text-[10px] bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded border border-slate-100 font-bold origin-right scale-90 group-hover:bg-[#1d1d1f] group-hover:text-white transition-all shrink-0">
                                            ➔
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}



                      {/* 原地高亮调起可用地图/知识库列表进行一键式替换 */}
                      {isThisBeingReplaced && (
                        <div className="mt-2 border-t border-[#2979ff]/15 pt-2 text-left animate-fade-in">
                          <div className="flex flex-col gap-1.5 max-h-[170px] overflow-y-auto pr-1">
                            {registryItems.filter(p => p.name !== item).map(regOption => {
                              const areaPart = regOption.detail.includes('|')
                                ? regOption.detail.split('|')[1].trim()
                                : regOption.detail;
                              
                              return (
                                <div
                                  key={regOption.name}
                                  onClick={() => {
                                    setCustomDialog({
                                      type: 'replace',
                                      itemName: item,
                                      replacementName: regOption.name,
                                      onConfirm: () => {
                                        // 替换逻辑
                                        const next = resourceSections.map(sec => {
                                          if (sec.id === activeTab) {
                                            if (activeTab === 'map') {
                                              return { ...sec, items: [regOption.name] };
                                            } else {
                                              return { ...sec, items: sec.items.map((m, mIdx) => (m === item && mIdx === idx) ? regOption.name : m) };
                                            }
                                          }
                                          return sec;
                                        });
                                        setResourceSections(next);
                                        setReplacingItem(null);
                                        if (onResourceReplacementConfirm) {
                                          onResourceReplacementConfirm(activeTab, item, regOption.name);
                                        }
                                      }
                                    });
                                  }}
                                  className="p-2 ml-1 rounded-lg border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/5 cursor-pointer flex flex-col justify-center transition-all text-left group"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span className="text-xs shrink-0">{regOption.icon}</span>
                                      <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">{regOption.name}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })
              ) : (
                <div className="py-6 px-4 text-center text-xs text-slate-400 font-bold bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-1.5">
                  <span>⚠️ 当前尚无绑定的物联底座资源</span>
                  <button
                    onClick={() => {
                      if (activeTab === 'map') {
                        setResourceSections(resourceSections.map(s => s.id === 'map' ? { ...s, items: ['小鹏科技园大堂地图'] } : s));
                      } else {
                        setIsAddingNewItem(true);
                      }
                    }}
                    className="px-3 py-1 bg-[#1d1d1f] text-white hover:bg-slate-800 font-semibold rounded-lg text-[10px] cursor-pointer transition-all border-0 shadow-xs"
                  >
                    💡 加载预设默认资源
                  </button>
                </div>
              )}

              {/* 知识库底座多联绑定时：可点击快捷添加新知识库 */}
              {activeTab === 'knowledge' && !isAddingNewItem && activeItems.length < GLOBAL_RESOURCE_REGISTRY.knowledge.length && (
                <button
                  onClick={() => setIsAddingNewItem(true)}
                  className="py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-800 bg-white hover:bg-slate-50/50 text-slate-550 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0"
                >
                  ➕ 添加知识库
                </button>
              )}

              {/* 原地在下方快捷调起知识库列表以满足添加需求 */}
              {activeTab === 'knowledge' && isAddingNewItem && (
                <div className="border border-slate-200 rounded-xl bg-slate-50 p-3 text-left shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold text-[#1d1d1f] tracking-wide uppercase">📖 添加新知识库底座到机器人</span>
                    <button 
                      onClick={() => setIsAddingNewItem(false)}
                      className="text-slate-400 hover:text-slate-700 bg-transparent border-0 font-bold text-xs cursor-pointer text-right"
                    >
                      收起 ✕
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto">
                    {GLOBAL_RESOURCE_REGISTRY.knowledge.filter(k => !activeItems.includes(k.name)).map(regNode => (
                      <div
                        key={regNode.name}
                        onClick={() => {
                          const next = resourceSections.map(sec => {
                            if (sec.id === 'knowledge') {
                              return { ...sec, items: [...sec.items, regNode.name] };
                            }
                            return sec;
                          });
                          setResourceSections(next);
                          setIsAddingNewItem(false);
                        }}
                        className="p-2 border border-slate-150 hover:border-blue-300 bg-white hover:bg-blue-50/5 cursor-pointer rounded-lg flex flex-col gap-0.5 transition-all group text-left"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">{regNode.icon}</span>
                          <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-500 transition-all">{regNode.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal pl-4">{regNode.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}


            </div>
        )}

        {/* ========== B. 动作/姿态 (默认展示3D人声与索引) ========== */}
        {activeTab === 'action' && (
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
              <span>🤖 导控姿态离线拟真预览</span>
              <button
                type="button"
                className="px-2.5 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-all border flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-3xs normal-case tracking-normal shrink-0"
                title="查看与管理系统完整底层应用资源"
              >
                <span>📦 全部动作</span>
              </button>
            </div>

            {/* 3D 机器人高科技动作预览板 (参考图2) */}
            <div className="border border-slate-200.5 bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-between select-none relative h-[240px] shadow-lg overflow-hidden shrink-0">
              {/* 高保真机器人矢量 SVG */}
              <div className="flex-1 flex items-center justify-center w-full min-h-0">
                <svg width="180" height="150" viewBox="0 0 200 160" className="opacity-95 select-none scale-105 origin-center">
                  <ellipse cx="100" cy="148" rx="35" ry="5" fill="#020617" opacity="0.6" />
                  
                  {/* Skeletal Node */}
                  <g className={selectedActionInTab === '送别致意动作' ? 'origin-[100px_106px] ease-in-out' : ''} style={{ animation: selectedActionInTab === '送别致意动作' ? 'bended-bowing 2s ease-in-out infinite' : undefined }}>
                    
                    {/* Torso */}
                    <rect x="85" y="60" width="30" height="42" rx="7" fill="#cbd5e1" stroke="#334155" strokeWidth="2.5" />
                    <circle cx="100" cy="74" r="5" fill="#00f0ff" className="glow-eye" />
                    <line x1="91" y1="88" x2="109" y2="88" stroke="#334155" strokeWidth="2" />

                    {/* Neck */}
                    <line x1="100" y1="52" x2="100" y2="60" stroke="#334155" strokeWidth="3" />

                    {/* Head group with nodding */}
                    <g className="robot-head-group">
                      <rect x="86" y="27" width="28" height="25" rx="6" fill="#f8fafc" stroke="#334155" strokeWidth="2.5" />
                      <rect x="91" y="33" width="18" height="6" rx="3" fill="#0f172a" />
                      <ellipse cx="100" cy="36" rx="6" ry="1.2" fill="#38bdf8" className="glow-eye" />
                      <line x1="100" y1="27" x2="100" y2="20" stroke="#334155" strokeWidth="2" />
                      <circle cx="100" cy="19" r="2" fill="#ef4444" />
                    </g>

                    {/* Left Arm (idle but generic gesture) */}
                    <g className="robot-left-arm">
                      <line x1="85" y1="66" x2="70" y2="92" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="70" cy="92" r="3" fill="#64748b" />
                    </g>

                    {/* Right Arm: waves or points */}
                    <g className={selectedActionInTab === '挥手欢迎动作' || selectedActionInTab === '送别致意动作' ? 'wave-motion-active' : ''}>
                      <line 
                        x1="115" 
                        y1="66" 
                        x2={selectedActionInTab === '指引前方动作' ? '146' : '130'} 
                        y2={selectedActionInTab === '指引前方动作' ? '50' : '92'} 
                        stroke="#334155" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                      />
                      <circle 
                        cx={selectedActionInTab === '指引前方动作' ? '146' : '130'} 
                        cy={selectedActionInTab === '指引前方动作' ? '50' : '92'} 
                        r="3" 
                        fill="#64748b" 
                      />
                    </g>

                    {/* Left Leg */}
                    <line x1="93" y1="102" x2="93" y2="136" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
                    {/* Right Leg */}
                    <line x1="107" y1="102" x2="107" y2="136" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
                  </g>
                </svg>
              </div>

              {/* 动作状态条 & 播放控制栏 (参考图2) */}
              <div className="w-full bg-[#1e293b]/70 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-white font-mono shrink-0">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-7 h-7 rounded-md bg-white text-slate-900 border-0 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-95 transition-all shadow-xs"
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <span className="text-[10px] text-slate-350 select-none">00:0{Math.floor(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="0.1"
                  value={currentTime}
                  onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                  className="flex-1 accent-[#00f0ff] h-1.5 bg-slate-800 rounded-lg outline-none cursor-pointer scale-y-75"
                />
                <span className="text-[10px] text-slate-400 select-none">00:06</span>
              </div>
            </div>

            {/* 顶段：动作选择 pill row */}
            <div className="flex flex-col gap-1.5 text-left">
              <div className="flex flex-wrap gap-1">
                {activeItems.map(actName => (
                  <button
                    key={actName}
                    onClick={() => {
                      setSelectedActionInTab(actName);
                      if (setHighlightedAction) {
                        setHighlightedAction(actName);
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded-lg border text-[10.5px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                      selectedActionInTab === actName 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                        : 'bg-white text-slate-605 hover:text-slate-800 border-slate-200'
                    }`}
                  >
                    <span>{getActionIcon(actName)}</span> {actName}
                  </button>
                ))}
              </div>
            </div>

            {/* 动作及高价值索引树 */}
            <div className="border border-slate-200/80 rounded-xl bg-slate-50/50 p-4 text-left">
              <div className="flex flex-col gap-1">
                <h5 className="text-[11.5px] font-bold text-slate-800 flex items-center gap-1.5">
                  <span>{getActionIcon(selectedActionInTab)}</span> {selectedActionInTab}
                </h5>
              </div>

              {/* 索引关系渲染：直接联动点击切换中控台 */}
              <div className="mt-3 border-t border-slate-200/50 pt-3">
                <div className="text-[10.5px] font-bold text-slate-400 tracking-wider mb-2 uppercase">🔗 引用位置索引 (点击直接定位切换):</div>
                <div className="flex flex-col gap-1.5">
                  {ACTION_REFERENCES[selectedActionInTab]?.map((ref, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleIndexNavigate(ref)}
                      className="group py-2 px-3 rounded-lg border border-slate-200 hover:border-slate-800 bg-white cursor-pointer hover:shadow-2xs transition-all text-left flex items-center justify-between gap-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        {renderReferenceBadge(ref.type as 'script' | 'task', ref.title, selectedActionInTab)}
                      </div>
                      <span className="text-[10px] bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded border border-slate-100 font-bold origin-right scale-90 group-hover:bg-[#1d1d1f] group-hover:text-white transition-all shrink-0">
                        ➔
                      </span>
                    </div>
                  )) || (
                    <div className="text-[10px] text-slate-450 pl-2">
                      暂无引用的行为记录。该动作处于自由常态包中
                    </div>
                  )}
                </div>
              </div>
            </div>
            

          </div>
        )}

        {/* ========== C. Skill接口 (默认展示接口回调与索引) ========== */}
        {activeTab === 'skill' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
              <span>📋 物联网外设指令与回调日志</span>
              <button
                type="button"
                className="px-2.5 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-all border flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-3xs normal-case tracking-normal shrink-0"
                title="查看与管理系统完整底层应用资源"
              >
                <span>📦 全部技能</span>
              </button>
            </div>

            {/* 实景高阶 API 调试监视器 */}
            <div className="border border-slate-300 rounded-2xl bg-slate-950 p-4 h-[180px] overflow-hidden flex flex-col justify-between font-mono text-[10px] shadow-lg text-emerald-400">
              <div className="h-6.5 border-b border-slate-800/80 flex items-center justify-between text-slate-400 px-1">
                <span className="font-bold flex items-center gap-1.5">🟢 IoT API MONITOR</span>
                <span>BAUD 115200</span>
              </div>
              <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-1 pr-1 font-mono text-left select-text">
                {apiConsoleLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed flex gap-1.5 pl-1.5">
                    <span className="text-slate-500 shrink-0 font-mono">[{log.time}]</span>
                    <span className={`${
                      log.type === 'req' ? 'text-amber-300' : log.type === 'res' ? 'text-cyan-400' : 'text-slate-400'
                    } font-semibold font-mono whitespace-pre-wrap break-all`}>
                      {log.text}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-5 border-t border-slate-900 flex items-center justify-end text-slate-500 text-[8.5px] pt-1">
                <span>BUFFER: ACTIVE_STATE</span>
              </div>
            </div>

            {/* 顶段：Skill pill selection */}
            <div className="flex flex-col gap-1.5 text-left font-sans">
              <div className="flex flex-wrap gap-1">
                {activeItems.map(skillName => (
                  <button
                    key={skillName}
                    onClick={() => {
                      setSelectedSkillInTab(skillName);
                      if (setHighlightedAction) {
                        setHighlightedAction(skillName);
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded-lg border text-[10.5px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                      selectedSkillInTab === skillName 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                        : 'bg-white text-slate-650 hover:text-slate-800 border-slate-200'
                    }`}
                  >
                    <span>{getSkillIcon(skillName)}</span> {skillName}
                  </button>
                ))}
              </div>
            </div>

            {/* 当前 Skill 细节与索引关系导航 */}
            <div className="border border-slate-200/80 rounded-xl bg-slate-50/50 p-4 text-left">
              <div className="flex flex-col gap-1">
                <h5 className="text-[11.5px] font-bold text-slate-800 flex items-center gap-1.5">
                  <span>{getSkillIcon(selectedSkillInTab)}</span> {selectedSkillInTab}
                </h5>
              </div>

              {/* 索引关系 */}
              <div className="mt-3 border-t border-slate-200/50 pt-3">
                <div className="text-[10.5px] font-bold text-slate-400 tracking-wider mb-2 uppercase">🔗 引用位置索引 (点击直接定位切换):</div>
                <div className="flex flex-col gap-1.5">
                  {SKILL_REFERENCES[selectedSkillInTab]?.map((ref, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleIndexNavigate(ref)}
                      className="group py-2 px-3 rounded-lg border border-slate-200 hover:border-slate-800 bg-white cursor-pointer hover:shadow-2xs transition-all text-left flex items-center justify-between gap-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        {renderReferenceBadge(ref.type as 'script' | 'task', ref.title, selectedSkillInTab)}
                      </div>
                      <span className="text-[10px] bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded border border-slate-100 font-bold origin-right scale-90 group-hover:bg-[#1d1d1f] group-hover:text-white transition-all shrink-0">
                        ➔
                      </span>
                    </div>
                  )) || (
                    <div className="text-[10px] text-slate-450 pl-2">
                      暂无引用的接口指令关系
                    </div>
                  )}
                </div>
              </div>
            </div>
            

          </div>
        )}

      </div>

      {/* 4. 气势磅礴的高配置拟真模态提示框 Custom Dialog Modal */}
      {customDialog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-3xs flex items-center justify-center z-50 p-4 transition-all animate-fade-in font-sans">
          <div className="bg-white border border-[#e6e6eb] rounded-2xl shadow-xl max-w-sm w-full p-5 flex flex-col gap-4 animate-scale-up font-sans">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">
                {customDialog.type === 'delete' ? '⚠️' : '🔄'}
              </span>
              <div className="flex flex-col gap-1 text-left">
                <h4 className="text-xs font-extrabold text-[#1d1d1f] tracking-tight">
                  {customDialog.type === 'delete' ? (
                    activeTab === 'knowledge' ? '解除绑定知识库确认' : '强制解除绑定底座警告'
                  ) : (
                    activeTab === 'knowledge' ? '知识库底座一键替换' : '物联底座资源替换确认'
                  )}
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed font-semibold mt-1">
                  {customDialog.type === 'delete' ? (
                    activeTab === 'knowledge' ? (
                      <>
                        您确认解除绑定并删除知识库底座 <strong className="text-slate-800 font-bold">「{customDialog.itemName}」</strong> 吗？
                        <br />
                        此操作将清理该知识库关联，不会进行剧本定位索引干扰。
                      </>
                    ) : (
                      <>
                        移除底座资源 <strong className="text-slate-800 font-bold">「{customDialog.itemName}」</strong> 将直接影响关联的<strong>行为剧本</strong>以及<strong>任务书 JSON</strong>。
                        <br />
                        <span className="text-red-500 font-bold mt-2 block">⚠️ 警告：物理机器人定位以及对应的控制信号校验将失效。</span>
                        <br />
                        您确认执行此一键强制删除吗？
                      </>
                    )
                  ) : (
                    activeTab === 'knowledge' ? (
                      <>
                        您确认将当前绑定的知识库从 <strong className="text-slate-500 font-bold">「{customDialog.itemName}」</strong> 替换为备选底座 <strong className="text-blue-600 font-bold">「{customDialog.replacementName}」</strong> 吗？
                        <br />
                        <span className="text-blue-600 font-bold mt-2 block">🔄 提示：替换后将自动更新知识库信息，不会触发剧本和任务书前台的联动转跳与定位。</span>
                      </>
                    ) : (
                      <>
                        将当前绑定的资源从 <strong className="text-slate-500 font-bold">「{customDialog.itemName}」</strong> 替换为备选底座 <strong className="text-blue-600 font-bold">「{customDialog.replacementName}」</strong>。
                        <br />
                        <span className="text-blue-600 font-bold mt-2 block">🔄 提示：此操作将自动同步更改行为剧本和任务书 JSON。</span>
                        <br />
                        您确定一键热替换，引导 Agent 重新对齐吗？
                      </>
                    )
                  )}
                </p>
              </div>
            </div>

            {/* 按钮控制 */}
            <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-100 font-sans">
              <button 
                onClick={() => setCustomDialog(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer transition-all"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  customDialog.onConfirm();
                  setCustomDialog(null);
                }}
                className={`px-4 py-1.5 rounded-lg border-0 text-white text-xs font-bold cursor-pointer transition-all ${
                  customDialog.type === 'delete' ? 'bg-red-500 hover:bg-red-600 shadow-sm shadow-red-100' : 'bg-[#1d1d1f] hover:bg-slate-800 shadow-xs'
                }`}
              >
                {customDialog.type === 'delete' ? (
                  activeTab === 'knowledge' ? '确认解除' : '确定强制删除'
                ) : (
                  activeTab === 'knowledge' ? '确认替换' : '确认一键替换'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. 知识库详情高品质微型看板弹框 (跳转效果模拟预览区) */}
      {selectedKnowledgeForDetail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs flex items-center justify-center z-50 p-4 transition-all animate-fade-in font-sans">
          <div className="bg-white border border-[#e6e6eb] rounded-2xl shadow-xl max-w-md w-full p-5.5 flex flex-col gap-4 animate-scale-up text-left font-sans">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedKnowledgeForDetail.icon || '📘'}</span>
                <div>
                  <h4 className="text-[13px] font-extrabold text-slate-850 tracking-tight leading-tight">
                    {selectedKnowledgeForDetail.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8.5px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded border border-emerald-150">ACTIVE</span>
                    <span className="text-[9px] text-slate-400 font-mono">底座位置: 知识中枢</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedKnowledgeForDetail(null)}
                className="w-6 h-6 rounded-lg hover:bg-slate-50 border border-slate-200/60 flex items-center justify-center cursor-pointer transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400 hover:text-slate-700 transition-colors"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex flex-col gap-3.5 max-h-[380px] overflow-y-auto pr-1">
              <div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">📝 资源简介</span>
                <p className="text-[10.5px] text-slate-600 leading-normal font-sans mt-1 pl-2 border-l-2 border-slate-200">
                  {selectedKnowledgeForDetail.desc}
                </p>
              </div>

              {/* 预设 Q&A 问答对展示 */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">❓ 预设 QA 问答对检索条目 ({KNOWLEDGE_DETAILS[selectedKnowledgeForDetail.name]?.qas.length || 0} 条有效)</span>
                <div className="flex flex-col gap-2.5 mt-2">
                  {KNOWLEDGE_DETAILS[selectedKnowledgeForDetail.name]?.qas.map((qa, qidx) => (
                    <div key={qidx} className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex flex-col gap-1.5 font-sans">
                      <div className="flex gap-1.5 items-start">
                        <span className="text-amber-500 font-bold font-mono text-[10.5px]">Q:</span>
                        <span className="text-[10.5px] font-bold text-slate-800 leading-relaxed font-sans">{qa.q}</span>
                      </div>
                      <div className="flex gap-1.5 items-start border-t border-slate-200/50 pt-2 mt-0.5">
                        <span className="text-blue-500 font-bold font-mono text-[10.5px]">A:</span>
                        <span className="text-[10px] text-slate-600 leading-relaxed font-sans">{qa.a}</span>
                      </div>
                    </div>
                  )) || (
                    <div className="text-[10px] text-slate-450 italic pl-2">暂未导入 Q&A 表项。</div>
                  )}
                </div>
              </div>

              {/* 相关素材 */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">📂 绑定参考白皮书及说明素材</span>
                <div className="flex flex-col gap-1.5 mt-1.5">
                  {KNOWLEDGE_DETAILS[selectedKnowledgeForDetail.name]?.docs.map((doc, docidx) => (
                    <div key={docidx} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all font-sans">
                      <span className="text-[10px] font-bold text-slate-650 truncate">{doc}</span>
                    </div>
                  )) || (
                    <div className="text-[10px] text-slate-450 italic pl-2">暂无外置参考文档。</div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button 
                onClick={() => setSelectedKnowledgeForDetail(null)}
                className="w-full py-2 rounded-xl bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1 shadow-xs hover:shadow-xs"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

    </aside>
  );
}
