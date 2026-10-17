# Quickstart & Validation Guide: Quote of the Day

**Feature**: `001-quote-of-the-day`
**Date**: 2026-10-17

## Prerequisites

- **Node.js** (v18+ installed; used to run automated unit tests for pure logic)
- Any modern web browser (Chrome, Edge, Firefox, Safari)

## 1. Run Automated Unit Tests

From the project root (`week2-spec-kit`), run:

```powershell
node tests/quotes.test.js
```

**Expected Outcome**:
- All unit test assertions pass with exit code `0`.
- Verifies:
  1. Built-in `QUOTES` list has >= 8 valid quotes with unique IDs (`FR-001`).
  2. `pickRandomQuote` never repeats the same quote twice in a row across 200 consecutive picks (`FR-003`, `SC-002`).
  3. `toggleFavorite` adds an unfavorited quote ID, removes an already-favorited quote ID, and does not mutate input arrays (`FR-004`).
  4. `serializeFavorites` and `deserializeFavorites` round-trip valid IDs, deduplicate entries, filter out stale/unknown quote IDs, and recover gracefully from invalid JSON or non-array data (`FR-007`, `SC-004`).
  5. `loadFavorites` and `saveFavorites` interact with `localStorage` mocks safely even when storage throws exceptions.

## 2. Manual Browser Validation Scenarios

Open `index.html` directly in a browser or serve the folder via a local static server.

1. **Initial Quote Display (`US1/AC1`)**:
   - Confirm `#quote-text` and `#quote-author` are populated immediately on load.
2. **Non-Repeating New Quote (`US1/AC2`)**:
   - Click **New quote** (`#new-quote-btn`) 10 times in a row.
   - Confirm every click immediately shows a different quote than the one just displayed.
3. **Favorite Toggle & Remove from List (`US2/AC1–AC3`)**:
   - Click **♡ Favorite** (`#favorite-btn`). Confirm it changes to **♥ Favorited** with `aria-pressed="true"`, `#favorites-count` increments to `1`, and the quote appears in `#favorites-list`.
   - Click **New quote** and favorite a second quote.
   - Click **Remove** next to a quote in the Favorites list. Confirm it disappears from the list, `#favorites-count` decrements, and if it was the active quote, `#favorite-btn` resets to `aria-pressed="false"`.
4. **Persistence Across Reloads (`US3/AC1–AC2`)**:
   - With at least one quote favorited, reload the browser tab (`F5` / `Ctrl+R`).
   - Confirm the Favorites list still displays all favorited quotes and `#favorites-count` matches.
