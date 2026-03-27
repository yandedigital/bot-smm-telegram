export default async function handler(req, res) {
  console.log("Menerima request dengan metode:", req.method);
  
  if (req.body) {
    console.log("Isi data dari Telegram:", JSON.stringify(req.body));
  }

  if (req.method === 'POST') {
    const message = req.body?.message;
    
    if (message && message.text) {
      const chatId = message.chat.id;
      const text = message.text;
      
      // === BAGIAN PENTING: ISI DENGAN TOKEN DAN API KEY MILIKMU ===
      const token = '8568216609:AAGPGjHkx8CwkXVlt24UHPmmc89cQYkLutE'; 
      const smmKey = 'e792c60725a0e7f8e94b57dac84ee0fbb70db72628d778d83786133786a7b87e'; 
      const smmUrl = 'https://layanan-sosmed.com/api'; 
      // ============================================================

      let reply = "Maaf, perintah tidak dikenali. Ketik /start, /saldo, atau /layanan";

      if (text === '/start') {
        reply = "Halo! Selamat datang di Bot SMM otomatis.\n\nKetik /layanan untuk melihat harga,\nKetik /saldo untuk cek saldo pusat (Admin).";
      } 
      else if (text === '/saldo') {
        try {
          const params = new URLSearchParams();
          params.append('key', smmKey);
          params.append('action', 'balance');

          const response = await fetch(smmUrl, { method: 'POST', body: params });
          const rawText = await response.text();
          console.log("Balasan MENTAH Saldo dari Server:", rawText); // CCTV KITA

          try {
            const data = JSON.parse(rawText);
            if (data.balance !== undefined) {
              reply = `💰 Saldo modal kamu di pusat saat ini: Rp ${data.balance}`;
            } else {
              reply = `Gagal cek saldo. Jawaban server: ${JSON.stringify(data)}`;
            }
          } catch (parseError) {
            reply = "Gagal membaca saldo. Server SMM membalas dengan format yang salah (HTML).";
          }
        } catch (error) {
          console.error("Error jaringan cek saldo:", error);
          reply = "Waduh, koneksi ke server SMM sedang bermasalah.";
        }
      }
      else if (text === '/layanan') {
        try {
          const params = new URLSearchParams();
          params.append('key', smmKey);
          params.append('action', 'services');

          const response = await fetch(smmUrl, { method: 'POST', body: params });
          const rawText = await response.text();
          console.log("Balasan MENTAH Layanan dari Server:", rawText); // CCTV KITA

          try {
            const dataLayanan = JSON.parse(rawText);
            if (Array.isArray(dataLayanan) && dataLayanan.length > 0) {
              reply = "📋 *Daftar 5 Layanan SMM (Contoh):*\n\n";
              for (let i = 0; i < 5; i++) {
                let hargaAsli = parseFloat(dataLayanan[i].rate);
                let hargaJual = hargaAsli * 1.2; // Untung 20%
                reply += `ID: ${dataLayanan[i].service}\nNama: ${dataLayanan[i].name}\nHarga Jual: Rp ${hargaJual.toFixed(0)} / 1000\n==================\n`;
              }
            } else {
              reply = `Gagal mengambil layanan. Server menjawab: ${JSON.stringify(dataLayanan)}`;
            }
          } catch (parseError) {
            reply = "Gagal membaca layanan. Server SMM membalas dengan format yang salah (HTML).";
          }
        } catch (error) {
          console.error("Error jaringan cek layanan:", error);
          reply = "Waduh, koneksi ke server SMM sedang bermasalah.";
        }
      }

      // KIRIM BALASAN KE TELEGRAM
      try {
        const teleUrl = `https://api.telegram.org/bot${token}/sendMessage`;
        await fetch(teleUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: reply, parse_mode: 'Markdown' })
        });
      } catch (error) {
        console.error("Gagal total mengirim pesan ke Telegram:", error);
      }
    }
  }
  
  res.status(200).send('OK');
}
