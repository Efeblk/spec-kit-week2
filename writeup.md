# Week 2 — Spec-Driven Development with GitHub Spec Kit (`writeup.md`)

## 1. Environment & Initialization Metadata

- **Specify CLI Version**: `1.2.1` (installed via `uv tool install specify-cli` under Python `3.12.11` on Windows AMD64)
- **Integration Key Used**: `gemini` (installs `.gemini/commands/speckit.*.toml` prompt definitions)
- **Script Type**: `ps` (PowerShell scripts in `.specify/scripts/powershell/`)
- **Initialization Command**:
  ```powershell
  specify init week2-spec-kit --integration gemini --non-interactive --ignore-agent-tools --script ps
  ```
  *(Note: `specify init` v1.2.1 does not create a nested `.git` repository unless `--extension git` is passed, so no nested git repository was created inside `week2-spec-kit/`.)*

---

## 2. Exact Prompts / Arguments Given to Each Stage

Each stage in `.gemini/commands/speckit.<stage>.toml` was executed in order with the following arguments:

| Stage | Command File | Exact Prompt / Arguments Passed | Primary Artifact(s) Produced |
|-------|--------------|---------------------------------|------------------------------|
| **1. Constitution** | `.gemini/commands/speckit.constitution.toml` | `"Create principles focused on code quality, testing, and maintainability."` | `.specify/memory/constitution.md` (v1.0.0) |
| **2. Specify** | `.gemini/commands/speckit.specify.toml` | `"A quote-of-the-day page: one random quote from a built-in list, a "New quote" button, and favoriting that persists across reloads."` | `specs/001-quote-of-the-day/spec.md`, `specs/001-quote-of-the-day/checklists/requirements.md`, `.specify/feature.json` |
| **3. Plan** | `.gemini/commands/speckit.plan.toml` | `"Use plain HTML/CSS/JavaScript, no backend; persist favorites in localStorage."` | `specs/001-quote-of-the-day/plan.md`, `research.md`, `data-model.md`, `contracts/ui-contract.md`, `quickstart.md` |
| **4. Tasks** | `.gemini/commands/speckit.tasks.toml` | *(no arguments)* | `specs/001-quote-of-the-day/tasks.md` (`T001`–`T013`) |
| **5. Implement (Round 1)** | `.gemini/commands/speckit.implement.toml` | *(no arguments)* | `index.html`, `styles.css`, `src/quotes.js`, `src/app.js`, `tests/quotes.test.js`, `.gitignore` |
| **6. Converge (Round 1)** | `.gemini/commands/speckit.converge.toml` | *(no arguments)* | Appended `Phase 7: Convergence` (`T014`) to `specs/001-quote-of-the-day/tasks.md` |
| **7. Implement (Round 2)** | `.gemini/commands/speckit.implement.toml` | *(no arguments)* | Completed `T014` in `src/quotes.js`, `tests/quotes.test.js`, and marked `[X]` in `tasks.md` |
| **8. Converge (Round 2)** | `.gemini/commands/speckit.converge.toml` | *(no arguments)* | Reported `✅ Converged` (`tasks.md` left byte-for-byte unchanged) |

---

## 3. Spec Refinement Before / After & How It Changed the Output

During the human review gate immediately after `/speckit.specify`, the initial generated specification was saved to [`notes/spec-before.md`](notes/spec-before.md) before refining [`specs/001-quote-of-the-day/spec.md`](specs/001-quote-of-the-day/spec.md).

### What Was Vague or Incomplete in `notes/spec-before.md` (Before)

1. **Ambiguous "random" quote selection (`FR-003` & `US1/AC2`)**:
   - *Before*: `FR-003` stated: *"System MUST provide a 'New quote' button that selects and displays a random quote from the built-in collection when activated."*
   - *Problem*: Pure uniform random selection over a small list of 8–10 quotes has a 10%–12.5% probability on every click of picking the exact same quote that is already displayed, making the **"New quote"** button appear broken to the user.
2. **Underspecified Favorite UI & Unfavoriting from the Saved List (`FR-005`, `FR-006`, `US2`)**:
   - *Before*: `FR-005` and `FR-006` mentioned showing a favorites section and a visual indicator on the toggle button, without specifying how a user removes a saved quote without waiting for it to appear randomly again, whether a favorites count is shown, or what accessible state attribute (`aria-pressed`) and labels (`♥ Favorited` vs `♡ Favorite`) the toggle button uses.
3. **Stale / Duplicate Quote IDs in `localStorage` (`FR-007` & Edge Cases)**:
   - *Before*: `FR-007` required persisting favorites across reloads, and the edge cases only mentioned corrupted storage, not what happens if `localStorage` contains stale quote IDs (from removed/renamed quotes) or duplicate IDs.

### How `specs/001-quote-of-the-day/spec.md` Was Refined (After)

- **Non-Repeating Random Selection (`US1/AC2`, `FR-003`, `SC-002`)**: Updated `FR-003` to require that activating **"New quote"** *never selects the currently displayed quote consecutively whenever the built-in collection has >= 2 quotes* (while handling a 1-quote collection safely without infinite loops), and added `SC-002` (0% consecutive repeats across 100 activations).
- **Explicit Favorite UI & Direct List Removal (`US2/AC1–AC3`, `FR-005`, `FR-006`)**: Specified `aria-pressed="true"` / `"false"`, `♥ Favorited` vs `♡ Favorite` labels, a live `#favorites-count` badge, and a per-item **"Remove"** button inside the Favorites list that also synchronizes `#favorite-btn` if the removed quote is currently displayed.
- **Stale ID Filtering & Deduplication (`FR-007` & Edge Cases)**: Specified that deserializing persisted favorite IDs must filter out any ID not present in the built-in `QUOTES` collection and deduplicate IDs while preserving order.

### How This Refinement Changed Downstream Artifacts & Code

- **In `plan.md`, `research.md`, `data-model.md`, and `contracts/ui-contract.md`**:
  - `pickRandomQuote(quotes, currentId, rng)` was designed with an explicit `currentId` exclusion parameter (`quotes.filter(q => q.id !== currentId)`) and an injectable `rng` function for deterministic testing.
  - `deserializeFavorites(rawJson, validQuotes)` was designed to cross-check loaded IDs against `validQuotes` (`new Set(validQuotes.map(q => q.id))`) and deduplicate entries.
  - `contracts/ui-contract.md` locked in `#favorites-count`, `#favorite-btn[aria-pressed]`, and `.remove-favorite-btn[data-quote-id]`.
- **In `tasks.md`, `src/quotes.js`, `src/app.js`, and `tests/quotes.test.js`**:
  - Generated dedicated tasks (`T004`, `T005`, `T009`, `T010`, `T011`) and unit tests verifying 200 consecutive non-repeating random picks, deterministic `rng=0` avoidance of `currentId`, stale ID filtering (`"q-999-missing"`), and delegated click handling for `.remove-favorite-btn`.

---

## 4. Convergence Outcome

Convergence required **2 rounds** of `implement → converge`:

- **Round 1 (`/speckit.converge`) — `tasks_appended` (1 finding)**:
  - Assessed all 7 functional requirements (`FR-001`–`FR-007`), 4 success criteria (`SC-001`–`SC-004`), 7 acceptance scenarios (`US1`–`US3`), 5 constitution principles, and `data-model.md` constraints.
  - **Finding `F1` (`partial`, `LOW`, source: `data-model.md: Quote.text constraints`)**: Quote `q-09` in `src/quotes.js` (`" The bearing of a child..."`) had a leading space inside the string literal, causing the rendered `<blockquote>` to show a space right after the opening quotation mark, and `tests/quotes.test.js` only checked `q.text.trim().length > 0` rather than `q.text === q.text.trim()`.
  - Appended `## Phase 7: Convergence` with task `T014` to `specs/001-quote-of-the-day/tasks.md`.
- **Round 2 (`/speckit.implement` → `/speckit.converge`) — `✅ Converged`**:
  - Executed `T014`: removed the leading whitespace on `q-09.text` in `src/quotes.js`, added strict `assert.equal(q.text, q.text.trim())` and `assert.equal(q.author, q.author.trim())` assertions in `tests/quotes.test.js`, and re-ran `node tests/quotes.test.js` (all 11 tests passed).
  - Re-ran `/speckit.converge`: **0 findings** across all requirements, acceptance criteria, data model constraints, UI contracts, and constitution principles. `tasks.md` was left byte-for-byte unchanged and convergence was declared complete.

---

## 5. What I Learned

Going through eight stages of docs for a 100-line quote page felt like total overkill, especially when one full review round only caught a stray space. Where it actually paid off was realizing early on that a truly "random" button might show the same quote twice in a row and look broken. Fixing that rule in the spec meant the solution carried straight into the code and tests without any messy rework.
