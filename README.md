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

# ❓ QUESTION ROUTES
**Base Path:** `/api/question`

---

## Get Questions By Round

```
GET /api/question/round/:roundId
```

### Response
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "roundId": 1,
      "text": "Question text",
      "options": null,
      "link": null,
      "reward": 10
    }
  ]
}
```

Questions remain accessible only while:

- currentTime ≤ endsAt
- user not finished

Backend must revalidate time before serving.

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

Answer:
Server time ke andar.
State machine ke beech.
Manual activation se upar uth chuka hai.