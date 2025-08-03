import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { chatting } from './query.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'], // Add your frontend URLs
  credentials: true
}));
app.use(express.json());



// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'RAG Backend Server is running',
    timestamp: new Date().toISOString()
  });
});

// Chat endpoint for RAG queries
app.post('/api/chat', async (req, res) => {
  try {
    const { message, question } = req.body;
    
    if (!message && !question) {
      return res.status(400).json({
        error: 'Missing required field: message or question',
        success: false
      });
    }

    const userQuery = message || question;
    
    console.log(`[${new Date().toISOString()}] Processing query:`, userQuery);
    
    // Capture the console output from chatting function
    let originalLog = console.log;
    let capturedOutput = '';
    
    console.log = (...args) => {
      capturedOutput += args.join(' ') + '\n';
      originalLog(...args);
    };

    await chatting(userQuery);
    
    // Restore original console.log
    console.log = originalLog;
    
    // Extract the answer from captured output
    const answerMatch = capturedOutput.match(/✅ Answer:\s*(.*)/s);
    const answer = answerMatch ? answerMatch[1].trim() : 'No response generated';
    
    // Try to parse JSON response if it's in JSON format
    let parsedResponse;
    try {
      // Look for JSON in the answer
      const jsonMatch = answer.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // If parsing fails, use the raw answer
      parsedResponse = { response: answer };
    }

    res.json({
      success: true,
      query: userQuery,
      answer: answer,
      structured_response: parsedResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing chat request:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      success: false
    });
  }
});

// Insurance claim evaluation endpoint
app.post('/api/evaluate-claim', async (req, res) => {
  try {
    const { 
      age, 
      gender, 
      procedure, 
      location, 
      policyDuration,
      customQuery 
    } = req.body;

    let query;
    
    if (customQuery) {
      query = customQuery;
    } else {
      // Construct query from provided details
      if (!age || !gender || !procedure) {
        return res.status(400).json({
          error: 'Missing required fields: age, gender, and procedure are required',
          success: false
        });
      }
      
      query = `${age}${gender}, ${procedure}`;
      if (location) query += `, ${location}`;
      if (policyDuration) query += `, ${policyDuration} policy`;
    }

    console.log(`[${new Date().toISOString()}] Evaluating claim:`, query);
    
    // Capture the console output from chatting function
    let originalLog = console.log;
    let capturedOutput = '';
    
    console.log = (...args) => {
      capturedOutput += args.join(' ') + '\n';
      originalLog(...args);
    };

    await chatting(query);
    
    // Restore original console.log
    console.log = originalLog;
    
    // Extract the answer from captured output
    const answerMatch = capturedOutput.match(/✅ Answer:\s*(.*)/s);
    const answer = answerMatch ? answerMatch[1].trim() : 'No response generated';
    
    // Try to parse JSON response
    let claimResult;
    try {
      const jsonMatch = answer.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        claimResult = JSON.parse(jsonMatch[0]);
      } else {
        claimResult = {
          Decision: 'Unknown',
          Amount: null,
          Justification: answer
        };
      }
    } catch (e) {
      claimResult = {
        Decision: 'Error',
        Amount: null,
        Justification: answer
      };
    }

    res.json({
      success: true,
      query: query,
      result: claimResult,
      raw_response: answer,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error evaluating claim:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      success: false
    });
  }
});

// Get environment status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'OK',
    environment: {
      gemini_configured: !!process.env.GEMINI_API_KEY,
      pinecone_configured: !!process.env.PINECONE_INDEX_NAME,
      pinecone_api_configured: !!process.env.PINECONE_API_KEY
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    success: false
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    success: false
  });
});

app.listen(PORT, () => {
  console.log(`🚀 RAG Backend Server is running on http://localhost:${PORT}`);
  console.log(`📚 Available endpoints:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   GET  /api/status - Environment status`);
  console.log(`   POST /api/chat - General chat with RAG`);
  console.log(`   POST /api/evaluate-claim - Insurance claim evaluation`);
  console.log(`\n🔧 Make sure your .env file contains:`);
  console.log(`   GEMINI_API_KEY=your_gemini_api_key`);
  console.log(`   PINECONE_API_KEY=your_pinecone_api_key`);
  console.log(`   PINECONE_INDEX_NAME=your_index_name`);
});
