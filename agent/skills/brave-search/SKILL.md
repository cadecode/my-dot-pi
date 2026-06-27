---
name: brave-search
description: Web search and content extraction via Brave Search API. Use for searching documentation, facts, or any web content. Lightweight, no browser required.
---

# Brave Search

Web search and content extraction using the official Brave Search API. No browser required.

## Dependencies

遵循 skill-deps 规范安装。当前已全部就绪。

### 环境路径

| 路径 | 用途 |
|------|------|
| `<skill-dir>/node_modules` | Node 包（pnpm） |
| `<skill-dir>/package.json` | Node 依赖声明 |

### Node (pnpm) — 核心

| 包 | 用途 | 验证命令 |
|----|------|---------|
| `@mozilla/readability` | 页面内容可读性提取 | `node -e "require('@mozilla/readability'); console.log('OK')"` |
| `jsdom` | 服务端 DOM 解析 | `node -e "require('jsdom'); console.log('OK')"` |
| `turndown` | HTML → Markdown 转换 | `node -e "require('turndown'); console.log('OK')"` |
| `turndown-plugin-gfm` | GitHub 风格 Markdown 支持 | `node -e "require('turndown-plugin-gfm'); console.log('OK')"` |

> Node 依赖使用 pnpm 本地安装。

## Setup

Requires a Brave Search API account with a free subscription. A credit card is required to create the free subscription (you won't be charged).

1. Create an account at https://api-dashboard.search.brave.com/register
2. Create a "Free" subscription (not "Free AI" — "Free AI" 不含 Web Search API）
3. Create an API key for the subscription
4. Create `config.json` in the skill directory:
   ```json
   {
     "braveApiKey": "your-api-key-here"
   }
   ```
5. Install dependencies (run once):
   ```bash
   cd {baseDir}
   pnpm install
   ```

> 也支持 `BRAVE_API_KEY` 环境变量（向后兼容）。

## Search

```bash
{baseDir}/search.js "query"                         # Basic search (5 results)
{baseDir}/search.js "query" -n 10                   # More results (max 20)
{baseDir}/search.js "query" --content               # Include page content as markdown
{baseDir}/search.js "query" --freshness pw          # Results from last week
{baseDir}/search.js "query" --freshness 2024-01-01to2024-06-30  # Date range
{baseDir}/search.js "query" --country DE            # Results from Germany
{baseDir}/search.js "query" -n 3 --content          # Combined options
```

### Options

- `-n <num>` - Number of results (default: 5, max: 20)
- `--content` - Fetch and include page content as markdown
- `--country <code>` - Two-letter country code (default: US)
- `--freshness <period>` - Filter by time:
  - `pd` - Past day (24 hours)
  - `pw` - Past week
  - `pm` - Past month
  - `py` - Past year
  - `YYYY-MM-DDtoYYYY-MM-DD` - Custom date range

## Extract Page Content

```bash
{baseDir}/content.js https://example.com/article
```

Fetches a URL and extracts readable content as markdown.

## Output Format

```
--- Result 1 ---
Title: Page Title
Link: https://example.com/page
Age: 2 days ago
Snippet: Description from search results
Content: (if --content flag used)
  Markdown content extracted from the page...

--- Result 2 ---
...
```

## When to Use

- Searching for documentation or API references
- Looking up facts or current information
- Fetching content from specific URLs
- Any task requiring web search without interactive browsing
