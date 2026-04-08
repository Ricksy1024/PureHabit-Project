<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- List of modified principles:
  - Added new principle: AI Agent Tooling (MCP Usage Constraints)
- Added sections: None
- Removed sections: None
- Templates requiring updates (✅ updated / ⚠ pending):
  ✅ .specify/templates/plan-template.md
  ✅ .specify/templates/spec-template.md
- Follow-up TODOs: None
-->

# PureHabit Backend Constitution

## Core Principles

### I. Security First
Authentication must strictly use TOTP (Authenticator App) based Two-Factor Authentication (2FA). SMS-based authentication is strictly prohibited.

### II. Strict Data Protection (GDPR)
When a user account is deleted, a complete, irreversible, cascading "Hard Delete" must be applied to all database records and the Auth account itself. 

### III. User-Centric Synchronization
During data sync, users must never lose a recorded habit completion. In case of conflicts, the "Logical OR" principle applies instead of the traditional "Last Write Wins".

### IV. Coding Standards
Modular, clean Node.js code, proper handling of asynchronous operations (Promises/async-await), and strict adherence to Firebase Cloud Functions best practices.

### V. Testability
Synchronization logic and streak calculations must be written in an isolated manner, fully coverable by unit tests.

### VI. AI Agent Tooling
To effectively navigate and implement the stack, the AI agent MUST use the Context7 MCP server for retrieving all software documentation. The agent MUST use the Firebase MCP server directly for executing Firebase actions.

## Governance

- All updates to the core synchronization logic or data retention models MUST be reviewed against this Constitution.
- Amendments to this constitution must increment the version number following Semantic Versioning (MAJOR for breaking changes, MINOR for additions, PATCH for clarifications).
- All Code Reviews MUST verify compliance with these core principles before merging.

**Version**: 1.1.0 | **Ratified**: 2026-04-08 | **Last Amended**: 2026-04-08
