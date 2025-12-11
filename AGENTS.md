# Repository Guidelines

## Project Structure & Modules

- Monorepo managed by pnpm workspaces; packages live under `packages/`.
- `packages/core`: shared graph-building logic; TypeScript source in `src/`, build output in `dist/`.
- `packages/recoil` and `packages/jotai`: framework adapters with CLI entry points (`bin/`) and tests under `src/__tests__/`.
- Example inputs and assets sit in `examples/`; root configs (`tsconfig.base.json`, `biome.json`, `pnpm-workspace.yaml`) define shared tooling.

## Build, Test, and Development Commands

- `pnpm build`: run `tsc` in every package to emit `dist/`.
- `pnpm test`: Node’s `--test` runner with `--experimental-strip-types` across package `src/**/*.test.ts`.
- `pnpm test:e2e`: framework adapters generate SVG graphs via their CLI (e.g., `packages/recoil/bin/str.js`); ensure Graphviz wasm peer deps are installed.
- `pnpm lint`: Biome lint across the workspace.
- `pnpm --filter ./packages/recoil test:u`: update snapshots when assertions rely on stored outputs.

## Coding Style & Naming Conventions

- TypeScript + ESM; prefer named exports for shared utilities in `core`.
- Follow Biome defaults (2-space indentation, single quotes, trailing commas where valid); run `pnpm lint` before sending a PR.
- Tests mirror source structure; keep file names descriptive (`*.test.ts`) and colocate fixtures in `__tests__/` or inline via `@mizdra/inline-fixture-files`.
- CLI bins are short, shebang-enabled scripts; keep argument parsing minimal and prefer explicit options.

## Testing Guidelines

- Unit tests: Node test runner; focus on graph shape, dependency edges, and CLI argument handling.
- E2E snapshot tests produce SVGs (`recoil-graph.svg`, `jotai-graph.svg`); commit updated snapshots only when intentional.
- Aim to cover new parsing paths and custom atom/selector patterns; mock framework APIs where practical.

## Commit & Pull Request Guidelines

- Commit messages generally follow Conventional Commit semantics (`fix(scope): message`, `chore: ...`); use scopes like `core`, `jotai`, or `recoil`.
- Include a Changeset when altering published packages (`pnpm changeset`), with bump type and concise summary.
- PRs should describe behavior changes, test coverage, and CLI examples (input command and expected SVG path). Link related issues; add screenshots or generated SVGs when visual output changes.
- Before opening a PR: run `pnpm lint`, `pnpm test`, and relevant `test:e2e`; ensure `dist/` is regenerated only when publishing.
