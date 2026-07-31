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
│   └── skills/                    # Skill 说明（内容已迁移至独立仓库）
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

常用 Skill 配置已迁移至独立仓库统一管理：

**👉 [cadecode/agent-skills](https://github.com/cadecode/agent-skills)**

涵盖文档类、搜索能力类、编程规范类等 Skill，安装与更新请参照该仓库 README 的指引。

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
