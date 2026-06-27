# 我的 PI 配置

[Pi Coding Agent](https://github.com/earendil-works/pi/tree/main/packages/coding-agent) 是一款终端原生的 AI 编码助手，深度集成到命令行工作流中。它在终端内运行，支持自定义扩展（Extension）、技能（Skill）、子代理（Subagent）和提示词（Prompt），让 AI 辅助编程更高效。

本仓库包含我的个人配置方案，覆盖扩展、Skill、Agent 和 Prompt 四个维度，公开分享供参考和学习。

---

## 目录

- [仓库内容](#仓库内容)
- [扩展](#扩展)
  - [基础功能类](#基础功能类)
  - [编码类](#编码类)
  - [优化类](#优化类)
  - [管理类](#管理类)
  - [多模态类](#多模态类)
- [Skill](#skill)
  - [基础工具类](#基础工具类-1)
  - [搜索能力类](#搜索能力类)
  - [文档类](#文档类)
  - [编程规范类](#编程规范类)
- [Agent](#agent)
- [Prompt](#prompt)

---

## 仓库内容

```
.pi/
├── agent/
│   ├── settings.json              # 核心配置：默认模型、插件列表
│   ├── keybindings.json           # 自定义快捷键
│   ├── AGENTS.md                  # 项目指令，定义代理行为规则
│   ├── agents/
│   │   └── README.md              # 子代理编排指南
│   ├── npm/
│   │   └── package.json           # npm 全局包声明
│   └── skills/                    # Skill 目录，每个子目录为一个独立 Skill
│       ├── brave-search/
│       ├── browser-tools/
│       ├── doc-coauthoring/
│       ├── env-info/
│       ├── frontend-design/
│       ├── grilling-me/
│       ├── internal-comms/
│       ├── pdf/
│       ├── pptx/
│       ├── skill-creator/
│       ├── skill-deps/
│       ├── tavily-search/
│       ├── teach/
│       └── xlsx/
├── .gitignore                     # 分层排除敏感信息
└── README.md                      # 本文件
```

---

## 扩展

### 基础功能类

| 包名 | 说明 |
|------|------|
| `npm:pi-mcp-adapter` | MCP（模型上下文协议）适配器，让 pi 能与外部工具和 API 交互 |
| `npm:pi-web-access` | 网页搜索、URL 内容抓取、GitHub 仓库克隆、PDF 提取等网络能力 |
| `npm:pi-subagents` | 将任务委派给子代理，支持链式调用、并行执行及 TUI 交互确认 |
| `npm:@juicesharp/rpiv-btw` | `/btw` 命令，提出一次性旁问，不污染主对话 |
| `npm:@juicesharp/rpiv-todo` | 待办事项列表，浮层渲染，`/reload` 和对话压缩后仍保留 |
| `npm:@juicesharp/rpiv-ask-user-question` | 结构化向用户提问 |
| `npm:@narumitw/pi-goal` | 持续处理 `/goal` 目标，直到代理完成 |
| `npm:@narumitw/pi-plan-mode` | `/plan` 进入 plan 模式，先规划再执行 |

### 编码类

| 包名 | 说明 |
|------|------|
| `npm:@cnife/pi-simple-plannotator` | 基于浏览器的代码审查和 Markdown 标注 |
| `npm:pi-simplify` | 审查近期代码，检查清晰性、一致性和可维护性 |

### 优化类

| 包名 | 说明 |
|------|------|
| `npm:pi-powerline-footer` | 美化输入栏底部状态 |
| `npm:pi-cache-optimizer` | 缓存优化，减少重复计算 |

### 管理类

| 包名 | 说明 |
|------|------|
| `npm:pi-cost` | WebUI 显示 tokens 使用和费用统计 |
| `npm:pi-inspect` | WebUI 显示模型完整上下文，用于调试 |
| `npm:pi-loadout` | 动态加载配置，可关闭特定 tools 和 skills |

### 多模态类

| 包名 | 说明 |
|------|------|
| `npm:pi-vision-proxy` | 纯文本模型的多模态 fallback，自动转发图像到视觉模型 |

---

## Skill

### 基础工具类

| 名称 | 来源 | 说明 |
|------|------|------|
| **skill-deps** | 自建 | 依赖管理规范。Python 优先 uv，Node 使用 pnpm。先检后装，安装后固化到 SKILL.md |
| **env-info** | 自建 | 开发环境参考。记录工具路径版本，包管理器偏好：pnpm > npm/yarn，uv > pip |
| **skill-creator** | Anthropic | Skill 创建完整工作流：草稿 → 测试用例 → 批量评估 → 定量分析 → 迭代优化 |

### 搜索能力类

| 名称 | 来源 | 说明 |
|------|------|------|
| **tavily-search** | Tavily 官方 | LLM 优化搜索。返回内容片段、相关性评分、来源元数据，支持域名和时间过滤 |
| **brave-search** | badlogic | Brave Search API 搜索和内容提取。轻量级，无需浏览器 |
| **browser-tools** | badlogic | 浏览器自动化。通过 CDP 连接 Edge/Chrome，实现导航、截图、内容提取、Cookie 操作等 |

### 文档类

| 名称 | 来源 | 说明 |
|------|------|------|
| **doc-coauthoring** | Anthropic | 协作写作工作流。三阶段：背景收集 → 内容提炼 → 读者验证，适用提案、规范、决策文档 |
| **internal-comms** | Anthropic | 内部沟通文案。支持 3P 更新、公司通讯、FAQ、事故报告、项目更新 |
| **pdf** | Anthropic | PDF 全功能处理。提取、合并、拆分、旋转、水印、表单、加密、OCR |
| **pptx** | Anthropic | PPTX 完整处理。创建新幻灯片、模板编辑、内容提取、XML 分析、样式校验 |
| **xlsx** | Anthropic | Excel 处理。读写 xlsx/csv/tsv、公式计算、格式化、图表、数据清洗 |

### 编程规范类

| 名称 | 来源 | 说明 |
|------|------|------|
| **grill-me** | mottpocock | 编程头脑风暴。通过追问遍历决策树，在编码前发现盲区和边界情况 |
| **frontend-design** | Anthropic | 前端设计规范。注重视觉风格、字体系统、色彩搭配、动效设计 |
| **teach** | mattpocock | 教学型 Skill，工作区内教授新概念，支持多会话持续学习 |

---

## Agent

自定义子代理配置和编排指南见 [agent/agents/README.md](agent/agents/README.md)，包含：

- 8 个内置代理详解（scout、planner、worker、reviewer、oracle 等）
- 推荐编排模式（clarify → planner → worker → reviewers）
- 自然语言工作流示例
- 自定义代理创建方法

---

## Prompt

*（待补充）*

---

*个人配置，仅供参考。请根据自身环境调整设置。*
