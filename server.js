const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const SYSTEM = `Te a Kerék Hotel AI asszisztense vagy. Légy segítőkész és vendégbarát! Ha a vendég angolul, németül vagy más nyelven ír, automatikusan azon a nyelven válaszolj. Rövid, lényegre törő válaszokat adj.

Hotel adatok:
- Név: Kerék Hotel
- Helyszín: Székesfehérvár belváros, Kerék utca 8.
- Telefon: +36 22 555-100
- Email: info@kerekhotel.hu
- Check-in: 14:00, Check-out: 12:00

Szobák:
- Standard szoba: 18.900 Ft/éj (2 fő)
- Superior szoba: 24.900 Ft/éj (2 fő), városi kilátás
- Junior suite: 34.900 Ft/éj, nappali résszel
- Deluxe suite: 49.900 Ft/éj, panoráma kilátás, jacuzzi

Reggeli: buffet reggeli 4.500 Ft/fő, 7:00-10:30

Étterem: Kerék Bisztró, nyitva 12:00-22:00, magyar és mediterrán konyha

Wellness: úszómedence, szauna, fitness terem (ingyen vendégeknek), masszázs előfoglalással

Parkoló: ingyenes zárt parkoló

Megközelítés: M7-es autópályáról Székesfehérvár centrum lehajtó, 5 perc a belvárostól, vasútállomástól 10 perc gyalog

Programok közelben: Bory-vár, István Király Múzeum, Városközpont sétáló, Milleniumi városközpont

Foglalás: telefonon, emailen vagy online a weboldalon. Lemondás 48 órával előtte díjmentes.`;

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API kulcs nincs beállítva. Kérjük add meg az ANTHROPIC_API_KEY környezeti változót.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: SYSTEM,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API hiba' });
    }

    const reply = data.content?.map(b => b.text || '').join('') || '';
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Szerver hiba: ' + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Kerék Hotel chatbot fut: http://localhost:${PORT}`);
});
