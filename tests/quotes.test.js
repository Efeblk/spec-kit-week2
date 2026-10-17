"use strict";

const assert = require("node:assert/strict");
const {
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
} = require("../src/quotes.js");

let passed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS: ${name}`);
  } catch (err) {
    console.error(`FAIL: ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

// --- US1: Quote dataset & non-repeating random selection ---

test("STORAGE_KEY is defined as 'qotd_favorites_v1'", () => {
  assert.equal(STORAGE_KEY, "qotd_favorites_v1");
});

test("QUOTES contains at least 8 valid, distinct quotes conforming to data-model constraints", () => {
  assert.ok(Array.isArray(QUOTES), "QUOTES must be an array");
  assert.ok(QUOTES.length >= 8, `Expected at least 8 quotes, found ${QUOTES.length}`);

  const seenIds = new Set();
  for (const q of QUOTES) {
    assert.equal(typeof q.id, "string");
    assert.match(q.id, /^q-\d{2,}$/, `Quote id '${q.id}' must match ^q-\\d{2,}$`);
    assert.ok(!seenIds.has(q.id), `Duplicate quote id: ${q.id}`);
    seenIds.add(q.id);

    assert.equal(typeof q.text, "string");
    assert.ok(q.text.trim().length > 0, "Quote text must be non-empty");
    assert.equal(q.text, q.text.trim(), `Quote '${q.id}' text must not have leading/trailing whitespace`);
    assert.ok(q.text.length <= 300, "Quote text must be <= 300 chars");

    assert.equal(typeof q.author, "string");
    assert.ok(q.author.trim().length > 0, "Quote author must be non-empty");
    assert.equal(q.author, q.author.trim(), `Quote '${q.id}' author must not have leading/trailing whitespace`);
    assert.ok(q.author.length <= 100, "Quote author must be <= 100 chars");
  }
});

test("pickRandomQuote returns null for empty or invalid arrays and returns single quote when length === 1", () => {
  assert.equal(pickRandomQuote([]), null);
  assert.equal(pickRandomQuote(null), null);

  const single = [{ id: "q-01", text: "Only one", author: "Solo" }];
  assert.deepEqual(pickRandomQuote(single, "q-01"), single[0]);
});

test("pickRandomQuote never repeats the same quote twice in a row across 200 consecutive selections", () => {
  let current = pickRandomQuote(QUOTES, null);
  assert.ok(current && current.id, "Initial pick must return a valid quote");

  for (let i = 0; i < 200; i += 1) {
    const next = pickRandomQuote(QUOTES, current.id);
    assert.ok(next && next.id, "Next pick must return a valid quote");
    assert.notEqual(
      next.id,
      current.id,
      `Consecutive duplicate quote '${next.id}' detected on iteration ${i}`
    );
    current = next;
  }
});

test("pickRandomQuote with deterministic rng=0 still avoids currentId", () => {
  const pair = [
    { id: "q-01", text: "First", author: "A" },
    { id: "q-02", text: "Second", author: "B" },
  ];
  const zeroRng = () => 0;
  assert.equal(pickRandomQuote(pair, "q-01", zeroRng).id, "q-02");
  assert.equal(pickRandomQuote(pair, "q-02", zeroRng).id, "q-01");
});

// --- US2: Favorite toggle & list resolution ---

test("isFavorite accurately detects whether a quoteId is in favoriteIds", () => {
  assert.equal(isFavorite(["q-01", "q-03"], "q-01"), true);
  assert.equal(isFavorite(["q-01", "q-03"], "q-02"), false);
  assert.equal(isFavorite([], "q-01"), false);
});

test("toggleFavorite adds an unfavorited quote, removes a favorited quote, and does not mutate input", () => {
  const initial = ["q-01"];
  const afterAdd = toggleFavorite(initial, "q-02");
  assert.deepEqual(afterAdd, ["q-01", "q-02"]);
  assert.deepEqual(initial, ["q-01"], "Input array must not be mutated");

  const afterRemove = toggleFavorite(afterAdd, "q-01");
  assert.deepEqual(afterRemove, ["q-02"]);
});

test("getFavoriteQuotes resolves quote objects in favorite order and ignores unknown IDs", () => {
  const resolved = getFavoriteQuotes(QUOTES, ["q-03", "q-999-missing", "q-01"]);
  assert.equal(resolved.length, 2);
  assert.equal(resolved[0].id, "q-03");
  assert.equal(resolved[1].id, "q-01");
});

// --- US3: Persistence serialization, deserialization & storage resilience ---

test("serializeFavorites and deserializeFavorites round-trip, deduplicate, and filter stale IDs", () => {
  const raw = serializeFavorites(["q-02", "q-05", "q-02"]);
  assert.equal(raw, JSON.stringify(["q-02", "q-05"]));

  const restored = deserializeFavorites(raw, QUOTES);
  assert.deepEqual(restored, ["q-02", "q-05"]);

  const withStale = JSON.stringify(["q-01", "deleted-id", 42, null, "q-04", "q-01"]);
  assert.deepEqual(deserializeFavorites(withStale, QUOTES), ["q-01", "q-04"]);
});

test("deserializeFavorites recovers gracefully from null, corrupted JSON, or non-array payloads", () => {
  assert.deepEqual(deserializeFavorites(null, QUOTES), []);
  assert.deepEqual(deserializeFavorites("", QUOTES), []);
  assert.deepEqual(deserializeFavorites("{not-valid-json", QUOTES), []);
  assert.deepEqual(deserializeFavorites('{"id":"q-01"}', QUOTES), []);
  assert.deepEqual(deserializeFavorites("123", QUOTES), []);
});

test("loadFavorites and saveFavorites persist state and handle storage exceptions safely", () => {
  const store = new Map();
  const mockStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
  };

  assert.deepEqual(loadFavorites(mockStorage, QUOTES), []);
  assert.equal(saveFavorites(mockStorage, ["q-01", "q-03"]), true);
  assert.deepEqual(loadFavorites(mockStorage, QUOTES), ["q-01", "q-03"]);

  const throwingStorage = {
    getItem() {
      throw new Error("SecurityError: storage disabled");
    },
    setItem() {
      throw new Error("QuotaExceededError");
    },
  };

  assert.deepEqual(loadFavorites(throwingStorage, QUOTES), []);
  assert.equal(saveFavorites(throwingStorage, ["q-01"]), false);
});

if (!process.exitCode) {
  console.log(`\nAll ${passed} unit tests passed.`);
}
