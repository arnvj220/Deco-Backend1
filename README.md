# Backend API Documentation & Complete Event Flow

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

This document explains the complete lifecycle of the event, clearly
separating:

1.  Global Round Lifecycle (Organizer controlled)
2.  User Participation Lifecycle (Participant controlled)

⚠️ All activation, deactivation, start, and finish calls are
AUTOMATICALLY triggered by frontend timers --- not manually clicked.

------------------------------------------------------------------------

# 🔄 High-Level Event Structure

Each round has:

-   `startedAt`
-   `endsAt`
-   `status` → UPCOMING \| ACTIVE \| COMPLETED

There are TWO separate flows happening in parallel:

------------------------------------------------------------------------

# 🛠 1️⃣ Global Round Lifecycle (Organizer Frontend -- Automatic)

This controls the global status of a round.

These APIs are ONLY accessible to ORGANIZER.

## Automatic Activation

At exact `startedAt`, the ORGANIZER frontend must automatically call:

PATCH /api/round/:roundId/activate

This: - Sets round status to ACTIVE - Makes it globally available

No participant can trigger this.

------------------------------------------------------------------------

## Automatic Deactivation

At exact `endsAt`, the ORGANIZER frontend must automatically call:

PATCH /api/round/:roundId/close

This: - Sets round status to COMPLETED - Locks the round globally -
Makes it eligible for leaderboard inclusion

This must also be automated using frontend timers (setTimeout /
scheduler).

------------------------------------------------------------------------

# 👤 2️⃣ User Participation Lifecycle (Participant Frontend -- Automatic)

This controls individual user participation.

These APIs DO NOT change global round status.

------------------------------------------------------------------------

## Step 1: Website Loads

Frontend calls:

GET /api/round/active

Backend returns:

{ "id": 1, "startedAt": "2026-03-05T10:00:00.000Z", "endsAt":
"2026-03-05T10:30:00.000Z", "status": "UPCOMING" \| "ACTIVE" }

Frontend stores timestamps and prepares timers.

------------------------------------------------------------------------

## Step 2: Automatic User Start

When:

-   Round status is ACTIVE
-   AND user is eligible
-   AND user has not started yet

The participant frontend must automatically call:

POST /api/round/:roundId/start

This registers that THIS user has started.

This does NOT activate the round globally.

Frontend then: - Starts user-specific countdown - Fetches questions

------------------------------------------------------------------------

## Step 3: Question Flow

GET /api/question/round/:roundId

Questions remain accessible until: - User finishes - Or global round
ends

------------------------------------------------------------------------

## Step 4: Response Flow

POST /api/response

Backend: - Saves answer - Evaluates correctness - Returns: -
`isCorrect` - `pointsEarned`

Users can update answers until they finish.

------------------------------------------------------------------------

## Step 5: Automatic User Finish

At the earliest of:

-   User manually clicks finish
-   OR global `endsAt` is reached

Frontend must automatically call:

POST /api/round/:roundId/finish

This: - Calculates total time - Calculates total score - Marks THIS user
as finished

This does NOT close the round globally.

Effective time calculation:

min(currentTime, endsAt) - userStartTime

Backend enforces final time cap.

------------------------------------------------------------------------

# ⏳ Early Finish Behavior

If user finishes before global `endsAt`:

Frontend must: - Show waiting screen - Wait until round closes
globally - Automatically fetch next active round at end time

GET /api/round/active

If next round exists → repeat full cycle.

------------------------------------------------------------------------

# 🔁 Complete Automated Cycle

## Organizer Side

Create round\
→ Automatically activate at `startedAt`\
→ Automatically close at `endsAt`\
→ Repeat

## Participant Side

Fetch active round\
→ Automatically start when eligible\
→ Play\
→ Automatically finish at end\
→ Wait\
→ Fetch next round\
→ Repeat

Everything is driven by frontend timers.

------------------------------------------------------------------------

# 🏆 Leaderboard Logic

GET /api/leaderboard

Includes only:

-   Rounds with status COMPLETED
-   Users who finished rounds

Ranking priority:

1.  Higher total points
2.  Lower total time
3.  Competition ranking (ties share rank)

------------------------------------------------------------------------

# 🔐 Authentication (Clerk Based)

All protected routes require:

Authorization: Bearer `<Clerk Session Token>`{=html}

Flow:

1.  User signs in via Clerk
2.  Clerk provides session token
3.  Frontend sends token with every request
4.  Backend verifies and attaches user

------------------------------------------------------------------------

# 👤 Role-Based Access Control

Users have roles:

-   ORGANIZER
-   PARTICIPANT

ORGANIZER can:

-   Create rounds
-   Activate rounds
-   Close rounds
-   Manage questions

PARTICIPANT can:

-   Start round (user-level)
-   Finish round (user-level)
-   Submit responses
-   View leaderboard

Participants CANNOT activate or close rounds.

Backend strictly enforces this.

------------------------------------------------------------------------

# 🛡️ Implementation Guarantees

-   All lifecycle transitions are automated
-   Organizer frontend automates global state changes
-   Participant frontend automates user-level state changes
-   Backend enforces timestamps using `startedAt` and `endsAt`
-   Refresh-safe: frontend must re-fetch state and restore timers
-   Frontend timers are visual only; backend is final authority

------------------------------------------------------------------------

# 🚀 Final Architecture Summary

There are two independent but synchronized systems:

1.  Global Round Control (Organizer -- Automatic)
2.  User Participation Control (Participant -- Automatic)

Frontend orchestrates timing. Backend enforces security, scoring, and
correctness.

------------------------------------------------------------------------
`Due to the majority of backend team's request here's an age old question -> 
Rishi kaha hai?`
