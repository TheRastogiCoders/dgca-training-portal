const express = require('express');
const { z } = require('zod');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Initialize Google AI using env var
const apiKey = process.env.GOOGLE_API_KEY;
let model;
if (apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

// Simple fallback in case AI unavailable or quota exceeded
const buildFallback = (message) => {
  const aviationMap = {
    'navigation': 'Air Navigation covers VOR/GPS, radio navigation, dead reckoning, and flight planning. What area do you want to practice?',
    'meteorology': 'Aviation meteorology includes weather patterns, clouds, wind/pressure systems, and how they affect flight performance and safety.',
    'regulation': 'Air Regulations cover ATC procedures, flight rules, licensing, and international standards. Which topic would you like to review?',
    'dgca': 'For DGCA prep, focus on Air Regulations, Navigation, Meteorology, Technical General/Specific, and RTR. I can give tips or quick questions.'
  };
  const lower = (message || '').toLowerCase();
  for (const key of Object.keys(aviationMap)) {
    if (lower.includes(key)) return aviationMap[key];
  }
  return `I can help with aviation topics, DGCA exam prep, study materials, and practice questions. Could you share a specific subject or concept?`;
};

// Utility: small wait
const delay = (ms) => new Promise(r => setTimeout(r, ms));

// POST /api/ai/chat - Send message to AI
router.post('/chat', async (req, res, next) => {
  try {
    const body = z.object({ message: z.string().min(1) }).parse(req.body);
    const message = body.message;

    console.log('Received AI request:', message);

    // Create aviation-focused prompt
    const prompt = `You are VIMAANNA AI, a specialized aviation learning assistant. You help students with:
    - DGCA (Directorate General of Civil Aviation) exam preparation
    - Aviation theory and concepts
    - Flight training questions
    - Weather patterns in aviation
    - Aircraft systems and operations
    - Navigation and air traffic control
    - Aviation safety and regulations
    
    User question: ${message.trim()}
    
    Please provide a helpful, accurate, and educational response focused on aviation topics. If the question is not aviation-related, politely redirect to aviation topics. Keep responses concise but informative.`;

    // If model is not configured, immediately return fallback
    if (!model) {
      return res.json({ success: true, response: buildFallback(message), note: 'fallback: ai_not_configured' });
    }

    console.log('Sending to Google AI:', prompt);
    let aiText = '';
    try {
      // Basic retry on 429
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          aiText = response.text();
          break;
        } catch (err) {
          const status = err?.status || err?.statusCode;
          if (status === 429 && attempt === 0) {
            await delay(1200);
            continue;
          }
          throw err;
        }
      }
    } catch (err) {
      console.error('AI provider error:', err);
      aiText = `⚠️ API Error - Using fallback response:\n\n${buildFallback(message)}`;
    }

    res.json({ success: true, response: aiText, timestamp: new Date().toISOString() });

  } catch (error) {
    console.error('Error calling Google AI API:', error);
    try {
      const message = (req.body && req.body.message) || '';
      return res.json({ success: true, response: buildFallback(message), note: 'fallback: server_error' });
    } catch (e) {
      return next(error);
    }
  }
});

module.exports = router;
