# Repository Guidelines

## Project Structure & Module Organization
- `ai/` — Agent prompts and scaffolding docs (e.g., `ai/prompts/create_project.md`).
- `requirements/` — Product requirements, plans, and assets (e.g., `requirements/implementation_plan.md`, `requirements/Component Matrix.xlsx`).
- Add new planning docs under `requirements/`; add AI prompt templates under `ai/prompts/`.

## Build, Test, and Development Commands
This repository is documentation‑first and has no required build step.
- Lint Markdown (optional): `npx markdownlint "**/*.md"`
- Check links (optional): `npx markdown-link-check -q -r .`
Run from the repository root. Add a dev note in your PR if you used additional tools.

## Coding Style & Naming Conventions
- Files: snake_case for Markdown and docs (e.g., `implementation_plan.md`).
- Directories: lowercase, short, descriptive (e.g., `ai`, `requirements`).
- Markdown: one `#` H1 per file, sentence‑case headings, hyphen bullets (`- `), fenced code blocks with a language (```bash, ```json).
- Text: concise, active voice, avoid ambiguity; prefer examples for procedures.

## Testing Guidelines
- Validate docs with the optional linters above before opening a PR.
- Verify all relative paths exist and external links resolve.
- Ensure code blocks are runnable/snippet‑accurate; keep commands copy‑pasteable from repo root.
- Large binary changes (e.g., spreadsheets) should be accompanied by a brief changelog in the PR body.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`. Subject ≤ 72 chars; body explains the “why”.
- Reference issues (`Closes #123`) and link related docs you touched.
- PRs should include: purpose, scope of files/dirs changed, before/after notes or screenshots where useful, and any follow‑ups.
- Keep PRs focused; avoid unrelated formatting churn.

## Agent‑Specific Instructions
- Treat this file as authoritative for the entire repo.
- Prefer minimal diffs; do not reformat untouched lines.
- Align new docs with existing structure (`ai/` vs `requirements/`).
- When renaming or moving files, update all references and examples in the same PR.
- Do not introduce new tooling or workflows without a brief rationale in the PR.

