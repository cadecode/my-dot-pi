---
name: browser-tools
description: Interactive browser automation via Chrome DevTools Protocol. Use when you need to interact with web pages, test frontends, or when user interaction with a visible browser is required.
---

# Browser Tools

Chrome DevTools Protocol tools for agent-assisted web automation. These tools connect to Edge (or Chrome) running on `:9222` with remote debugging enabled.

## Dependencies

遵循 skill-deps 规范安装。当前已全部就绪。

### 环境路径

| 路径 | 用途 |
|------|------|
| `<skill-dir>/node_modules` | Node 包（pnpm） |
| `<skill-dir>/pnpm-lock.yaml` | 锁定版本 |

### Node (pnpm) — 核心

| 包 | 用途 | 验证命令 |
|----|------|---------|
| `puppeteer` | 浏览器自动化（CDP） | `node -e "import('puppeteer').then(()=>console.log('OK'))"` |
| `puppeteer-core` | CDP 核心库 | `node -e "import('puppeteer-core').then(()=>console.log('OK'))"` |
| `puppeteer-extra` | Puppeteer 插件扩展 | `node -e "import('puppeteer-extra').then(()=>console.log('OK'))"` |
| `puppeteer-extra-plugin-stealth` | 反检测隐身插件 | `node -e "import('puppeteer-extra-plugin-stealth').then(()=>console.log('OK'))"` |
| `@mozilla/readability` | 提取页面可读内容 | `node -e "import('@mozilla/readability').then(()=>console.log('OK'))"` |
| `turndown` | HTML→Markdown 转换 | `node -e "import('turndown').then(()=>console.log('OK'))"` |
| `turndown-plugin-gfm` | GFM Markdown 支持 | `node -e "import('turndown-plugin-gfm').then(()=>console.log('OK'))"` |
| `cheerio` | 服务端 DOM 操作 | `node -e "import('cheerio').then(()=>console.log('OK'))"` |
| `jsdom` | DOM 环境模拟 | `node -e "import('jsdom').then(()=>console.log('OK'))"` |

> Node 依赖使用 pnpm 本地安装，安装时设置 `PUPPETEER_SKIP_DOWNLOAD=true` 跳过 Chromium 下载（连接已有浏览器实例）。

> Profile 数据目录：`%USERPROFILE%\.cache\browser-tools`（自动创建）

## Setup

Run once before first use:

```bash
cd {baseDir}/browser-tools
pnpm install
```

> 如果跳过 Chromium 下载：`PUPPETEER_SKIP_DOWNLOAD=true pnpm install`（browser-tools 连接已有浏览器，不需要内置 Chromium）

## Start Browser

```bash
{baseDir}/browser-start.js                          # Fresh profile, no URL
{baseDir}/browser-start.js --profile                # Copy user's profile (cookies, logins)
{baseDir}/browser-start.js https://example.com      # Start and open URL
{baseDir}/browser-start.js --profile --help         # Show help
```

Launch Edge with remote debugging on `:9222`. Auto-detects Edge at:
- `%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe`
- `%ProgramFiles%\Microsoft\Edge\Application\msedge.exe`
- PATH 中的 `msedge.exe`

Fallback to Chrome if Edge not found. Override with `EDGE_PATH` environment variable.

### `--profile` 首次拷贝行为

- **第一次**使用 `--profile` 时：从 `%LOCALAPPDATA%\Microsoft\Edge\User Data` 拷贝 profile 到 `%USERPROFILE%\.cache\browser-tools`
  - 自动跳过运行时锁定的目录（`Sessions/`, `Cache/`, `Current Session`, `Singleton*` 等）
  - 跳过缓存/日志等不必要文件（`*.log`, `*.tmp`, `Crashpad/`, `VideoDecodeStats/` 等）
  - 拷贝完成后写入 `.initialized` 标记文件
- **后续**调用 `--profile` 时：检测到标记文件，跳过拷贝直接使用
- **不使用** `--profile` 时：使用空 profile 目录，不拷贝

### 多开复用

如果 Edge 已在 `:9222` 上运行，`browser-start.js` 不会重复启动，而是连接已有实例并打开一个新标签页。可同时指定 URL：`browser-start.js --profile https://example.com` 会在已有浏览器中打开该 URL。

## Stop Browser

```bash
{baseDir}/browser-stop.js                    # Close agent tabs, keep browser alive
{baseDir}/browser-stop.js --all              # Close ALL tabs (browser auto-exits)
{baseDir}/browser-stop.js --match baidu      # Close tabs with "baidu" in URL
```

安全关闭 agent 打开的标签页。**不会杀掉 Edge 进程**，因此用户自己的 Edge 窗口不受影响。

- 默认模式：保留最后一个标签页，浏览器进程保持运行
- `--all` 模式：关闭所有标签页，浏览器自动退出（无标签页时）
- `--match <text>` 模式：只关闭 URL 中包含指定文本的标签页

## Navigate

```bash
{baseDir}/browser-nav.js https://example.com
{baseDir}/browser-nav.js https://example.com --new
```

Navigate to URLs. Use `--new` flag to open in a new tab instead of reusing current tab.

## Evaluate JavaScript

```bash
{baseDir}/browser-eval.js 'document.title'
{baseDir}/browser-eval.js 'document.querySelectorAll("a").length'
```

Execute JavaScript in the active tab. Code runs in async context. Use this to extract data, inspect page state, or perform DOM operations programmatically.

## Screenshot

```bash
{baseDir}/browser-screenshot.js
```

Capture current viewport and return temporary file path. Use this to visually inspect page state or verify UI changes.

## Pick Elements

```bash
{baseDir}/browser-pick.js "Click the submit button"
```

**IMPORTANT**: Use this tool when the user wants to select specific DOM elements on the page. This launches an interactive picker that lets the user click elements to select them. The user can select multiple elements (Cmd/Ctrl+Click) and press Enter when done. The tool returns CSS selectors for the selected elements.

Common use cases:
- User says "I want to click that button" → Use this tool to let them select it
- User says "extract data from these items" → Use this tool to let them select the elements
- When you need specific selectors but the page structure is complex or ambiguous

## Cookies

```bash
{baseDir}/browser-cookies.js
```

Display all cookies for the current tab including domain, path, httpOnly, and secure flags. Use this to debug authentication issues or inspect session state.

## Extract Page Content

```bash
{baseDir}/browser-content.js https://example.com
```

Navigate to a URL and extract readable content as markdown. Uses Mozilla Readability for article extraction and Turndown for HTML-to-markdown conversion. Works on pages with JavaScript content (waits for page to load).

## When to Use

- Testing frontend code in a real browser
- Interacting with pages that require JavaScript
- When user needs to visually see or interact with a page
- Debugging authentication or session issues
- Scraping dynamic content that requires JS execution

---

## Efficiency Guide

### DOM Inspection Over Screenshots

**Don't** take screenshots to see page state. **Do** parse the DOM directly:

```javascript
// Get page structure
document.body.innerHTML.slice(0, 5000)

// Find interactive elements
Array.from(document.querySelectorAll('button, input, [role="button"]')).map(e => ({
  id: e.id,
  text: e.textContent.trim(),
  class: e.className
}))
```

### Complex Scripts in Single Calls

Wrap everything in an IIFE to run multi-statement code:

```javascript
(function() {
  // Multiple operations
  const data = document.querySelector('#target').textContent;
  const buttons = document.querySelectorAll('button');
  
  // Interactions
  buttons[0].click();
  
  // Return results
  return JSON.stringify({ data, buttonCount: buttons.length });
})()
```

### Batch Interactions

**Don't** make separate calls for each click. **Do** batch them:

```javascript
(function() {
  const actions = ["btn1", "btn2", "btn3"];
  actions.forEach(id => document.getElementById(id).click());
  return "Done";
})()
```

### Typing/Input Sequences

```javascript
(function() {
  const text = "HELLO";
  for (const char of text) {
    document.getElementById("key-" + char).click();
  }
  document.getElementById("submit").click();
  return "Submitted: " + text;
})()
```

### Reading App/Game State

Extract structured state in one call:

```javascript
(function() {
  const state = {
    score: document.querySelector('.score')?.textContent,
    status: document.querySelector('.status')?.className,
    items: Array.from(document.querySelectorAll('.item')).map(el => ({
      text: el.textContent,
      active: el.classList.contains('active')
    }))
  };
  return JSON.stringify(state, null, 2);
})()
```

### Waiting for Updates

If DOM updates after actions, add a small delay with bash:

```bash
sleep 0.5 && {baseDir}/browser-eval.js '...'
```

### Investigate Before Interacting

Always start by understanding the page structure:

```javascript
(function() {
  return {
    title: document.title,
    forms: document.forms.length,
    buttons: document.querySelectorAll('button').length,
    inputs: document.querySelectorAll('input').length,
    mainContent: document.body.innerHTML.slice(0, 3000)
  };
})()
```

Then target specific elements based on what you find.
