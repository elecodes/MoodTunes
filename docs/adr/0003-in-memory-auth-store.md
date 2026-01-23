# 3. Use In-Memory User Store for MVP Authentication

Date: 2025-01-23

## Status

Accepted

## Context

We are implementing a "Mock" but functional full-stack authentication flow to demonstrate security best practices (hashing, validation, JWTs) without the overhead of setting up a persistent database like MongoDB or PostgreSQL for this demo.

## Decision

We will use a simple JavaScript `Map` in `authController.js` to store registered users (`usersDB`).

-   **Keys**: User email.
-   **Values**: User object containing `id`, `username`, and `passwordHash`.

## Consequences

### Positive
-   **Speed**: Zero setup time, no external dependencies (Docker, Mongo).
-   **Demonstration**: Allows demonstrating real `bcrypt` hashing and `jsonwebtoken` issuance.
-   **Simplicity**: Code remains entirely within the Node.js runtime.

### Negative
-   **Persistence**: All user data is lost when the server restarts (`npm run server`).
-   **Scalability**: Not suitable for production or load testing multiple instances.

## Compliance
This decision aligns with the goal of creating a "Self-Contained Demo" while still adhering to OWASP standards for the *logic* (even if the storage is temporary).
