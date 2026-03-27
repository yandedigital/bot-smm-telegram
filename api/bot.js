const axios = require('axios');

export default async function handler(req, res) {
  // Hanya proses jika ada data yang dikirim (POST)
  if (req.method === 'POST') {
    const message = req.body.message;
    
    // Pastikan ada pesan teks dari pengguna
    if (message && message.text) {
      const chatId = message.chat.id;
      const text = message.text;
      
      // Mengambil Token Bot dari sistem Vercel (nanti kita isi)
      const token = process.env.TELEGRAM_TOKEN;
      let reply = "Halo! Ini adalah balasan otomatis dari bot Node.js kamu.";

      // Logika sederhana: Jika diketik /start
      if (text === '/start') {
        reply = "Selamat datang di Bot SMM! Sistem sedang disiapkan...";
      }

      // Mengirim balasan ke Telegram menggunakan API resmi
      try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
          chat_id: chatId,
          text: reply
        });
      } catch (error) {
        console.error("Gagal mengirim pesan:", error);
      }
    }
  }
  
  // Wajib membalas "OK" ke server Telegram agar tidak dianggap error
  res.status(200).send('OK');
}
