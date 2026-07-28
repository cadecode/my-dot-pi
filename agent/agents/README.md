# 子代理（Subagent）使用指南

## 什么是子代理

子代理是一个独立的 Pi 子进程，有自己单独的上下文窗口和工具集。你可以把任务交给它，等它完成后拿结果回来。

适合的场景：
- 不理解代码 → 让 scout 去侦察
- 大改动前 → 让 planner 出个计划
- 写代码 → 让 worker 去实现
- 审查代码 → 让 reviewer 检查质量

---

## 内置代理

| 名称 | 能干什么 |
|------|---------|
| **scout** | 快速了解代码结构，只读不编辑 |
| **planner** | 制定实现计划，只读不编辑 |
| **reviewer** | 审查 diff 的正确性、测试、边界情况。注意 reviewer 不会自动运行测试，它会建议需要你手动执行的验证命令 |
| **worker** | 执行实现，编写和修改代码文件 |
| **general** | worker 的别名 |

---

## 怎么用

直接对主模型说就行，不需要背格式：

```
用 reviewer 审查一下这个 diff
让 scout 了解认证模块的代码结构
用 worker 实现这个方案，完成后让 reviewer 审查
并行审查：一个看正确性、一个看测试、一个看简洁性
```

也可以明确定义 subagent 工具调用：

```
subagent({ agent: "reviewer", task: "审查这个 diff" })
```

### 同时做多件事情

如果两件事互不依赖，可以并行跑。

```json
{
  "tasks": [
    { "agent": "scout", "task": "找到认证模块的代码" },
    { "agent": "scout", "task": "找到认证模块的测试" }
  ]
}
```

还可以把多个结果合并给一个 reviewer 做综合分析：

```json
{
  "tasks": [
    { "agent": "scout", "task": "找到代码入口" },
    { "agent": "scout", "task": "找到相关测试" }
  ],
  "aggregator": {
    "agent": "reviewer",
    "task": "合并以上发现，输出风险评估。使用 {previous}。"
  }
}
```

### 链式执行（下一步依赖上一步的结果）

```json
{
  "chain": [
    { "agent": "scout", "task": "调研当前实现" },
    { "agent": "planner", "task": "基于调研结果制定方案：{previous}" }
  ]
}
```

### 后台执行（不打断当前工作）

如果任务不需要立刻等结果，可以用 `subagent_spawn` 启动后台 agent。主模型可以继续干别的事，后台任务完成后会自动通知。

后台 agent 适合代码审查、调研等不需要你等的事情。实现类任务如果有并发写操作会被拒绝，避免文件冲突。

已启动的 agent 可以通过管理工具查看和操作：

| 工具 | 用途 |
|------|------|
| `subagent_spawn` | 启动后台 agent，返回 agentId |
| `subagent_send` | 向已有的 agent 发后续任务 |
| `subagent_manage` | 查看、中断或关闭 agent |
| `subagent_mailbox` | 给 agent 发排队消息 |

---

## 让子代理用不同的模型

如果想给某个子代理指定不同的模型（比如让 reviewer 用更强的模型），有两种方式：

### 方式一：写在 agent 定义里

```yaml
---
name: deep-review
description: 用高性能模型做深度审查
model: anthropic/claude-sonnet-4
---
```

### 方式二：调用时指定

```
subagent({ agent: "reviewer", task: "...", model: "anthropic/claude-sonnet-4" })
```

---

## 思考强度（Thinking Level）

模型在回答问题前会进行内部推理。可以根据任务复杂度选择合适的强度：

| 级别 | 适合 |
|------|------|
| off / minimal | 格式转换、提取文字等机械工作 |
| low | 简单的、步骤明确的任务 |
| medium | 普通的多步研究或实现 |
| high / xhigh | 复杂调试、设计评审、跨文件分析 |
| max | 非常困难、对质量要求极高的任务 |

可以在 agent 定义中指定，也可以在调用时传参。

---

## 自定义代理

在 `~/.pi/agent/agents/` 下建一个 `.md` 文件，就能创建自己的代理。

### 一个实际的例子

`~/.pi/agent/agents/api-reviewer.md`：

```yaml
---
name: api-reviewer
description: 审查 API 变更的兼容性和测试覆盖
tools: read, grep, find, ls, bash
---

你是一个 API 审查代理。检查 API 变更是否向后兼容、测试是否覆盖了边界情况。
不要编辑文件。输出 PASS / FAIL / PARTIAL 并附上证据。
```

### 让自定义代理用多模态模型

如果主模型是纯文本的，但自定义的代理需要看图片：

```yaml
---
name: vision
description: 描述图片内容
model: apikey.fun-gpt/gpt-5.6-luna
tools: read
---

用户会把图片路径传给你。描述图片中的文字、图表和 UI 布局。
```

### 关键字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | 是 | 代理名称，调用时用这个 |
| `description` | 是 | 简短说明，告诉主模型什么时候该用它 |
| `tools` | 否 | 允许使用的工具，逗号分隔。不填则用默认工具 |
| `model` | 否 | 指定模型，格式 `provider/model-id`，省略则用当前会话模型 |
| `thinkingLevel` | 否 | 思考强度：off / minimal / low / medium / high / xhigh / max |

### 代理放在哪里

- **全局可用**：放在 `~/.pi/agent/agents/*.md`
- **仅某个项目可用**：放在项目根目录的 `.pi/agents/*.md`，调用时需要指定 `agentScope: "project"` 或 `"both"`
- **覆盖内置代理**：自定义代理和内建代理重名时，自定义的会覆盖内置的

### 使用自定义代理

直接说就行，主模型会根据 agent 的 description 决定是否用它：

```
subagent({ agent: "api-reviewer", task: "审查本次 API 变更" })
```

---

## 管理

在 pi 对话框中输入 `/subagents` 可以打开管理界面，查看当前 agent 配置、切换工作流模式等。

---

## 工作流速查

| 场景 | 做法 |
|------|------|
| 不清楚代码怎么组织的 | scout 侦察，拿到上下文简报再说 |
| 大改动心里没底 | planner 出计划，确认了再动手 |
| 多个独立调研 | 并行跑，各自出结果 |
| 调研完要综合 | parallel + aggregator |
| 实现完了不放心 | reviewer 审查 |
| 后台跑任务不打断 | subagent_spawn |
| 串行任务有依赖 | chain，上一步结果传给下一步 |

---

*完整参考见 `@narumitw/pi-subagents` 官方文档。*
