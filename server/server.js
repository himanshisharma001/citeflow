import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'citeflow_jwt_secret_default';

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.send('⚡ CiteFlow Backend Engine is running and healthy on Port 5000!');
});

// Authentication
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const validEmail = process.env.DEMO_EMAIL || 'demo@citeflow.ai';
  const validPassword = process.env.DEMO_PASSWORD || 'citeflow123';

  if (email === validEmail && password === validPassword) {
    const token = jwt.sign({ email, role: 'authenticated_user' }, JWT_SECRET, {
      expiresIn: '7d',
    });
    return res.json({
      success: true,
      token,
      user: { email, name: 'Guest Developer' },
    });
  }

  return res.status(401).json({ error: 'Invalid credentials. Please use demo credentials.' });
});

// JWT Verification Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Session expired. Please log in again.' });
    }
    req.user = user;
    next();
  });
};

app.post('/api/chat', authenticateToken, async (req, res) => {
  const { prompt, pages } = req.body;
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in server/.env' });
  }

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    // Concise document context
    const documentContext =
      pages && pages.length > 0
        ? pages
            .map((p) => `--- PAGE ${p.pageNumber} ---\n${p.text.slice(0, 1500)}`)
            .join('\n\n')
        : 'NO PDF ATTACHED.';

    const systemPrompt = `You are CiteFlow, an intelligent document analysis assistant.
Answer the user's question directly and concisely based on the document context.
Whenever citing information from the document, append exact page tags like [Page X] (e.g. [Page 1]).

DOCUMENT CONTEXT:
${documentContext}

USER QUESTION:
${prompt}`;

    const result = await model.generateContentStream(systemPrompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('❌ Generation Error:', error);
    
    let errorResponseText = `⚠️ Error: ${error.message}`;
    if (error.status === 429 || error.message?.includes('429')) {
      errorResponseText = '⚠️ Quota limit reached on this API key. Please try again in 30 seconds or generate a fresh key in Google AI Studio.';
    }

    res.write(`data: ${JSON.stringify({ text: errorResponseText })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`⚡ CiteFlow Backend running on http://localhost:${PORT}`);
});