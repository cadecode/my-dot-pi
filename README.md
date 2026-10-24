# 我的 PI 配置

[Pi Coding Agent](https://github.com/earendil-works/pi/tree/main/packages/coding-agent) 是一款终端原生的 AI 编码助手，深度集成到命令行工作流中。它在终端内运行，支持自定义扩展（Extension）、技能（Skill）和子代理（Subagent），让 AI 辅助编程更高效。

本仓库包含我的个人配置方案，覆盖扩展、Skill 和 Subagent 三个维度，公开分享供参考和学习。当前基于 **pi 1.4.0**。

> 仓库地址：https://github.com/cadecode/my-dot-pi

---

## 目录

- [仓库内容](#仓库内容)
- [敏感文件与模板](#敏感文件与模板)
- [扩展](#扩展)
- [Pi 1.4.0 内置能力](#pi-140-内置能力)
- [loadout 预设](#loadout-预设)
- [Skill](#skill)
- [Subagent](#subagent)
- [版本策略](#版本策略)

---

## 仓库内容

```
.pi/
├── agent/
│   ├── settings.json              # 核心配置：默认模型、插件版本（精确锁定）、tuiMode
│   ├── loadout.json               # loadout 默认预设（default：22 工具 / 32 技能）
│   ├── loadout-profiles.json      # loadout 用户预设（base：23 工具 / 11 技能）
│   ├── models.json                # 自定义 provider / 模型元数据（仅本地，不入库）
│   ├── keybindings.json           # 自定义快捷键
│   ├── AGENTS.md                  # 全局项目指令
│   ├── agents/
│   │   └── README.md              # 子代理编排指南
│   ├── extensions/
│   │   └── herdr-agent-state.ts   # herdr 状态上报扩展
│   └── npm/
│       ├── package.json           # 插件声明（精确版本）
│       └── package-lock.json      # 依赖锁定
├── GIT_SHARE.md                   # 配置仓库提交守则
├── .gitignore                     # 分层排除敏感信息
└── README.md                      # 本文件
```

---

## 敏感文件与模板

以下内容**不入库**，换机器时按模板重建：

| 文件 | 内容 | 重建方式 |
|------|------|----------|
| `agent/auth.json` | 各 provider 的 API Key / OAuth 凭证 | `pi` 内 `/login` |
| `agent/models-store.json` | 模型运行时状态（含凭证） | 自动生成 |
| `agent/models.json` | 本机 provider 与模型元数据（baseUrl、上下文长度、价格） | 不含密钥，但涉及个人订阅的 provider，故与 `auth.json` 一并忽略；换机器需自行重建 |
| `agent/mcp.json` | MCP 服务器列表，含 Bearer token | `/mcp add` 或按需手写（不入库，故不提供模板） |
| `agent/pi-goal.json` | `/goal` 运行状态 | 自动生成 |
| `agent/pi-statusline.json` | 底栏个人偏好 | 按需自建 |
| `agent/sessions/` | 会话记录（隐私敏感） | 自动生成 |
| `agent/pi-cache-optimizer-stats.d/` | 缓存命中统计分片（含 session ID） | 自动生成 |
| `agent/bin/` | 内置 `fd`、`rg` 二进制（约 9 MB） | pi 自动下载 |
| `agent/npm/node_modules/` | 插件依赖 | `cd agent/npm && npm ci` |

`models.json` 与 `models-store.json` 的区别：前者是静态的 provider/模型定义（改一次用很久），后者是运行时会写入凭证的状态文件。两者都不入库。

---

## 扩展

### 基础功能类

| 包名 | 说明 |
|------|------|
| `npm:@juicesharp/rpiv-todo` | 待办事项列表，浮层渲染，`/reload` 和对话压缩后仍保留 |
| `npm:@narumitw/pi-btw` | `/btw` 侧问命令，独立侧线程对话，支持将回答带回主编辑器 |
| `npm:@narumitw/pi-goal` | 持续处理 `/goal` 目标，直到代理完成 |
| `npm:@narumitw/pi-plan-mode` | `/plan` 进入 plan 模式，先规划再执行 |
| `npm:@narumitw/pi-subagents` | 派发边界化子任务：`spawn` 起任务、`wait` 等待结果，上下文隔离 |
| `npm:pi-simplify` | 审查近期代码，检查清晰性、一致性和可维护性 |
| `npm:pi-web-access` | 网页搜索、URL 内容抓取、GitHub 仓库克隆、PDF 提取等网络能力 |

### 使用体验类

| 包名 | 说明 |
|------|------|
| `npm:@narumitw/pi-statusline` | 信息丰富的底栏，支持颜色主题和响应式收缩 |
| `npm:pi-cache-optimizer` | 缓存优化，减少重复计算 |
| `npm:pi-loadout` | 动态加载配置，逐工具切换 `direct` / `codemode` / `off` 与技能可见范围 |

### 已移除

| 包名 | 移除原因 | 替代 |
|------|----------|------|
| `npm:pi-mcp-adapter` | pi 0.99 起内置 MCP，且适配器会关掉 `builtin:mcp` 导致双重管理 | 内置 MCP（`agent/mcp.json`） |
| `npm:pi-multimodal-proxy` | 现用模型原生支持图像输入，代理层纯属多余 | 模型自身 `input: ["text","image"]`；生图用 codemode 的 `models.generateImages()` |

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

## Pi 1.4.0 内置能力

升级到 1.4.0 后，以下能力无需插件：

| 能力 | 用法 | 配置位置 |
|------|------|----------|
| MCP 客户端 | `pi mcp list` / `/mcp`，工具默认以 `codemode` 暴露，不占上下文 | `agent/mcp.json` |
| `codemode` | 用 JS 脚本批量调用工具、过滤大输出、调分类器与生图模型 | `settings.json` → `codemode.mode` / `codemode.inlineBudget` |
| `tool_search` | 检索未声明的工具 | 默认注册为 inactive，按需激活 |
| TUI | 默认全屏；本仓库设 `"tuiMode": "regular"` 保留旧式滚动视图 | `settings.json` |

---

## loadout 预设

pi-loadout 的「默认」就是 `loadout.json` 本身——预设文件里再叫 `default` 是无效的（内置命令优先命中）。

| 预设 | 存放位置 | 内容 | 应用方式 |
|------|----------|------|----------|
| **default** | `agent/loadout.json` | 23 项白名单 / 32 技能（内置 7 + `codemode` + `tool_search` + goal 3 + subagent 5 + web 4 + `todo`），实际声明 22 个 | `/loadout default`，新会话自动生效 |
| **base** | `agent/loadout-profiles.json` → `profiles.base` | 23 项白名单 / 11 技能（工具与 default 相同，技能精简为 11 个） | `/loadout use base` |

`web_enable` 保留在白名单里，但**不会出现在工具声明中**：pi-web-access 在当前模型走 eager 路径，`session_start` 时把四个 web 工具设为直接可用并摘掉 loader；把 `web-search.json` 改成 `"toolExposure": "deferred"`（或模型支持中途加工具）时，它会自动接管懒加载。因此白名单 23 项、实际声明 22 项属正常。

其他：`/loadout full`、`/loadout minimal` 为内置预设；`/loadout list` 列全部预设；`/loadout status` 看当前状态；面板中 `Ctrl+S` 把当前选择存成新 default，`Ctrl+P` 存成命名预设。

切换预设会改变工具声明，下一次请求可能表现为提示缓存未命中，属正常现象。

---

## Skill

常用 Skill 配置已迁移至独立仓库统一管理：

**👉 [cadecode/agent-skills](https://github.com/cadecode/agent-skills)**

涵盖文档类、搜索能力类、编程规范类等 Skill，安装与更新请参照该仓库 README 的指引。

---

## Subagent

详细说明见 [agent/agents/README.md](agent/agents/README.md)。

`@narumitw/pi-subagents` 3.x 采用「边界化任务」模型：每个子代理是独立上下文的作业，只返回结果，不与主会话共享记忆。

| 工具 | 用途 |
|------|------|
| `subagent_spawn` | 起一个作业，立即返回 jobId |
| `subagent_wait` | 等待作业结束，取出结果（需要阻塞时用 `spawn` + `wait`） |
| `subagent_send` | 向运行中的作业追加要求，或回答它的提问 |
| `subagent_inspect` | 查看作业脱敏快照（不暴露任务正文与子代理输出） |
| `subagent_cancel` | 取消作业并释放资源 |

子代理默认只有只读工具（`read` / `grep` / `find` / `ls`），需要改文件或跑命令时在 `spawn` 里显式授权 `edit` / `write` / `bash`。

> 2.x 的 `consult` / `manage` / `mailbox` / `panel` / `chain` / `workflow` 在 3.x 已移除：只读咨询用默认工具的 `spawn`，取消用 `subagent_cancel`，通信统一走 `subagent_send`，阻塞等价于 `spawn` + `wait`。

---

## 加载顺序

pi 按 `settings.json` 的 `packages` 数组顺序加载扩展，hook 按同一顺序串链，因此顺序不是装饰：

| 位置 | 包 | 原因 |
|---|---|---|
| 1 | `pi-loadout` | 最先注册，`session_start` 时立刻收窄活动工具集 |
| 2 | `pi-cache-optimizer` | 在工具集确定后再改写系统提示（技能列表压缩、段序稳定），保证缓存前缀与实发内容一致 |

其余包的顺序不影响行为。`agent/npm/package.json` 的依赖顺序与之保持一致。

---

## 版本策略

- `settings.json` 的 `packages` 与 `npm/package.json` 都写**精确版本**（不带 `^`），避免 `pi update --extensions` 静默漂移；升级时显式改版本号并同步 `package-lock.json`。
- 内置 `bin/` 与 `npm/node_modules/` 不入库，新机器执行 `npm ci` 即可还原。

---

*个人配置，仅供参考。请根据自身环境调整设置。*
