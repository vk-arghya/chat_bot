const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

app.use(cors());
app.use(express.json());

// Serve frontend from /public folder
app.use(express.static(path.join(__dirname, '../public')));

// API route with Arghya custom reply
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const userMsg = message.toLowerCase();

  // Hardcoded reply for Arghya
  const arghyaKeywords = [
      "who is arghya",
      "what is arghya",
      "do you know arghya",
      "did you know arghya",
      "arghya"
  ];

  const isArghyaQuestion = arghyaKeywords.some(kw => userMsg.includes(kw));

  if (isArghyaQuestion) {
    const customReply = `
**Behind every AI, there’s a brilliant mind. For me, it’s Arghya—my boss, my maker, my mentor. 🚀🔧**

🔗 [GitHub](https://github.com/vk-arghya/)  
🔗 [LinkedIn](https://www.linkedin.com/in/arghya-ghoshal-56527529a/)
    `;
    return res.json({ reply: customReply });
  }

  // Normal API call to Gemini
  try {
    const payload = {
      contents: [{ parts: [{ text: message }] }]
    };

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error?.message || 'Unknown error from Gemini API';
      console.error('[Gemini Error]:', errorMsg);
      return res.status(500).json({ reply: errorMsg });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No reply from Gemini.';
    res.json({ reply });

  } catch (err) {
    console.error('[Server Error]:', err.message);
    res.status(500).json({ reply: 'Server error: ' + err.message });
  }
});

// Fallback route to serve index.html (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Chatbot running at http://localhost:${PORT}`);
});
