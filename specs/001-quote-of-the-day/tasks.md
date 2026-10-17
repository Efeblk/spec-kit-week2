# Tasks: Quote of the Day

**Input**: Design documents from `/specs/001-quote-of-the-day/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/ui-contract.md

**Tests**: Required per Constitution Principle II (Automated Unit Testing - NON-NEGOTIABLE).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project directories (`src/`, `tests/`) and base semantic HTML5 document structure in `index.html` with `#quote-text`, `#quote-author`, `#new-quote-btn`, `#favorite-btn`, `#favorites-count`, `#favorites-empty`, and `#favorites-list` per `contracts/ui-contract.md`
- [X] T002 [P] Create responsive, accessible stylesheet in `styles.css` covering the quote card, action buttons (`aria-pressed="true"` active state), favorites section, and empty-state message

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core quote dataset and module export scaffold that MUST be complete before user story implementation

- [X] T003 Define `STORAGE_KEY = "qotd_favorites_v1"` and the built-in `QUOTES` collection (10 distinct quotes where `id` is required, unique, non-empty, pattern `^q-\d{2,}$`; `text` is required, non-empty, max length 300 chars; `author` is required, non-empty, max length 100 chars) with dual browser (`globalThis.QuoteLogic`) and Node.js (`module.exports`) exports in `src/quotes.js`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View and Cycle Non-Repeating Random Quotes (Priority: P1) 🎯 MVP

**Goal**: Display one random quote and author on initial page load and cycle to a non-repeating random quote whenever "New quote" is clicked.

**Independent Test**: Run `node tests/quotes.test.js` for `pickRandomQuote` assertions and verify in browser that loading `index.html` shows a quote and clicking `#new-quote-btn` 20 times never repeats the same quote consecutively.

### Tests for User Story 1

- [X] T004 [US1] Write unit tests in `tests/quotes.test.js` verifying `QUOTES` schema constraints (>= 8 quotes, unique IDs matching `^q-\d{2,}$`, non-empty `text` <= 300 chars and `author` <= 100 chars) and verifying `pickRandomQuote(quotes, currentId, rng)` never repeats the current quote across 200 consecutive selections when `quotes.length >= 2` (and handles empty or single-element arrays safely)

### Implementation for User Story 1

- [X] T005 [US1] Implement pure function `pickRandomQuote(quotes, currentId, rng)` in `src/quotes.js` that filters out `currentId` when `quotes.length >= 2`
- [X] T006 [US1] Implement initial quote rendering (`#quote-text`, `#quote-author`) on `DOMContentLoaded` and wire the `#new-quote-btn` click handler to `pickRandomQuote` in `src/app.js`

**Checkpoint**: User Story 1 is functional and independently testable

---

## Phase 4: User Story 2 - Mark, Unmark, and Manage Favorite Quotes (Priority: P2)

**Goal**: Allow users to toggle the current quote as a favorite (`♥ Favorited` / `♡ Favorite` with `aria-pressed`), see all favorited quotes with a live count in the Favorites section, and remove any favorite directly from the list.

**Independent Test**: Run `node tests/quotes.test.js` for `isFavorite`, `toggleFavorite`, and `getFavoriteQuotes` tests, and verify in browser that toggling `#favorite-btn` or clicking `.remove-favorite-btn` updates both the button state and `#favorites-list`.

### Tests for User Story 2

- [X] T007 [US2] Add unit tests in `tests/quotes.test.js` for `isFavorite(favoriteIds, quoteId)`, `toggleFavorite(favoriteIds, quoteId)` (adding, removing, immutability, deduplication), and `getFavoriteQuotes(quotes, favoriteIds)` (preserving favorite order and ignoring unknown IDs)

### Implementation for User Story 2

- [X] T008 [US2] Implement pure functions `isFavorite`, `toggleFavorite`, and `getFavoriteQuotes` in `src/quotes.js`
- [X] T009 [US2] Implement favorite toggle button rendering (`aria-pressed="true"`/`"false"`, `♥ Favorited` vs `♡ Favorite`), `#favorites-count` badge, `#favorites-empty` visibility, `#favorites-list` item rendering with `.remove-favorite-btn[data-quote-id]`, and event handlers in `src/app.js`

**Checkpoint**: User Stories 1 and 2 work together and independently

---

## Phase 5: User Story 3 - Persist Favorites Across Page Reloads (Priority: P3)

**Goal**: Persist favorited quote IDs in `localStorage` across page reloads while deduplicating IDs, filtering out unknown/stale quote IDs, and recovering gracefully from corrupted or unavailable storage.

**Independent Test**: Run `node tests/quotes.test.js` for `serializeFavorites`, `deserializeFavorites`, `loadFavorites`, and `saveFavorites` (including corrupted JSON, non-array JSON, stale IDs, and throwing storage mocks), and reload the browser page to verify favorites persist.

### Tests for User Story 3

- [X] T010 [US3] Add unit tests in `tests/quotes.test.js` for `serializeFavorites`, `deserializeFavorites` (null/empty/invalid JSON, non-array JSON, stale quote ID filtering, deduplication), and `loadFavorites`/`saveFavorites` with mock `localStorage` (including quota/security error resilience)

### Implementation for User Story 3

- [X] T011 [US3] Implement `serializeFavorites`, `deserializeFavorites`, `loadFavorites`, and `saveFavorites` with `try/catch` error handling and `validQuotes` ID filtering in `src/quotes.js`
- [X] T012 [US3] Integrate `loadFavorites(window.localStorage, QUOTES)` on initialization and `saveFavorites(window.localStorage, favoriteIds)` on favorite toggle/remove in `src/app.js`

**Checkpoint**: All user stories (US1, US2, US3) are complete and independently testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across unit tests, UI contract, and quickstart scenarios

- [X] T013 Execute full Node.js unit test suite (`node tests/quotes.test.js`) and validate all scenarios in `specs/001-quote-of-the-day/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 (`QUOTES` defined in `src/quotes.js`)
- **User Story 2 (Phase 4)**: Depends on Phase 2 and integrates with `src/app.js` from US1
- **User Story 3 (Phase 5)**: Depends on Phase 4 favorite state management
- **Polish (Phase 6)**: Depends on Phases 1–5 completion

### Parallel Opportunities

- `T001` (`index.html`) and `T002` (`styles.css`) affect separate files and can be executed in parallel `[P]`.
- Within each User Story phase, unit test cases in `tests/quotes.test.js` are authored before or alongside `src/quotes.js` pure functions before wiring `src/app.js`.

---

## Parallel Example: Phase 1 Setup

```bash
Task T001: "Create base semantic HTML5 document structure in index.html"
Task T002: "Create responsive, accessible stylesheet in styles.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (`index.html`, `styles.css`)
2. Complete Phase 2: Foundational (`QUOTES` in `src/quotes.js`)
3. Complete Phase 3: User Story 1 (`pickRandomQuote` + initial/new-quote DOM rendering)
4. **STOP and VALIDATE**: Run unit tests and test cycling quotes in the browser

### Incremental Delivery

1. Setup + Foundational → Base layout and quote dataset ready
2. Add User Story 1 → Non-repeating random quote display & "New quote" button (MVP)
3. Add User Story 2 → Favorite toggle (`aria-pressed`), count badge, and Favorites list with "Remove" buttons
4. Add User Story 3 → `localStorage` persistence with stale-ID filtering and error recovery

---

## Phase 7: Convergence

- [X] T014 Trim leading/trailing whitespace on `q-09.text` in `src/quotes.js` and enforce `q.text === q.text.trim()` and `q.author === q.author.trim()` in `tests/quotes.test.js` per `data-model.md: Quote.text constraints` (`partial`)
