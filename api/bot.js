export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('OK');

  const message = req.body?.message;
  if (!message || !message.text) return res.status(200).send('OK');

  const chatId = message.chat.id;
  const text = message.text;
  
  // === BAGIAN PENTING: JANGAN LUPA ISI LAGI YA ===
  const token = '8568216609:AAGPGjHkx8CwkXVlt24UHPmmc89cQYkLutE'; 
  const smmKey = 'e792c60725a0e7f8e94b57dac84ee0fbb70db72628d778d83786133786a7b87e'; 
  const smmUrl = 'https://layanan-sosmed.com/api'; 
  // ===============================================

  let reply = "Maaf, perintah tidak dikenali. Ketik /start atau /saldo";

  // Helm Penyamaran Anti-Cloudflare
  const headersAntiBlokir = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/javascript, */*; q=0.01'
  };

  if (text === '/start') {
    reply = "Halo! Selamat datang di Bot SMM otomatis.\n\nKetik /saldo untuk cek saldo pusat (Admin).";
  } 
  else if (text === '/saldo') {
    try {
      const params = new URLSearchParams();
      params.append('key', smmKey);
      params.append('action', 'balance');

      // Menggunakan penyamaran saat mengetuk pintu SMM
      const response = await fetch(smmUrl, { 
        method: 'POST', 
        headers: headersAntiBlokir,
        body: params 
      });
      
      const rawText = await response.text();
      console.log("Balasan MENTAH Saldo:", rawText);

      if (rawText.includes('<') || rawText.includes('<!DOCTYPE')) {
         reply = "Cloudflare server SMM masih memblokir bot kita. Silakan hubungi Admin layanan-sosmed.com.";
      } else {
         const data = JSON.parse(rawText);
         reply = data.balance ? `💰 Saldo modal kamu: Rp ${data.balance}` : `Gagal cek saldo. Jawaban: ${rawText}`;
      }
    } catch (error) {
      reply = "Waduh, koneksi ke server SMM sedang bermasalah.";
    }
  }

  // KIRIM BALASAN KE TELEGRAM
  try {
    const teleUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    await fetch(teleUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: reply })
    });
  } catch (error) {
    console.error("Gagal kirim:", error);
  }
  
  res.status(200).send('OK');
}
