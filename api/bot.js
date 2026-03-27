import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const message = req.body.message;
    
    if (message && message.text) {
      const chatId = message.chat.id;
      const text = message.text;
      
      const token = process.env.TELEGRAM_TOKEN;
      const smmId = process.env.SMM_API_ID; // Mengambil API ID (2216)
      const smmKey = process.env.SMM_API_KEY; // Mengambil API Key V2
      
      // URL V2 sesuai sistem
      const smmUrl = 'https://layanan-sosmed.com/api/v2'; 

      let reply = "Maaf, perintah tidak dikenali. Ketik /start, /saldo, atau /layanan";

      if (text === '/start') {
        reply = "Halo! Selamat datang di Bot SMM otomatis.\n\nKetik /layanan untuk melihat harga,\nKetik /saldo untuk cek saldo pusat (Admin).";
      } 
      else if (text === '/saldo') {
        reply = "Memeriksa saldo ke server..."; // Pesan loading sementara
        try {
          // Format request standar SMM Panel Indonesia (butuh api_id dan api_key)
          const params = new URLSearchParams();
          params.append('api_id', smmId);
          params.append('api_key', smmKey);
          params.append('action', 'balance');

          const response = await axios.post(smmUrl, params);
          if (response.data.status === true || response.data.data) {
             // Biasanya datanya ada di response.data.data.balance, kita coba tarik:
            let saldo = response.data.data ? response.data.data.balance : response.data.balance;
            reply = `💰 Saldo modal kamu di pusat saat ini: Rp ${saldo}`;
          } else {
            reply = `Gagal cek saldo. Jawaban server: ${JSON.stringify(response.data)}`;
          }
        } catch (error) {
          reply = "Waduh, koneksi ke server SMM sedang bermasalah.";
        }
      }
      else if (text === '/layanan') {
        reply = "Mengambil daftar layanan...";
        try {
          const params = new URLSearchParams();
          params.append('api_id', smmId);
          params.append('api_key', smmKey);
          params.append('action', 'services');

          const response = await axios.post(smmUrl, params);
          // Struktur data biasanya di response.data.data
          const dataLayanan = response.data.data || response.data;

          if (Array.isArray(dataLayanan) && dataLayanan.length > 0) {
            reply = "📋 *Daftar 5 Layanan SMM (Contoh):*\n\n";
            
            for (let i = 0; i < 5; i++) {
              let hargaAsli = parseFloat(dataLayanan[i].price || dataLayanan[i].rate);
              let hargaJual = hargaAsli * 1.2; // Keuntungan 20%
              
              reply += `ID: ${dataLayanan[i].id || dataLayanan[i].service}\n`;
              reply += `Nama: ${dataLayanan[i].name}\n`;
              reply += `Harga Jual: Rp ${hargaJual.toFixed(0)} / 1000\n`;
              reply += `==================\n`;
            }
          } else {
            reply = `Gagal mengambil layanan. Server menjawab: ${JSON.stringify(response.data)}`;
          }
        } catch (error) {
          reply = "Waduh, koneksi ke server SMM sedang bermasalah.";
        }
      }

      // Kirim pesan balasan ke Telegram
      try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
          chat_id: chatId,
          text: reply,
          parse_mode: 'Markdown'
        });
      } catch (error) {
        console.error("Gagal mengirim pesan:", error);
      }
    }
  }
  
  res.status(200).send('OK');
}
