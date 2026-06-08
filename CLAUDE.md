# Project Instructions

## Git Commits

Always commit as:
- Name: `haoxiang14`
- Email: `haoxiang14@users.noreply.github.com`

Use `--author="haoxiang14 <haoxiang14@users.noreply.github.com>"` on every commit. Do NOT use `haoxiang.tan` or any other identity.

## Project Architecture

This project is split into two parts:

- **Frontend** (`src/`) — Next.js dashboard deployed to Vercel. Read-only display, no alerting.
- **Worker** (`worker/`) — Standalone Node.js script run by GitHub Actions every 5 minutes. Handles monitoring + Lark alerts.

## Keeping Both in Sync

When the user asks to add/remove/modify bridges, tokens, chains, or xStocks entries, **ALWAYS update both**:

1. `src/lib/bridges.ts` ↔ `worker/src/bridges.ts`
2. `src/lib/rpc.ts` ↔ `worker/src/rpc.ts`
3. `src/lib/cctp.ts` ↔ `worker/src/cctp.ts`
4. `src/lib/xstocks.ts` ↔ `worker/src/xstocks.ts`

The worker has its own copies (not shared imports) because it runs standalone in GitHub Actions without the Next.js build system. If you change monitoring logic in one, mirror it in the other.
