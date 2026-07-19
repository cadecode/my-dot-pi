---
name: skill-vetter
description: Security-first skill vetting for AI agents. Audit skills before installing from any source.
---

# Skill Vetter

Security-first skill vetting for AI agents. Use before installing any skill from ClawHub, GitHub, or other sources. Checks for red flags, permission scope, and suspicious patterns.

## When to Use

Use this skill BEFORE installing any third-party skill. Run the vetting checklist whenever you:
- Are about to install a skill from a marketplace or registry
- Receive code shared by another agent
- Need to evaluate whether a skill is safe to use

## Vetting Checklist

### 1. Full Source Review

Read every file in the skill:
- `SKILL.md` — the main instructions
- Any scripts (`.py`, `.js`, `.sh`, `.bat`, `.ps1`)
- Config files (`.json`, `.yaml`, `.toml`)
- Any other bundled files

### 2. Provenance Check

| Check | What to look for |
|-------|-----------------|
| Author reputation | Known/popular author? How many skills published? |
| Stars/Forks | Community engagement signals |
| Last update | Recently maintained? Abandoned? |
| Version | Mature (≥1.0) or experimental? |

### 3. Red Flag Detection

Flag any of these patterns:

| Red Flag | Examples |
|----------|----------|
| **Network exfiltration** | `curl`/`wget` to external servers without clear purpose |
| **Credential access** | Reading `~/.ssh/`, `AWS_*`, `API_KEY`, `token`, `secret` |
| **Eval/exec** | `eval()`, `exec()`, `os.system()`, `subprocess` without justification |
| **Base64 obfuscation** | Encoded strings, `base64 -d` without clear source |
| **Sudo requests** | `sudo` without clear need |
| **Hidden downloads** | Downloading scripts and running them without review |
| **File modification** | Modifying files outside the skill's stated scope |

### 4. Permission Scope Analysis

| Category | Analyze |
|----------|---------|
| **Files read** | What files does the skill access? |
| **Files written** | Does it modify/create files? Where? |
| **Commands executed** | What shell commands? Network calls? |
| **Network endpoints** | What URLs/APIs does it connect to? |
| **Environment variables** | What env vars does it read? |

### 5. Risk Classification

| Risk Level | Criteria | Action |
|-----------|----------|--------|
| **Low** | No red flags, minimal permissions, well-known author | Safe to install |
| **Medium** | Minor concerns (e.g., network calls to unknown but legitimate APIs) | Review carefully, consider installing in sandbox |
| **High** | Red flags present (e.g., credential access, obfuscation) | Do NOT install without full code audit |
| **Extreme** | Clear malicious patterns (e.g., exfiltration, hidden downloads) | Block immediately |

## Usage

```bash
# Vet a specific skill
/vet @author/skill-name

# Batch audit all installed skills
/vet --all

# Manual review
1. Download the skill files
2. Run through the checklist above
3. Classify risk level
4. Decide: approve or block
```

## Example Output

```
=== SKILL VETTER REPORT ===

Skill: @spclaudehome/skill-vetter
Source: ClawHub
Files: SKILL.md, _meta.json

[PROVENANCE]
  Author: spclaudehome — 15 skills published
  Stars: ⭐ 3,331 (openclaw/skills)
  Last updated: 2 weeks ago
  Version: 1.0.0

[RED FLAGS]
  ✓ No executable code
  ✓ No credential access
  ✓ No obfuscation
  ✓ No hidden downloads
  ✓ No network exfiltration
  ✓ No sudo requests

[PERMISSIONS]
  Files read: SKILL.md only
  Commands: None
  Network: None
  Risk: LOW

[VERDICT]
  ✅ Safe to install. Pure security checklist, no runtime code.
```

## Notes

- This skill is itself a meta-skill — it vets other skills
- Always re-vet after skill updates (new version may introduce new code)
- When in doubt, install in an isolated environment first
