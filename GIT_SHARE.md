# GIT_SHARE — 配置仓库提交守则

> 本文档只针对 `~/.pi`（my-dot-pi）这一个仓库：提交思路、硬性要求与检查流程。
> 每次动手 `git add` 之前先过一遍第 3 节的检查清单。
> 技能仓库（`~/.agents/skills` 软链的源库）是独立项目，提交规范另行维护，不在本文范围内。

---

## 1. 仓库结构与分支策略

| 仓库 | 路径 | 远程 |
|---|---|---|
| my-dot-pi | `~/.pi`（`project-space/my-dot-pi` 是指向它的软链，方便从 NAS 侧查看） | `github.com/cadecode/my-dot-pi` |

分支约定：

```
main              纯远程镜像，只做 fetch / fast-forward，不在上面提交
local-<主机名>     本机工作分支，如 local-linux；提交都落在这里
```

- `main` 设置上游 `origin/main`，只用于对比落后/领先。
- 工作分支首次推送用 `git push -u origin local-<主机名>` 建立跟踪，之后 `git status` 直接显示领先/落后条数；**推送前确认目标是工作分支，不要 `push origin main`**。
- 需要在多台机器并行开发时，各自用 `local-<主机名>`，互不冲突。
- 合并到 `main` 走 PR 或人工确认后 fast-forward，不直接推 `main`。

---

## 2. 四条硬性原则

### ① 版本与依赖必须三方一致
`agent/settings.json` 的 `packages`、`agent/npm/package.json` 的 `dependencies`、`agent/npm/package-lock.json` 的根依赖，三者的**包名集合与版本号必须完全相等**。

- 插件版本用精确锁定（`"pi-loadout": "0.0.37"`），不用 `^` / `~`。
- `packages` 数组顺序有语义：`pi-loadout` 必须第 1（最早注册、收窄工具集），`pi-cache-optimizer` 第 2（改写系统提示），其余无所谓。
- 升级插件后必须 `npm install` 更新 lock，不能只改声明。

### ② 密钥与凭证绝不入库
**永远不跟踪**（已在 `.gitignore` 中，不要改动）：

```
agent/auth.json                 各 provider 的 API Key / OAuth 凭证
agent/models-store.json         运行时状态（含凭证）
agent/models.json               本机 provider 与模型元数据（含第三方中转站地址、价格）
agent/mcp.json / mcp-cache.json MCP 服务器列表（含 Bearer token）
agent/trust.json                信任路径
web-search.json                 搜索 API Key
.git-credentials                HTTPS 凭证明文（在 $HOME，不在任何仓库内）
```

判定标准：**只要含「本机专属的账号/端点/额度信息」，即使没有字面量 key，也不入库。** `models.json` 曾因「不含密钥」被放进去，事后撤回 —— 属误判。

### ③ 临时文件、无用文件不入库
`*.tmp`、`*.log`、`bin/`（二进制）、`node_modules/`、`sessions/`、`pi-cache-optimizer-stats.d/`、`.DS_Store` 等一律忽略。

### ④ 已忽略的文件不得随意入库，`.gitignore` 只收紧不放松
- 已跟踪文件里出现被忽略路径 = **违规**，必须处理（`git rm --cached` + 保留本地文件）。
- `.gitignore` 的规则**不得随意删除**。删一条（如 `multimodal-proxy.json`）就可能让重装插件后生成的敏感配置进入跟踪范围。
- 新增忽略规则要有理由（隐私数据、临时产物），改完用第 3 节命令验证规则集合。
- 调整注释、分组、顺序可以，但**规则集合的语义不能变**。

---

## 3. 提交前检查清单

```bash
cd ~/.pi

# ④ 已跟踪文件里有没有被忽略的（必须为空）
git ls-files | while read -r f; do git check-ignore -q "$f" && echo "违规: $f"; done

# ③ 已跟踪文件里有没有临时/无用文件（必须为空）
git ls-files | grep -Ei '\.(tmp|log|bak|swp)$|(^|/)node_modules/|(^|/)\.DS_Store'

# ② 密钥扫描：待推提交的新增行 + 全树
git diff origin/main..HEAD | grep -E '^\+' | grep -Ei \
  'ghp_[A-Za-z0-9]{20,}|github_pat_|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|BEGIN [A-Z ]*PRIVATE KEY|Bearer [A-Za-z0-9._-]{20,}'
git grep -IE 'ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|Bearer [A-Za-z0-9._-]{20,}' HEAD -- .

# ② 敏感文件是否仍未跟踪
git ls-files | grep -E 'auth\.json|models(-store)?\.json|mcp(-cache)?\.json|trust\.json|web-search\.json|\.git-credentials'

# ① 三方版本一致性
#（settings.json ↔ package.json ↔ lock，见 scripts 或手工核对）

# ④ ignore 规则集合是否只增不减
git diff origin/local-<host> -- agent/.gitignore | grep -E '^-' | grep -v '^---'
```

全部通过才允许 `git add`。

---

## 4. 提交粒度与消息规范

- **一个提交只做一件事**：依赖升级 / loadout 调整 / 文档与 ignore 分开。
- 消息用 Angular Conventional Commits：`type(scope): subject`，type 取 `feat|fix|docs|chore|refactor|test`。
- 标题 ≤ 50 字，中文可以；正文用 `-` 列要点，说明**为什么**改，不只是改了什么。
- 引用版本升级时写清 `旧 → 新`。
- 不要在一串「先加后删」的操作后留两个互相抵消的提交（如 `f88ff03` 移除 `web_enable` + `15e5785` 恢复），要么压掉，要么合成一个。

示例：

```
chore(deps): 升级至 pi 1.4.0，移除 mcp-adapter 与 multimodal-proxy

- 8 个插件升级，pi-subagents 2.0.1 → 3.3.0（跨大版本）
- 移除 pi-mcp-adapter：pi 0.99 起内置 MCP，适配器会关掉 builtin:mcp 造成双重管理
- package-lock 重算：218 → 381 个包
```

---

## 5. Review 流程（本仓库的特殊要求）

1. **先列清单，再一条条过**：一次只抛一条改动（一个提交或一个文件），等对方给结论（保留 / 修改 / 撤销）再继续，不要一口气倒出来。
2. **未推送的改动不要擅自提交**：宁可留在工作区等 review。用户说「待我 review」时，任何 commit 都是违规。
3. **回退用 `git reset --soft` / `--mixed`**，保住工作区改动；确认彻底丢弃才用 `--hard`。
4. **发现历史里混进了不该有的文件**（如 `models.json`），趁未推送重写历史：
   ```bash
   git reset --soft <已推送点>     # 改动全部回工作区/索引
   git reset                       # 取消暂存，逐个重新组成干净提交
   git rev-list --all --objects | grep '不该有的文件'   # 验证彻底消失
   ```
5. **提交前确认没有别的会话在并发操作同一仓库**（`ps -eo pid,etime,cmd | grep pi`）。本仓库出现过「回退 44 秒后被另一个会话 `git add -A && commit`」的事故，表现为「改动凭空变成提交」。

---

## 6. 网络与凭证

- `github.com` 的 DNS 会解析到被封 IP（`20.205.243.166`），表现为 `git push` 卡死/超时。已在 `/etc/hosts` 固定可用入口：
  ```
  140.82.112.3 github.com
  ```
  失效时删掉该行即可回退；可用 IP 备选：`140.82.112.3`、`20.201.28.151`、`20.26.156.215`、`4.237.22.38`。
- 备选通道：`ssh.github.com:443` 可达（TCP 通、SSH 握手正常），需要账号绑定 SSH key 才能用。
- HTTPS 凭证存在 `~/.git-credentials`（`credential.helper=store`，权限 600）。**不要在 remote URL 里内联 token**，不要在仓库 `.git/config` 里出现 token。
- PAT 曾以明文形式出现在会话记录里 → 用完应 rotate；会话文件（`agent/sessions/*.jsonl`）已被忽略，但导出/分享前仍需检查。
- **push 卡死或 `GnuTLS recv error (-110)` / `port 443 could not connect`**：`fetch` 正常而 `push` 超时，多半是 HTTP/2 在本机链路上被中断。先加 `-c http.version=HTTP/1.1` 重试：
  ```bash
  git -c http.version=HTTP/1.1 push --force-with-lease origin local-<host>
  ```
  实测（2026-10-24）`ls-remote` 能通、默认 push 卡 134s，加该参数后 1 秒完成。
- 中国大陆镜像：`ghfast.top` / `gh-proxy.com` 只代理 fetch/clone，**不支持 push**。

---

## 7. 事故记录（都踩过）

| 事故 | 根因 | 教训 |
|---|---|---|
| 5 个会话文件副本凭空消失 | 命令开头带 `rm -rf` 又被中断 | 破坏性命令与下载分开执行 |
| `models.json` 被提交进仓库 | 只按「有没有字面量 key」判断，忽略「本机专属配置」 | 判定标准见原则② |
| `mcp.json.example` 泄漏内网域名 | 提供「模板」时用了真实地址 | 模板里不写真实主机名，或干脆不提供模板 |
| 回退后 44 秒又出现新提交 | 另一个 pi 会话并发 `git add -A` | review 前检查进程；重要操作前确认独占 |
| `.gitignore` 删掉 `multimodal-proxy.json` | 认为「插件已卸载所以规则无用」 | 规则只增不减，卸载的插件也可能被重装 |
| `git push` 卡 134 秒失败 | DNS 指向被封 IP | 固定 `/etc/hosts` 入口，或走 SSH 443 |

---

## 8. 常用片段

```bash
# 看净效果（已推送点 → 工作区，含未提交）
git diff --stat origin/local-$(hostname | tr 'A-Z' 'a-z') 

# 逐提交文件清单
for c in $(git rev-list --reverse origin/main..HEAD); do
  echo "== $(git log -1 --format='%h %s' $c)"; git show --name-status --format='' $c
done

# 某文件在全部历史里是否存在（找泄漏）
git rev-list --all --objects | grep 'agent/models.json$'

# 从索引移除但保留本地文件
git rm --cached agent/models.json && echo 'models.json' >> agent/.gitignore
```
