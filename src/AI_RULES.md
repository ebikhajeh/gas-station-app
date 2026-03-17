# AI_RULES

This document defines the operational rules that **any AI assistant must follow when working with this repository**.  
The purpose of this file is to ensure **consistent architecture, safe modifications, predictable behavior, and maintainable code**.

This repository follows a **feature-oriented React + TypeScript architecture using Zustand for state management**.

AI assistants must strictly follow the rules defined below.

---

# 1. General Principles

AI assistants must treat this repository as a **structured production codebase**.

Key principles:

- Respect the **existing architecture and patterns**
- Make **minimal, targeted changes**
- Avoid introducing new patterns without explicit instruction
- Preserve **data flow and separation of concerns**

Core architecture rules:

UI → Selectors → Store → Persistence

Meaning:

- **UI components render data**
- **Selectors compute derived values**
- **Store holds canonical state**
- **Persistence (localStorage or backend) stores state**

AI must **never mix responsibilities across these layers**.

---

# 2. Modification Rules

When modifying existing code, AI must:

1. Read the **entire file first**
2. Understand the **existing pattern**
3. Modify **only the necessary code**
4. Keep formatting consistent
5. Preserve naming conventions

AI must **NOT**:

- Rename variables or fields without instruction
- Move files across folders
- Change architecture patterns
- Replace existing logic with different patterns
- Introduce new libraries

If a change affects multiple files, AI must **identify all impacted files before proposing modifications**.

---

# 3. File Creation Rules

When creating new files, AI must:

- Place files in the **correct feature folder**
- Follow the repository naming conventions
- Avoid duplicating existing logic
- Integrate with existing store and selectors

New files must follow this technology stack:

- React functional components
- TypeScript
- Zustand state management
- Feature-based folder structure

AI must **never introduce**:

- Redux
- Global React Context for app state
- Unstructured utility files

---

# 4. Folder Structure Rules

All features must follow the existing structure.

Example structure:

src/
  features/
    feature-name/
      pages/
      components/
      hooks/
      selectors/
      types/

Folder responsibilities:

pages/ → full page components representing screens  
components/ → reusable UI elements for that feature  
hooks/ → feature-level logic hooks  
selectors/ → derived calculations and business rules  
types/ → TypeScript definitions

AI must **never place feature logic outside the feature folder**.

Global folders such as:

store/  
domain/  
utils/  

must remain **generic and reusable**.

---

# 5. State Management Rules

Global state is handled through **Zustand**.

## Store Responsibilities

The store must contain:

- Raw application data
- Date-keyed entries
- Setter functions
- Persistence logic

The store must **NOT contain**:

- UI formatting
- Business calculations
- Derived totals

## Selector Responsibilities

Selectors must contain:

- Derived calculations
- Totals
- Over / short logic
- Business formulas

Selectors must **NOT modify state**.

Selectors must remain **pure functions**.

## Component Responsibilities

Components must:

- Read values from selectors
- Send updates through store setters

Components must **never perform business calculations directly**.

---

# 6. Component Design Rules

React components must follow this structure:

1. Imports  
2. Types / Interfaces  
3. Store hooks  
4. Derived values  
5. Local UI state  
6. JSX render  

Rules:

- Use **functional components only**
- Avoid deeply nested logic
- Avoid inline business calculations
- Keep components readable and predictable

Complex logic must move to **selectors or hooks**.

---

# 7. Hook Usage Rules

Custom hooks must follow these rules:

- Hook names must start with `use`
- Hooks must live inside `/hooks`
- Hooks encapsulate reusable logic

Hooks may handle:

- reusable interaction logic
- UI synchronization logic
- form state coordination

Hooks must **never mutate store state outside defined setter functions**.

---

# 8. Naming Conventions

All code must follow consistent naming rules.

## Files

Component files  
PascalCase.tsx

Hook files  
useSomething.ts

Selector files  
something.selectors.ts

Type files  
something.types.ts

## Variables

camelCase

## Components

PascalCase

## Hooks

useSomething

## Selectors

computeSomething  
getSomething

---

# 9. Code Safety Rules

AI must **never break the following guarantees**:

- Never break the Zustand store structure
- Never remove existing store fields
- Never modify selector formulas without understanding business logic
- Never introduce side effects inside selectors
- Never break date-keyed storage

Selectors must remain **pure and deterministic**.

Store updates must remain **atomic and predictable**.

---

# 10. Refactoring Rules

AI must **not perform large refactors automatically**.

Refactoring must follow this process:

1. Identify the issue
2. Explain the improvement
3. List impacted files
4. Propose incremental steps

AI must never:

- Rewrite entire components
- Change folder structure
- Change core data models

unless explicitly requested.

---

# 11. Response Format Rules

When proposing code changes, AI must:

1. Clearly list affected files
2. Provide **complete file replacements when necessary**
3. Avoid partial snippets that could cause confusion
4. Preserve formatting and style

All code suggestions must be **copy-paste ready**.

---

# 12. Debugging Process

When analyzing bugs, AI must follow this process:

1. Identify the component where the issue occurs
2. Trace data flow back to selectors
3. Verify store updates
4. Inspect dependencies and effects
5. Only then propose fixes

Debugging must respect architecture:

Component  
→ Selector  
→ Store  
→ Persistence  

Fixes must always be applied **at the correct architectural layer**.

---

# Summary

AI assistants working on this repository must:

- Respect existing architecture
- Maintain predictable state flow
- Separate UI, calculations, and persistence
- Apply safe incremental changes
- Preserve the feature-based structure