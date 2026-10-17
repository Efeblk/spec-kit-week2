# UI & Module Contracts: Quote of the Day

**Feature**: `001-quote-of-the-day`
**Date**: 2026-10-17

## 1. Pure Logic Module Contract (`src/quotes.js`)

Exposed on `globalThis.QuoteLogic` (for browser scripts) and `module.exports` (for Node.js tests):

```javascript
/**
 * Constant storage key for localStorage persistence.
 * Value: "qotd_favorites_v1"
 */
STORAGE_KEY: string

/**
 * Built-in array of at least 8 Quote objects: { id: string, text: string, author: string }
 */
QUOTES: ReadonlyArray<Quote>

/**
 * Selects a random quote from `quotes`.
 * - Throws or returns null if `quotes` is empty.
 * - If `quotes.length === 1`, returns `quotes[0]`.
 * - If `quotes.length >= 2` and `currentId` matches a quote in `quotes`,
 *   guarantees the returned quote has `id !== currentId`.
 * - `rng` defaults to `Math.random` and can be injected for deterministic testing.
 */
pickRandomQuote(quotes: ReadonlyArray<Quote>, currentId?: string | null, rng?: () => number): Quote | null

/**
 * Returns true if `quoteId` is in `favoriteIds`, false otherwise.
 */
isFavorite(favoriteIds: ReadonlyArray<string>, quoteId: string): boolean

/**
 * Pure function returning a new deduplicated array of favorite IDs:
 * - If `quoteId` is not present, appends `quoteId`.
 * - If `quoteId` is already present, removes `quoteId`.
 * - Does not mutate the input `favoriteIds` array.
 */
toggleFavorite(favoriteIds: ReadonlyArray<string>, quoteId: string): string[]

/**
 * Pure function that serializes an array of string IDs to a JSON string.
 * Deduplicates non-empty string entries before serializing.
 */
serializeFavorites(favoriteIds: ReadonlyArray<string>): string

/**
 * Pure function that parses `rawJson` and returns a clean `string[]` of valid favorite IDs.
 * - Returns `[]` on null/undefined/empty/invalid JSON or non-array payloads.
 * - Filters out non-string items and IDs not present in `validQuotes` (when provided).
 * - Deduplicates IDs while preserving order.
 */
deserializeFavorites(rawJson: string | null | undefined, validQuotes?: ReadonlyArray<Quote>): string[]

/**
 * Reads from `storage.getItem(STORAGE_KEY)` inside a try/catch block and delegates to `deserializeFavorites`.
 */
loadFavorites(storage: Storage | null | undefined, validQuotes?: ReadonlyArray<Quote>): string[]

/**
 * Writes `serializeFavorites(favoriteIds)` to `storage.setItem(STORAGE_KEY, ...)` inside a try/catch block.
 * Returns `true` if persisted, `false` if storage was unavailable or threw an error.
 */
saveFavorites(storage: Storage | null | undefined, favoriteIds: ReadonlyArray<string>): boolean

/**
 * Resolves `favoriteIds` into an array of full `Quote` objects from `quotes` in favorite order,
 * skipping any ID not found in `quotes`.
 */
getFavoriteQuotes(quotes: ReadonlyArray<Quote>, favoriteIds: ReadonlyArray<string>): Quote[]
```

---

## 2. DOM / UI Contract (`index.html` & `src/app.js`)

| Element Purpose | Selector / ID | Required Attributes & Behavior |
|-----------------|---------------|--------------------------------|
| Main Quote Text | `#quote-text` | Displays `currentQuote.text` inside a `<blockquote>` |
| Main Quote Author | `#quote-author` | Displays `currentQuote.author` inside a `<cite>` or `<figcaption>` |
| New Quote Button | `#new-quote-btn` | `type="button"`, text includes `"New quote"`; clicking selects a non-repeating random quote |
| Favorite Toggle Button | `#favorite-btn` | `type="button"`, `aria-pressed="true"` when current quote is favorited (`"false"` otherwise); displays `♥ Favorited` when active and `♡ Favorite` when inactive |
| Favorites Count Badge | `#favorites-count` | Displays numeric count of current favorites (e.g., `0`, `1`, `2`) |
| Favorites Empty State | `#favorites-empty` | Visible when `favoriteIds.length === 0`; hidden (`hidden` attribute) when `favoriteIds.length > 0` |
| Favorites List | `#favorites-list` | `<ul>` containing one `<li>` per favorited `Quote`, each displaying quote text, author, and a `<button type="button" class="remove-favorite-btn" data-quote-id="...">Remove</button>` |
