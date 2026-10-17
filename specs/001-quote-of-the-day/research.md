# Phase 0 Research: Quote of the Day

**Feature**: `001-quote-of-the-day`
**Date**: 2026-10-17

## Decision 1: Module Format for Dual Browser + Node.js Test Compatibility

- **Decision**: Implement `src/quotes.js` as a standard ES module (`export const QUOTES = ...; export function pickRandomQuote(...) ...`) or universal module, and load `src/app.js` via `<script type="module">` in `index.html` (while also supporting `file://` or static HTTP serving by providing a UMD/global fallback or standard ES module imports with `"type": "module"` in `package.json` for `node --test`). Specifically, using universal export pattern (attaching to `globalThis.QuoteLogic` AND supporting CommonJS `module.exports` when `typeof module !== 'undefined'`) allows `index.html` to work even over `file://` without CORS restrictions on `<script type="module">`, while `node tests/quotes.test.js` can `require('../src/quotes.js')` directly with zero config!
- **Rationale**: In plain HTML/JS without a bundler, `<script type="module">` fails in some browsers when opened directly via `file://` due to CORS policy, whereas classic `<script defer src="src/quotes.js">` + `<script defer src="src/app.js">` works over both `file://` and `http://`. Exposing `module.exports` when running in Node.js lets `node --test tests/quotes.test.js` import the exact same `src/quotes.js` file without Babel, Webpack, or flags.
- **Alternatives considered**:
  - ES Modules only (`export` / `import`): Clean syntax, but blocks `file://` double-click opening in Chromium browsers due to CORS.
  - Bundler (Vite/Parcel): Violates Constitution Principle III (Zero External Dependencies & Simplicity).

## Decision 2: Non-Repeating Random Selection Algorithm

- **Decision**: Filter the candidate pool to `quotes.filter(q => q.id !== currentQuoteId)` whenever `quotes.length > 1` and `currentQuoteId` is present in `quotes`. Select index `Math.floor(rng() * candidates.length)` where `rng` defaults to `Math.random` (injectable for deterministic unit testing).
- **Rationale**: O(N) filtering over a small list (8–12 quotes) is instantaneous (< 0.01ms), guarantees 0% chance of consecutive repetition on a single pass without unbounded `while` retry loops, and supports deterministic dependency-injected `rng` testing.
- **Alternatives considered**:
  - Rejection sampling (`do { pick } while (pick === current)`): Can theoretically loop indefinitely if a bug passes a single-item array or constant RNG in tests.
  - Pre-shuffled deck cycle: Over-complicates state tracking across clicks when simple consecutive deduplication satisfies FR-003.

## Decision 3: `localStorage` Schema and Defensive Serialization

- **Decision**: Store favorite quote IDs as a JSON-serialized array of string IDs under the constant key `"qotd_favorites_v1"` (e.g., `["q1", "q4"]`). Provide pure functions `serializeFavorites(favoriteIds)` and `deserializeFavorites(rawJson, validQuotes)` plus storage adapter helpers `loadFavorites(storage, validQuotes)` and `saveFavorites(storage, favoriteIds)` wrapped in `try/catch`.
- **Rationale**: Storing only string `id`s avoids data duplication, keeps payload tiny, and allows `deserializeFavorites` to validate that the parsed value is an `Array`, filter items to strings that exist in `validQuotes`, and deduplicate via `Array.from(new Set(...))`. Wrapping `storage.getItem` / `storage.setItem` in `try/catch` satisfies Constitution Principle IV and SC-004.
- **Alternatives considered**:
  - Storing full Quote objects in `localStorage`: Risks stale quote text/author if typos are fixed in built-in list, and requires heavier schema validation.
  - Comma-separated string: Fragile if IDs ever contain delimiters; JSON array is standard and explicit.

## Decision 4: Built-in Quote Dataset

- **Decision**: Include 10 curated quotes on software engineering, design, and clarity (Dijkstra, Knuth, Hopper, Brooks, Hoare, Kay, Liskov, Torvalds, Beck, Abelson) with stable IDs `q-01` through `q-10`.
- **Rationale**: Exceeds the minimum requirement of 8 quotes (FR-001) and fits the university software engineering theme.
- **Alternatives considered**:
  - External quote API: Violates "no backend" constraint and offline reliability.
