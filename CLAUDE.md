# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ゆる動画管理アプリ (Yuru Movie Management App) — a desktop app for video creators to manage production schedules. Built with Tauri 2 (Rust backend) + React 19 + TypeScript + Tailwind CSS 4 + Vite frontend. Data is stored in localStorage with automatic backup to the filesystem via Tauri's fs plugin.

## Commands

- `npm run dev` — Start Vite dev server (port 1420)
- `npm run build` — TypeScript check + Vite build
- `npx tauri dev` — Launch full Tauri desktop app in dev mode (starts Vite automatically)
- `npx tauri build` — Production build of the Tauri desktop app
- `cd src-tauri && cargo check` — Check Rust backend compilation

No test framework is configured. No linter is configured.

## Architecture

### Frontend (src/)

State management uses a custom React hook (`src/store/cardStore.ts` via `useCardStore`) — not Redux or Context. This hook manages all card CRUD operations and settings, persisting to localStorage via `useEffect` on state changes.

**Card system**: Two card types exist — `manual` (user-created) and `auto` (generated from process steps). Creating a manual card auto-generates deadline cards based on `AppSettings.processSteps`. Editing an auto card converts it to manual. Deleting a manual card cascades to its auto cards. Cards link via `parentCardId`.

**Data flow**: `useCardStore` → `storage.ts` (localStorage read/write + serialization of Date↔ISO strings) → `backup.ts` (async fire-and-forget backup to filesystem via `@tauri-apps/plugin-fs`).

**Key utilities**:
- `src/utils/autoCard.ts` — Auto card generation/regeneration logic
- `src/utils/cardColor.ts` — Deadline-based color warnings (overdue → urgent → warning → normal)
- `src/utils/storage.ts` — localStorage persistence with `AppData` validation
- `src/utils/backup.ts` — Tauri fs plugin backup to `BaseDirectory.Resource`

**Views**: Timeline (date-sorted card list) and Calendar (monthly grid), toggled in Header and persisted to localStorage.

**Types** are in `src/types/index.ts`: `Card`, `CardStorage` (serialized form), `ProcessStep`, `AppSettings`, `AppData`.

### Backend (src-tauri/)

Minimal Rust backend — primarily serves as the Tauri shell. Uses `tauri-plugin-fs` for backup file access and `tauri-plugin-opener` for external links. No custom Rust commands are defined.

## Language

The UI, comments, and documentation are in Japanese. Follow the same convention.
