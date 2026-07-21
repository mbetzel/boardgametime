# AGENTS.md — Workspace Guidelines & Execution Policy

## 1. Runtime Environment (WSL Directive)
This is a WSL Linux project. Never run terminal scripts or commands using native Windows PowerShell or CMD. Always route execution tasks through WSL using:
```bash
wsl -d Ubuntu -e <command>
```

---

## 2. File Creation & Modification Policy
To prevent Windows PowerShell string mangling or quote truncation during file operations:
- **Direct File Operations**: Always write and edit individual files directly on the workspace filesystem using direct file writing tools (`write_to_file` / `replace_file_content`).
- **No Inline Command Code Piping**: Do NOT attempt to pass multi-line source code, JSON, or complex heredoc strings through inline shell arguments.

---

## 3. Git Commit Standards (Conventional Commits)
All git commits MUST strictly adhere to the **Conventional Commits** specification:
`<type>(<scope>): <short description>`

### Commit Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation updates or additions
- `style`: Formatting, semi-colon fixes, lint cleanups (no code logic changes)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding or updating test suites
- `chore`: Dependencies, monorepo configuration, build scripts, workspace tooling

### Standard Scopes
- `kingdoms`: Rules engine (`packages/games/kingdoms`)
- `core`: Shared game engine primitives (`packages/games/core`)
- `db`: Database schema, migrations & Prisma client (`packages/db`)
- `api`: Fastify API server & Socket.IO (`apps/api`)
- `web`: Next.js front-end client (`apps/web`)
- `infra`: Terraform GCP infrastructure (`infra/terraform`)
- `docs`: PRDs and ADRs (`docs/*`)
- `repo`: Root monorepo configuration (`package.json`, `pnpm-workspace.yaml`, `turbo.json`)

### Examples
- `feat(kingdoms): implement turn action state machine and board scoring calculator`
- `docs(adr): add ADR-001 through ADR-006 architecture decision records`
- `chore(repo): scaffold initial Turborepo and pnpm workspace structure`

---

## 4. Build, Verification & Testing Workflow
- **Monorepo Directory**: All workspace execution commands MUST be run from `/home/mike/github/boardgametime`.
- **Package Management & Orchestration**: Use `pnpm` and `turbo`:
  ```bash
  wsl -d Ubuntu -e bash -c "cd /home/mike/github/boardgametime && pnpm build"
  wsl -d Ubuntu -e bash -c "cd /home/mike/github/boardgametime && pnpm test"
  ```
