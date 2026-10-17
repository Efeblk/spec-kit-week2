# Implementation Plan: Quote of the Day

**Branch**: `001-quote-of-the-day` | **Date**: 2026-10-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-quote-of-the-day/spec.md`

**User Input**: `Use plain HTML/CSS/JavaScript, no backend; persist favorites in localStorage.`

## Summary

Build a zero-dependency, client-side **Quote of the Day** web page using plain HTML5, CSS3, and standard JavaScript (ES6+). The page displays a random quote from a built-in list of 10 software engineering/design quotes on load, provides a **"New quote"** button guaranteed not to repeat the currently displayed quote consecutively, and lets users toggle favorites (`♥ Favorited` / `♡ Favorite` with `aria-pressed`) or remove favorites from a dedicated Favorites section that persists across reloads in `localStorage` (`"qotd_favorites_v1"`). Pure business logic is isolated in `src/quotes.js` so it can be unit-tested directly under Node.js (`tests/quotes.test.js`) while `src/app.js` binds DOM events and rendering.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES6+ / ECMAScript 2022)

**Primary Dependencies**: None (plain HTML/CSS/JS; zero external runtime libraries or frameworks)

**Storage**: Browser `window.localStorage` under key `"qotd_favorites_v1"` (JSON array of quote ID strings)

**Testing**: Node.js built-in assertion/test script (`node tests/quotes.test.js` using `node:assert/strict`)

**Target Platform**: Modern evergreen desktop and mobile web browsers (works over both `http://` and `file://`), plus Node.js v18+ for unit testing

**Project Type**: Static client-side web application (`index.html`, `styles.css`, `src/quotes.js`, `src/app.js`)

**Performance Goals**: Initial render < 100ms (SC-001); quote switching and favorite toggling < 50ms (SC-003)

**Constraints**: No backend, no build step or bundler, offline-capable, defensive `localStorage` error handling (`try/catch`), non-repeating consecutive random selection

**Scale/Scope**: Single-page interface with 10 built-in quotes and local browser persistence

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate Requirement | Status | Evidence / Design Alignment |
|-----------|------------------|--------|-----------------------------|
| **I. Separation of Pure Logic and DOM** | Core quote selection, favorite toggling, and serialization isolated from DOM APIs | PASS | `src/quotes.js` contains only pure functions + data; `src/app.js` handles DOM queries and event listeners |
| **II. Automated Unit Testing (NON-NEGOTIABLE)** | Node.js test script covering non-repeating random pick, favorite toggle, and persistence serialization | PASS | `tests/quotes.test.js` tests `pickRandomQuote`, `toggleFavorite`, `serializeFavorites`, `deserializeFavorites`, `loadFavorites`, `saveFavorites` |
| **III. Zero External Dependencies & Simplicity** | Plain HTML/CSS/JS, no frameworks, no build tools | PASS | Zero `npm` packages required; runs natively in browser and Node.js |
| **IV. Defensive Persistence & State Integrity** | `localStorage` wrapped in `try/catch`, schema/ID validation on load | PASS | `deserializeFavorites` filters non-strings, deduplicates, and drops stale IDs not in `QUOTES`; `loadFavorites`/`saveFavorites` catch storage errors |
| **V. Accessible & Semantic Markup** | Semantic HTML (`<main>`, `<blockquote>`, `<button>`, `<section>`) + `aria-pressed` | PASS | Defined in `contracts/ui-contract.md` and `index.html` structure |

*Post-Phase 1 Re-Check*: All 5 constitution principles pass with zero violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-quote-of-the-day/
├── plan.md              # This implementation plan (/speckit.plan output)
├── research.md          # Phase 0 architectural & testing decisions
├── data-model.md        # Phase 1 Quote & FavoriteState entity definitions
├── quickstart.md        # Phase 1 test execution & manual verification guide
├── contracts/
│   └── ui-contract.md   # Phase 1 pure logic API & DOM selector contract
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit.specify output)
└── tasks.md             # Phase 2 actionable task list (/speckit.tasks output)
```

### Source Code (repository root)

```text
week2-spec-kit/
├── index.html           # Main Quote-of-the-Day page (semantic HTML5)
├── styles.css           # Responsive, accessible styling for quote card & favorites list
├── src/
│   ├── quotes.js        # Built-in QUOTES array + pure logic (random pick, favorite toggle, serialization)
│   └── app.js           # Browser DOM controller binding UI elements to QuoteLogic
└── tests/
    └── quotes.test.js   # Node.js unit test suite for pure logic in src/quotes.js
```

**Structure Decision**: Single static web project at the repository root (`index.html`, `styles.css`) with modular scripts in `src/` (`src/quotes.js` for pure logic and `src/app.js` for DOM wiring) and automated Node.js unit tests in `tests/quotes.test.js`. This directly enforces Principle I (Separation of Pure Logic and DOM) and Principle III (Zero External Dependencies & Simplicity).

## Complexity Tracking

No Constitution violations exist; no complexity justifications required.
