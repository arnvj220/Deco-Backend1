# Backend API Documentation

---

# 🔄 ROUND ROUTES
**Base Path:** `/api/round`

---

### 1. Get Active Round
Returns the currently active round.

- **Endpoint:** `GET /api/round/active`
- **Response:**
```json
{ 
  "id": number, 
  "startedAt": datetime,
  "endsAt": datetime, 
  "status": "UPCOMING" | "ACTIVE" | "COMPLETED" 
}
```

---

### 2. Start Round
Starts the specified round for the authenticated user.

- **Endpoint:** `POST /api/round/:roundId/start`
- **URL Params:** `roundId` (number)
- **Response:**
```json
{ "message": "Round started" }
```

---

### 3. Finish Round
Finishes the specified round for the authenticated user.  
Calculates total time and total score.

- **Endpoint:** `POST /api/round/:roundId/finish`
- **URL Params:** `roundId` (number)
- **Response:**
```json
{ "message": "Round finished" }
```

---

### 4. Create Round (Admin)
Creates a new round.

- **Endpoint:** `POST /api/round`
- **Request Body:**
```json
{
  "startedAt": datetime,
  "endsAt": datetime
}
```
- **Response:**
```json
{ 
  "message": "Round created successfully", 
  "round": { 
    "id": number,
    "startedAt": datetime,
    "endsAt": datetime,
    "status": "UPCOMING" 
  } 
}
```

---

### 5. Activate Round (Admin)
Sets the specified round status to `ACTIVE`.

- **Endpoint:** `PATCH /api/round/:roundId/activate`
- **URL Params:** `roundId` (number)
- **Response:**
```json
{ "message": "Round activated" }
```

---

### 6. Close Round (Admin)
Sets the specified round status to `COMPLETED`.

- **Endpoint:** `PATCH /api/round/:roundId/close`
- **URL Params:** `roundId` (number)
- **Response:**
```json
{ "message": "Round closed" }
```

---

### 7. Get All Rounds (Admin)
Returns all rounds with summary details.

- **Endpoint:** `GET /api/round/admin/all`
- **Response:**
```json
[
  {
    "id": number,
    "startedAt": datetime,
    "endsAt": datetime,
    "status": "UPCOMING" | "ACTIVE" | "COMPLETED",
    "totalQuestions": number,
    "totalParticipants": number,
    "finishedCount": number
  }
]
```

---

# ❓ QUESTION ROUTES
**Base Path:** `/api/question`

---

### 1. Create Question (Admin)
Creates a new question for a round.

- **Endpoint:** `POST /api/question`
- **Request Body:**
```json
{
  "roundId": number,
  "text": string,
  "options": object | null,
  "answer": string,
  "link": string | null,
  "reward": number
}
```
- **Response:**
```json
{
  "status": true,
  "data": {
    "id": number,
    "roundId": number,
    "text": string,
    "options": object | null,
    "answer": string,
    "link": string | null,
    "reward": number
  }
}
```

---

### 2. Get Questions By Round
Returns all questions for a specific round.

- **Endpoint:** `GET /api/question/round/:roundId`
- **URL Params:** `roundId` (number)
- **Response:**
```json
{
  "status": true,
  "data": [
    {
      "id": number,
      "roundId": number,
      "text": string,
      "options": object | null,
      "link": string | null,
      "reward": number
    }
  ]
}
```

---

### 3. Update Question (Admin)
Updates question details.

- **Endpoint:** `PATCH /api/question/:id`
- **URL Params:** `id` (number)
- **Request Body:** Any of:
```json
{
  "text": string,
  "options": object,
  "answer": string,
  "link": string,
  "reward": number
}
```
- **Response:**
```json
{
  "status": true,
  "data": { ...updatedQuestion }
}
```

---

### 4. Delete Question (Admin)
Deletes a question.

- **Endpoint:** `DELETE /api/question/:id`
- **URL Params:** `id` (number)
- **Response:**
```json
{
  "status": true,
  "message": "Question deleted"
}
```

---

# 📝 RESPONSE ROUTES
**Base Path:** `/api/response`

---

### 1. Submit Answer
Submits or updates an answer for a question.

- **Endpoint:** `POST /api/response`
- **Request Body:**
```json
{
  "questionId": number,
  "submittedAnswer": string
}
```
- **Response:**
```json
{
  "message": "Saved",
  "isCorrect": boolean,
  "pointsEarned": number
}
```

---

### 2. Get User Responses
Returns all responses submitted by the authenticated user for a specific round.

- **Endpoint:** `GET /api/response/:roundId/me`
- **URL Params:** `roundId` (number)
- **Response:**
```json
[
  {
    "id": number,
    "questionId": number,
    "submittedAnswer": string,
    "isCorrect": boolean,
    "pointsEarned": number
  }
]
```

---

# 🏆 LEADERBOARD ROUTES
**Base Path:** `/api`

---

### 1. Get Final Leaderboard
Returns the final leaderboard after all rounds are completed.

- Includes only:
  - Rounds with status `COMPLETED`
  - Users who finished rounds
- Ranking Priority:
  1. Higher total points
  2. Lower total time
  3. Ties share the same rank (competition ranking)

- **Endpoint:** `GET /api/leaderboard`
- **Response:**
```json
{
  "status": true,
  "data": [
    {
      "rank": number,
      "userId": number,
      "name": string,
      "email": string,
      "avatar_url": string | null,
      "totalPoints": number,
      "totalTime": number
    }
  ]
}
```

---

## 🔐 Authentication (Clerk Based)

This backend uses Clerk Authentication with an additional server-side whitelist.

All protected routes require a valid Clerk session token sent via:

Authorization: Bearer <Clerk Session Token>

Returns the current authenticated backend user.

### Auth Check Endpoint

-**Endpoint:** `GET /api/auth/me`
- **Response:**
```json
{
  "message": "Backend connected successfully",
  "user": {
    "id": number,
    "email": string,
    "name": string,
    "role": "ORGANIZER" | "PARTICIPANT"
  }
}
```

------------------------------------------------------------------------


# 🧠 Event Flow Explanation (How The Platform Works)

This section explains the complete lifecycle of the event, including
frontend responsibilities, backend responsibilities, authentication
flow, and how rounds repeat automatically.

------------------------------------------------------------------------

# 🔄 High-Level Event Cycle

The event runs in rounds. Each round has:

-   `startedAt`
-   `endsAt`
-   `status` → UPCOMING \| ACTIVE \| COMPLETED

The frontend controls the timing logic using these timestamps.

------------------------------------------------------------------------

# 🟢 Step 1: Website Loads → Fetch Active Round

When the website loads:

1.  Frontend calls: GET /api/round/active

2.  Backend returns: { "id": 1, "startedAt": "2026-03-05T10:00:00.000Z",
    "endsAt": "2026-03-05T10:30:00.000Z", "status": "UPCOMING" \|
    "ACTIVE" }

3.  Frontend:

    -   Stores `startedAt`
    -   Stores `endsAt`
    -   Starts countdown timers accordingly

------------------------------------------------------------------------

# ⏳ Step 2: Automatically Start & End Round (Frontend Responsibility)

At `startedAt`: POST /api/round/:roundId/start

At `endsAt`: POST /api/round/:roundId/finish

The backend does NOT auto-trigger this. The frontend must schedule these
calls.

------------------------------------------------------------------------

# 🏃 Step 3: User Participation Flow

-   User clicks Start → call start API
-   Frontend starts visible countdown timer
-   User submits answers via POST /api/response
-   User can manually finish early via finish API

Effective time calculation: min(currentTime, endsAt) - userStartTime

------------------------------------------------------------------------

# 🟡 Step 4: Early Finish → Waiting Screen

If user finishes early: - Show waiting screen - Wait until `endsAt` -
Fetch next round using GET /api/round/active - Restart cycle if next
round exists

------------------------------------------------------------------------

# 🔁 Multi-Round Cycle

Fetch active round → Wait for start → Call start → Play → Wait for end →
Call finish → Fetch next round → Repeat

------------------------------------------------------------------------

# ❓ Question Flow

GET /api/question/round/:roundId

Questions remain accessible until round ends or user finishes.

------------------------------------------------------------------------

# 📝 Response Flow

POST /api/response

Backend: - Saves answer - Evaluates correctness - Returns `isCorrect`
and `pointsEarned`

------------------------------------------------------------------------

# 🏆 Leaderboard Logic

GET /api/leaderboard

Ranking priority: 1. Higher total points 2. Lower total time 3.
Competition ranking (ties share rank)

Only completed rounds and users who finished are included.

------------------------------------------------------------------------

# 🔐 Authentication (Clerk Based)

1.  User signs in via Clerk.
2.  Clerk provides session token.
3.  Frontend sends:

Authorization: Bearer `<Clerk Session Token>`{=html}

4.  Backend verifies token and attaches user.

User roles: - ORGANIZER - PARTICIPANT

Auth check endpoint: GET /api/auth/me

------------------------------------------------------------------------

# 🛡️ Implementation Notes

-   Frontend controls timing
-   Backend calculates final time
-   Backend enforces `endsAt`
-   Handle refresh by re-fetching active round and responses
-   Always treat `endsAt` as final authority

------------------------------------------------------------------------

# 🚀 Summary

Frontend orchestrates timing and lifecycle. Backend enforces
correctness, scoring, and security.

