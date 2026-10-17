# Feature Specification: Quote of the Day

**Feature Branch**: `001-quote-of-the-day`

**Created**: 2026-10-17

**Status**: Approved

**Input**: User description: "A quote-of-the-day page: one random quote from a built-in list, a "New quote" button, and favoriting that persists across reloads."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View and Cycle Non-Repeating Random Quotes (Priority: P1)

Visitors opening the page immediately see an inspiring or thought-provoking quote along with its author from a built-in collection, and can click a "New quote" button at any time to display a different randomly chosen quote without seeing the exact same quote twice in a row.

**Why this priority**: Displaying a random quote and letting the user cycle through quotes is the foundational value proposition of a quote-of-the-day page; preventing consecutive duplicates ensures the "New quote" button never feels broken.

**Independent Test**: Can be fully tested by loading the page to verify a quote and author appear, then clicking the "New quote" button repeatedly (e.g., 20 times in a row) to confirm that every click transitions to a quote different from the immediately preceding one.

**Acceptance Scenarios**:

1. **Given** the user opens the page for the first time, **When** the page finishes loading, **Then** one quote and its author from the built-in list are displayed in the main quote area.
2. **Given** a quote is currently displayed on the page and the built-in list has at least 2 quotes, **When** the user activates the "New quote" button, **Then** a randomly selected quote from the built-in list is displayed that is guaranteed not to be the same quote that was just displayed.

---

### User Story 2 - Mark, Unmark, and Manage Favorite Quotes (Priority: P2)

Visitors can mark the currently displayed quote as a favorite (or unmark it if it is already a favorite), view a live count and list of their saved favorite quotes on the page, and remove any favorite directly from the favorites list.

**Why this priority**: Favoriting provides personal curation and interactive engagement on top of basic quote viewing, and direct removal from the favorites list lets users manage their collection without waiting for a quote to reappear randomly.

**Independent Test**: Can be tested by clicking the favorite toggle button on the current quote, verifying that the button visual state (`aria-pressed="true"` and heart icon/label) updates and the quote appears in the favorites list with an updated count, and then removing it either via the main toggle button or the item's "Remove" button in the favorites list.

**Acceptance Scenarios**:

1. **Given** a quote is displayed and is not currently marked as a favorite, **When** the user activates the favorite toggle button, **Then** the quote is marked as a favorite, the button updates to `aria-pressed="true"` with an active label/icon, the favorites count increments, and the quote (text and author) is listed in the favorites section.
2. **Given** a quote is currently marked as a favorite, **When** the user activates the main favorite toggle button, **Then** the quote is unmarked as a favorite (`aria-pressed="false"`), the favorites count decrements, and the quote is removed from the favorites section.
3. **Given** one or more quotes are listed in the favorites section, **When** the user clicks the "Remove" button next to a favorited quote in the list, **Then** that quote is removed from favorites, the favorites count updates, and if that quote is currently displayed in the main card, its favorite toggle button immediately updates to the unfavorited state (`aria-pressed="false"`).

---

### User Story 3 - Persist Favorites Across Page Reloads (Priority: P3)

Visitors who have marked one or more quotes as favorites can reload or revisit the page in the same browser and still see their favorited quotes preserved and accurately reflected on the page.

**Why this priority**: Persistence ensures user curation is durable across browser sessions rather than lost on refresh.

**Independent Test**: Can be tested by marking two quotes as favorites, reloading the page, and verifying both quotes remain in the favorites section in order and show an active favorite indicator when displayed as the current quote.

**Acceptance Scenarios**:

1. **Given** the user has marked one or more quotes as favorites, **When** the user reloads the page, **Then** all previously favorited quotes that exist in the built-in list remain displayed in the favorites list with the accurate count.
2. **Given** a persisted favorite quote is selected as the currently displayed quote, **When** it renders in the main quote display, **Then** the favorite toggle button immediately reflects its favorited status (`aria-pressed="true"`).

---

### Edge Cases

- **Consecutive random selection**: When the built-in quote list contains 2 or more quotes, selecting a "New quote" MUST exclude the currently displayed quote so the same quote never appears twice in a row. If the list contains only 1 quote, it returns that single quote without entering an infinite loop.
- **Empty favorites state**: When the user has 0 favorited quotes, an explicit empty-state message ("No favorite quotes yet. Mark a quote as a favorite to save it here!") is shown in the favorites section and the count displays `0`.
- **Stale or removed quote IDs in storage**: If persisted storage contains quote IDs that no longer exist in the built-in quote list (or duplicate IDs), the system MUST filter out unrecognized IDs and deduplicate valid IDs upon load so ghost entries never render.
- **Inaccessible or corrupted storage data**: If browser storage contains invalid JSON, non-array data, or throws a security/quota exception, the application MUST fall back gracefully to an empty favorites list without crashing or blocking quote viewing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST include a built-in collection of at least 8 distinct quotes, each with a unique string `id`, `text`, and `author` attribution.
- **FR-002**: System MUST display one randomly selected quote (text and author) from the built-in collection upon initial page load.
- **FR-003**: System MUST provide a "New quote" button that selects and displays a random quote from the built-in collection while guaranteeing that the newly selected quote is never identical to the currently displayed quote (whenever the collection size is >= 2).
- **FR-004**: System MUST provide a favorite toggle button for the currently displayed quote that adds the quote ID to the user's favorites if not present, or removes it if already present.
- **FR-005**: System MUST visually and semantically indicate on the favorite toggle button whether the currently displayed quote is favorited, using `aria-pressed="true"` / `aria-pressed="false"`, distinct visual styling, and clear button text/iconography (e.g., `♥ Favorited` vs `♡ Favorite`).
- **FR-006**: System MUST display a dedicated Favorites section showing the total count of favorited quotes, each favorited quote's text and author, a per-item "Remove" button to unfavorite directly from the list, and a friendly empty-state message when no quotes are favorited.
- **FR-007**: System MUST persist the list of favorited quote IDs across page reloads in browser storage, deduplicating IDs, ignoring unknown quote IDs that are not in the built-in collection, and recovering gracefully from corrupted or unavailable storage.

### Key Entities

- **Quote**: Represents a single quotation in the built-in list, comprising a unique string `id`, non-empty `text` (the quotation body), and non-empty `author` (the attributed speaker or source).
- **FavoriteState**: Represents the ordered, deduplicated list of valid quote `id` strings marked as favorites by the user and persisted across reloads.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users see an initial quote and author rendered within 100 milliseconds of opening the page.
- **SC-002**: Across 100 consecutive activations of "New quote" (with >= 2 built-in quotes), 0% of transitions repeat the immediately preceding quote.
- **SC-003**: 100% of valid favorited quotes remain intact and visible in the favorites list after a full page reload, and toggling or removing a favorite updates both the main card and favorites list in under 50 milliseconds.
- **SC-004**: The application operates with zero unhandled runtime errors across normal usage and when storage contains malformed JSON, non-array payloads, or stale quote IDs.

## Assumptions

- The built-in list of quotes is static and shipped directly with the client application (no external API or database required).
- Favorites are scoped to the user's current browser profile via client-side storage; cross-device synchronization and user accounts are out of scope.
- Standard modern web browsers with JavaScript enabled are used to view the page.
