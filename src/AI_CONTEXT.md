# AI_CONTEXT

This document provides **architectural and operational context** for AI assistants working on this repository.

The purpose of this file is to help AI systems quickly understand **how the project works, how data flows, and how new changes should be integrated safely**.

---

# Project Overview

This project is a **daily operational tracking system for a retail / gas station environment**.

The system allows staff to record operational data for each business day and verify that **physical counts match POS records**.

The application helps detect operational discrepancies such as:

- inventory mismatches
- incorrect cash drops
- POS vs physical count differences
- over / short balances

Each day's data is stored independently using a **date-keyed model**.

---

# Core Technologies

The project uses the following technologies:

React  
TypeScript  
Zustand  
Feature-based architecture  
LocalStorage persistence (current implementation)

Future versions may introduce:

Backend API  
Database persistence  
Server validation

The architecture is intentionally designed to support **future backend expansion**.

---

# Architectural Layers

The project follows a **strict layered architecture**:

UI Components  
↓  
Selectors (Derived Calculations)  
↓  
Zustand Store (Source of Truth)  
↓  
Persistence Layer

Layer responsibilities:

UI → renders data and captures input  
Selectors → compute derived results  
Store → holds canonical state  
Persistence → stores state externally

These responsibilities must **never be mixed**.

---

# Data Model

The primary domain object is:

DailyEntry

DailyEntry represents **all operational data recorded for a single day**.

Entries are stored using a date-keyed structure:

Record<DateKey, DailyEntry>

Where:

DateKey = "YYYY-MM-DD"

This structure allows fast switching between operational days.

---

# Feature Architecture

The application is organized using a **feature-based structure**.

Each operational module lives in its own feature directory.

Example:

src/features/

fuel/  
lotto/  
cigarettes/  
cash/  
prepaid/  
summary/

Each feature contains its own:

pages  
components  
hooks  
selectors  
types

This design keeps logic **localized and maintainable**.

---

# Selectors

Selectors compute **derived values** from raw store data.

Examples include:

- totals
- reconciliation calculations
- over / short detection
- comparisons between POS numbers and physical counts

Selectors must always be:

pure  
deterministic  
stateless

Selectors must **never modify store state**.

---

# Store Design

The global state is implemented using **Zustand**.

Store responsibilities:

- hold canonical operational data
- expose setter functions
- persist data

The store must remain **simple and predictable**.

Business calculations must **never live inside the store**.

---

# Component Philosophy

React components in this project follow a strict rule:

Components handle **presentation only**.

Components should:

display values  
capture user input  
send updates through store setters

Components should not perform:

complex calculations  
business logic  
data transformations

Those responsibilities belong to selectors or hooks.

---

# Hooks

Custom hooks encapsulate **reusable feature logic**.

Examples include:

data synchronization  
input management  
shared UI interaction logic

Hooks help keep components small and readable.

---

# Input Handling Strategy

Many inputs support **decimal values and temporary typing states**.

For example:

12  
12.  
12.5

To prevent input interruption:

- UI keeps local input state
- Store stores numeric values

This prevents typing issues such as **dot removal or cursor reset**.

---

# Status System

Most operational tabs compute a **status indicator**.

Possible statuses:

missing  
check  
ok

Meaning:

missing → no values entered  
check → partial data entered  
ok → values complete and balanced

Status values are computed through selectors.

---

# Over / Short Logic

Detecting discrepancies is a core feature of the system.

Over / Short values represent differences between:

- POS totals
- physical counts
- cash drops
- inventory data

Selectors compute these values.

The UI simply displays them.

---

# End Of Day Summary

The **End Of Day page** aggregates data from multiple modules.

Examples include:

cash totals  
cash drops  
lotto payouts  
inventory differences  
terminal totals

Selectors combine data across modules to produce final reconciliation results.

---

# Navigation Model

Users interact with the system by:

1. selecting a date
2. navigating through operational tabs
3. entering daily data
4. reviewing reconciliation results

Each tab contributes data to the **daily operational record**.

---

# Persistence Layer

Currently the system persists data to:

localStorage

Data is stored per date key.

Future architecture may introduce:

REST APIs  
database persistence  
server synchronization

The codebase must remain compatible with **backend migration**.

---

# Design Philosophy

The architecture emphasizes:

predictable state  
deterministic calculations  
clear separation of responsibilities  
feature isolation  
maintainable structure

The system prioritizes **operational reliability over architectural experimentation**.

---

# AI Expectations

AI assistants working on this repository must:

- understand the layered architecture
- respect the feature-based structure
- preserve store integrity
- keep selectors pure
- ensure UI remains responsive
- produce incremental safe changes

Large architectural changes should **never be introduced automatically**.

AI must always maintain **consistency with the existing system design**.