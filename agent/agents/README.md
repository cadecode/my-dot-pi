# pi-subagents — 子代理编排指南

`pi-subagents` 是 pi 的核心扩展，支持将任务委派给专用子代理（subagent），实现代码审查、侦察、实现、并行审计和后台任务等高级工作流。

---

## 内置代理

| 名称 | 职责 | 使用场景 |
|------|------|----------|
| **scout** | 快速代码侦察 | 了解代码结构前：定位相关文件、入口点、数据流、风险点，输出上下文简报 |
| **researcher** | 外部研究 | 需要引用外部事实前：搜索官方文档、规范、基准测试、最新变更，输出研究摘要 |
| **planner** | 制定实现计划 | 代码较大变更前：基于上下文输出具体执行计划，应读取分析但不编辑代码 |
| **worker** | 具体实现 | 经批准的方案落地：编写/修改代码文件、验证结果，遇到未授权决策应升级而非猜测 |
| **reviewer** | 代码审查 | 审查变更质量：检查实现是否匹配任务/计划、测试覆盖、边界情况、复杂度 |
| **context-builder** | 上下文构建 | 规划前的强化阶段：收集代码上下文并输出 `context.md`、`meta-prompt.md` 等交接材料 |
| **oracle** | 决策审查 | 行动前获取第二意见：挑战假设、发现执行偏差、推荐最安全的下一步动作（不编辑代码） |
| **delegate** | 通用委派 | 需要接近父代理行为的轻量子代理时 |

### 经验法则

```
不理解代码 → scout
不确定外部事实 → researcher
较大变更前 → planner
实施变更 → worker
检查变更质量 → reviewer
决策本身有风险 → oracle
```

---

## 常用工作流

| 需求 | 自然语言指令 |
|------|-------------|
| 代码审查 | "用 reviewer 审查一下这个 diff" |
| 第二意见 | "让 oracle 审查一下当前计划，挑战一下我的假设" |
| 并行审查 | "并行审查：一个看正确性、一个看测试、一个看简洁性" |
| 调查 Bug | "先让 oracle 调查一下这个 bug，别着急改代码" |
| 实现后审查 | "让 worker 实现这个方案，然后跑并行审查，汇总反馈并修复" |
| 循环审查直到干净 | "跑一个 review loop，最多 3 轮，直到没发现需要修的问题" |
| 侦察后规划 | "先用 scout 了解认证流程，再让 planner 出个实现计划" |
| 后台运行 | "后台实现这个" |
| 查看可用代理 | "看看有哪些可用的子代理" |
| 诊断设置 | "检查一下子代理配置正不正常"

---

## 斜杠命令

| 命令 | 说明 |
|------|------|
| `/run <agent> [task]` | 运行单个代理 |
| `/chain a1 "t1" -> a2 "t2"` | 顺序链式运行 |
| `/parallel a1 "t1" -> a2 "t2"` | 并行运行 |
| `/run-chain <chainName> -- <task>` | 运行保存的工作流链 |
| `/subagents-doctor` | 诊断代理设置、发现路径和 intercom 状态 |

后台运行加 `--bg`，fork 上下文加 `--fork`：

```bash
/run worker "implement this plan" --bg
/run reviewer "review this diff" --fork --bg
```

### Prompt 快捷方式

| 快捷方式 | 用途 |
|----------|------|
| `/parallel-review` | 启动多个 reviewer，从不同角度审查（正确性、测试、简洁性），然后综合反馈 |
| `/review-loop` | worker → reviewer → fix-worker 循环，直到审查通过或达到上限 |
| `/parallel-research` | 并行运行 researcher + scout，综合外部证据与本地代码上下文 |
| `/parallel-context-build` | 并行 context-builder，输出规划交接材料和 meta-prompt |
| `/parallel-handoff-plan` | 外部研究 + 本地上下文构建，产出综合实现计划 |
| `/gather-context-and-clarify` | 先侦察/搜索，再向用户提出澄清问题 |
| `/parallel-cleanup` | 两个 fresh reviewer 做对抗性清理审查（啰嗦 + 冗余） |

在 `/parallel-review` 或 `/parallel-cleanup` 后加 `autofix` 可直接应用值得修复的问题。

---

## 推荐编排模式

```
clarify → planner → worker → fresh reviewers → worker
```

1. 与用户确认需求和方向
2. planner 制定具体实现计划
3. worker 执行实现
4. 启动 fresh reviewer（无上下文污染）进行对抗性审查
5. 根据审查反馈修复

oracle 辅助决策：

```
oracle 诊断 → 用户审批方向 → worker 实施
```

### 上下文模式

| 模式 | 说明 |
|------|------|
| `fresh` | 干净启动，不继承对话历史，适合独立审查 |
| `fork` | 分支当前会话，继承完整上下文（项目指令、对话历史），适合延续性工作 |

**默认行为**：`planner`、`worker`、`oracle` 默认 `fork`；其他默认 `fresh`。可在命令中覆盖：

```bash
/run reviewer[context=fresh] "review this diff"
```

---

## 创建自定义代理

在 `~/.pi/agent/agents/` 下创建 `.md` 文件，YAML frontmatter + Markdown 正文：

```yaml
---
name: my-custom-agent
description: 自定义代理的用途描述
tools: read, grep, find, ls, bash
model: deepseek-v4-flash
thinking: high
fallbackModels: openai/gpt-5-mini
systemPromptMode: replace
inheritProjectContext: false
inheritSkills: false
skills: safe-bash, skill-deps
defaultContext: fresh
---

在这里编写代理的系统提示词，定义其行为规则和工作方式。
```

### 关键字段说明

| 字段 | 说明 |
|------|------|
| `name` | 代理名，命令和工具调用中使用 |
| `description` | 简短描述，帮助 AI 选择正确的代理 |
| `tools` | 工具白名单，逗号分隔。省略则继承全部内置工具。`mcp:xxx` 可直连 MCP 工具 |
| `model` | 默认模型；省略则继承 pi 当前默认 |
| `fallbackModels` | 主模型失效时的备用模型列表 |
| `thinking` | 思考强度：`low`、`medium`、`high` |
| `systemPromptMode` | `replace`（仅系统提示词）或 `append`（附加到 pi 基础提示词后） |
| `inheritProjectContext` | 是否继承项目 `AGENTS.md` 等指令文件 |
| `inheritSkills` | 是否继承 pi 发现的 skills 目录 |
| `skills` | 直接注入指定 skill，逗号分隔 |
| `defaultContext` | `fresh` 或 `fork` |
| `defaultReads` | 运行前默认读取的文件 |
| `completionGuard` | 设为 `false` 可禁用非实现代理的完成守卫 |

### 文件位置（优先级从低到高）

| 优先级 | 位置 |
|--------|------|
| 最低 | 内置（系统自带） |
| | npm 包（`package.json` 中的 `pi-subagents.agents`） |
| | 用户级 `~/.pi/agent/agents/**/*.md` |
| 最高 | 项目级 `.pi/agents/**/*.md` |

同名代理按优先级覆盖。可设 `disabled: true` 禁用某个内置代理。

---

## 模型覆盖

### 单次覆盖

```bash
/run reviewer[model=anthropic/claude-sonnet-4] "review this"
```

### 持久覆盖

在 `settings.json` 中配置：

```json
{
  "subagents": {
    "agentOverrides": {
      "reviewer": {
        "model": "anthropic/claude-sonnet-4",
        "thinking": "high",
        "fallbackModels": ["openai/gpt-5-mini"],
        "inheritProjectContext": false
      }
    }
  }
}
```

用户级覆盖写 `~/.pi/agent/settings.json`，项目级写 `.pi/settings.json`。

---

## Skills 注入

为子代理注入特定 skill 以获取专业知识：

```bash
/run worker[skills=safe-bash+skill-deps] "install dependencies"
/run worker[skills=false] "do simple work"
```

---

## 验收关口（Acceptance Gates）

设置验收等级确保工作质量：

```json
{
  "agent": "worker",
  "task": "Implement the fix",
  "acceptance": {
    "level": "verified",
    "criteria": ["修复 bug 而不扩大影响范围"],
    "verify": [{ "id": "tests", "command": "npm test", "timeoutMs": 120000 }]
  }
}
```

等级：`auto`（默认）→ `none` → `attested` → `checked` → `verified` → `reviewed`。

---

## 工作树隔离（Worktree）

并行任务可能冲突时使用 git worktree 隔离：

```bash
/parallel w1 "implement auth" -> w2 "implement API" --worktree
```

每个子代理获得独立的 git worktree，避免文件冲突。要求仓库干净状态。

---

## 诊断

```bash
/subagents-doctor
```

检查代理发现、异步路径和 intercom 桥接是否正常。

---

*完整文档参考 `pi-subagents` 包的 README。*
