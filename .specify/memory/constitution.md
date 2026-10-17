<!--
Sync Impact Report:
- Version change: 0.0.0 (unfilled template) -> 1.0.0
- Modified principles:
  - [PRINCIPLE_1_NAME] -> I. Separation of Pure Logic and DOM
  - [PRINCIPLE_2_NAME] -> II. Automated Unit Testing (NON-NEGOTIABLE)
  - [PRINCIPLE_3_NAME] -> III. Zero External Dependencies & Simplicity
  - [PRINCIPLE_4_NAME] -> IV. Defensive Persistence & State Integrity
  - [PRINCIPLE_5_NAME] -> V. Accessible & Semantic Markup
- Added sections:
  - Technical & Quality Constraints
  - Development Workflow & Quality Gates
- Removed sections: None
- Follow-up TODOs: None
-->

# Week 2 Spec Kit Constitution

## Core Principles

### I. Separation of Pure Logic and DOM
All core business logic—including quote selection, non-repeating random algorithms, favorite state toggling, and storage serialization—MUST be implemented as pure, deterministic functions decoupled from DOM manipulation and browser globals. UI event handlers MUST act strictly as thin bindings between DOM elements and pure logic modules.
*Rationale*: Isolating business logic from browser APIs ensures that core behavior can be verified directly under Node.js without headless browser overhead, improving maintainability and debuggability.

### II. Automated Unit Testing (NON-NEGOTIABLE)
Every pure logic function MUST be covered by automated unit tests runnable via Node.js (`node --test` or a standalone Node assertion script). Tests MUST verify normal execution paths and edge cases—specifically that random selection never picks the same quote twice in a row when multiple quotes exist, that toggling favorites adds and removes accurately, and that persistence serialization/deserialization handles empty or corrupted state gracefully.
*Rationale*: Executable specifications prevent regressions and prove that core requirements are satisfied before manual UI inspection.

### III. Zero External Dependencies & Simplicity
The application MUST be built using plain HTML, CSS, and standard JavaScript (ES6+) with zero runtime frameworks, build bundlers, or external libraries. Code MUST follow YAGNI (You Aren't Gonna Need It) principles, avoiding unrequested features, over-engineered abstractions, or unnecessary configuration files.
*Rationale*: Keeping the stack minimal eliminates dependency churn, build failures, and hidden complexity for a static client-side application.

### IV. Defensive Persistence & State Integrity
All interactions with `localStorage` MUST be wrapped in defensive error handling (`try/catch`) and validate parsed JSON structures before use. If stored favorite data is missing, malformed, or references stale identifiers, the application MUST recover gracefully to a clean default state without throwing unhandled exceptions.
*Rationale*: Browser storage can be cleared, blocked, or corrupted by external factors; resilient state handling guarantees uninterrupted user experience.

### V. Accessible & Semantic Markup
HTML markup MUST use semantic elements (`<main>`, `<blockquote>`, `<button>`, `<section>`) and explicit accessibility attributes (such as `aria-pressed` or clear state labels on favorite controls) so that screen readers and keyboard navigation operate predictably.
*Rationale*: Semantic structure improves both user accessibility and automated DOM inspection clarity.

## Technical & Quality Constraints

- **Runtime Environment**: Modern evergreen browsers for UI; Node.js (v18+) for executing automated unit tests.
- **Module Compatibility**: Logic files MUST be structured so they can be imported by both browser scripts and Node.js test runners without a build step.
- **Code Style**: Functions MUST be small, single-purpose, and clearly named. Magic strings (such as storage keys) MUST be defined as named constants.

## Development Workflow & Quality Gates

1. **Spec-First Discipline**: No application code may be written or modified before `spec.md`, `plan.md`, and `tasks.md` are generated and reviewed.
2. **Refinement Over Workarounds**: When an ambiguity or defect is discovered in requirements or design, the specification or plan MUST be updated first before propagating changes to tasks and code.
3. **Verification Gate**: Implementation is only considered complete when all unit tests pass with zero errors and `/speckit.converge` confirms zero remaining gaps against the specification, plan, and constitution.

## Governance

This Constitution supersedes ad-hoc implementation shortcuts within `week2-spec-kit`. Amendments require updating `.specify/memory/constitution.md`, incrementing the semantic version (`MAJOR` for principle removals/redefinitions, `MINOR` for new principles/sections, `PATCH` for clarifications), and re-evaluating downstream artifacts (`plan.md`, `tasks.md`). All implementation reviews and convergence checks MUST verify compliance with Principles I through V.

**Version**: 1.0.0 | **Ratified**: 2026-10-17 | **Last Amended**: 2026-10-17
