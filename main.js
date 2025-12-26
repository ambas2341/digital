require("./setting")
const { Telegraf } = require("telegraf")
const fs = require("fs") 
const chalk = require('chalk')
const moment = require("moment-timezone")
const yargs = require('yargs/yargs')
const figlet = require("figlet")
// === TAMBAHAN LOGIKA TRANSAKSI ===
const axios = require('axios')
const crypto = require("crypto")
const QRCode = require("qrcode")
const { sizeFormatter } = require('human-readable')
const toMs = require('ms')
// =================================

const { simple } = require("./function/myfunc")

//Waktu
moment.tz.setDefault("Asia/Jakarta").locale("id");
const d = new Date
const tanggal = d.toLocaleDateString('id', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})
const jamwib = moment.tz('Asia/Jakarta').format('HH:mm:ss')
const dnew = new Date(new Date + 3600000)
const dateIslamic = Intl.DateTimeFormat('id' + '-TN-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(dnew)

if (BOT_TOKEN == "YOUR_TELEGRAM_BOT_TOKEN") {
  return console.log("Bot token tidak boleh kosong, silahkan buat bot melalui https://t.me/BotFather")
}

//DATABASE
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.db = new (require('./function/database'))(`${opts._[0] ? opts._[0] + '_' : ''}options/database.json`, null, 2)

if (!db.data.order) db.data.order = {}
// [BARU] Database khusus script
if (!db.data.script) db.data.script = {}
if (!db.data.list) db.data.list = []
if (!db.data.testi) db.data.testi = []
if (!db.data.chat) db.data.chat = {}
if (!db.data.user) db.data.user = []
if (!db.data.sewa) db.data.sewa = {}
if (!db.data.produk) db.data.produk = {}
if (!db.data.transaksi) db.data.transaksi = []

let lastJSON = JSON.stringify(db.data)
if (!opts['test']) setInterval(async () => {
  if (JSON.stringify(db.data) == lastJSON) return
  await db.save()
  lastJSON = JSON.stringify(db.data)
}, 30 * 1000)

const bot = new Telegraf(BOT_TOKEN)

async function startronzz() {
  bot.on('callback_query', async (ronzz) => {
    let rawData = ronzz.callbackQuery.data
    let action = []
    
    // === LOGIKA PARSING ACTION (FIX SPASI GANDA) ===
    if (rawData.startsWith('detprod')) {
         let temp = rawData.replace('detprod ', '').replace('detprod', '') 
         let userIdMatch = temp.match(/^(\d+)/)
         if (userIdMatch) {
             action[0] = 'detprod'
             action[1] = userIdMatch[1] 
             action[2] = temp.substring(userIdMatch[1].length).trim() 
         }
    } else if (rawData.startsWith('buynow')) {
         let temp = rawData.replace('buynow ', '').replace('buynow', '')
         let userIdMatch = temp.match(/^(\d+)/)
         if (userIdMatch) {
             action[0] = 'buynow'
             action[1] = userIdMatch[1] 
             action[2] = temp.substring(userIdMatch[1].length).trim() 
         }
    } else if (rawData.startsWith('fixbuy')) {
        let parts = rawData.split(' ').filter(i => i !== '') // Filter spasi kosong
        action[0] = parts[0] 
        action[1] = parts[1] 
        action[2] = parts[2] 
        action[3] = parts.slice(3).join(' ').trim() 
    } else if (rawData.startsWith('stokpage')) {
        // FIX: Tambahkan .filter(i => i !== '') untuk menangani spasi ganda dari index.js
        let parts = rawData.split(' ').filter(i => i !== '')
        action[0] = parts[0]
        action[1] = parts[1]
        action[2] = parts[2]
        // [BARU] LOGIKA PARSER SCRIPT (Letakkan di bawah logika stokpage lama)
    } else if (rawData.startsWith('detscript')) {
         let temp = rawData.replace('detscript ', '').replace('detscript', '') 
         let userIdMatch = temp.match(/^(\d+)/)
         if (userIdMatch) { action[0] = 'detscript'; action[1] = userIdMatch[1]; action[2] = temp.substring(userIdMatch[1].length).trim() }
    } else if (rawData.startsWith('buyscript')) {
         let temp = rawData.replace('buyscript ', '').replace('buyscript', '')
         let userIdMatch = temp.match(/^(\d+)/)
         if (userIdMatch) { action[0] = 'buyscript'; action[1] = userIdMatch[1]; action[2] = temp.substring(userIdMatch[1].length).trim() }
    } else if (rawData.startsWith('fixbuyscript')) {
        let parts = rawData.split(' ').filter(i => i !== '') 
        action[0] = parts[0]; action[1] = parts[1]; action[2] = parts[2]; action[3] = parts.slice(3).join(' ').trim() 
    } else if (rawData.startsWith('scriptpage')) {
        let parts = rawData.split(' ').filter(i => i !== '')
        action[0] = parts[0]; action[1] = parts[1]; action[2] = parts[2]
    } else {
        action = rawData.split(" ").filter(i => i !== '')
    }
    // ============================
    // ============================
    
    args = action
    user_id = Number(action[1])
    const user = simple.getUserName(ronzz.callbackQuery.from)
    const isOwner = [ronzz.botInfo.username, ...global.OWNER].map(v => v.replace("https://t.me/", '')).includes(user.username ? user.username : "-")
    
    if (ronzz.callbackQuery.from.id != user_id && !isOwner) return ronzz.answerCbQuery('Uppss... button ini bukan untukmu!', { show_alert: true })
    
    const pushname = user.full_name.replace("@", "")
    const username = user.username ? user.username : "-";
    const userId = user.id.toString()
    const from = ronzz.callbackQuery.message.chat.id
    
    if (!userId.length <= 8 && !db.data.user.includes(userId + " ")) db.data.user.push(userId + " ")

    const reply = async (text) => {
      for (var x of simple.range(0, text.length, 4096)) {
        return await ronzz.replyWithMarkdown(text.substr(x, 4096), { disable_web_page_preview: true })
      }
    }

    function toRupiah(angka) {
      var saldo = '';
      var angkarev = angka.toString().split('').reverse().join('');
      for (var i = 0; i < angkarev.length; i++)
        if (i % 3 == 0) saldo += angkarev.substr(i, 3) + '.';
      return '' + saldo.split('', saldo.length - 1).reverse().join('');
    }

    try {
      switch (action[0]) {
        case "stokpage": {
            await ronzz.answerCbQuery().catch(() => {})

            // ID STIKER (Pastikan sama dengan yang berhasil di HOME)
            const STICKER_ID = "CAACAgIAAxkBAAE_GeBpOrDtRlfEtIv8J0xN5mhExWcwPgACSAIAAladvQoc9XL43CkU0DYE";

            // 1. KIRIM STIKER DULUAN
            let msgLoad = await ronzz.telegram.sendSticker(ronzz.chat.id, STICKER_ID).catch((e) => {
                 return null;
            });

            // 2. HAPUS PESAN LAMA
            await ronzz.deleteMessage().catch(() => {})
            
            // 3. TAHAN SEBENTAR (Animasi)
            await simple.sleep(800) 

            // 4. HAPUS STIKER
            if (msgLoad) {
                await ronzz.telegram.deleteMessage(msgLoad.chat.id, msgLoad.message_id).catch(() => {})
            }

    let keys = Object.keys(db.data.produk)
    let page = Number(action[2])
    let limit = 5
    let totalPage = Math.ceil(keys.length / limit)

    if (page < 1) page = 1
    if (page > totalPage) page = totalPage

    let start = (page - 1) * limit
    let end = page * limit
    let items = keys.slice(start, end)

    let keyboard = []

    // ===== STYLE A KOTAK =====
    let teks = `📦 *KATALOG PRODUK* (Hal: ${page}/${totalPage})\n\n`

    // kumpulan tombol angka di 1 baris
    let numberRow = []

    items.forEach((key, index) => {
        let p = db.data.produk[key]
        let stok = p.stok.length
        let icon = stok > 0 ? "✅" : "❌"
        let num = start + index + 1

        teks += 
`┌────────────────────────┐
 | [ ${num} ] ${p.name.toUpperCase()}
 | ${icon} Stok: ${stok} item
└────────────────────────┘
`

        numberRow.push({
            text: String(num),
            callback_data: `detprod ${user_id}${p.id}`
        })
    })

    // row angka (1 2 3 4 5) di satu baris
    if (numberRow.length) keyboard.push(numberRow)

    // nav tombol
    let nav = []
    if (page > 1) {
        nav.push({ 
            text: "⬅️ Sebelumnya", 
            callback_data: `stokpage ${user_id} ${page - 1}` 
        })
    }
    if (page < totalPage) {
        nav.push({ 
            text: "Selanjutnya ➡️", 
            callback_data: `stokpage ${user_id} ${page + 1}` 
        })
    }
    if (nav.length) keyboard.push(nav)

    // tombol kembali
    keyboard.push([{ 
        text: '🔄 Kembali Ke Halaman Pertama', 
        callback_data: `stokpage ${userId} 1` }])
        
        // Baris 4: HOME (Baru)
            keyboard.push([{ text: '🏠 KEMBALI KE HOME', callback_data: `home ${userId}` }])

    teks += "👇 Pilih nomor produk 👇"

    try {
        await ronzz.editMessageText(teks, {
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: keyboard }
        })
    } catch {
        await ronzz.reply(teks, {
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: keyboard }
        })
    }
}
break;

// [BARU] LOGIKA KEMBALI KE HOME (/START)
        case "home": {
            console.log("--> [DEBUG] User menekan tombol HOME");
            await ronzz.answerCbQuery().catch(() => {});

            // ID STIKER (Pastikan ini ID yang benar)
            const STICKER_ID = "CAACAgIAAxkBAAE_GeZpOrEqvdr3SKWQapWcLOUQdHrtNQACBQEAAladvQq35P22DkVfdzYE";
            
            let pushname = simple.getUserName(ronzz.callbackQuery.from).full_name;

            // --- PERUBAHAN UTAMA DI SINI ---
            
            // 1. KIRIM STIKER DULUAN (Supaya user lihat loading)
            // Kita pakai telegram.sendSticker biar lebih aman daripada reply
            let msgLoad = await ronzz.telegram.sendSticker(ronzz.chat.id, STICKER_ID).catch((e) => {
                console.log("[ERROR] Gagal kirim stiker:", e.message);
                return null;
            });
            
            // 2. BARU HAPUS PESAN LAMA (Menu sebelumnya dihapus setelah stiker muncul)
            await ronzz.deleteMessage().catch(() => {});
            
            // 3. TAHAN 1 DETIK (Biar stiker sempat joget)
            await simple.sleep(1000);

            // 4. HAPUS STIKERNYA
            if (msgLoad) {
                await ronzz.telegram.deleteMessage(msgLoad.chat.id, msgLoad.message_id).catch(() => {});
            }

            // 5. TAMPILKAN MENU UTAMA
            let button = [
              [{ text: '🛍️ APP PREMIUM & CLOUD', callback_data: 'stokpage ' + user_id + ' 1' }],
              [{ text: '🔥 KUMPULAN SCRIPT', callback_data: 'scriptpage ' + user_id + ' 1' }]
            ];
            
            let teks = `Halo ${pushname}! 👋\n\nSelamat datang di *${BOT_NAME}*.\nSilahkan pilih menu di bawah untuk mulai berbelanja.`;
            
            await ronzz.replyWithPhoto({ source: thumbnail }, {
                caption: teks,
                parse_mode: "MARKDOWN",
                reply_markup: { inline_keyboard: button }
            });
        }
        break;



        case "detprod": {
           let pid = action[2]
           if (!pid || !db.data.produk[pid]) return ronzz.answerCbQuery('Produk tidak ditemukan!', { show_alert: true })

           let p = db.data.produk[pid]
           // Tampilan diperbarui agar lebih rapi
           let caption = `📦 *DETAIL PRODUK*\n\n` +
                         `🏷️ *Nama:* ${p.name.toUpperCase()}\n` +
                         `💵 *Harga:* Rp${toRupiah(p.price)}\n` +
                         `📦 *Stok:* ${p.stok.length} Item\n` +
                         `📝 *Deskripsi:* ${p.desc}\n\n` +
                         `_Ingin membeli produk ini? Klik tombol di bawah._`

           let buyBtn = []
           // Tombol Beli Sekarang
           if (p.stok.length > 0) {
               buyBtn.push([{ text: '🛒 BELI SEKARANG', callback_data: `buynow ${userId}${pid}` }])
           } else {
               buyBtn.push([{ text: '❌ STOK HABIS', callback_data: 'dummy' }])
           }
           // Tombol Kembali
           buyBtn.push([{ text: '🔙 Kembali', callback_data: `stokpage ${userId} 1` }])

           try { await ronzz.editMessageText(caption, { parse_mode: "MARKDOWN", reply_markup: { inline_keyboard: buyBtn } }) } 
           catch (e) { await ronzz.reply(caption, { parse_mode: "MARKDOWN", reply_markup: { inline_keyboard: buyBtn } }) }
        }
        break

        case "buynow": {
            let pid = action[2]
            if (!pid || !db.data.produk[pid]) return ronzz.answerCbQuery('Produk hilang!', { show_alert: true })
            let p = db.data.produk[pid]
            
            let qtyBtns = []
            let currentRow = []
            
            // FIX: Menghapus batasan 5. Sekarang tombol akan muncul sesuai stok.
            // Kita batasi tampilan max 25 tombol agar layout Telegram tidak rusak jika stok ratusan.
            let maxDisplay = Math.min(p.stok.length, 25) 

            for (let i = 1; i <= maxDisplay; i++) {
                currentRow.push({ text: `${i}`, callback_data: `fixbuy ${userId} ${i} ${pid}` })
                
                // Logika agar tombol turun ke bawah setiap 5 angka (Baris baru)
                if (i % 5 === 0) {
                    qtyBtns.push(currentRow)
                    currentRow = []
                }
            }
            // Memasukkan sisa tombol jika tidak habis dibagi 5
            if (currentRow.length > 0) {
                qtyBtns.push(currentRow)
            }

            // Tombol Batal
            qtyBtns.push([{ text: '🔙 Batal', callback_data: `detprod ${userId}${pid}` }])

            let txt = `🔢 *PILIH JUMLAH PEMBELIAN*\n\n` +
                      `📦 *Produk:* ${p.name.toUpperCase()}\n` +
                      `💵 *Harga Satuan:* Rp${toRupiah(p.price)}\n` +
                      `📊 *Tersedia:* ${p.stok.length} Item\n\n` +
                      `_Silahkan pilih berapa banyak yang ingin dibeli:_`
            
            try { await ronzz.editMessageText(txt, { parse_mode: "MARKDOWN", reply_markup: { inline_keyboard: qtyBtns } }) } 
            catch (e) { await ronzz.reply(txt, { parse_mode: "MARKDOWN", reply_markup: { inline_keyboard: qtyBtns } }) }
        }
        break

        case "cancelbuy": {
            if (db.data.order[user_id]) {
                delete db.data.order[user_id]
                await ronzz.deleteMessage().catch(()=>{})
                await ronzz.reply("✅ Transaksi berhasil dibatalkan.")
            } else {
                await ronzz.answerCbQuery("Tidak ada transaksi yang aktif.", { show_alert: true })
                await ronzz.deleteMessage().catch(()=>{})
            }
        }
        break

        case "fixbuy": {
            let jumlah = parseInt(action[2]) 
            let pid = action[3]
            
            if (!db.data.produk[pid]) return ronzz.answerCbQuery('Error Produk', {show_alert: true})
            if (db.data.order[user_id] !== undefined) return ronzz.answerCbQuery('Selesaikan transaksi sebelumnya dulu!', {show_alert: true})
            if (db.data.produk[pid].stok.length < jumlah) return ronzz.answerCbQuery('Stok tidak cukup!', {show_alert: true})

            await ronzz.deleteMessage().catch(() => {})

            let p = db.data.produk[pid]
            let priceInt = parseInt(p.price)
            let amount = priceInt * jumlah
            
            reply(`*Mempersiapkan Pembayaran Pakasir...*\nProduk: ${p.name}\nJumlah: ${jumlah}\nTotal Awal: Rp${toRupiah(amount)}`)

            try {
                let merchantOrderId = "INV-" + Date.now()

                // [REQUEST PAKASIR]
                let trx;
                try {
                    trx = await axios.post("https://app.pakasir.com/api/transactioncreate/qris", {
                        project: PAKASIR_PROJECT, 
                        order_id: merchantOrderId,
                        amount: amount,
                        customer_name: pushname || "Customer",
                        customer_email: username + "@telegram.bot",
                        customer_phone: "081234567890",
                        api_key: PAKASIR_API_KEY 
                    }, { headers: { "Content-Type": "application/json" } })
                } catch (err) {
                     console.log("Pakasir Inquiry Error:", err.message)
                     reply("Gagal menghubungi gateway pembayaran.")
                     break
                }

                let result = trx.data
                if (!result?.payment?.payment_number) {
                   reply("Gagal membuat transaksi Pakasir.")
                   break
                }

                // === [PERBAIKAN: AMBIL TOTAL DARI PAKASIR] ===
                let totalBayar = result.payment.total_payment || amount // Ambil harga final (+fee)
                let qrString = result.payment.payment_number
                let qrPath = `./options/QRIS-${merchantOrderId}.png`
                
                await QRCode.toFile(qrPath, qrString, { color: { dark: "#000000", light: "#ffffff" }, width: 400 })

                await ronzz.replyWithPhoto({ source: qrPath }, {
                  // Gunakan totalBayar di caption agar sesuai QRIS
                  caption: `*🧾 TAGIHAN PEMBAYARAN*\n\n` +
                           `*📦 Produk:* ${p.name}\n` +
                           `*💵 Total:* Rp${toRupiah(totalBayar)}\n` + 
                           `*🔢 Jumlah:* ${jumlah}\n\n` +
                           `_Scan QRIS di atas untuk membayar otomatis._`,
                  parse_mode: "MARKDOWN",
                  reply_markup: { 
                      inline_keyboard: [
                          [{ text: "🚫 Batalkan Transaksi", callback_data: `cancelbuy ${userId}` }] 
                      ] 
                  }
                })

                db.data.order[user_id] = {
                  id: pid,
                  jumlah: jumlah,
                  chatId: from,
                  ref: merchantOrderId,
                  merchantOrderId: merchantOrderId
                }
                
                try { if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath) } catch (err) {}

                // [POLLING STATUS PAKASIR]
                (async () => {
                    let expired = Date.now() + toMs("5m")
                    while (db.data.order[user_id] !== undefined) {
                        await simple.sleep(15000)
                        
                        if (Date.now() >= expired) {
                             bot.telegram.sendMessage(from, "⚠️ Pesanan dibatalkan karena waktu habis.")
                             delete db.data.order[user_id]
                             break
                        }
                        
                        try {
                            // Cek status tetap menggunakan 'amount' (base price) sesuai dokumentasi Pakasir biasanya
                            let statusUrl = `https://app.pakasir.com/api/transactiondetail?project=${PAKASIR_PROJECT}&amount=${amount}&order_id=${merchantOrderId}&api_key=${PAKASIR_API_KEY}`
                            let cek = await axios.get(statusUrl)
                            let status = cek.data?.transaction?.status 

                            if (status === "completed") {
                                bot.telegram.sendMessage(from, "✅ Pembayaran Diterima! Mengirim akun...")

                                // Notif ke Owner
                                await bot.telegram.sendMessage(
                                  5894696119, 
                                  `📢 ORDER MASUK (PAKASIR)\n` +
                                  `👤 Dari: @${user.username || '-'}\n` +
                                  `📦 Produk: ${p.name}\n` +
                                  `💰 Masuk: Rp${toRupiah(amount)}`
                                );
                              
                                // Proses Pengiriman Barang
                                db.data.produk[pid].terjual += jumlah
                                let dataStok = []
                                for (let i = 0; i < jumlah; i++) {
                                    dataStok.push(db.data.produk[pid].stok.shift())
                                }
                                
                                let reffId = crypto.randomBytes(5).toString("hex").toUpperCase()
                                let teks = `Tanggal: ${tanggal}\nOrder ID: ${merchantOrderId}\n\n----- AKUN ANDA -----\n`
                                dataStok.forEach(i => {
                                    let dAkun = i.split("|")
                                    teks += `Email: ${dAkun[0]}\nPass: ${dAkun[1]}\nInfo: ${dAkun[2]||'-'}\n\n`
                                })
                                
                                fs.writeFileSync(`./options/TRX-${reffId}.txt`, teks, "utf8")
                                await bot.telegram.sendDocument(from, { source: `./options/TRX-${reffId}.txt`, filename: `Order-${p.name}.txt` }, { caption: "Terimakasih sudah berbelanja! 🤝" })
                                fs.unlinkSync(`./options/TRX-${reffId}.txt`)
                                delete db.data.order[user_id]
                                break
                            } 
                        } catch (err) { }
                    }
                })()

            } catch (e) {
                console.log("ERROR FIXBUY:", e.message)
                reply("Terjadi kesalahan sistem.")
            }
        }
        break
        
        // [BARU] MULAI LOGIKA SCRIPT DARI SINI ---------------------
        case "scriptpage": {
            await ronzz.answerCbQuery().catch(() => {})
            
            // ID STIKER
            const STICKER_ID = "CAACAgIAAxkBAAE_GeJpOrEfL8J6nO48dNol9asjo86zHQAC9AADVp29ChFYsPXZ_VVJNgQ";

            // 1. KIRIM STIKER DULUAN
            let msgLoad = await ronzz.telegram.sendSticker(ronzz.chat.id, STICKER_ID).catch((e) => {
                 return null;
            });

            // 2. HAPUS PESAN LAMA
            await ronzz.deleteMessage().catch(() => {})
            
            // 3. TAHAN SEBENTAR
            await simple.sleep(800)

            // 4. HAPUS STIKER
            if (msgLoad) {
                await ronzz.telegram.deleteMessage(msgLoad.chat.id, msgLoad.message_id).catch(() => {})
            }
            
            let keys = Object.keys(db.data.script) // Perhatikan ini pakai db.data.script
            let page = Number(action[2]); let limit = 5
            let totalPage = Math.ceil(keys.length / limit)

            if (page < 1) page = 1; if (page > totalPage) page = totalPage
            let start = (page - 1) * limit; let end = page * limit; let items = keys.slice(start, end)
            let keyboard = []; let teks = `📜 *KATALOG SCRIPT* (Hal: ${page}/${totalPage})\n\n`; let numberRow = []

            items.forEach((key, index) => {
                let p = db.data.script[key]
                let stok = p.stok.length
                let icon = stok > 0 ? "✅" : "❌"
                let num = start + index + 1
                teks += `┌────────────────────────┐\n | [ ${num} ] ${p.name.toUpperCase()}\n | ${icon} Stok: ${stok} item\n└────────────────────────┘\n`
                numberRow.push({ text: String(num), callback_data: `detscript ${user_id}${p.id}` })
            })
            if (numberRow.length) keyboard.push(numberRow)

            let nav = []
            if (page > 1) nav.push({ text: "⬅️ Sebelumnya", callback_data: `scriptpage ${user_id} ${page - 1}` })
            if (page < totalPage) nav.push({ text: "Selanjutnya ➡️", callback_data: `scriptpage ${user_id} ${page + 1}` })
            if (nav.length) keyboard.push(nav)
            // Baris 3: Refresh Halaman 1
            keyboard.push([{ text: '🔄 Kembali Ke Halaman Pertama', callback_data: `scriptpage ${userId} 1` }])

            // Baris 4: HOME (Baru)
            keyboard.push([{ text: '🏠 KEMBALI KE HOME', callback_data: `home ${userId}` }])

            teks += "👇 Pilih nomor script 👇"
            try { await ronzz.editMessageText(teks, { parse_mode: "Markdown", reply_markup: { inline_keyboard: keyboard } }) } 
            catch { await ronzz.reply(teks, { parse_mode: "Markdown", reply_markup: { inline_keyboard: keyboard } }) }
        }
        break;

        case "detscript": {
           let pid = action[2]
           if (!pid || !db.data.script[pid]) return ronzz.answerCbQuery('Script tidak ditemukan!', { show_alert: true })
           let p = db.data.script[pid]
           let caption = `*📜 DETAIL SCRIPT*\n\n*🏷️ Nama:* ${p.name}\n*💰 Harga:* Rp${toRupiah(p.price)}\n*📦 Stok:* ${p.stok.length} Item\n*📝 Deskripsi:* ${p.desc}\n\n_Ingin membeli script ini?_`
           let buyBtn = []
           if (p.stok.length > 0) { buyBtn.push([{ text: '🛒 BELI SCRIPT', callback_data: `buyscript ${userId}${pid}` }]) } 
           else { buyBtn.push([{ text: '❌ STOK HABIS', callback_data: 'dummy' }]) }
           buyBtn.push([{ text: '🔙 Kembali', callback_data: `scriptpage ${userId} 1` }])

           try { await ronzz.editMessageText(caption, { parse_mode: "MARKDOWN", reply_markup: { inline_keyboard: buyBtn } }) } 
           catch (e) { await ronzz.reply(caption, { parse_mode: "MARKDOWN", reply_markup: { inline_keyboard: buyBtn } }) }
        }
        break

        case "buyscript": {
            let pid = action[2]
            if (!pid || !db.data.script[pid]) return ronzz.answerCbQuery('Script hilang!', { show_alert: true })
            let p = db.data.script[pid]
            let qtyBtns = []
            let maxShow = Math.min(5, p.stok.length)
            let row = []
            for (let i=1; i<=maxShow; i++) row.push({ text: `${i}`, callback_data: `fixbuyscript ${userId} ${i} ${pid}` })
            qtyBtns.push(row)
            qtyBtns.push([{ text: '🔙 Batal', callback_data: `detscript ${userId}${pid}` }])

            let txt = `*🔢 JUMLAH SCRIPT*\n\nProduk: ${p.name}\nHarga: Rp${toRupiah(p.price)}\n\n_Pilih jumlah pembelian:_`
            try { await ronzz.editMessageText(txt, { parse_mode: "MARKDOWN", reply_markup: { inline_keyboard: qtyBtns } }) } 
            catch (e) { await ronzz.reply(txt, { parse_mode: "MARKDOWN", reply_markup: { inline_keyboard: qtyBtns } }) }
        }
        break

        case "fixbuyscript": {
            let jumlah = parseInt(action[2]); let pid = action[3]
            if (!db.data.script[pid]) return ronzz.answerCbQuery('Error Script', {show_alert: true})
            if (db.data.order[user_id] !== undefined) return ronzz.answerCbQuery('Selesaikan transaksi sebelumnya!', {show_alert: true})
            if (db.data.script[pid].stok.length < jumlah) return ronzz.answerCbQuery('Stok script kurang!', {show_alert: true})

            await ronzz.deleteMessage().catch(() => {})
            let p = db.data.script[pid]
            let amount = parseInt(p.price) * jumlah
            reply(`*Mempersiapkan Pembayaran Script Pakasir...*\nProduk: ${p.name}\nTotal Awal: Rp${toRupiah(amount)}`)

            try {
                let merchantOrderId = "INV-SCR-" + Date.now()

                // [REQUEST PAKASIR]
                let trx;
                try {
                    trx = await axios.post("https://app.pakasir.com/api/transactioncreate/qris", {
                        project: PAKASIR_PROJECT, 
                        order_id: merchantOrderId,
                        amount: amount,
                        customer_name: pushname || "Customer Script",
                        customer_email: username + "@telegram.bot",
                        customer_phone: "081234567890",
                        api_key: PAKASIR_API_KEY 
                    }, { headers: { "Content-Type": "application/json" } })
                } catch (err) {
                     reply("Gagal menghubungi gateway.")
                     break
                }

                let result = trx.data
                if (!result?.payment?.payment_number) {
                   reply("Gagal membuat transaksi Pakasir.")
                   break
                }

                // === [PERBAIKAN: AMBIL TOTAL DARI PAKASIR] ===
                let totalBayar = result.payment.total_payment || amount // Ambil harga final
                let qrString = result.payment.payment_number
                let qrPath = `./options/QRIS-${merchantOrderId}.png`
                
                await QRCode.toFile(qrPath, qrString, { color: { dark: "#000000", light: "#ffffff" }, width: 400 })

                await ronzz.replyWithPhoto({ source: qrPath }, {
                  // Gunakan totalBayar di caption
                  caption: `*🧾 TAGIHAN SCRIPT*\n*📦:* ${p.name}\n*💵 Total:* Rp${toRupiah(totalBayar)}\n\n_Scan QRIS di atas_`,
                  parse_mode: "MARKDOWN",
                  reply_markup: { 
                      inline_keyboard: [
                          [{ text: "🚫 Batalkan Transaksi", callback_data: `cancelbuy ${userId}` }] 
                      ] 
                  }
                })

                db.data.order[user_id] = { id: pid, jumlah: jumlah, chatId: from, ref: merchantOrderId, merchantOrderId: merchantOrderId, type: 'script' }
                try { if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath) } catch (err) {}

                // [POLLING STATUS PAKASIR]
                (async () => {
                    let expired = Date.now() + toMs("5m")
                    while (db.data.order[user_id] !== undefined) {
                        await simple.sleep(15000)
                        if (Date.now() >= expired) { bot.telegram.sendMessage(from, "⚠️ Waktu habis."); delete db.data.order[user_id]; break }
                        
                        try {
                            let statusUrl = `https://app.pakasir.com/api/transactiondetail?project=${PAKASIR_PROJECT}&amount=${amount}&order_id=${merchantOrderId}&api_key=${PAKASIR_API_KEY}`
                            let cek = await axios.get(statusUrl)
                            let status = cek.data?.transaction?.status 

                            if (status === "completed") {
                                bot.telegram.sendMessage(from, "✅ Lunas! Mengirim file script..."); 
                                
                                // Notif Owner
                                await bot.telegram.sendMessage(
                                  5894696119,
                                  `📢 ORDER SCRIPT (PAKASIR)\n` +
                                  `👤 Dari: @${user.username || '-'}\n` +
                                  `📦 Produk: ${p.name}`
                                );

                                // Proses Pengiriman Script
                                db.data.script[pid].terjual += jumlah
                                let dataStok = []
                                for (let i = 0; i < jumlah; i++) { dataStok.push(db.data.script[pid].stok.shift()) }
                                
                                let reffId = crypto.randomBytes(5).toString("hex").toUpperCase()
                                let teks = `Order ID: ${merchantOrderId}\n\n`
                                dataStok.forEach(i => { let dAkun = i.split("|"); teks += `Link Download: ${dAkun[0]}\nPassword: ${dAkun[1]||'-'}\n\n` })
                                
                                fs.writeFileSync(`./options/TRX-${reffId}.txt`, teks, "utf8")
                                await bot.telegram.sendDocument(from, { source: `./options/TRX-${reffId}.txt`, filename: `Script-${p.name}.txt` })
                                fs.unlinkSync(`./options/TRX-${reffId}.txt`)
                                delete db.data.order[user_id]
                                break
                            } 
                        } catch (err) { }
                    }
                })()

            } catch (e) { reply("Error Payment Script.") }
        }
        break
        // [BARU] AKHIR LOGIKA SCRIPT --------------------------------

        case "menucmd": {
          let button = [[{ text: '💰 ORDER MENU', callback_data: 'ordercmd ' + userId }, { text: 'STORE MENU 🛍️', callback_data: 'storecmd ' + userId }], [{ text: '📒 INFO BOT', callback_data: 'infocmd ' + userId }, { text: 'OWNER MENU 🧒🏻', callback_data: 'ownercmd ' + userId }]]
          let teks = `*🤖 BOT INFO 🤖*
• Bot Name: ${BOT_NAME}
• Runtime: ${simple.runtime(process.uptime())}
• User: ${db.data.user.length} Users
• Owner: [@${OWNER_NAME}](${OWNER[0]})

*👤 USER INFO 👤*
• Tag: [@${pushname}](https://t.me/${username})
• Username: ${username}
• Name: ${pushname}

*📆 DATE INFO 📆*
• Masehi: ${moment.tz("Asia/Jakarta").format("DD MMMM YYYY")}
• Hijriah: ${dateIslamic}

*⏰ TIME INFO ⏰*
• WIB: ${moment.tz('Asia/Jakarta').format('HH:mm:ss')}
• WITA: ${moment.tz('Asia/Makassar').format('HH:mm:ss')}
• WIT: ${moment.tz('Asia/Jayapura').format('HH:mm:ss')}

_Silahkan pilih menu di bawah ini._`
          try {
            await ronzz.editMessageMedia({
              type: "photo",
              media: {
                source: thumbnail
              },
              caption: teks,
              parse_mode: "MARKDOWN",
              disable_web_page_preview: true
            }, {
              reply_markup: {
                inline_keyboard: button
              }
            })
          } catch {
            await ronzz.replyWithPhoto({
              source: thumbnail
            }, {
              caption: teks,
              parse_mode: "MARKDOWN",
              disable_web_page_preview: true,
              reply_markup: {
                inline_keyboard: button
              }
            })
          }
        }
          break

        case "ordercmd": {
          let button = [[{ text: '📖 MENU', callback_data: 'menucmd ' + userId }, { text: 'STORE MENU 🛍️', callback_data: 'storecmd ' + userId }], [{ text: '📒 INFO BOT', callback_data: 'infocmd ' + userId }, { text: 'OWNER MENU 🧒🏻', callback_data: 'ownercmd ' + userId }]]
          let teks = `*🤖 BOT INFO 🤖*
• Bot Name: ${BOT_NAME}
• Runtime: ${simple.runtime(process.uptime())}
• User: ${db.data.user.length} Users
• Owner: [@${OWNER_NAME}](${OWNER[0]})
  
*👤 USER INFO 👤*
• Tag: [@${pushname}](https://t.me/${username})
• Username: ${username}
• Name: ${pushname}
  
*📆 DATE INFO 📆*
• Masehi: ${moment.tz("Asia/Jakarta").format("DD MMMM YYYY")}
• Hijriah: ${dateIslamic}
  
*⏰ TIME INFO ⏰*
• WIB: ${moment.tz('Asia/Jakarta').format('HH:mm:ss')}
• WITA: ${moment.tz('Asia/Makassar').format('HH:mm:ss')}
• WIT: ${moment.tz('Asia/Jayapura').format('HH:mm:ss')}
  
╭─────╼「 *ORDER MENU* 」
│☛ /stok
╰─────╼`
          try {
            await ronzz.editMessageMedia({
              type: "photo",
              media: {
                source: thumbnail
              },
              caption: teks,
              parse_mode: "MARKDOWN",
              disable_web_page_preview: true
            }, {
              reply_markup: {
                inline_keyboard: button
              }
            })
          } catch {
            await ronzz.replyWithPhoto({
              source: thumbnail
            }, {
              caption: teks,
              parse_mode: "MARKDOWN",
              disable_web_page_preview: true,
              reply_markup: {
                inline_keyboard: button
              }
            })
          }
        }
          break

        case "storecmd": {
          let button = [[{ text: '📖 MENU', callback_data: 'menucmd ' + userId }, { text: 'ORDER MENU 💰', callback_data: 'ordercmd ' + userId }], [{ text: '📒 INFO BOT', callback_data: 'infocmd ' + userId }, { text: 'OWNER MENU 🧒🏻', callback_data: 'ownercmd ' + userId }]]
          let teks = `*🤖 BOT INFO 🤖*
• Bot Name: ${BOT_NAME}
• Runtime: ${simple.runtime(process.uptime())}
• User: ${db.data.user.length} Users
• Owner: [@${OWNER_NAME}](${OWNER[0]})
    
*👤 USER INFO 👤*
• Tag: [@${pushname}](https://t.me/${username})
• Username: ${username}
• Name: ${pushname}
    
*📆 DATE INFO 📆*
• Masehi: ${moment.tz("Asia/Jakarta").format("DD MMMM YYYY")}
• Hijriah: ${dateIslamic}
    
*⏰ TIME INFO ⏰*
• WIB: ${moment.tz('Asia/Jakarta').format('HH:mm:ss')}
• WITA: ${moment.tz('Asia/Makassar').format('HH:mm:ss')}
• WIT: ${moment.tz('Asia/Jayapura').format('HH:mm:ss')}
    
╭─────╼「 *STORE MENU* 」
│☛ /list
│☛ /testi
│☛ /addlist
│☛ /dellist
│☛ /setlist
│☛ /addtesti
│☛ /deltesti
│☛ /settesti
│☛ /kalkulator
│☛ /done
│☛ /setdone
│☛ /deldone
│☛ /changedone
│☛ /proses
│☛ /setproses
│☛ /delproses
│☛ /changeproses
╰─────╼`
          try {
            await ronzz.editMessageMedia({
              type: "photo",
              media: {
                source: thumbnail
              },
              caption: teks,
              parse_mode: "MARKDOWN",
              disable_web_page_preview: true
            }, {
              reply_markup: {
                inline_keyboard: button
              }
            })
          } catch {
            await ronzz.replyWithPhoto({
              source: thumbnail
            }, {
              caption: teks,
              parse_mode: "MARKDOWN",
              disable_web_page_preview: true,
              reply_markup: {
                inline_keyboard: button
              }
            })
          }
        }
          break

        case "infocmd": {
          let button = [[{ text: '📖 MENU', callback_data: 'menucmd ' + userId }, { text: 'ORDER MENU 💰', callback_data: 'ordercmd ' + userId }], [{ text: '🛍️ STORE MENU', callback_data: 'storecmd ' + userId }, { text: 'OWNER MENU 🧒🏻', callback_data: 'ownercmd ' + userId }]]
          let teks = `*🤖 BOT INFO 🤖*
• Bot Name: ${BOT_NAME}
• Runtime: ${simple.runtime(process.uptime())}
• User: ${db.data.user.length} Users
• Owner: [@${OWNER_NAME}](${OWNER[0]})
      
*👤 USER INFO 👤*
• Tag: [@${pushname}](https://t.me/${username})
• Username: ${username}
• Name: ${pushname}
      
*📆 DATE INFO 📆*
• Masehi: ${moment.tz("Asia/Jakarta").format("DD MMMM YYYY")}
• Hijriah: ${dateIslamic}
      
*⏰ TIME INFO ⏰*
• WIB: ${moment.tz('Asia/Jakarta').format('HH:mm:ss')}
• WITA: ${moment.tz('Asia/Makassar').format('HH:mm:ss')}
• WIT: ${moment.tz('Asia/Jayapura').format('HH:mm:ss')}
      
╭─────╼「 *INFO BOT* 」
│☛ /creator
│☛ /owner
│☛ /ping
│☛ /runtime
│☛ /script
╰─────╼`
          try {
            await ronzz.editMessageMedia({
              type: "photo",
              media: {
                source: thumbnail
              },
              caption: teks,
              parse_mode: "MARKDOWN",
              disable_web_page_preview: true
            }, {
              reply_markup: {
                inline_keyboard: button
              }
            })
          } catch {
            await ronzz.replyWithPhoto({
              source: thumbnail
            }, {
              caption: teks,
              parse_mode: "MARKDOWN",
              disable_web_page_preview: true,
              reply_markup: {
                inline_keyboard: button
              }
            })
          }
        }
          break

        case "ownercmd": {
          let button = [[{ text: '📖 MENU', callback_data: 'menucmd ' + userId }, { text: 'ORDER MENU 💰', callback_data: 'ordercmd ' + userId }], [{ text: '🛍️ STORE MENU', callback_data: 'storecmd ' + userId }, { text: 'INFO BOT 📒', callback_data: 'infocmd ' + userId }]]
          let teks = `*🤖 BOT INFO 🤖*
• Bot Name: ${BOT_NAME}
• Runtime: ${simple.runtime(process.uptime())}
• User: ${db.data.user.length} Users
• Owner: [@${OWNER_NAME}](${OWNER[0]})
    
*👤 USER INFO 👤*
• Tag: [@${pushname}](https://t.me/${username})
• Username: ${username}
• Name: ${pushname}
    
*📆 DATE INFO 📆*
• Masehi: ${moment.tz("Asia/Jakarta").format("DD MMMM YYYY")}
• Hijriah: ${dateIslamic}
    
*⏰ TIME INFO ⏰*
• WIB: ${moment.tz('Asia/Jakarta').format('HH:mm:ss')}
• WITA: ${moment.tz('Asia/Makassar').format('HH:mm:ss')}
• WIT: ${moment.tz('Asia/Jayapura').format('HH:mm:ss')}
    
╭─────╼「 *OWNER MENU* 」
│☛ /addproduk
│☛ /delproduk
│☛ /setkode
│☛ /setjudul
│☛ /setdesk
│☛ /setsnk
│☛ /setharga
│☛ /setprofit
│☛ /addstok
│☛ /delstok
│☛ /rekap
│☛ /backup
│☛ /broadcast
│☛ /welcome
│☛ /goodbye
╰─────╼`
          try {
            await ronzz.editMessageMedia({
              type: "photo",
              media: {
                source: thumbnail
              },
              caption: teks,
              parse_mode: "MARKDOWN",
              disable_web_page_preview: true
            }, {
              reply_markup: {
                inline_keyboard: button
              }
            })
          } catch {
            await ronzz.replyWithPhoto({
              source: thumbnail
            }, {
              caption: teks,
              parse_mode: "MARKDOWN",
              disable_web_page_preview: true,
              reply_markup: {
                inline_keyboard: button
              }
            })
          }
        }
          break

        case 'rekapminggu': {
          function kelompokkanTransaksi(transaksi) {
            let today = new Date(moment.tz("Asia/Jakarta").format("YYYY-MM-DD"));
            let startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());

            let endOfWeek = new Date(today);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23);
            endOfWeek.setMinutes(59);

            let transaksiMingguIni = transaksi.filter(data => {
              let transaksiDate = new Date(data.date);
              transaksiDate.setDate(transaksiDate.getDate());
              return transaksiDate >= startOfWeek && transaksiDate <= endOfWeek;
            });

            let transaksiMingguan = {};
            transaksiMingguIni.forEach(data => {
              let tanggall = new Date(data.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
              if (!transaksiMingguan[tanggall]) {
                transaksiMingguan[tanggall] = [];
              }
              transaksiMingguan[tanggall].push(data);
            });

            let sortedTransaksiMingguan = {};
            Object.keys(transaksiMingguan).sort((a, b) => {
              let days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
              return days.indexOf(a.split(',')[0]) - days.indexOf(b.split(',')[0]);
            }).forEach(key => {
              sortedTransaksiMingguan[key] = transaksiMingguan[key];
            });

            return sortedTransaksiMingguan;
          }

          function rekapMingguan(transaksiHarian) {
            let totalStokTerjual = 0;
            let totalPendapatanKotor = 0;
            let totalPendapatanBersih = 0;
            let rekap = "*Rekap Mingguan:*\n\n";

            let sortedDates = Object.keys(transaksiHarian).sort((a, b) => {
              let dateA = new Date(a.split(',')[1]);
              let dateB = new Date(b.split(',')[1]);
              return dateA - dateB;
            });

            sortedDates.forEach((tanggall, index) => {
              let dataTransaksi = transaksiHarian[tanggall];
              let stokTerjualHarian = 0;
              let pendapatanKotorHarian = 0;
              let pendapatanBersihHarian = 0;

              dataTransaksi.forEach(data => {
                stokTerjualHarian += parseInt(data.jumlah);
                pendapatanKotorHarian += parseInt(data.price) * parseInt(data.jumlah);
                pendapatanBersihHarian += parseInt(data.profit) * parseInt(data.jumlah);
              });

              totalStokTerjual += stokTerjualHarian;
              totalPendapatanKotor += pendapatanKotorHarian;
              totalPendapatanBersih += pendapatanBersihHarian;

              rekap += `${index + 1}. *${new Date(tanggall.split(',')[1] + tanggall.split(',')[2]).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}*\n`;
              rekap += `- *Stok Terjual:* ${stokTerjualHarian}\n`;
              rekap += `- *Pendapatan Kotor:* Rp${toRupiah(pendapatanKotorHarian)}\n`;
              rekap += `- *Pendapatan Bersih:* Rp${toRupiah(pendapatanBersihHarian)}\n\n`;
            });
            rekap += `- *Total Stok Terjual:* ${totalStokTerjual}\n`;
            rekap += `- *Total Pendapatan Kotor:* Rp${toRupiah(totalPendapatanKotor)}\n`;
            rekap += `- *Total Pendapatan Bersih:* Rp${toRupiah(totalPendapatanBersih)}\n\n`;

            return rekap;
          }

          let mingguan = kelompokkanTransaksi(db.data.transaksi);

          try {
            ronzz.editMessageText(rekapMingguan(mingguan), {
              parse_mode: "MARKDOWN",
              disable_web_page_preview: true
            })
          } catch {
            reply(rekapMingguan(mingguan))
          }
        }
          break

        case 'rekapbulan': {
          function bulankelompok(transaksi) {
            let transaksiHarian = {};

            transaksi.forEach(data => {
              let tanggall = new Date(data.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
              if (!transaksiHarian[tanggall]) {
                transaksiHarian[tanggall] = [];
              }
              transaksiHarian[tanggall].push(data);
            });

            return transaksiHarian;
          }

          function rekapBulanan(transaksiHarian) {
            let totalStokTerjual = 0;
            let totalPendapatanKotor = 0;
            let totalPendapatanBersih = 0;
            let rekap = "*Rekap Bulanan:*\n\n";

            const bulanan = {};

            Object.entries(transaksiHarian).forEach(([tanggall, dataTransaksi]) => {
              let bulan = new Date(tanggall).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

              if (!bulanan[bulan]) {
                bulanan[bulan] = {
                  stokTerjual: 0,
                  pendapatanKotor: 0,
                  pendapatanBersih: 0,
                  transaksiPerHari: {}
                };
              }

              dataTransaksi.forEach(data => {
                let hari = new Date(data.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

                if (!bulanan[bulan].transaksiPerHari[hari]) {
                  bulanan[bulan].transaksiPerHari[hari] = [];
                }

                bulanan[bulan].transaksiPerHari[hari].push(data);
              });

              dataTransaksi.forEach(data => {
                bulanan[bulan].stokTerjual += parseInt(data.jumlah);
                bulanan[bulan].pendapatanKotor += parseInt(data.price) * parseInt(data.jumlah);
                bulanan[bulan].pendapatanBersih += parseInt(data.profit) * parseInt(data.jumlah);
              });
            });

            Object.entries(bulanan).forEach(([bulan, dataBulan]) => {
              rekap += `\`${bulan}:\`\n`;

              Object.entries(dataBulan.transaksiPerHari).forEach(([hari, transaksiHari]) => {
                let stokTerjualHari = 0;
                let pendapatanKotorHari = 0;
                let pendapatanBersihHari = 0;
                transaksiHari.forEach(transaksi => {
                  stokTerjualHari += parseInt(transaksi.jumlah);
                  pendapatanKotorHari += parseInt(transaksi.price) * parseInt(transaksi.jumlah);
                  pendapatanBersihHari += parseInt(transaksi.profit) * parseInt(transaksi.jumlah);
                });
                rekap += `- *${hari}:*\n`;
                rekap += `  - *Stok Terjual:* ${stokTerjualHari}\n`;
                rekap += `  - *Pendapatan Kotor:* Rp${toRupiah(parseInt(pendapatanKotorHari))}\n`;
                rekap += `  - *Pendapatan Bersih:* Rp${toRupiah(parseInt(pendapatanBersihHari))}\n\n`;
              });

              rekap += `- *Total Stok Terjual:* ${dataBulan.stokTerjual}\n`;
              rekap += `- *Total Pendapatan Kotor:* Rp${toRupiah(dataBulan.pendapatanKotor)}\n`;
              rekap += `- *Total Pendapatan Bersih:* Rp${toRupiah(dataBulan.pendapatanBersih)}\n\n`;

              totalStokTerjual += dataBulan.stokTerjual;
              totalPendapatanKotor += dataBulan.pendapatanKotor;
              totalPendapatanBersih += dataBulan.pendapatanBersih;
            });

            return rekap;
          }

          let bulanan = bulankelompok(db.data.transaksi);

          try {
            ronzz.editMessageText(rekapBulanan(bulanan), {
              parse_mode: "MARKDOWN",
              disable_web_page_preview: true
            })
          } catch {
            reply(rekapBulanan(bulanan))
          }
        }
          break
          
        case 'welcome': {
          if (action[2] == "on") {
            db.data.chat[action[3]].welcome = true
            
            try {
              ronzz.editMessageText("Welcome berhasil diaktifkan di Group ini.", {
                parse_mode: "MARKDOWN",
                disable_web_page_preview: true
              })
            } catch {
              reply("Welcome berhasil diaktifkan di Group ini.")
            }
          } else if (action[2] == "off") {
            db.data.chat[action[3]].welcome = false
            
            try {
              ronzz.editMessageText("Welcome berhasil dinonaktifkan di Group ini.", {
                parse_mode: "MARKDOWN",
                disable_web_page_preview: true
              })
            } catch {
              reply("Welcome berhasil dinonaktifkan di Group ini.")
            }
          }
        }
          break
          
        case 'goodbye': {
          if (action[2] == "on") {
            db.data.chat[action[3]].goodbye = true
            
            try {
              ronzz.editMessageText("Good Bye berhasil diaktifkan di Group ini.", {
                parse_mode: "MARKDOWN",
                disable_web_page_preview: true
              })
            } catch {
              reply("Good Bye berhasil diaktifkan di Group ini.")
            }
          } else if (action[2] == "off") {
            db.data.chat[action[3]].goodbye = false
            
            try {
              ronzz.editMessageText("Good Bye berhasil dinonaktifkan di Group ini.", {
                parse_mode: "MARKDOWN",
                disable_web_page_preview: true
              })
            } catch {
              reply("Good Bye berhasil dinonaktifkan di Group ini.")
            }
          }
        }
          break

        case 'tambah': {
          try {
            ronzz.editMessageText(`${Number(action[2]) + Number(action[3])}`)
          } catch {
            ronzz.reply(`${Number(action[2]) + Number(action[3])}`)
          }
        }
          break

        case 'kurang': {
          try {
            ronzz.editMessageText(`${Number(action[2]) - Number(action[3])}`)
          } catch {
            ronzz.reply(`${Number(action[2]) - Number(action[3])}`)
          }
        }
          break

        case 'bagi': {
          try {
            ronzz.editMessageText(`${Number(action[2]) / Number(action[3])}`)
          } catch {
            ronzz.reply(`${Number(action[2]) / Number(action[3])}`)
          }
        }
          break

        case 'kali': {
          try {
            ronzz.editMessageText(`${Number(action[2]) * Number(action[3])}`)
          } catch {
            ronzz.reply(`${Number(action[2]) * Number(action[3])}`)
          }
        }
          break
      }
    } catch (e) {
      console.log(e)
    }
  })

  bot.command('start', async (ronzz) => {
    let user = simple.getUserName(ronzz.message.from)
    
    // === GANTI ID STIKER INI DENGAN ID PUNYA KAMU ===
    const STICKER_ID = "CAACAgIAAxkBAAE-6CVpNW_eMimyblcf4m5TpUSjBoZhOQACAwEAAladvQoC5dF4h-X6TzYE"; 
    
    // 1. Kirim Stiker Animasi Bebek Uang
    let msgLoad = await ronzz.replyWithSticker(STICKER_ID).catch(() => {
        // Fallback jika stiker gagal, kirim teks loading biasa
        return ronzz.reply("⏳ _Memuat menu utama..._");
    });
    
    await simple.sleep(1500) // Animasi 1.5 detik
    
    // 2. Hapus Stiker/Loading Text
    if (msgLoad) {
        await ronzz.telegram.deleteMessage(msgLoad.chat.id, msgLoad.message_id).catch(() => {})
    }

    // 3. Button Menu
    let button = [
      [
        { text: '🛍️ APP PREMIUM & CLOUD', callback_data: 'stokpage ' + user.id.toString() + ' 1' }
      ],
      [
        { text: '🔥 KUMPULAN SCRIPT', callback_data: 'scriptpage ' + user.id.toString() + ' 1' }
      ]
    ]

    let teks = `Halo ${user.full_name}! 👋\n\nSelamat datang di *${BOT_NAME}*.\nSilahkan pilih menu di bawah untuk mulai berbelanja.`
    
    await ronzz.replyWithPhoto({
        source: thumbnail 
    }, {
        caption: teks,
        parse_mode: "MARKDOWN",
        disable_web_page_preview: true,
        reply_markup: {
            inline_keyboard: button
        }
    })
  })

  bot.on('message', async (ronzz) => {
    if (ronzz.message.new_chat_member && ronzz.message.new_chat_member.id !== ronzz.botInfo.id && db.data.chat[ronzz.message.chat.id].welcome) {
      let message = ronzz.message
      let groupname = message.chat.title
      let groupmembers = await bot.telegram.getChatMembersCount(message.chat.id)
      let pp_user = await simple.getPhotoProfile(message.new_chat_member.id)
      let full_name = simple.getUserName(message.new_chat_member).full_name
      let teks = `*Welcome To ${groupname}*
      
📛 : [@${full_name}](https://t.me/${message.from.username})
🪪 : ${message.from.id}
🌐 : ${message.from.language_code !== undefined ? message.from.language_code : "id"}
🏅 : ${groupmembers} Members
📆 : ${moment.tz('Asia/Jakarta').format('dddd')}, ${tanggal}
⏰ : ${jamwib} *WIB*`

      await ronzz.replyWithPhoto({
        url: pp_user
      }, {
        caption: teks,
        parse_mode: "Markdown",
        disable_web_page_preview: true
      })
    }
    if (ronzz.message.left_chat_member && ronzz.message.left_chat_member.id !== ronzz.botInfo.id && db.data.chat[ronzz.message.chat.id].goodbye) {
      let message = ronzz.message
      let groupname = message.chat.title
      let groupmembers = await bot.telegram.getChatMembersCount(message.chat.id)
      let pp_user = await simple.getPhotoProfile(message.left_chat_member.id)
      let full_name = simple.getUserName(message.left_chat_member).full_name
      let teks = `*Leave From Group ${groupname}*
      
📛 : [@${full_name}](https://t.me/${message.from.username})
🪪 : ${message.from.id}
🌐 : ${message.from.language_code !== undefined ? message.from.language_code : "id"}
🏅 : ${groupmembers} Members
📆 : ${moment.tz('Asia/Jakarta').format('dddd')}, ${tanggal}
⏰ : ${jamwib} *WIB*

*┗━━ ❑ Good Bye👋*`

      await ronzz.replyWithPhoto({
        url: pp_user
      }, {
        caption: teks,
        parse_mode: "Markdown",
        disable_web_page_preview: true
      })
    }
    ronzz.download = async (save = false, path = '') => {
      const id = await simple.getFileId(ronzz);
      const { href } = await bot.telegram.getFileLink(id);
      if (save) {
        let res = await simple.fetchBuffer(href)
        fs.writeFileSync(path, res?.data)
        return path
      } else if (!save) {
        return href;
      }
    }
    require("./index")(ronzz, bot)
  })

  bot.launch({
    dropPendingUpdates: true
  })

  bot.telegram.getMe().then(async (getme) => {
    console.log(chalk.bold.green(figlet.textSync('Velzzy', {
      font: 'Standard',
      horizontalLayout: 'default',
      vertivalLayout: 'default',
      whitespaceBreak: false
    })))
    await simple.sleep(100)
    console.log(`\n${chalk.yellow("[ BOT INFO ]")}\n${chalk.green("Bot Name:")} ${chalk.white(getme.first_name + (getme.last_name !== undefined ? ` ${getme.last_name}` : ""))}\n${chalk.green("Username:")} ${chalk.white("@" + getme.username)}\n${chalk.green("Id:")} ${chalk.white(getme.id)}\n${chalk.green("Link:")} ${chalk.white("https://t.me/" + getme.username)}\n \n `)
    await simple.sleep(100)
    console.log(chalk.yellow(`${chalk.red('[ CREATOR RONZZ YT ]')}\n\n${chalk.italic.magenta(`SV Ronzz YT\nNomor: 08817861263\nSebut nama👆,`)}\n\n${chalk.red(`ADMIN MENYEDIAKAN`)}\n${chalk.white(`- SC BOT TOPUP\n- SC BOT CPANEL\n- SC BOT AUTO ORDER\n- SC BOT PUSH KONTAK\n- ADD FITUR JADIBOT\n- UBAH SC LAMA KE PAIRING CODE\n- FIXS FITUR/SC ERROR\n`)}`))
  })
}

startronzz()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
