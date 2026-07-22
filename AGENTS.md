# AGENTS.md — Workspace Guidelines & Execution Policy

## 1. Runtime Environment (WSL Directive)
This is a WSL Linux project. All terminal execution commands MUST be routed using the `--cd` option to specify the Linux path directly, preventing Windows network drive (`Z:\`) path translation warnings:
```bash
wsl -d Ubuntu --cd /home/mike/github/boardgametime <command>
```

---

## 2. Model Selection & Subagent Strategy
- **Planning & Architectural Reasoning**: High-level planning, requirements drafting, ADR design, and complex problem decomposition are performed using **Frontier / Pro models** (`pro`). If frontier credits are unavailable or exhausted, fall back to **Medium models** (`flash`).
- **Code Execution & Implementation**: Code generation, file edits, test suite execution, and build tasks are delegated to **Faster / Cheaper models** (`flash` / `flash_lite`).
- **Bug Investigation & Resolution**: When the user requests a bug investigation or fix—including by pasting a screenshot or error log from a console or application failure—delegate the diagnostic investigation and code resolution to a low-cost agent (`Model: 'flash'`).
- **Workspace Isolation**: When invoking subagents via `invoke_subagent`, ALWAYS set `Workspace: 'branch'` (or `'share'`) to create isolated worktrees/branches. This ensures multiple subagents can run concurrently without file or git conflicts.

---

## 3. File Creation & Modification Policy
To prevent Windows PowerShell string mangling or quote truncation during file operations:
- **Direct File Operations**: Always write and edit individual files directly on the workspace filesystem using direct file writing tools (`write_to_file` / `replace_file_content`).
- **No Inline Command Code Piping**: Do NOT attempt to pass multi-line source code, JSON, or complex heredoc strings through inline shell arguments.

---

## 4. Git Commit & Review Policy
- **User Review Required**: All changes MUST be reviewed and approved by the user before committing or pushing.
- **Conventional Commits**: All git commits MUST strictly adhere to the **Conventional Commits** specification:
  `<type>(<scope>): <short description>`

### Commit Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation updates or additions
- `style`: Formatting, semi-colon fixes, lint cleanups (no code logic changes)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding or updating test suites
- `chore`: Dependencies, monorepo configuration, build scripts, workspace tooling

---

## 5. Build, Verification & Testing Workflow
- **Monorepo Directory**: All workspace execution commands MUST be run from `/home/mike/github/boardgametime`.
- **Package Management & Orchestration**: Use `pnpm` and `turbo`:
  ```bash
  wsl -d Ubuntu --cd /home/mike/github/boardgametime bash -c "pnpm build"
  wsl -d Ubuntu --cd /home/mike/github/boardgametime bash -c "pnpm test"
  ```
