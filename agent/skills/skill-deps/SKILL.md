---
name: skill-deps
description: >
  依赖管理规范 — 用于任何 skill 需要安装 Python/Node 依赖或下载工具的场景。
  Python 优先使用 uv（.venv + pyproject.toml），降级使用 venv + pip；Node 使用 pnpm 本地安装。
  HTTP/URL 来源需人工确认。安装完成后在 SKILL.md 中写入 Dependencies 章节固化依赖说明。
  Make sure to use this skill even if the user just mentions "install", "missing package", "setup",
  "dependencies", "venv", "pnpm add", "pip install", "uv add", "No module named", or "package not found".
---

# skill-deps — 依赖管理规范

## 核心原则

1. **隔离安装** — Python 用 uv 或 venv，Node 用 pnpm，不污染全局环境
2. **先检后装** — 检查本地隔离环境 → 检查全局 → 都没有才新装
3. **用户确认** — 列出清单等确认后再装，URL 来源需特别确认
4. **固化说明** — 安装后在 SKILL.md 写入 `## Dependencies`，后续 agent 可直接看到环境状态

## Python 环境选择

`uv` 和 `venv` 完全独立，不混合使用。先检测 `uv --version`，成功走 uv 工作流，失败走 venv 工作流。

| | uv 工作流 | venv 工作流 |
|---|---------|-----------|
| 虚拟环境 | `.venv/` | `venv/` |
| 安装 | `uv add <pkg>` | `venv/Scripts/pip install <pkg>` |
| 初始化 | `uv venv` + `uv init` | `python -m venv venv` |
| 配置文件 | `pyproject.toml` + `uv.lock` | 无 |
| 选择原因 | 快 10-100 倍，锁文件可重现构建 | 兼容性好，不强制装新工具 |

Node 统一用 pnpm：`pnpm add <pkg>`（无 `package.json` 则先 `pnpm init`）

---

## 工作流程

### 1. 收集依赖清单

从 SKILL.md 的 `## Dependencies` 章节读取。uv 环境也可从 `pyproject.toml` 读取。

区分：Python 包 → uv/venv | Node 包 → pnpm | URL 来源 → 强确认 | 系统工具 → 手动指引

### 2. 三级检测

对每个依赖按优先级检查：
- **本地隔离环境**：`.venv` 或 `venv` 中已安装？`node_modules` 中已有？
- **全局环境**：系统 Python 可 import？全局 node 可 require？（仅确认存在时才用，不假设）
- **本地新装**：前两者都没有才装

### 3. 报告并确认

```
检测结果：
  ✅ 本地已安装: pypdf
  ✅ 使用全局:   pdf-lib
  ⚠️ 需要安装:   pdfplumber, reportlab
                  https://... [URL 来源，需确认]
请确认是否安装？
```

用户肯定 → 继续 | 否定 → 停止 | 修改清单 → 按用户说的装 | URL 未明确确认 → 当作否

### 4. 按规范安装

| 类型 | 操作 |
|------|------|
| Python（uv） | `uv venv` + `uv init`（如不存在）→ `uv add <pkg>` |
| Python（venv） | `python -m venv venv`（如不存在）→ `venv/Scripts/pip install <pkg>` |
| Node | `pnpm init`（如无 package.json）→ `pnpm add <pkg>` |
| URL 来源 | 用户确认后执行 |
| 系统工具 | 给出安装指引 |

### 5. 验证

```bash
# Python（uv）
"<skill-dir>/.venv/Scripts/python" -c "import <pkg>; print('OK')"
# Python（venv）
"<skill-dir>/venv/Scripts/python" -c "import <pkg>; print('OK')"
# Node
cd "<skill-dir>" && node -e "require('<pkg>'); console.log('OK')"
```

验证不通过则排查，不跳过。

### 6. 固化依赖说明

安装验证通过后，在 SKILL.md 中写入或更新 `## Dependencies` 章节（位于简介之后、正文之前）。

**模板：**

```markdown
## Dependencies

遵循 skill-deps 规范安装。当前已全部就绪。

### 环境路径

| 路径 | 用途 |
|------|------|
| `<skill-dir>/{.venv|venv}/Scripts/python` | Python 隔离环境解释器 |
| `<skill-dir>/pyproject.toml` | Python 依赖声明（仅 uv） |
| `<skill-dir>/uv.lock` | 锁定版本（仅 uv） |
| `<skill-dir>/node_modules` | Node 包（pnpm） |

### Python — 核心

| 包 | 用途 | 验证命令 |
|----|------|---------|
| `pkg` | 用途 | `python -c "import pkg; print(pkg.__version__)"` |

### Python — 可选

| 包 | 用途 | 验证命令 |
|----|------|---------|
| `pkg` | 特定场景 | `python -c "import pkg; print('OK')"` |

### Node (pnpm) — 核心

| 包 | 用途 | 验证命令 |
|----|------|---------|
| `pkg` | 用途 | `node -e "require('pkg'); console.log('OK')"` |

### 系统工具（手动安装）

| 工具 | 用途 | 安装方式 |
|------|------|---------|
| `tool` | 用途 | 安装指引 |

> Python 依赖使用 {uv / venv + pip} 管理，Node 依赖使用 pnpm 本地安装。
```

规则：
- 每个包附验证命令，后续 agent 可一键确认
- 区分核心（必装）和可选（特定场景）
- 已有 `## Dependencies` 则替换；只补装个别包则只更新对应行

---

## URL 依赖安全

从 URL 下载脚本/二进制、非官方源安装、`curl | bash` 管道安装 — 这些都需要展示 URL 和用途、说明风险、等用户明确确认后才继续。

---

## 常见问题

**已有 venv 环境，后来装了 uv，要迁移吗？**
不自动迁移，避免破坏现有环境。下次新建 skill 时会自动使用 uv。

**少了一个包？** 只补装不重建。uv：`uv add <pkg>`，venv：`venv/Scripts/pip install <pkg>`

**没有 package.json？** `pnpm init` → `pnpm add <pkg>`

**系统级依赖？** 先查 PATH 中是否有命令 → 没有则给安装指引
