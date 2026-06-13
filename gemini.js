// gemini.js
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { text } = req.body; // Recibimos el texto transcrito del usuario
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    // Usamos el modelo rápido y gratuito gemini-1.5-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Construimos el prompt estructurado para que actúe como corrector de inglés
    const prompt = `You are an expert English teacher. Analyze the following English phrase spoken by a student: "${text}". 
    Provide a concise correction. If it is correct, say so and praise them. If there are grammar or pronunciation-based spelling mistakes, point them out kindly and offer 1 or 2 natural alternatives. Keep the response brief and encouraging.`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    const data = await response.json();
    
    // Extraemos la respuesta de texto generada por Gemini
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";

    return res.status(200).json({ reply: aiResponse });
    
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
