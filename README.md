# 我的 PI 配置

[Pi Coding Agent](https://github.com/earendil-works/pi/tree/main/packages/coding-agent) 是一款终端原生的 AI 编码助手，深度集成到命令行工作流中。它在终端内运行，支持自定义扩展（Extension）、技能（Skill）和子代理（Subagent），让 AI 辅助编程更高效。

本仓库包含我的个人配置方案，覆盖扩展、Skill 和 Subagent 三个维度，公开分享供参考和学习。

> 仓库地址：https://github.com/cadecode/my-dot-pi

---

## 目录

- [仓库内容](#仓库内容)
- [扩展](#扩展)
  - [基础功能类](#基础功能类)
  - [使用体验类](#使用体验类)
  - [多模态类](#多模态类)
  - [其他可选](#其他可选)
- [Skill](#skill)
  - [文档类](#文档类)
  - [搜索能力类](#搜索能力类)
  - [编程规范类](#编程规范类)
- [Subagent](#subagent)

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
│   │   ├── package.json           # npm 包声明
│   │   └── package-lock.json      # 依赖锁定
│   └── skills/                    # Skill 目录
├── .gitignore                     # 分层排除敏感信息
└── README.md                      # 本文件
```

---

## 扩展

### 基础功能类

| 包名 | 说明 |
|------|------|
| `npm:@juicesharp/rpiv-todo` | 待办事项列表，浮层渲染，`/reload` 和对话压缩后仍保留 |
| `npm:@narumitw/pi-btw` | `/btw` 侧问命令，独立侧线程对话，支持将回答带回主编辑器 |
| `npm:@narumitw/pi-goal` | 持续处理 `/goal` 目标，直到代理完成 |
| `npm:@narumitw/pi-plan-mode` | `/plan` 进入 plan 模式，先规划再执行 |
| `npm:@narumitw/pi-subagents` | 将任务委派给子代理，支持 blocking 批量执行和 stateful 生命周期管理 |
| `npm:pi-mcp-adapter` | MCP（模型上下文协议）适配器，让 pi 能与外部工具和 API 交互 |
| `npm:pi-simplify` | 审查近期代码，检查清晰性、一致性和可维护性 |
| `npm:pi-web-access` | 网页搜索、URL 内容抓取、GitHub 仓库克隆、PDF 提取等网络能力 |

### 使用体验类

| 包名 | 说明 |
|------|------|
| `npm:@narumitw/pi-statusline` | 信息丰富的底栏，支持颜色主题和响应式收缩 |
| `npm:pi-cache-optimizer` | 缓存优化，减少重复计算 |
| `npm:pi-loadout` | 动态加载配置，可控制当前会话中 tools 和 skills 的可见范围 |

### 多模态类

| 包名 | 说明 |
|------|------|
| `npm:pi-multimodal-proxy` | 纯文本模型的多模态 fallback，自动转发图像到视觉模型 |

### 其他可选

以下插件同样值得关注，可根据需求选用：

| 包名 | 说明 | 当前选型 |
|------|------|------|
| `npm:@cnife/pi-simple-plannotator` | 代码审查与标注 | — |
| `npm:@juicesharp/rpiv-ask-user-question` | 结构化提问 | — |
| `npm:@juicesharp/rpiv-btw` | 轻量弹窗版 `/btw` | `npm:@narumitw/pi-btw` |
| `npm:pi-cost` | WebUI 费用统计 | — |
| `npm:pi-inspect` | WebUI 调试面板 | — |
| `npm:pi-powerline-footer` | 功能丰富底栏 + 固定编辑器等 | `npm:@narumitw/pi-statusline` |
| `npm:pi-subagents` | 偏自然语言工作流 | `npm:@narumitw/pi-subagents` |
| `npm:pi-web-access-lean` | 轻量网页访问 | `npm:pi-web-access` |

---

## Skill

### 文档类

| 名称 | 来源 | 说明 |
|------|------|------|
| **doc-coauthoring** | Anthropic | 协作写作工作流。三阶段：背景收集 → 内容提炼 → 读者验证，适用提案、规范、决策文档 |
| **internal-comms** | Anthropic | 内部沟通文案。支持 3P 更新、公司通讯、FAQ、事故报告、项目更新 |
| **pdf** | Anthropic | PDF 全功能处理。提取、合并、拆分、旋转、水印、表单、加密、OCR |
| **pptx** | Anthropic | PPTX 完整处理。创建新幻灯片、模板编辑、内容提取、XML 分析、样式校验 |
| **xlsx** | Anthropic | Excel 处理。读写 xlsx/csv/tsv、公式计算、格式化、图表、数据清洗 |

### 搜索能力类

| 名称 | 来源 | 说明 |
|------|------|------|
| **brave-search** | @badlogic | Brave Search API 搜索和内容提取。轻量级，无需浏览器 |
| **browser-tools** | @badlogic | 浏览器自动化。通过 CDP 连接 Edge/Chrome，实现导航、截图、内容提取、Cookie 操作等 |
| **tavily-search** | Tavily | LLM 优化搜索。返回内容片段、相关性评分、来源元数据，支持域名和时间过滤 |

### 编程规范类

| 名称 | 来源 | 说明 |
|------|------|------|
| **grill-me** | @mottpocock | 编程头脑风暴。通过追问遍历决策树，在编码前发现盲区和边界情况 |
| **frontend-design** | Anthropic | 前端设计规范。注重视觉风格、字体系统、色彩搭配、动效设计 |
| **teach** | @mattpocock | 教学型 Skill，工作区内教授新概念，支持多会话持续学习 |

---

## Subagent

详细说明见 [agent/agents/README.md](agent/agents/README.md)。

内置代理：

- **scout** — 只读代码侦察
- **planner** — 制定实现计划
- **reviewer** — 代码审查
- **worker** — 具体实现
- **general** — worker 别名

支持 blocking 批量执行（single / parallel + aggregator / chain）和 stateful 异步生命周期（spawn / send / manage / mailbox）。

---

*个人配置，仅供参考。请根据自身环境调整设置。*
