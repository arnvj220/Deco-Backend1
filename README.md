# Backend API Documentation (For Frontend Integration)

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
  "timeLimit": number | null, 
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
{ "timeLimit": number (optional) }
```
- **Response:**
```json
{ 
  "message": "Round created successfully", 
  "round": { 
    "id": number, 
    "timeLimit": number | null, 
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
    "timeLimit": number | null,
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
      "answer": string,
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
