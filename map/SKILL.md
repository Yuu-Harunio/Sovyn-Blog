---
name: map
description: Analyze an unfamiliar software repository and create or update a high-signal MAP.md that helps humans and AI agents quickly understand the project's architecture, business domains, code structure, data relationships, security boundaries, operational details, and maintenance paths. Use when onboarding to a repository, taking over an existing project, documenting architecture, preparing a project for AI-agent maintenance, or reducing repeated repository exploration and token consumption.
---

<!-- 本文件为 MAP 技能的英文原版定义，是 Agent skills/MAP.md 的来源模板，仅建立关联、不做内容优化。 -->
<!-- 相关笔记：本技能的中文使用说明见 [[Agent skills/MAP]]。 -->

# Project Map Architect

## Purpose

This skill helps transform an unfamiliar software repository into a practical project knowledge map (`MAP.md`) that enables fast understanding and efficient long-term maintenance by humans and AI agents.

The purpose is not to generate a large amount of documentation.

The purpose is to create a:

- high-signal
- low-token
- evidence-based
- maintenance-oriented

project map.

A good MAP.md should allow an unfamiliar developer or AI agent to quickly understand:

- What is this project?
- What business problems does it solve?
- What are the core modules?
- Where is each capability implemented?
- How does data flow through the system?
- Which files should be modified for a specific change?
- What business rules must be preserved?
- What security boundaries exist?
- Where should debugging start?

The generated MAP.md should become the project's first context source before any future modification.

---

# Reference MAP.md

This skill should include a reference example:

references/MAP.md

This file represents a real project MAP.md written by the author of this skill.

The reference MAP.md should be used as a quality and style reference.

It teaches:

- how much information should be included
- how technical and business information should be combined
- how code locations should be explained
- how modules should be mapped
- how troubleshooting paths should be documented
- how to reduce unnecessary context consumption

The reference MAP.md is NOT a fixed template.

Do not force every project to have identical sections.

Do not copy:

- technologies
- frameworks
- modules
- APIs
- directory structures
- database models
- business concepts
- project-specific terminology

The generated MAP.md structure must be determined by the actual repository.

The reference answers:

"What does a high-quality MAP.md look like?"

It does not answer:

"What exact format must every project follow?"

---

# Core Philosophy

## 1. Truth is more important than completeness

MAP.md is an evidence-based project map.

It is not a design proposal.

It is not a guess about how the project should work.

It must describe the current reality of the repository.

Before documenting any conclusion, inspect available evidence:

Priority order:

1. Source code
2. Build and dependency configuration
3. Database schema and migration files
4. Application configuration
5. Tests
6. Deployment files
7. Existing documentation
8. Reasonable inference

Never invent:

- modules that do not exist
- APIs that were not found
- database relationships without evidence
- business rules based only on naming
- security guarantees without verification
- architecture decisions that are not documented or observable

A smaller accurate MAP.md is better than a large fictional one.

---

## 2. Do not generate content only to satisfy a format

The goal is not to fill every possible section.

Do not create empty sections such as:

- "Frontend Architecture" when no frontend exists
- "Message Queue" when no message queue exists
- "Microservice Design" when the project is a monolith

Do not write:

"Currently no related implementation exists."

unless that absence itself provides maintenance value.

If a topic does not exist or is irrelevant:

omit it.

The MAP.md structure should naturally emerge from the project.

---

## 3. Learn the writing style, not the exact structure

The reference MAP.md demonstrates:

- information density
- organization style
- explanation depth
- navigation philosophy

The generated MAP.md should maintain the same principles.

However, different projects require different maps.

Examples:

A web application may emphasize:

- frontend routes
- backend APIs
- database entities
- user workflows

A machine learning project may emphasize:

- datasets
- pipelines
- models
- experiments
- deployment

A CLI tool may emphasize:

- commands
- modules
- configuration
- execution flow

The Skill should adapt to the repository.

---

## 4. MAP.md is a navigation layer

MAP.md should help answer:

"If I need to modify feature X, where should I start?"

It should connect:

Business concept

↓

User interaction

↓

API or command entry

↓

Core implementation

↓

Data storage or external service

↓

Testing and troubleshooting location

Avoid documenting every file.

Only include files that help future understanding and maintenance.

---

## 5. Optimize for AI-agent context efficiency

The main purpose of MAP.md is reducing repeated repository exploration.

A future agent should not need to:

- scan the whole repository again
- rediscover module boundaries
- search thousands of files for entry points
- rebuild business understanding from source code

Prefer:

- concise tables
- meaningful directory trees
- explicit file paths
- business-to-code mapping
- dependency relationships
- troubleshooting paths

Avoid:

- copied source code
- generic programming explanations
- redundant descriptions
- low-value file listings

---

# Repository Analysis Workflow

## Phase 1: Repository Discovery

First inspect the repository structure.

Analyze:

- root directories
- README files
- build files
- dependency manifests
- application entry points
- backend entry points
- frontend entry points
- database files
- configuration files
- environment templates
- test directories
- deployment files

Ignore:

- dependency folders
- generated files
- build output
- cache directories
- IDE metadata

The objective is understanding the project boundary.

---

## Phase 2: Architecture Reconstruction

Identify:

- project purpose
- primary users
- major business domains
- technology stack
- runtime structure
- frontend/backend boundaries
- service boundaries
- database systems
- external integrations
- deployment model

Describe architecture from evidence.

Do not create architecture diagrams only for appearance.

Only add diagrams when they improve understanding.

---

## Phase 3: Module Discovery

Identify important modules based on:

- directory structure
- routes
- controllers
- services
- entities
- database tables
- UI pages
- tests
- documentation

For each important module determine:

- What problem does it solve?
- Where is the entry point?
- Where is the core logic?
- What data does it use?
- What other modules depend on it?
- What rules must be preserved?

---

## Phase 4: Business Flow Reconstruction

Trace important workflows.

Examples:

- user registration
- authentication
- permission checking
- content creation
- approval workflows
- payment
- contracts
- notifications
- scheduled jobs
- external integrations

Follow the actual execution path:

Frontend or client

↓

API / route / command

↓

Controller / handler

↓

Service / business layer

↓

Repository / data access

↓

Database / external service

Do not stop at the first visible entry point.

# Phase 5: Data Relationship Analysis

Analyze important domain entities and their relationships.

Focus on business-important data relationships rather than listing every database table.

Identify:

- core entities
- ownership relationships
- foreign key relationships
- many-to-many relationships
- important constraints
- sensitive data boundaries
- cross-module data dependencies

Example:

User

↓

owns

↓

House

↓

generates

↓

Contract

↓

creates

↓

Payment

Only document relationships that can be verified from:

- database schema
- ORM/entity definitions
- repository logic
- service implementation
- tests

Do not infer relationships only from naming conventions.

---

# Phase 6: State Machine and Business Invariants

When a system contains lifecycle states, document them.

Examples:

- order lifecycle
- contract lifecycle
- approval workflow
- payment status
- publishing status
- user status

Document:

- available states
- allowed transitions
- transition triggers
- responsible roles or services
- validation rules

Example:

Draft

↓

Pending Review

↓

Approved

↓

Published

↓

Expired

Also identify business invariants.

Examples:

- Only approved content can become publicly visible.
- Only resource owners can modify their resources.
- A payment record should not be generated twice for the same billing period.
- A workflow cannot skip mandatory approval states.

Business invariants are often more valuable to AI agents than individual code locations because they define what must never be broken.

---

# Phase 7: Security Boundary Analysis

Every generated MAP.md should consider security boundaries.

Analyze:

## Authentication

Identify:

- authentication mechanism
- login flow
- token/session handling
- identity propagation

Examples:

- JWT
- Session
- OAuth
- API Key

---

## Authorization

Document:

- roles
- permissions
- protected operations
- administrative capabilities

Do not only describe role-level permissions.

Also analyze object-level authorization.

Example:

Incorrect:

"Landlords can modify houses."

Better:

"Landlords can modify houses only when the house ownership field matches the current authenticated user."

---

## Data Isolation

Check:

- tenant isolation
- ownership filtering
- user-scoped queries
- administrator bypass logic

Important questions:

- Can user A access user B's resources?
- Are sensitive records filtered correctly?
- Are authorization checks performed in the service layer or only the frontend?

---

## Sensitive Boundaries

Document important security-related areas:

- file upload/download
- payment operations
- account management
- administrative APIs
- external integrations
- secret configuration locations

Never copy actual secrets into MAP.md.

---

# Phase 8: Configuration and Deployment Analysis

Identify operationally important files.

Include:

- application configuration
- frontend configuration
- environment templates
- database configuration
- Docker files
- reverse proxy configuration
- CI/CD workflows
- startup commands
- deployment scripts

Document:

- what the file controls
- when it is modified
- what risks exist

Example:

Configuration file:

Purpose:
Database connection and application runtime settings.

Common changes:
Environment migration.

Risk:
Incorrect values may prevent startup.

Never include:

- passwords
- access tokens
- private keys
- production secrets

---

# Phase 9: Testing and Quality Analysis

Identify:

- unit tests
- integration tests
- end-to-end tests
- test configuration
- test commands
- fixtures
- seed data

Document:

- how to validate changes
- which areas have strong coverage
- which areas lack obvious tests

Only mention missing coverage when there is clear evidence.

Do not make unsupported claims.

---

# Phase 10: Troubleshooting Map

A valuable MAP.md should help future maintainers debug common problems.

Use symptom-oriented documentation.

Format:

Problem:

↓

First investigation point:

↓

Related files:

↓

Possible causes:

Example:

Login failure

First check:

Authentication controller

Then check:

- token configuration
- user status validation
- authentication middleware

Possible causes:

- invalid token configuration
- incorrect user state
- authentication flow error

Prioritize:

- frequent problems
- expensive problems
- problems difficult for new developers to locate

---

# Phase 11: Extension Guidance

Document common modification paths.

Examples:

## Adding a new API

Explain:

- where routes/controllers are defined
- where business logic belongs
- where data access is implemented
- where tests should be added

---

## Adding a database field

Explain:

- migration location
- entity/model changes
- validation changes
- frontend impact

---

## Adding a new business module

Explain:

- recommended module location
- dependency rules
- integration points

---

## Changing permissions

Explain:

- authentication layer
- authorization layer
- ownership checks
- affected modules

---

# Phase 12: Known Issues and Technical Debt

Only document verified issues.

Classify findings:

## Confirmed

Directly observed from code or configuration.

Example:

"Payment service contains duplicated calculation logic."

---

## To Verify

Potential issue requiring additional investigation.

Example:

"Some read endpoints may require additional ownership validation."

---

## Technical Debt

Known maintainability concerns.

Examples:

- duplicated code
- outdated dependencies
- missing tests
- complex modules

---

## Security Risk

Only include when supported by evidence.

Examples:

- exposed secrets
- missing authorization checks
- unsafe input handling

Do not turn assumptions into security findings.

---

# MAP.md Structure Guidelines

The generated MAP.md should adapt to the project.

Possible sections:

- Project Overview
- Architecture Overview
- Repository Structure
- Backend Structure
- Frontend Structure
- Business Capability Map
- Data Model
- Workflow and State Machine
- Dependency Map
- Security Boundary
- Configuration
- Deployment
- Testing
- Troubleshooting
- Extension Guide
- Known Issues

Not every project needs all sections.

The final structure should maximize maintenance value.

---

# Information Priority Rules

## High Priority Information

Always consider including:

- project purpose
- major modules
- important entry points
- business workflows
- key files
- data relationships
- security boundaries
- configuration boundaries
- troubleshooting paths

---

## Medium Priority Information

Include when valuable:

- scheduled tasks
- background workers
- message queues
- external services
- performance-sensitive areas
- extension points
- technical debt

---

## Low Priority Information

Usually avoid:

- explaining common programming concepts
- listing every file
- describing obvious folders
- repeating framework documentation
- copying source code

---

# Token Optimization Principles

MAP.md exists to reduce future context consumption.

Follow these rules:

- Prefer tables over long explanations.
- Prefer compact trees over directory dumps.
- Describe why a file matters, not only its name.
- Avoid repeating the same information.
- Keep one authoritative description for each module.
- Use references instead of duplication.
- Do not include generated files.
- Do not include unnecessary implementation details.

For large projects:

Use layered documentation.

Example:

MAP.md

↓

docs/maps/

- backend-map.md
- frontend-map.md
- domain-user.md
- domain-payment.md

The root MAP.md should remain the entry point.

---

# Final Quality Checklist

Before completing MAP.md, verify:

## Accuracy

- All referenced files exist.
- All described modules exist.
- All important relationships are evidence-based.
- No secrets are exposed.
- No assumptions are written as facts.

## Usefulness

A new developer should quickly answer:

- What is this project?
- Where is the code?
- How does a feature work?
- What files should change?
- What rules must not break?

## Agent Readiness

An AI agent should be able to:

- identify the relevant module
- locate implementation files
- understand dependencies
- understand permissions
- understand important business rules
- avoid unnecessary repository scanning

## Maintainability

The MAP.md should:

- remain concise
- avoid duplication
- avoid stale information
- be easy to update after architecture changes

---

# Agent Quick Start

Every generated MAP.md should include a short final section:

## Agent Quick Start

Before modifying this project:

1. Read MAP.md first.
2. Identify the related business capability.
3. Follow the mapped implementation path.
4. Check data relationships and authorization rules.
5. Understand state transitions and business invariants.
6. Modify the smallest correct layer.
7. Run relevant tests.
8. Update MAP.md when architecture, modules, or important business flows change.

---

# Final Principle

A high-quality MAP.md is not:

A complete copy of the repository.

A high-quality MAP.md is:

A compact cognitive map that allows humans and AI agents to understand, navigate, modify, and maintain the project efficiently.

The target outcome:

High Signal

+

Low Token Cost

+

Evidence Based

+

Business Aware

+

Maintenance Friendly
