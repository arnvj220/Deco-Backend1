# Backend API Documentation (For Frontend Integration)

## 🔄 ROUND ROUTES
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

### 2. Start Round
Starts the specified round for the authenticated user.
- **Endpoint:** `POST /api/round/:roundId/start`
- **URL Params:** `roundId` (number)
- **Response:**
  ```json
  { "message": "Round started" }
  ```

### 3. Finish Round
Finishes the specified round for the authenticated user. Calculates total time and total score.
- **Endpoint:** `POST /api/round/:roundId/finish`
- **URL Params:** `roundId` (number)
- **Response:**
  ```json
  { "message": "Round finished" }
  ```

### 4. Create Round
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
    "round": { "id": number, "timeLimit": number | null, "status": "UPCOMING" } 
  }
  ```

### 5. Activate Round
Sets the specified round status to `ACTIVE`.
- **Endpoint:** `PATCH /api/round/:roundId/activate`
- **URL Params:** `roundId` (number)
- **Response:**
  ```json
  { "message": "Round activated" }
  ```

### 6. Close Round
Sets the specified round status to `COMPLETED`.
- **Endpoint:** `PATCH /api/round/:roundId/close`
- **URL Params:** `roundId` (number)
- **Response:**
  ```json
  { "message": "Round closed" }
  ```

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

## 📝 RESPONSE ROUTES
**Base Path:** `/api/response`

### 1. Submit Answer
Submits an answer for a question.
- **Endpoint:** `POST /api/response`
- **Request Body:**
  ```json
  { "questionId": number, "answer": string }
  ```
- **Response:**
  ```json
  { "isCorrect": boolean, "pointsEarned": number }
  ```

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

