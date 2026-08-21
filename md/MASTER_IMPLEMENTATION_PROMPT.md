# CYBERESCAPE — MASTER IMPLEMENTATION PROMPT

## Role

You are an experienced full-stack web developer, game developer, UI/UX designer, system architect, database designer, QA tester, and technical documentation specialist.

Your task is to develop and improve:

**CyberEscape: A Game-Based Cybersecurity Escape Room with Puzzle Validation Algorithm**

Do not treat this as a simple static prototype. Build it as a complete, organized, maintainable system.

---

# 1. FIRST INSTRUCTION — READ THE MD FOLDER

Before modifying or generating any code, inspect the project's:

`/md/`

folder.

Read **ALL `.md` files** contained inside it, including:

* `Error Handling Guidelines.md`
* `Project Architecture Guidelines.md`
* `Development and Design Guardrails.md`
* `Modern UI-UX Design Guidelines.md`
* `Modern UI Development Skill.md`
* Any additional `.md` guideline files added later

Treat these files as project implementation rules.

Do not ignore a guideline simply because the current implementation does not follow it.

If two instructions conflict, prioritize:

1. This `MASTER_PROMPT.md`
2. Project architecture and security requirements
3. Development/design guardrails
4. UI/UX guidelines
5. Existing implementation

---

# 2. ANALYZE BEFORE CODING

Before making changes:

* Inspect the complete project structure.
* Identify the frontend architecture.
* Identify the backend architecture.
* Identify the authentication system.
* Identify the database structure.
* Identify existing Admin, Teacher, and Student features.
* Identify reusable components.
* Identify incomplete pages.
* Identify broken functionality.
* Identify placeholder/demo functionality.
* Identify duplicated code.
* Identify security problems.
* Identify UI/UX inconsistencies.
* Identify features required by the `.md` guidelines but not yet implemented.

Do not immediately rewrite the entire project.

Preserve working functionality whenever possible.

---

# 3. IMPLEMENTATION CHECKLIST

Create and maintain:

`/md/IMPLEMENTATION_CHECKLIST.md`

Use this file to track implementation progress.

Use the following statuses:

* `[x] COMPLETED`
* `[ ] PENDING`
* `[~] ONGOING`
* `[-] SKIPPED`
* `[!] BLOCKED`

Organize the checklist into:

## Project Architecture

## Authentication

## Admin Features

## Teacher Features

## Student Features

## CyberEscape Gameplay

## Puzzle Validation

## Database

## API

## Security

## Error Handling

## UI/UX

## Responsive Design

## Accessibility

## Testing

## Performance

## Final Cleanup

For every important requirement found in the `.md` files, create a corresponding checklist item.

Update the checklist as implementation progresses.

Never mark an item COMPLETED unless it is actually implemented and verified.

For SKIPPED or BLOCKED items, include a short reason.

---

# 4. SYSTEM USERS

CyberEscape has exactly three primary roles:

### ADMIN

The Admin has full administrative control over the system.

The Admin should be able to:

* Access the Admin Dashboard
* Create Teacher accounts
* Create Student accounts
* Manage users
* Activate/deactivate accounts
* View system statistics
* Monitor game activity
* Manage cybersecurity rooms
* Manage puzzles
* Manage difficulty levels
* View student progress
* View scores
* View leaderboard data
* View reports
* View activity/audit logs
* Manage system settings

---

### TEACHER

The Teacher is primarily responsible for monitoring students and their CyberEscape performance.

The Teacher should be able to:

* Access the Teacher Dashboard
* View assigned students
* Monitor student progress
* View completed rooms
* View current room
* View scores
* View attempts
* View hints used
* View completion times
* View performance results
* View cybersecurity learning progress
* View reports when permitted

IMPORTANT:

The Teacher **must NOT generate a game code for students to enter the game**.

Remove or do not implement teacher-generated room/game access codes unless explicitly requested later.

Students should access authorized CyberEscape gameplay through the system's normal authentication and access-control flow.

---

### STUDENT

The Student is the player.

The Student should be able to:

* Log in securely
* Access the Student Dashboard
* Start CyberEscape
* Enter available rooms
* Read scenarios and instructions
* Solve cybersecurity puzzles
* Submit answers
* Receive immediate feedback
* Use available hints
* See remaining attempts
* See the timer
* Earn scores
* Unlock rooms
* View progress
* View achievements
* View leaderboard position
* View lessons learned after puzzles
* Continue unfinished gameplay when supported

Students must not have access to Admin or Teacher functions.

---

# 5. CYBERESCAPE GAMEPLAY

The system is a game-based cybersecurity escape room.

Gameplay should support cybersecurity topics such as:

* Phishing detection
* Password security
* Malware identification
* Social engineering
* Data protection
* Encryption/decryption
* Safe browsing
* Incident response

The system should contain multiple rooms with increasing difficulty.

Possible levels:

* Easy
* Medium
* Hard

Each room should contain:

* Room title
* Difficulty
* Cybersecurity topic
* Objective
* Scenario/story
* Instructions
* Puzzle/question
* Choices or interactive solution
* Validation
* Hint
* Attempts
* Timer when applicable
* Score
* Immediate feedback
* Explanation
* Lesson learned
* Completion status
* Next-room unlocking

---

# 6. PUZZLE VALIDATION

Implement a **Rule-Based Puzzle Validation Algorithm**.

Puzzle validation should determine whether the player's submitted solution satisfies the predefined rules for that puzzle.

Validation may include:

* Correct-answer matching
* Required cybersecurity indicators
* Pattern matching
* Multiple conditions
* Ordered actions
* Required selections
* Valid password conditions
* Phishing indicators
* Malware classification
* Decryption results
* Incident-response sequence

Do not pretend to use AI-based adaptive learning if the project specification does not require it.

---

# 7. FRONTEND

Use the project's existing frontend architecture.

When the current project uses:

* React
* Vite
* Tailwind CSS

continue using those technologies unless a migration is explicitly required.

Follow the rules inside:

`Modern UI Development Skill.md`

and

`Modern UI-UX Design Guidelines.md`

The UI should be:

* Modern
* Professional
* Cybersecurity-themed
* Consistent
* Responsive
* Accessible
* Easy to navigate
* Appropriate for a thesis/capstone presentation

Avoid unnecessary visual clutter.

---

# 8. BACKEND

When the project includes a backend, maintain a clean architecture.

For a Node.js implementation, use:

* Node.js
* Express.js
* REST API
* Proper authentication
* Role-based authorization
* Input validation
* Secure password storage
* Organized controllers/services/routes
* Centralized error handling

Never expose sensitive credentials in frontend code.

---

# 9. DATABASE

Maintain proper relationships for entities such as:

* Users
* Roles
* Students
* Teachers
* Rooms
* Puzzles
* Puzzle choices
* Attempts
* Scores
* Progress
* Achievements
* Leaderboard records
* Activity logs

Avoid duplicate and unnecessary data.

Do not delete existing important data or database structures without determining their purpose first.

---

# 10. AUTHENTICATION AND AUTHORIZATION

Implement proper role-based authentication.

After login:

Admin → Admin Dashboard

Teacher → Teacher Dashboard

Student → Student Dashboard

Protect routes according to role.

A Student must not access Teacher/Admin pages by manually changing the URL.

A Teacher must not access Admin-only pages.

Unauthorized requests must be rejected by the backend, not only hidden in the frontend.

---

# 11. ERROR HANDLING

Follow:

`Error Handling Guidelines.md`

Implement proper handling for:

* Invalid login
* Unauthorized access
* Missing records
* Invalid input
* Failed API requests
* Database errors
* Network errors
* Puzzle validation errors
* Loading failures
* Unexpected server errors

Display understandable messages to users without exposing sensitive technical details.

---

# 12. DEVELOPMENT GUARDRAILS

Follow:

`Development and Design Guardrails.md`

Do not:

* Destroy working features unnecessarily.
* Replace the whole project when a targeted fix is enough.
* Introduce unnecessary dependencies.
* Duplicate components.
* Hardcode sensitive credentials.
* Store plain-text passwords.
* Bypass role authorization.
* Leave major demo functionality in production.
* Mark unfinished features as completed.
* Change requirements without documenting the reason.

---

# 13. IMPLEMENTATION PROCESS

Work systematically.

For each major feature:

1. Read the relevant `.md` instructions.
2. Inspect the existing implementation.
3. Determine what is missing.
4. Update `IMPLEMENTATION_CHECKLIST.md`.
5. Mark the feature as ONGOING.
6. Implement the feature.
7. Check for errors.
8. Test the feature.
9. Verify role permissions.
10. Verify responsive UI.
11. Verify related existing features still work.
12. Mark the feature COMPLETED only after verification.

If implementation cannot be completed:

Mark it as:

`[!] BLOCKED`

and explain the reason.

If deliberately excluded:

Mark it as:

`[-] SKIPPED`

and explain why.

---

# 14. DO NOT FAKE IMPLEMENTATION

Never claim that a feature is working simply because the UI exists.

A button is not considered implemented if it has no working behavior.

A dashboard statistic is not implemented if it only displays hardcoded numbers.

A login page is not implemented if it only redirects without authentication.

A role restriction is not implemented if the page is merely hidden from the sidebar.

A database feature is not implemented if it only uses temporary hardcoded data.

Verify functionality before marking it complete.

---

# 15. FINAL VERIFICATION

After implementation, perform a final review of the entire CyberEscape project.

Check:

* All `.md` instructions were reviewed.
* Admin permissions work correctly.
* Teacher permissions work correctly.
* Student permissions work correctly.
* Authentication works.
* Authorization works.
* Dashboards work.
* Navigation works.
* Game rooms work.
* Puzzle validation works.
* Scores work.
* Progress tracking works.
* Room unlocking works.
* Hints and attempts work.
* Leaderboard works where implemented.
* Database operations work.
* APIs work.
* Error handling works.
* UI is consistent.
* Responsive layouts work.
* No important console errors remain.
* No broken routes remain.
* No unnecessary demo accounts/data remain.
* No exposed secrets exist.
* No unfinished feature is incorrectly marked COMPLETE.

Finally update:

`/md/IMPLEMENTATION_CHECKLIST.md`

with the actual final status of every implementation.

---

# FINAL COMMAND

Start by reading this `MASTER_PROMPT.md`.

Then inspect **every `.md` file inside `/md/`**.

After that, inspect the existing CyberEscape codebase.

Create or update `IMPLEMENTATION_CHECKLIST.md`.

Do not start major implementation until the project requirements, architecture, and existing code have been analyzed.

Then implement the requirements systematically, following the checklist and all applicable `.md` guidelines.

Preserve existing working features, fix incomplete or incorrect implementations, and continuously update the checklist so it accurately shows:

**COMPLETED / ONGOING / PENDING / SKIPPED / BLOCKED.**
