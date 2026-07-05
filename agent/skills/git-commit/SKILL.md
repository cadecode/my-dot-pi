---
name: git-commit
description: "Generate Angular Conventional Commit messages for git commits. MUST use this skill whenever the user asks to commit code, write a commit message, generate a commit, mentions 'commit message', or says 提交 / commit in the context of git. This skill ensures every commit follows the type(scope): subject format with proper body and footer conventions."
---

# Git Commit Message Generator

Generate commit messages following Angular Conventional Commits.

**Output only the commit message text**, ready for the user to paste into `git commit -m "..."`. Do not add explanations or markdown fences — the user needs a clean message to use directly.

## Format

```
<type>(<scope>): <subject>

<body lines — explain WHY, not just WHAT>
```

## How to Choose Type

Read the user's change description and pick the type that best matches the **primary intent**:

| Type | When the change primarily... |
|------|------------------------------|
| `feat` | Adds new capability the user can see or use |
| `fix` | Corrects incorrect behavior (bug) |
| `docs` | Changes only markdown, comments, or README files |
| `style` | Reformats code without changing logic (whitespace, lint) |
| `refactor` | Restructures code with no new feature and no bug fix |
| `perf` | Makes something faster or uses less resources |
| `test` | Adds or updates test files only |
| `build` | Changes build config, dependencies, or packaging |
| `ci` | Changes CI pipeline or automation scripts |
| `chore` | Everything else — config tweaks, logging, cleanup |
| `revert` | Undoes a previous commit |

**Key distinction**: `refactor` = code structure change with zero behavior change. If the user adds a log line, that's `chore`. If they rename a module, that's `refactor`. If they fix a calculation, that's `fix`.

## How to Choose Scope

Use the module or layer the change touches:

| Scope | Module |
|-------|--------|
| `(common)` | shared utilities, extension patterns |
| `(framework)` | Spring config, thread pools, web config |
| `(server)` or `(main)` | application/business logic |
| `(codegen)` | code generation tools |
| `(mybatis)` | ORM, database mapping |
| `(web)` | controllers, interceptors, advisors |
| `(spec)` | `.trellis/spec/` documentation |

Omit scope for project-wide changes that touch multiple modules.

## Subject Rules

- Start with a verb: `add`, `fix`, `remove`, `refactor`, `update`, `rename`, `move`, `extract`, `simplify`
- ≤ 50 characters
- Chinese or English is fine, but stick to one language per commit

## When to Add Body

Add a body (blank line after subject) when the change needs explanation — WHY it was done, not just WHAT:

```
refactor: rename admin module to main

The module was originally named "admin" but serves as the primary
application server, not just an admin panel. The rename aligns
with its actual purpose: svc/server/admin → svc/server/main.
```

## Breaking Changes

If the change breaks existing APIs or behavior, add a `BREAKING CHANGE:` footer:

```
refactor(common): change ExtensionType getType() return type

BREAKING CHANGE: getType() now returns int instead of String

Migration: update all enum implementations to return numeric IDs.
```

## Examples

**User says**: "commit, add thread pool init logs"
```
chore(framework): add thread pool init logs
```

**User says**: "commit the admin→main rename"
```
refactor: rename admin module to main

Module renamed from svc/server/admin to svc/server/main to reflect
its role as the primary application server.
```

**User says**: "Commit these changes — I fixed the order timeout bug in OrderService"
```
fix(server): correct order timeout calculation
```

**User says**: "帮我提交，加了 Plugin demo 测试"
```
test(main): add Plugin demo tests
```

**User says**: "commit, updated the git commit spec with Body and Footer sections"
```
docs(spec): add Body/Footer/BREAKING CHANGE to git commit spec
```
