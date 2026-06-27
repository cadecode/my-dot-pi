---
name: tavily-search
description: |
  Search the web with LLM-optimized results via the Tavily CLI. Use this skill when the user wants to search the web, find articles, look up information, get recent news, discover sources, or says "search for", "find me", "look up", "what's the latest on", "find articles about", or needs current information from the internet. Returns relevant results with content snippets, relevance scores, and metadata — optimized for LLM consumption. Supports domain filtering, time ranges, and multiple search depths.
allowed-tools: Bash({baseDir}/.venv/Scripts/tvly *)
---

# tavily search

Web search returning LLM-optimized results with content snippets and relevance scores.

## Dependencies

遵循 skill-deps 规范安装。当前已全部就绪。

### 环境路径

| 路径 | 用途 |
|------|------|
| `<skill-dir>/.venv/Scripts/tvly` | Tavily CLI 本地隔离环境 |
| `<skill-dir>/.venv/Scripts/python` | Python 隔离环境解释器 |
| `<skill-dir>/pyproject.toml` | Python 依赖声明（uv） |
| `<skill-dir>/uv.lock` | 锁定版本（uv） |

### Python (uv) — 核心

| 包 | 用途 | 验证命令 |
|----|------|---------|
| `tavily-cli` | Tavily 命令行搜索工具 | `<skill-dir>/.venv/Scripts/python -c "import tavily_cli; print('OK')"` |

> Python 依赖使用 uv 管理。`{baseDir}` 为 skill 根目录路径。

## 首次使用

认证（只需一次）：

```bash
{baseDir}/.venv/Scripts/tvly login --api-key tvly-YOUR_KEY
```

这会将 API Key 存储在 `~/.tavily/config.json` 中，后续调用无需再认证。

## When to use

- You need to find information on any topic
- You don't have a specific URL yet
- First step in the workflow: **search** → extract → map → crawl → research

## Quick start

```bash
# Basic search
{baseDir}/.venv/Scripts/tvly search "your query" --json

# Advanced search with more results
{baseDir}/.venv/Scripts/tvly search "quantum computing" --depth advanced --max-results 10 --json

# Recent news
{baseDir}/.venv/Scripts/tvly search "AI news" --time-range week --topic news --json

# Domain-filtered
{baseDir}/.venv/Scripts/tvly search "SEC filings" --include-domains sec.gov,reuters.com --json

# Include full page content in results
{baseDir}/.venv/Scripts/tvly search "react hooks tutorial" --include-raw-content --max-results 3 --json
```

## Options

| Option | Description |
|--------|-------------|
| `--depth` | `ultra-fast`, `fast`, `basic` (default), `advanced` |
| `--max-results` | Max results, 0-20 (default: 5) |
| `--topic` | `general` (default), `news`, `finance` |
| `--time-range` | `day`, `week`, `month`, `year` |
| `--start-date` | Results after date (YYYY-MM-DD) |
| `--end-date` | Results before date (YYYY-MM-DD) |
| `--include-domains` | Comma-separated domains to include |
| `--exclude-domains` | Comma-separated domains to exclude |
| `--country` | Boost results from country |
| `--include-answer` | Include AI answer (`basic` or `advanced`) |
| `--include-raw-content` | Include full page content (`markdown` or `text`) |
| `--include-images` | Include image results |
| `--include-image-descriptions` | Include AI image descriptions |
| `--chunks-per-source` | Chunks per source (advanced/fast depth only) |
| `-o, --output` | Save output to file |
| `--json` | Structured JSON output |

## Search depth

| Depth | Speed | Relevance | Best for |
|-------|-------|-----------|----------|
| `ultra-fast` | Fastest | Lower | Real-time chat, autocomplete |
| `fast` | Fast | Good | Need chunks, latency matters |
| `basic` | Medium | High | General-purpose (default) |
| `advanced` | Slower | Highest | Precision, specific facts |

## Tips

- **Keep queries under 400 characters** — think search query, not prompt.
- **Break complex queries into sub-queries** for better results.
- **Use `--include-raw-content`** when you need full page text (saves a separate extract call).
- **Use `--include-domains`** to focus on trusted sources.
- **Use `--time-range`** for recent information.
- Read from stdin: `echo "query" | {baseDir}/.venv/Scripts/tvly search - --json`

## See also

- [tavily-extract](../tavily-extract/SKILL.md) — extract content from specific URLs
- [tavily-research](../tavily-research/SKILL.md) — comprehensive multi-source research

> 所有命令中的 `{baseDir}` 需替换为 skill 实际路径：`~/.pi/agent/skills/tavily-search`
