export default async function handler(req, res) {
  // 1. CCTV Vercel: Memaksa Vercel mencatat ada tamu yang datang
  console.log("Menerima request dengan metode:", req.method);
  
  if (req.body) {
    // Mencatat apa isi pesan dari Telegram
    console.log("Isi data dari Telegram:", JSON.stringify(req.body));
  }

  if (req.method === 'POST') {
    // Membaca pesan Telegram
    const message = req.body?.message;
    
    if (message && message.text) {
      const chatId = message.chat.id;
      const text = message.text;
      
      const token = '8568216609:AAGPGjHkx8CwkXVlt24UHPmmc89cQYkLutE';
      const smmKey = process.env.SMM_API_KEY;
      const smmUrl = 'https://layanan-sosmed.com/api'; 

      let reply = "Maaf, perintah tidak dikenali. Ketik /start, /saldo, atau /layanan";

      // LOGIKA BALASAN BOT
      if (text === '/start') {
        reply = "Halo! Selamat datang di Bot SMM otomatis.\n\nKetik /layanan untuk melihat harga,\nKetik /saldo untuk cek saldo pusat (Admin).";
      } 
      else if (text === '/saldo') {
        try {
          const params = new URLSearchParams();
          params.append('key', smmKey);
          params.append('action', 'balance');

          // Menggunakan 'fetch' bawaan agar tidak error di Vercel
          const response = await fetch(smmUrl, { method: 'POST', body: params });
          const data = await response.json();
          
          if (data.balance !== undefined) {
            reply = `💰 Saldo modal kamu di pusat saat ini: Rp ${data.balance}`;
          } else {
            reply = `Gagal cek saldo. Jawaban server: ${JSON.stringify(data)}`;
          }
        } catch (error) {
          console.error("Error cek saldo:", error);
          reply = "Waduh, koneksi ke server SMM sedang bermasalah.";
        }
      }
      else if (text === '/layanan') {
        try {
          const params = new URLSearchParams();
          params.append('key', smmKey);
          params.append('action', 'services');

          const response = await fetch(smmUrl, { method: 'POST', body: params });
          const dataLayanan = await response.json();

          if (Array.isArray(dataLayanan) && dataLayanan.length > 0) {
            reply = "📋 *Daftar 5 Layanan SMM (Contoh):*\n\n";
            for (let i = 0; i < 5; i++) {
              let hargaAsli = parseFloat(dataLayanan[i].rate);
              let hargaJual = hargaAsli * 1.2; // Tambah untung 20%
              
              reply += `ID: ${dataLayanan[i].service}\n`;
              reply += `Nama: ${dataLayanan[i].name}\n`;
              reply += `Harga Jual: Rp ${hargaJual.toFixed(0)} / 1000\n`;
              reply += `==================\n`;
            }
          } else {
            reply = `Gagal mengambil layanan. Server menjawab: ${JSON.stringify(dataLayanan)}`;
          }
        } catch (error) {
          console.error("Error cek layanan:", error);
          reply = "Waduh, koneksi ke server SMM sedang bermasalah.";
        }
      }

      // 2. KIRIM BALASAN KE TELEGRAM
      try {
        const teleUrl = `https://api.telegram.org/bot${token}/sendMessage`;
        const sendResponse = await fetch(teleUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: reply,
            parse_mode: 'Markdown'
          })
        });
        
        const teleResult = await sendResponse.json();
        console.log("Status pengiriman ke Telegram:", teleResult);
        
      } catch (error) {
        console.error("Gagal total mengirim pesan:", error);
      }
    }
  }
  
  // Wajib ada agar Telegram tidak mengirim ulang pesannya terus-terusan
  res.status(200).send('OK');
}
