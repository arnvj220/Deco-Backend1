# Backend API Documentation & Complete Event Lifecycle

---

# 🧠 Core Architectural Principle

The system is designed as a **server-time-driven event engine**.

Rounds do not require manual activation or closing.

Every state transition is derived from:

- `startedAt`
- `endsAt`
- Current **server time**

Server time is the single source of truth.

Frontend timers are visual only.

Backend enforces all lifecycle constraints.

---

# 🔄 ROUND STATE MODEL

Each round contains:

- `id`
- `startedAt`
- `endsAt`

Round state is derived dynamically:

| Condition | Derived State |
|------------|--------------|
| currentTime < startedAt | UPCOMING |
| startedAt ≤ currentTime ≤ endsAt | ACTIVE |
| currentTime > endsAt | COMPLETED |

State is not stored.
State is calculated.

---

# 🔄 ROUND ROUTES
**Base Path:** `/api/round`

---

## 1️⃣ Get Active Round

Returns the currently ACTIVE round based on server time.

### Endpoint
```
GET /api/round/active
```

### Success Response (200)
```json
{
  "id": 1,
  "startedAt": "2026-03-05T10:00:00.000Z",
  "endsAt": "2026-03-05T10:30:00.000Z"
}
```

### No Active Round (404)
```json
{
  "message": "No active round"
}
```

### Backend Logic
```
WHERE startedAt <= now AND endsAt >= now
```

Only one active round is expected at a time.

---

## 2️⃣ Start Round (Participant)

Registers that a specific user has started a round.

### Endpoint
```
POST /api/round/:roundId/start
```

### Preconditions
- Round exists
- startedAt ≤ now ≤ endsAt
- User has not started already

### Success Response (200)
```json
{
  "message": "Round started"
}
```

### Error Responses

```json
{ "message": "Round not found" }
```

```json
{ "message": "Round not active" }
```

```json
{ "message": "Round already started" }
```

### What Backend Does
- Creates row in `roundResult`
- Stores:
  - userId
  - roundId
  - startTime = now
  - finished = false

---

## 3️⃣ Finish Round (Participant)

Marks the round as completed for the user.

### Endpoint
```
POST /api/round/:roundId/finish
```

### Preconditions
- User has started round
- Not already finished

### Time Handling

Effective finish time is:

```
effectiveEndTime = min(currentTime, round.endsAt)
```

Total time is:

```
effectiveEndTime - startTime
```

This prevents finishing after round ends.

### Success Response (200)
```json
{
  "message": "Round finished"
}
```

### Error Responses

```json
{ "message": "Invalid finish request" }
```

```json
{ "message": "Round not found" }
```

```json
{ "message": "Round not started yet" }
```

---

## 4️⃣ Create Round (Organizer)

Creates a new round.

### Endpoint
```
POST /api/round
```

### Request
```json
{
  "startedAt": "2026-03-05T10:00:00.000Z",
  "endsAt": "2026-03-05T10:30:00.000Z"
}
```

### Validation
- endsAt > startedAt

### Success (201)
```json
{
  "message": "Round created successfully",
  "round": {
    "id": 1,
    "startedAt": "...",
    "endsAt": "..."
  }
}
```

---

## 5️⃣ Get All Rounds (Organizer)

Returns rounds with computed state.

### Endpoint
```
GET /api/round/admin/all
```

### Success Response
```json
[
  {
    "id": 1,
    "startedAt": "...",
    "endsAt": "...",
    "status": "ACTIVE",
    "totalQuestions": 10,
    "totalParticipants": 50,
    "finishedCount": 30
  }
]
```
---
## 6️⃣ Get User Round Status

Returns the participation status of the authenticated user for a specific round.

This endpoint allows the frontend to determine whether the user has already
started or finished the round. It is primarily used for **refresh recovery**
and **game state restoration**.

---

### Endpoint

```
GET /api/round/:id/status
```

---

### Success Response (200)

If the user **has not started the round**:

```json
{
  "started": false,
  "finished": false
}
```

If the user **has started but not finished**:

```json
{
  "started": true,
  "finished": false
}
```

If the user **has already finished**:

```json
{
  "started": true,
  "finished": true
}
```

---


### Typical Frontend Usage

This endpoint is used to determine what screen the user should see.

Example page load flow:

```
GET /api/round/active
GET /api/round/:roundId/status
```


### Refresh Recovery Example

If a user refreshes their browser during a round:

1. Frontend checks the active round
2. Frontend calls this endpoint
3. If `started: true`, the frontend restores the round state

Example recovery flow:

```
GET /api/round/active
GET /api/round/:roundId/status
GET /api/question/round/:roundId
GET /api/response/:roundId/me
```
---

# ❓ QUESTION ROUTES
**Base Path:** `/api/question`

These endpoints allow organizers to manage questions for rounds and allow
participants to retrieve questions during gameplay.

---

# 1️⃣ Create Question (Organizer)

Creates a new question for a specific round.

### Endpoint
```
POST /api/question
```

### Authentication
Required. Organizer role only.

```
Authorization: Bearer <Clerk Session Token>
```

### Request Body
```json
{
  "roundId": 1,
  "text": "What is the capital of France?",
  "options": {
    "A": "Paris",
    "B": "Berlin",
    "C": "Madrid",
    "D": "Rome"
  },
  "answer": "A",
  "link": null,
  "reward": 10
}
```

---

### Success Response (201)

```json
{
  "status": true,
  "data": {
    "id": 12,
    "roundId": 1,
    "text": "What is the capital of France?",
    "options": {
      "A": "Paris",
      "B": "Berlin",
      "C": "Madrid",
      "D": "Rome"
    },
    "answer": "A",
    "link": null,
    "reward": 10
  }
}
```

---

### Error Responses

Missing question text

```json
{
  "status": false,
  "message": "Question text is required"
}
```

Server error

```json
{
  "status": false,
  "message": "Server error"
}
```

---

# 2️⃣ Get Questions By Round

Returns all questions belonging to a specific round.

### Endpoint
```
GET /api/question/round/:roundId
```

---

### Success Response (200)

```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "roundId": 1,
      "text": "What is the capital of France?",
      "options": {
        "A": "Paris",
        "B": "Berlin",
        "C": "Madrid",
        "D": "Rome"
      },
      "link": null,
      "reward": 10
    }
  ]
}
```

---

### Typical Frontend Usage

This endpoint is called after a user starts a round.

Example:

```
GET /api/question/round/1
```

The returned questions are displayed to the participant.

---

# 3️⃣ Update Question (Organizer)

Updates an existing question.

### Endpoint
```
PATCH /api/question/:id
```

### Authentication
Organizer only.

---

### Request Body

Any subset of these fields may be provided:

```json
{
  "text": "Updated question text",
  "options": {
    "A": "Option 1",
    "B": "Option 2"
  },
  "answer": "A",
  "link": "https://example.com",
  "reward": 20
}
```

---

### Success Response (200)

```json
{
  "status": true,
  "data": {
    "id": 1,
    "roundId": 1,
    "text": "Updated question text",
    "options": {
      "A": "Option 1",
      "B": "Option 2"
    },
    "answer": "A",
    "link": "https://example.com",
    "reward": 20
  }
}
```

---

### Error Response

```json
{
  "status": false,
  "message": "Server error"
}
```

---

# 4️⃣ Delete Question (Organizer)

Deletes a question permanently.

### Endpoint
```
DELETE /api/question/:id
```

### Authentication
Organizer only.

---

### Success Response (200)

```json
{
  "status": true,
  "message": "Question deleted"
}
```

---

### Error Response

```json
{
  "status": false,
  "message": "Server error"
}
```

---



# 📝 RESPONSE ROUTES
**Base Path:** `/api/response`

---

## Submit Answer

```
POST /api/response
```

### Request
```json
{
  "questionId": 1,
  "submittedAnswer": "A"
}
```

### Backend Validation
- Round is ACTIVE
- User has started
- currentTime ≤ endsAt
- User not finished

### Success Response
```json
{
  "message": "Saved",
  "isCorrect": true,
  "pointsEarned": 10
}
```

If after endsAt:
```json
{ "message": "Round already ended" }
```
---
## Get User Responses For Round

Returns all answers submitted by the authenticated user for a specific round.

This endpoint is primarily used for **state recovery**, allowing the frontend
to restore previously submitted answers when the user refreshes the page or
reopens the round.

### Endpoint
```
GET /api/response/:roundId/me
```

### Request
```json
[
  {
    "id": 21,
    "questionId": 1,
    "submittedAnswer": "A",
    "isCorrect": true,
    "pointsEarned": 10
  },
  {
    "id": 22,
    "questionId": 2,
    "submittedAnswer": "C",
    "isCorrect": false,
    "pointsEarned": 0
  }
]
```
---

# 🏆 LEADERBOARD ROUTES

---

## Get Final Leaderboard

```
GET /api/leaderboard
```

Includes:
- Only rounds where currentTime > endsAt
- Only users who finished

Ranking Priority:
1. Higher totalPoints
2. Lower totalTime
3. Competition ranking

### Success Response
```json
{
  "status": true,
  "data": [
    {
      "rank": 1,
      "userId": 12,
      "name": "User A",
      "email": "user@email.com",
      "avatar_url": null,
      "totalPoints": 100,
      "totalTime": 540
    }
  ]
}
```

---

# 🔁 COMPLETE EVENT FLOW (DETAILED)

There are two synchronized but independent systems:

---

# 🏛 GLOBAL ROUND LIFECYCLE (Server Controlled)

1. Organizer creates round.
2. Until startedAt → Round is UPCOMING.
3. At startedAt → Automatically becomes ACTIVE.
4. At endsAt → Automatically becomes COMPLETED.
5. No API call required for state change.
6. Server determines state at every request.

No frontend trigger required.

---

# 👤 USER PARTICIPATION LIFECYCLE

## Step 1: Page Load

Frontend calls:
```
GET /api/round/active
```

If 200:
- Store startedAt
- Store endsAt
- Start countdown UI

If 404:
- Show waiting state
- Poll periodically

---

## Step 2: User Auto-Start

If:
- Active round exists
- User has not started

Frontend calls:
```
POST /api/round/:roundId/start
```

Backend validates time window.

---

## Step 3: Question Interaction

Frontend fetches:
```
GET /api/question/round/:roundId
```

Answers submitted via:
```
POST /api/response
```

Each submission revalidated server-side.

---

## Step 4: Auto Finish

At earliest of:
- User clicks finish
- currentTime ≥ endsAt

Frontend calls:
```
POST /api/round/:roundId/finish
```

Backend caps time automatically.

---

# 🔄 REFRESH HANDLING

On refresh:

Frontend must:
1. Re-fetch active round
2. Check if user already started
3. Recompute remaining time:
   ```
   endsAt - currentServerTime
   ```

Never trust client clock.

---

# ⚠️ EDGE CASES HANDLED

- User tries to start after endsAt → Rejected
- User tries to submit after finish → Rejected
- User tries to submit after endsAt → Rejected
- User refreshes at 1 second left → Time enforced by server
- User finishes after endsAt → Time capped automatically

---

# 🔐 AUTHENTICATION

All protected routes require:

```
Authorization: Bearer <Clerk Session Token>
```

---

# 🚀 FINAL SYSTEM CHARACTERISTICS

- Fully automatic lifecycle
- No manual state transitions
- Server-enforced timing
- Race-condition resistant
- Refresh-safe
- Scalable
- Deterministic
- Production ready

---

`Due to the majority of backend team's request here's an age old question ->  
Rishi kaha hai?`
