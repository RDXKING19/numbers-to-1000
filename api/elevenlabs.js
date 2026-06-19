// ─────────────────────────────────────────────────────────────────────────────
// Vercel Serverless Function — ElevenLabs TTS Proxy
// Keeps ELEVENLABS_API_KEY secure on the server (no VITE_ prefix).
// Cached at the Vercel Edge for 24 hours to minimise API spend.
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text, voiceId = 'Xb7hH8MSUJpSbSDYk0k2', voiceSettings } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'text is required' });
  }

  // Server-side key — NOT exposed to the browser
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ELEVENLABS_API_KEY not configured on server.' });
  }

  const defaultSettings = {
    stability:        0.20,
    similarity_boost: 0.55,
    style:            0.50,
    use_speaker_boost: true,
  };

  try {
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key':   apiKey,
        },
        body: JSON.stringify({
          text,
          model_id:       'eleven_multilingual_v2',
          voice_settings: voiceSettings || defaultSettings,
        }),
      }
    );

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error('ElevenLabs API error:', errText);
      return res.status(upstream.status).json({ error: 'ElevenLabs API failed' });
    }

    // Stream audio back with 24-hour edge cache
    res.setHeader('Content-Type',  'audio/mpeg');
    res.setHeader('Cache-Control', 's-maxage=86400');

    const buffer = Buffer.from(await upstream.arrayBuffer());
    return res.status(200).send(buffer);

  } catch (err) {
    console.error('Serverless function error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
