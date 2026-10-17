"use strict";

(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.QuoteLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const STORAGE_KEY = "qotd_favorites_v1";

  const QUOTES = Object.freeze([
    Object.freeze({
      id: "q-01",
      text: "Simplicity is prerequisite for reliability.",
      author: "Edsger W. Dijkstra",
    }),
    Object.freeze({
      id: "q-02",
      text: "Programs must be written for people to read, and only incidentally for machines to execute.",
      author: "Harold Abelson",
    }),
    Object.freeze({
      id: "q-03",
      text: "Premature optimization is the root of all evil in programming.",
      author: "Donald Knuth",
    }),
    Object.freeze({
      id: "q-04",
      text: "The most dangerous phrase in the language is, 'We've always done it this way.'",
      author: "Grace Hopper",
    }),
    Object.freeze({
      id: "q-05",
      text: "There are two ways of constructing a software design: one way is to make it so simple that there are obviously no deficiencies, and the other way is to make it so complicated that there are no obvious deficiencies.",
      author: "C.A.R. Hoare",
    }),
    Object.freeze({
      id: "q-06",
      text: "The best way to predict the future is to invent it.",
      author: "Alan Kay",
    }),
    Object.freeze({
      id: "q-07",
      text: "Make it work, make it right, make it fast.",
      author: "Kent Beck",
    }),
    Object.freeze({
      id: "q-08",
      text: "Talk is cheap. Show me the code.",
      author: "Linus Torvalds",
    }),
    Object.freeze({
      id: "q-09",
      text: "The bearing of a child takes nine months, no matter how many women are assigned.",
      author: "Fred Brooks",
    }),
    Object.freeze({
      id: "q-10",
      text: "Modular design relies on separating what a module does from how it is implemented.",
      author: "Barbara Liskov",
    }),
  ]);

  /**
   * Picks a random quote from `quotes`, guaranteeing it will not repeat `currentId`
   * consecutively whenever `quotes` has at least 2 distinct entries.
   */
  function pickRandomQuote(quotes, currentId = null, rng = Math.random) {
    if (!Array.isArray(quotes) || quotes.length === 0) {
      return null;
    }
    if (quotes.length === 1) {
      return quotes[0];
    }

    const candidates =
      typeof currentId === "string" && currentId.length > 0
        ? quotes.filter((q) => q && q.id !== currentId)
        : quotes;

    const pool = candidates.length > 0 ? candidates : quotes;
    const rawRandom = typeof rng === "function" ? rng() : Math.random();
    const clamped = Math.max(0, Math.min(0.999999999999, Number(rawRandom) || 0));
    const index = Math.floor(clamped * pool.length);
    return pool[index];
  }

  /**
   * Returns true if `quoteId` is present in `favoriteIds`.
   */
  function isFavorite(favoriteIds, quoteId) {
    if (!Array.isArray(favoriteIds) || typeof quoteId !== "string" || !quoteId) {
      return false;
    }
    return favoriteIds.includes(quoteId);
  }

  /**
   * Pure function that toggles `quoteId` inside `favoriteIds` without mutating the input array.
   */
  function toggleFavorite(favoriteIds, quoteId) {
    const cleanList = Array.isArray(favoriteIds)
      ? Array.from(new Set(favoriteIds.filter((id) => typeof id === "string" && id.length > 0)))
      : [];

    if (typeof quoteId !== "string" || quoteId.length === 0) {
      return cleanList;
    }

    if (cleanList.includes(quoteId)) {
      return cleanList.filter((id) => id !== quoteId);
    }
    return [...cleanList, quoteId];
  }

  /**
   * Resolves an ordered array of `favoriteIds` into full Quote objects from `quotes`.
   */
  function getFavoriteQuotes(quotes, favoriteIds) {
    if (!Array.isArray(quotes) || !Array.isArray(favoriteIds)) {
      return [];
    }
    const quoteById = new Map(quotes.map((q) => [q.id, q]));
    const resolved = [];
    const seen = new Set();

    for (const id of favoriteIds) {
      if (typeof id === "string" && !seen.has(id) && quoteById.has(id)) {
        seen.add(id);
        resolved.push(quoteById.get(id));
      }
    }
    return resolved;
  }

  /**
   * Serializes an array of favorite quote IDs into a deduplicated JSON string.
   */
  function serializeFavorites(favoriteIds) {
    if (!Array.isArray(favoriteIds)) {
      return JSON.stringify([]);
    }
    const deduplicated = Array.from(
      new Set(favoriteIds.filter((id) => typeof id === "string" && id.length > 0))
    );
    return JSON.stringify(deduplicated);
  }

  /**
   * Safely parses `rawJson` and returns a deduplicated array of valid string quote IDs.
   */
  function deserializeFavorites(rawJson, validQuotes = QUOTES) {
    if (typeof rawJson !== "string" || rawJson.trim().length === 0) {
      return [];
    }

    let parsed;
    try {
      parsed = JSON.parse(rawJson);
    } catch (_err) {
      return [];
    }

    if (!Array.isArray(parsed)) {
      return [];
    }

    const validIdSet =
      Array.isArray(validQuotes) && validQuotes.length > 0
        ? new Set(validQuotes.map((q) => q.id))
        : null;

    const result = [];
    const seen = new Set();

    for (const item of parsed) {
      if (typeof item !== "string" || item.length === 0 || seen.has(item)) {
        continue;
      }
      if (validIdSet && !validIdSet.has(item)) {
        continue;
      }
      seen.add(item);
      result.push(item);
    }

    return result;
  }

  /**
   * Loads and sanitizes favorite quote IDs from a Storage-compatible object.
   */
  function loadFavorites(storage, validQuotes = QUOTES) {
    if (!storage || typeof storage.getItem !== "function") {
      return [];
    }
    try {
      const raw = storage.getItem(STORAGE_KEY);
      return deserializeFavorites(raw, validQuotes);
    } catch (_err) {
      return [];
    }
  }

  /**
   * Saves favorite quote IDs to a Storage-compatible object.
   */
  function saveFavorites(storage, favoriteIds) {
    if (!storage || typeof storage.setItem !== "function") {
      return false;
    }
    try {
      const payload = serializeFavorites(favoriteIds);
      storage.setItem(STORAGE_KEY, payload);
      return true;
    } catch (_err) {
      return false;
    }
  }

  return {
    STORAGE_KEY,
    QUOTES,
    pickRandomQuote,
    isFavorite,
    toggleFavorite,
    getFavoriteQuotes,
    serializeFavorites,
    deserializeFavorites,
    loadFavorites,
    saveFavorites,
  };
});
