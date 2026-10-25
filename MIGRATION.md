# Pi 升级迁移指南（0.84.2 → 1.4.0）

> **自包含**：本文只依赖「本仓库里的配置文件」和「系统命令」，不引用任何本地归档、模板目录或辅助脚本。照着命令逐条执行即可完成迁移与验收。
>
> 仓库内可直接使用的文件：`agent/settings.json`、`agent/loadout.json`、`agent/loadout-profiles.json`、`agent/extensions/herdr-agent-state.ts`、`agent/keybindings.json`、`agent/AGENTS.md`。
> 必须在目标机器上现场生成的：`agent/auth.json`（`/login`）、`agent/mcp.json`（含 token）、`agent/models.json`（自定义 provider，可选）。
>
> 目标机器：Linux / macOS，已装 Node.js ≥ 22.19、npm、pnpm。最后更新：2026-10-24。
>
> **Windows 差异**（本仓库的 Windows 分支）：另需在 `settings.json` 保留 `shellPath`（指向 `bash.exe`）；skills 挂载用 junction（`mklink /J`）代替 `ln -s`；`pnpm add -g` 按 AGENTS.md 约定改为项目本地安装。
>
> **Debian VM 差异**（本仓库的 `local-vm-dev-deb` 分支）：`defaultProvider` 用 `apikey-dpsk`（本机 models.json 里的中转站 provider），**不设 `shellPath`**（Linux 直接用 `/bin/bash`）；skills 用 `ln -s` 绝对路径挂载，源库搬家后必须重建；`pnpm add -g` 可正常使用全局安装。本分支不保留 `lastChangelogVersion`（属运行时状态，交给 pi 自行写入）。

---

## 0. 一页速览（迁移后的目标状态）

| 项 | 取值 |
|---|---|
| pi | `1.4.0`（pnpm 全局安装） |
| 扩展 | 10 个，全部钉死版本 |
| MCP | **内置 MCP**（`builtin:mcp`），配置文件 `~/.pi/agent/mcp.json` |
| 工具面 | 22 个实际声明（白名单 23 项，见 §6 坑 8） |
| 视觉 | 用模型自带的图像输入，不装视觉代理插件 |
| skills | `~/.agents/skills/*` 软链到 skills 源库 `.../agent-skills/skills/*` |
| 默认模型 | `apikey-dpsk` / `deepseek-flash`，thinking `high` |
| TUI | `tuiMode: "regular"`（旧版滚动方式，非 1.0 起的全屏） |

---

## 1. 前置条件

```bash
node -v          # ≥ 22.19
pnpm -v          # 任一版本；没有 pnpm 就用 npm（命令见 2.1）
git -C ~/.pi status --short   # 工作区应为干净，便于回滚
```

配置目录默认 `~/.pi/agent/`，可用环境变量 `PI_CODING_AGENT_DIR` 覆盖。

---

## 2. 迁移步骤

### 2.1 安装 pi 1.4.0

```bash
pnpm add -g @earendil-works/pi-coding-agent@1.4.0
# 没有 pnpm 时：npm i -g @earendil-works/pi-coding-agent@1.4.0
pi --version     # 必须输出 1.4.0
```

### 2.2 部署配置文件

只迁**配置**，不迁 `auth.json` / `sessions/` / `npm/`（与机器、账号绑定）：

```bash
mkdir -p ~/.pi/agent
cd ~/.pi                                    # 若尚无仓库：git clone <my-dot-pi> ~/.pi
cp agent/settings.json agent/loadout.json agent/loadout-profiles.json \
   agent/keybindings.json agent/AGENTS.md ~/.pi/agent/ 2>/dev/null || true
```

`settings.json` 关键内容（完整值见仓库同文件）：

```json
{
  "theme": "dark",
  "tuiMode": "regular",
  "defaultProvider": "apikey-dpsk",
  "defaultModel": "deepseek-flash",
  "defaultThinkingLevel": "high",
  "packages": [
    "npm:pi-loadout@0.0.37",
    "npm:pi-cache-optimizer@2.10.4",
    "npm:@juicesharp/rpiv-todo@2.15.0",
    "npm:@narumitw/pi-btw@0.62.0",
    "npm:@narumitw/pi-goal@0.54.13",
    "npm:@narumitw/pi-plan-mode@0.59.4",
    "npm:@narumitw/pi-statusline@0.50.2",
    "npm:@narumitw/pi-subagents@3.3.0",
    "npm:pi-simplify@0.2.3",
    "npm:pi-web-access@0.44.0"
  ]
}
```

要点：

- **不要加 `"extensions": ["-builtin:mcp"]`** —— 那是旧方案（配 `pi-mcp-adapter`）才需要的。
- `auth.json` 由 `pi` 内 `/login` 生成，**不要拷贝**；`defaultProvider` / `defaultModel` 按目标机器实际情况改。
- 自定义 provider（中转站等）写在 `agent/models.json`，无需密钥（密钥在 `auth.json`）。

### 2.3 扩展安装（自动，无需手工）

`packages` 里写完钉版本后，**pi 首次启动会自动安装**到 `~/.pi/agent/npm/node_modules`（约 190MB）。用一次性会话触发：

```bash
pi --mode json -p "Reply with exactly: OK" >/dev/null
pi list          # 应列出 10 个包及其路径
```

> 若 `~/.npmrc` 指向镜像（如 `registry.npmmirror.com`）而官方刚发版，会装不上（`notarget`）。临时切官方源再触发一次：
> ```bash
> npm_config_registry=https://registry.npmjs.org pi --mode json -p ok
> ```

### 2.4 内置 MCP（不用插件）

`~/.pi/agent/mcp.json`（**不入库**，含明文 token）：

```json
{
  "mcpServers": {
    "siyuan": {
      "url": "https://<your-host>/mcp",
      "headers": { "Authorization": "Bearer <TOKEN>" }
    }
  }
}
```

要点：

- 内置 MCP 只读两个位置：`~/.pi/agent/mcp.json`（用户级）、`.pi/mcp.json`（项目级，需信任该项目）。
- 默认 `exposure: "codemode"`：工具不直接声明给模型，通过 `codemode` 脚本或 `tool_search` 调用。
- **`loadout.json` 白名单里必须有 `codemode`**（本仓库已含），否则 MCP 工具不可达。
- 不要写 `directTools`（适配器专用键，内置 MCP 会忽略并告警）。

验证：`pi mcp list` → `siyuan: connected, 31 tools (codemode, global)`

### 2.5 skills 源库挂载

skills 本体在独立仓库（如 `.../agent-skills/skills`），通过软链给 pi 用：

```bash
mkdir -p ~/.agents/skills
for d in /path/to/agent-skills/skills/*/; do
  ln -sfn "${d%/}" ~/.agents/skills/"$(basename "$d")"
done
find -L ~/.agents/skills -name SKILL.md | wc -l    # 本机 36
```

> 软链写的是**绝对路径**，源库搬家后必须重建，否则 pi 扫不到技能。`~/.pi/agent/skills/` 保持为空，不要往里放东西。

### 2.6 插件加载顺序（必须照抄）

pi 按 `settings.json` 中 `packages` 数组顺序解析并加载扩展，扩展注册的 hook 也按该顺序串链。固定两条约束：

| 位置 | 包 | 原因 |
|---|---|---|
| 1 | `pi-loadout` | 必须最先注册，`session_start` 里第一时间收窄活动工具集 |
| 2 | `pi-cache-optimizer` | 要在工具集确定之后再改写系统提示（技能列表压缩、段序稳定），否则缓存前缀与实发内容不一致 |

其余包顺序无所谓。两者诉求相反：loadout 要**抢先**（决定哪些工具进上下文），cache-optimizer 要**殿后**（基于最终工具集算缓存前缀）。若将来发现 cache-optimizer 必须最后执行，可移到数组末位，但**绝不能放在 loadout 之前**。

顺序错的表现：每轮 cache miss、`/loadout status` 与系统提示的工具列表不一致、已关闭的工具仍被调用、启动时工具重名告警。

---

## 3. 自检清单（全部命令可独立执行）

### 3.1 结构与版本

```bash
pi --version                                        # 1.4.0
pi list | wc -l                                     # 10（10 个扩展）
node -e 'const p=require(process.env.HOME+"/.pi/agent/settings.json").packages;
  if(!/pi-loadout@/.test(p[0])||!/pi-cache-optimizer@/.test(p[1])){console.error("顺序不对");process.exit(1)}
  console.log("加载顺序正确", p.length+" 个包")'
node -e 'const l=require(process.env.HOME+"/.pi/agent/loadout.json");
  console.log("白名单工具", l.enabledTools.length, "技能", l.enabledSkills.length)'   # 23 / 30
```

### 3.2 工具面（应 22 个声明）

```bash
pi --mode json -p "ok" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
  const m=s.split("\n").map(x=>{try{return JSON.parse(x)}catch{return null}}).filter(Boolean)
          .find(o=>o.message&&o.message.toolsAdded);
  console.log(m?m.message.toolsAdded.length:0)})'
```

期望值 `22`，且包含：

```
bash codemode edit find goal_blocked goal_complete goal_wait grep ls read
subagent_spawn subagent_wait subagent_send subagent_inspect subagent_cancel
todo tool_search write web_search source_check fetch_content get_search_content
```

> 别用 `grep -o '"toolsAdded":\[[^]]*\]'` 数工具——工具对象内部含数组，正则会提前截断。

### 3.3 交互式验收

| 检查 | 做法 |
|---|---|
| MCP 可用 | 让模型用 `codemode` 调 `mcp__siyuan__notebook`（`action: list`），应返回笔记列表 |
| loadout 生效 | `/loadout status` 看工具/技能列表 |
| 技能可见 | `/skill` 补全里能看到 tdd、code-review、docx 等 |
| 缓存 | `/session` 看 cache warming 决策与统计 |
| 状态栏 | 底部状态栏（pi-statusline）正常渲染 |
| 子代理 | `subagent_spawn`（task 写「只回复 PONG」）→ `subagent_wait`，应得 `completed` + `PONG` |
| MCP 暴露 | `/mcp` 看 siyuan 为 `codemode`；要临时直连：`/loadout mode direct mcp__siyuan__xxx` |

---

## 4. 回滚

配置回滚（仓库有历史，最省事）：

```bash
git -C ~/.pi log --oneline -5           # 找到升级前的提交
git -C ~/.pi checkout <commit> -- agent/   # 只回滚配置
```

pi 本体回滚：

```bash
pnpm add -g @earendil-works/pi-coding-agent@0.84.2
rm -rf ~/.pi/agent/npm/node_modules      # 让扩展按旧配置重装
pi --version
```

升级前建议留一份快照（自行选择存放位置，**不要放进共享/多用户目录**）：

```bash
tar czf ~/pi-config-$(date +%Y%m%d).tgz -C ~/.pi agent \
  --exclude=agent/npm --exclude=agent/sessions --exclude=agent/bin
```

---

## 5. 版本选择依据

| 包 | 钉住版本 | 为什么不是最新 |
|---|---|---|
| `@narumitw/pi-subagents` | **3.3.0** | v3「有界 job」模型：`spawn/inspect/cancel/wait/send`。不再有阻塞 `subagent`、`consult`、`manage`、`mailbox`、panel/chain/workflow（编排改为自己 spawn×N + wait）。**loadout 白名单必须同时含 `subagent_spawn` 与 `subagent_wait`**，否则工具被静默禁用 |
| `@juicesharp/rpiv-todo` | **2.15.0** | npmmirror 只到 2.14.2，装 2.15.0 需临时用官方源（见 §6 坑 6） |
| `pi-multimodal-proxy` | **不装** | 主模型自带图像输入；出图用 1.0+ `codemode` 的 `models.generateImages()` |
| `pi-mcp-adapter` | **不装** | 与内置 MCP 重复（会顶掉 `builtin:mcp`），本机只 1 个 HTTP 服务器，内置够用 |
| 其余 | 钉版本 | 已在 1.4.0 实测加载无告警 |

升级策略：**先钉住，再逐个验证**。`pi update --extensions` 会按 `^` 语义漂到大版本，所以要么保持钉死，要么升级后立刻跑第 3 节自检。

---

## 6. 已知坑

1. **pi-subagents 3.x 工具面**：只有 `subagent_spawn / inspect / cancel / wait / send` 五个。阻塞语义 = spawn 后立刻 wait；只读咨询 = spawn 时把 `tools` 限成 `read/grep/find/ls`（默认值）。升级时务必同步 loadout 白名单。
2. **loadout 会静默过滤工具**：白名单里没有的工具即使扩展注册了也不会启用，表现为「插件装了但模型看不见工具」。换 subagents 大版本或删插件后必须同步白名单。
3. **pi 1.0 起 TUI 默认全屏**：本方案显式设 `"tuiMode": "regular"` 保持旧滚动。键位也随之变化：Home/End 是编辑器行首/行尾，全屏模式才用 Ctrl+Home / Ctrl+End。
4. **NFS 上的文件可能「显示 777 但读不了」**：从 tarball 解出的文件在 NFS 导出上会权限错乱，`chmod -R a+rX <dir>` 可修复。反过来，某些 NFS 导出**忽略 chmod**（设 600 后 `stat` 仍显示 777）——这类目录不能存放含 token 的备份。
5. **token 泄露面**：`mcp.json` 含明文 token；`pi mcp list` 不打印它，但 `cat` / 调试脚本会。换机时用模板重填，别整目录直接分发。
6. **npm 镜像滞后**：`~/.npmrc` 指向 npmmirror 时，官方刚发布的版本会 `notarget`。用 `npm_config_registry=https://registry.npmjs.org` 临时切换安装，装好后本地版本满足钉版本，后续启动不会重装。
7. **配置目录不要整包复制**：`auth.json`、`sessions/`、`npm/`、`bin/` 都与机器/账号绑定，只迁 §2.2 列出的文件。
8. **白名单 23 项 ≠ 声明 22 个工具**：`web_enable` 确实由 pi-web-access 注册（面板里能看到），但当前模型走 eager 路径——`session_start` 里插件把四个 web 工具设为直接可用并**摘掉 loader**，且执行顺序是 `loadout.session_start → pi-web-access.session_start`，后者覆盖前者。判断正常与否看 `toolsAdded` 是否 22 个且四个 web 工具齐全；想让它真正接管，把 `~/.pi/agent/web-search.json` 设成 `"toolExposure": "deferred"`。**不要因为「23 项只激活 22 个」去删白名单条目。**

---

## 7. 0.84.2 → 1.4.0 关键变化（为什么值得升）

| 变化 | 影响 |
|---|---|
| 内置 MCP（`builtin:mcp`） | 不再需要 `pi-mcp-adapter`；MCP 工具默认经 `codemode` 暴露，不占上下文 |
| `codemode` | 用 JS 脚本批量调工具、过滤大输出、调分类器与生图模型 |
| `tool_search` | 检索未声明的工具，避免一次性把全部工具塞进上下文 |
| 内置 prompt cache warming | 减少首轮缓存未命中 |
| 会话中系统提示与工具变更保缓存 | 切换 loadout / 加载技能不再整段失效 |
| `tuiMode` | 新增配置项，可保留旧的滚动视图 |
| 中文渲染与压缩摘要修复 | 长会话中文显示与压缩质量提升 |
