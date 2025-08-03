# RAG Backend API Documentation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your API keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=your_pinecone_index_name_here
PORT=3001
```

3. Index your PDF documents (run once):
```bash
npm run index
```

4. Start the server:
```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### Environment Status
```
GET /api/status
```
Returns configuration status (whether API keys are set).

### General Chat
```
POST /api/chat
Content-Type: application/json

{
  "message": "Your question here"
}
```

**Response:**
```json
{
  "success": true,
  "query": "Your question",
  "answer": "AI response",
  "structured_response": {
    "Decision": "Approved/Rejected",
    "Amount": 50000,
    "Justification": "Explanation here"
  },
  "timestamp": "2025-08-03T07:30:00.000Z"
}
```

### Insurance Claim Evaluation
```
POST /api/evaluate-claim
Content-Type: application/json

{
  "age": "46",
  "gender": "M",
  "procedure": "knee surgery",
  "location": "Pune",
  "policyDuration": "3-month"
}
```

**Or with custom query:**
```json
{
  "customQuery": "46M, knee surgery, Pune, 3-month policy"
}
```

**Response:**
```json
{
  "success": true,
  "query": "46M, knee surgery, Pune, 3-month policy",
  "result": {
    "Decision": "Approved",
    "Amount": 75000,
    "Justification": "Coverage approved under Easy Health Policy..."
  },
  "raw_response": "Full AI response",
  "timestamp": "2025-08-03T07:30:00.000Z"
}
```

## Frontend Integration

Example JavaScript fetch requests:

```javascript
// General chat
const response = await fetch('http://localhost:3001/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'What is covered under the policy?'
  })
});
const data = await response.json();

// Claim evaluation
const claimResponse = await fetch('http://localhost:3001/api/evaluate-claim', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    age: '46',
    gender: 'M',
    procedure: 'knee surgery',
    location: 'Pune',
    policyDuration: '3-month'
  })
});
const claimData = await claimResponse.json();
```

## Error Handling

All endpoints return errors in this format:
```json
{
  "error": "Error description",
  "message": "Detailed error message",
  "success": false
}
```

Common status codes:
- 200: Success
- 400: Bad Request (missing required fields)
- 500: Internal Server Error
