---
name: env-info
description: >
  开发环境配置参考：工具路径、版本、包管理器偏好。
  核心规则：pnpm 优于 npm/yarn，uv 优于 pip，本地/虚拟环境优于全局。
  Use when user mentions "environment", "which tool", "path", "version", "install",
  "pip install", "npm install", "装个包", "加个依赖", "add package", "-g", or what's available.
---

# Env Info

## 规则

- **pnpm** 优于 npm/yarn，**uv** 优于 pip
- 优先本地：Python 用 `.venv` / `uv venv`；Node.js 用项目 `node_modules` + `pnpx`，不用 `-g`
- 替换：`npm install` → `pnpm install`，`pip install` → `uv add`，`python -m venv` → `uv venv`

## 工具

| 工具 | 版本 | 路径 |
|------|------|------|
| OS | Windows 11 (MINGW64) | — |
| Shell | Git Bash 5.2.37 / pwsh 7.5.5 | — |
| Node.js | v22.22.3 | `D:\dev-env\lib\nvm\nodejs` |
| pnpm | 10.34.3 | `D:\dev-env\lib\pnpm-store` |
| Python | 3.13.9 | `D:\dev-env\lib\python\Python313` |
| uv | 0.9.9 | `D:\dev-env\lib\python\Python313\Scripts\uv.exe` |
| JDK | 17.0.13 (Dragonwell) | `JAVA_HOME` ✅ |
| Maven | 3.9.8 | `D:\dev-env\lib\sdkman\candidates\maven\current` |
| Git | 2.47.0 | PATH ✅ |
| ripgrep | 15.1.0 | `D:\dev-env\lib\ai-tool\ripgrep` |
| fd | 10.4.2 | `~/.pi/agent/bin/fd.exe` |
| VS Code | 1.97.2 | `D:\dev-env\Microsoft VS Code\bin\code` |

## 注意

- 用 `python` 不是 `python3`
- 所有工具在 PATH 中，直接用命令名
- `D:\dev-env\lib\` 放工具，`D:\dev-env\lib\sdkman\` 放 Java 工具链
- Go / Rust / Docker 未安装
