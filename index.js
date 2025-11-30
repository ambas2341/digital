require("./setting")
const chalk = require('chalk')
const moment = require('moment-timezone')
const fs = require('fs')
const os = require('os')
const speed = require('performance-now')
const util = require('util')
const { exec, execSync } = require('child_process')
const { sizeFormatter } = require('human-readable')
const toMs = require('ms')
const axios = require('axios')
const crypto = require("crypto")
const QRCode = require("qrcode")

const { qrisDinamis } = require("./function/dinamis");
const { addResponList, delResponList, isAlreadyResponList, sendResponList, updateResponList, getDataResponList } = require('./function/respon-list');
const { addResponTesti, delResponTesti, isAlreadyResponTesti, updateResponTesti, getDataResponTesti } = require('./function/respon-testi');
const { simple } = require('./function/myfunc')

//Waktu
moment.tz.setDefault("Asia/Jakarta").locale("id");
const tanggal = moment.tz('Asia/Jakarta').format('DD MMMM YYYY')
const jamwib = moment.tz('Asia/Jakarta').format('HH:mm:ss')
const dnew = new Date(new Date() + 3600000)
const dateIslamic = Intl.DateTimeFormat('id' + '-TN-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(dnew)

module.exports = ronzz = async (ronzz, bot) => {
  try {
    const body = ronzz.message.text || ronzz.message.caption || ''
    const budy = (typeof ronzz.message.text == 'string' ? ronzz.message.text : '')
    const isCmd = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#/$%^&.+-,\\\©^]/.test(body)
    const prefa = [""]
    const prefix = prefa ? /^[°•π÷×¶∆£¢€¥®=????+✓_=|/~!?@#%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®=????+✓_/=|~!?@#%^&.©^]/gi)[0] : "" : prefa ?? '#'
    const commands = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase()
    const command = (commands.split("@")[1] !== undefined && commands.split("@")[1].toLowerCase() == ronzz.botInfo.username.toLowerCase()) ? commands.split("@")[0] : commands
    const args = body.trim().split(/ +/).slice(1)
    const q = args.join(" ")
    const user = simple.getUserName(ronzz.message.from)
    const pushname = user.full_name;
    const user_id = ronzz.message.from.id + " "
    const username = ronzz.message.from.username ? ronzz.message.from.username : "ronzzyt";
    const isOwner = OWNER.map(v => v.replace("https://t.me/", '').toLowerCase()).includes(ronzz.update.message.from.username.toLowerCase())
    const from = ronzz.message.chat.id

    const isGroup = ronzz.chat.type.includes('group')
    const groupName = isGroup ? ronzz.chat.title : ''

    const isImage = ronzz.message.hasOwnProperty('photo')
    const isVideo = ronzz.message.hasOwnProperty('video')
    const isAudio = ronzz.message.hasOwnProperty('audio')
    const isSticker = ronzz.message.hasOwnProperty('sticker')
    const isContact = ronzz.message.hasOwnProperty('contact')
    const isLocation = ronzz.message.hasOwnProperty('location')
    const isDocument = ronzz.message.hasOwnProperty('document')
    const isAnimation = ronzz.message.hasOwnProperty('animation')
    const isMedia = isImage || isVideo || isAudio || isSticker || isContact || isLocation || isDocument || isAnimation
    const quotedMessage = ronzz.message.reply_to_message || {}
    const isQuotedImage = quotedMessage.hasOwnProperty('photo')
    const isQuotedVideo = quotedMessage.hasOwnProperty('video')
    const isQuotedAudio = quotedMessage.hasOwnProperty('audio')
    const isQuotedSticker = quotedMessage.hasOwnProperty('sticker')
    const isQuotedContact = quotedMessage.hasOwnProperty('contact')
    const isQuotedLocation = quotedMessage.hasOwnProperty('location')
    const isQuotedDocument = quotedMessage.hasOwnProperty('document')
    const isQuotedAnimation = quotedMessage.hasOwnProperty('animation')
    const isQuoted = ronzz.message.hasOwnProperty('reply_to_message')

    if (user_id.length >= 8 && !db.data.user.includes(user_id)) db.data.user.push(user_id)
    if (isGroup && !db.data.chat[from]) db.data.chat[from] = {
      welcome: false,
      goodbye: false,
      sDone: "",
      sProses: ""
    }

    const reply = async (text) => {
      for (var x of simple.range(0, text.length, 4096)) {
        return await ronzz.replyWithMarkdown(text.substr(x, 4096), {
          disable_web_page_preview: true
        })
      }
    }

    function digit() {
      const characters = '0123456789';
      const length = 2;
      let haha = '';
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        haha += characters[randomIndex];
      }
      return haha;
    }

    const formatp = sizeFormatter({
      std: 'JEDEC',
      decimalPlaces: 2,
      keepTrailingZeroes: false,
      render: (literal, symbol) => `${literal} ${symbol}B`,
    })

    var typeMessage = body.substr(0, 50).replace(/\n/g, '')
    if (isImage) typeMessage = 'Image'
    else if (isVideo) typeMessage = 'Video'
    else if (isAudio) typeMessage = 'Audio'
    else if (isSticker) typeMessage = 'Sticker'
    else if (isContact) typeMessage = 'Contact'
    else if (isLocation) typeMessage = 'Location'
    else if (isDocument) typeMessage = 'Document'
    else if (isAnimation) typeMessage = 'Animation'

    function toRupiah(angka) {
      var saldo = '';
      var angkarev = angka.toString().split('').reverse().join('');
      for (var i = 0; i < angkarev.length; i++)
        if (i % 3 == 0) saldo += angkarev.substr(i, 3) + '.';
      return '' + saldo.split('', saldo.length - 1).reverse().join('');
    }
    
    if (isAlreadyResponList(body.toLowerCase())) {
      let get_data_respon = getDataResponList(body.toLowerCase())
      if (get_data_respon.isImage === false) {
        reply(get_data_respon.response)
      } else {
        await ronzz.replyWithPhoto({
          url: get_data_respon.image_url
        }, {
          caption: get_data_respon.response,
          parse_mode: "MARKDOWN",
          disable_web_page_preview: true
        })
      }
    }

    if (isAlreadyResponTesti(body.toLowerCase())) {
      let get_data_respon = getDataResponTesti(body.toLowerCase())
      await ronzz.replyWithPhoto({
        url: get_data_respon.image_url
      }, {
        caption: get_data_respon.response,
        parse_mode: "MARKDOWN",
        disable_web_page_preview: true
      })
    }

    if (ronzz.message) console.log('->[\x1b[1;32mCMD\x1b[1;37m]', chalk.yellow(moment.tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss')), chalk.green(`${prefix + command.split("@")[1] ? command.split("@")[0] : command} [${args.length}]`), 'from', chalk.green(pushname), isGroup ? 'in ' + chalk.green(groupName) : '')

    switch (command) {
      case "tes": case 'runtime': {
        reply(`*STATUS: BOT ONLINE*\n_Runtime: ${simple.runtime(process.uptime())}_`)
      }
        break

      case 'ping': {
        let timestamp = speed()
        let latensi = speed() - timestamp
        reply(`Kecepatan respon ${latensi.toFixed(4)} 𝘚𝘦𝘤𝘰𝘯𝘥\n\n💻 *INFO SERVER*\nHostname: ${os.hostname}\nRAM: ${formatp(os.totalmem() - os.freemem())} / ${formatp(os.totalmem())}\nCPUs: ${os.cpus().length} Core`)
      }
        break

      case 'owner': {
        await ronzz.sendContact(OWNER_NUMBER, OWNER_NAME)
        reply(`My owner [${OWNER_NAME}](${OWNER[0]}) 👑`)
      }
        break

      case 'creator': {
        await ronzz.sendContact("9191919", "picung")
        reply(`My creator [picung](https://t.me/sipicung) 👑`)
      }
        break

      case 'sc':
      case 'script':
      case 'scrip': {
        ronzz.reply("*SCRIPT NO ENC*\nMau beli scriptnya?\n\n*Harga* 💰\nRp40.000 (60k)\nHarga terlalu mahal?\nNego tipis aja\n\n*Payment* 💳\n_Qris / Dana_\n\nSudah termasuk tutorial.\nKalau error difixs.\nPasti dapet update dari *picung.*\nSize script ringan.\nAnti ngelag/delay.\n\n*Contact Person* 📞", {
          parse_mode: "MARKDOWN",
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [
              [{
                text: 'WhatsApp',
                url: "https://wa.me/91919191"
              }, {
                text: 'Telegram',
                url: "https://t.me/sipicung"
              }]
            ]
          }
        })
      }
        break

      case "menu": {
        let button = [[{ text: '💰 ORDER MENU', callback_data: 'ordercmd ' + user_id }, { text: 'STORE MENU 🛍️', callback_data: 'storecmd ' + user_id }], [{ text: '📒 INFO BOT', callback_data: 'infocmd ' + user_id }, { text: 'OWNER MENU 🧒🏻', callback_data: 'ownercmd ' + user_id }]]
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

      // === UPDATE: STOK DENGAN PAGINATION (HALAMAN) ===
      case 'stok': {
    let keys = Object.keys(db.data.produk)
    if (keys.length == 0) return reply("Belum ada produk di database")

    let page = 1
    let limit = 5
    let totalPage = Math.ceil(keys.length / limit)

    let start = (page - 1) * limit
    let end = page * limit
    let items = keys.slice(start, end)

    // keyboard untuk inline_keyboard
    let keyboard = []

    // ==== TEKS KATALOG DENGAN STYLE A ====
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

        // tombol angka, dikumpulin jadi 1 row
        numberRow.push({
            text: String(num),
            callback_data: `detprod ${user_id}${p.id}`
        })
    })

    // masukkan row angka ke keyboard (jadi 1 baris: 1 2 3 4 5)
    if (numberRow.length) keyboard.push(numberRow)

    // tombol navigasi halaman
    if (page < totalPage) {
        keyboard.push([{
            text: 'Selanjutnya ➡️',
            callback_data: `stokpage ${user_id} ${page + 1}`
        }])
    }

    // tombol kembali
    keyboard.push([{ 
        text: '🔄 Kembali Ke Halaman Pertama', 
        callback_data: `stokpage ${user_id} 1` }])

    teks += "👇 Pilih nomor produk 👇"

    ronzz.reply(teks, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: keyboard }
    })
}
break;


      // ================================================

      case 'addproduk': {
        if (!isOwner) return reply(mess.owner)
        let data = q.split("|")
        if (!data[5]) return reply(`Contoh:\n/${command} id|namaproduk|deskripsi|snk|harga|profit`)
        if (db.data.produk[data[0]]) return reply(`Produk dengan ID ${data[0]} sudah ada di database`)

        db.data.produk[data[0]] = {
          id: data[0],
          name: data[1],
          desc: data[2],
          snk: data[3],
          price: data[4],
          profit: data[5],
          terjual: 0,
          stok: []
        }

        reply(`Berhasil menambahkan produk *${data[1]}*`)
      }
        break

      case 'delproduk': {
        if (!isOwner) return reply(mess.owner)
        if (!q) return reply(`Contoh: /${command} idproduk`)
        if (!db.data.produk[q]) return reply(`Produk dengan ID *${q}* tidak ada di database`)

        delete db.data.produk[q]

        reply(`Berhasil delete produk *${q}*`)
      }
        break

      case 'setharga': {
        if (!isOwner) return reply(mess.owner)
        let data = q.split("|")
        if (!data[1]) return reply(`Contoh: /${command} idproduk|harga`)
        if (!db.data.produk[data[0]]) return reply(`Produk dengan ID *${data[0]}* tidak ada di database`)

        db.data.produk[data[0]].price = Number(data[1])
        reply(`Berhasil set harga produk dengan ID *${data[0]}* menjadi Rp${toRupiah(Number(data[1]))}`)
      }
        break

      case 'setjudul': {
        if (!isOwner) return reply(mess.owner)
        let data = q.split("|")
        if (!data[1]) return reply(`Contoh: /${command} idproduk|namaproduk`)
        if (!db.data.produk[data[0]]) return reply(`Produk dengan ID *${data[0]}* tidak ada di database`)

        db.data.produk[data[0]].name = data[1]
        reply(`Berhasil set judul produk dengan ID *${data[0]}* menjadi *${data[1]}*`)
      }
        break

      case 'setdesk': {
        if (!isOwner) return reply(mess.owner)
        let data = q.split("|")
        if (!data[1]) return reply(`Contoh: /${command} idproduk|deskripsi`)
        if (!db.data.produk[data[0]]) return reply(`Produk dengan ID *${data[0]}* tidak ada di database`)

        db.data.produk[data[0]].desc = data[1]
        reply(`Berhasil set deskripsi produk dengan ID *${data[0]}*`)
      }
        break

      case 'setsnk': {
        if (!isOwner) return reply(mess.owner)
        let data = q.split("|")
        if (!data[1]) return reply(`Contoh: /${command} idproduk|snk`)
        if (!db.data.produk[data[0]]) return reply(`Produk dengan ID *${data[0]}* tidak ada di database`)

        db.data.produk[data[0]].snk = data[1]
        reply(`Berhasil set SNK produk dengan ID *${data[0]}*`)
      }
        break

      case 'setprofit': {
        if (!isOwner) return reply(mess.owner)
        let data = q.split("|")
        if (!data[1]) return reply(`Contoh: /${command} idproduk|snk`)
        if (!db.data.produk[data[0]]) return reply(`Produk dengan ID *${data[0]}* tidak ada di database`)

        db.data.produk[data[0]].profit = Number(data[1])
        reply(`Berhasil set profit produk dengan ID *${data[0]}*`)
      }
        break

      case 'setkode': {
        if (!isOwner) return reply(mess.owner)
        let data = q.split("|")
        if (!data[1]) return reply(`Contoh: /${command} idlama|idbaru`)
        if (!db.data.produk[data[0]]) return reply(`Produk dengan ID *${data[0]}* tidak ada di database`)

        db.data.produk[data[0]].id = data[1]
        db.data.produk[data[1]] = db.data.produk[data[0]]
        reply(`Berhasil set kode produk dengan ID *${data[0]}* menjadi *${data[1]}*`)
        delete db.data.produk[data[0]]
      }
        break

      case 'addstok': {
        if (!isOwner) return reply(mess.owner)
        let data = q.split(",")
        if (!data[1]) return reply(`Contoh:\n/${command} idproduk,email1@gmail.com|password1|profil1|pin1|2fa1\nemail2@gmail.com|password2|profil2|pin2|2fa2\n\n*NOTE*\nJika tidak ada Profil, Pin, 2FA, kosongkan saja atau dikasih tanda strip (-)`)
        if (!db.data.produk[data[0]]) return reply(`Produk dengan ID *${data[0]}* tidak ada`)

        let dataStok = data[1].split("\n").map(i => i.trim())
        db.data.produk[data[0]].stok.push(...dataStok)

        reply(`Berhasil menambahkan stok sebanyak ${dataStok.length}`)
      }
        break

      case 'delstok': {
        if (!isOwner) return reply(mess.owner)
        if (!q) return reply(`Contoh: /${command} idproduk`)
        if (!db.data.produk[q]) return reply(`Produk dengan ID *${q}* tidak ada`)

        db.data.produk[q].stok = []

        reply(`Berhasil delete stok produk *${q}*`)
      }
        break
        
        // [BARU] FITUR OWNER KHUSUS SCRIPT (Paste di bawah case 'delstok')
      case 'addscript': {
        if (!isOwner) return reply(mess.owner)
        let data = q.split("|")
        if (!data[5]) return reply(`Format: /${command} id|nama|deskripsi|snk|harga|profit`)
        if (db.data.script[data[0]]) return reply(`ID Script ${data[0]} sudah ada`)
        
        db.data.script[data[0]] = {
          id: data[0], name: data[1], desc: data[2], snk: data[3], price: data[4], profit: data[5], terjual: 0, stok: []
        }
        reply(`Sukses tambah script: ${data[1]}`)
      }
      break

      case 'delscript': {
        if (!isOwner) return reply(mess.owner)
        if (!db.data.script[q]) return reply(`ID Script tidak ditemukan`)
        delete db.data.script[q]
        reply(`Sukses hapus script`)
      }
      break

      case 'addstokscript': {
        if (!isOwner) return reply(mess.owner)
        let data = q.split(",") // Format: id,link|pass
        if (!db.data.script[data[0]]) return reply(`ID Script salah`)
        
        let dataStok = data[1].split("\n").map(i => i.trim())
        db.data.script[data[0]].stok.push(...dataStok)
        reply(`Sukses tambah ${dataStok.length} stok script`)
      }
      break

      case 'delstokscript': {
         if (!isOwner) return reply(mess.owner)
         if (!db.data.script[q]) return reply(`ID Script salah`)
         db.data.script[q].stok = []
         reply(`Sukses hapus semua stok script ${q}`)
      }
      break
      
case 'buy': {
  // CASE BUY LAMA BISA DIHAPUS ATAU DIBIARKAN
  reply("Silahkan gunakan menu button /stok untuk membeli produk.")
}
break

case 'buypanel': {
    if (isGroup) return reply("Pembelian panel pterodactyl hanya bisa di private chat")
    if (db.data.order[user_id] !== undefined) {
      reply("Masih ada transaksi yang belum diselesaikan, ketik /batal untuk membatalkan transaksi sebelumnya!")
      break
    }

    if (!q) {
      const listMessage = `*🛒 Daftar Harga Panel Server 🛒*

Silakan pilih paket yang Anda inginkan dengan mengetik perintah di bawah.

🐏 *RAM 5 GB*
💰 Harga: Rp2.000
👉 Ketik: \`/buypanel 5\`

🐏 *RAM 6 GB*
💰 Harga: Rp3.000
👉 Ketik: \`/buypanel 6\`

🐏 *RAM 7 GB*
💰 Harga: Rp4.000
👉 Ketik: \`/buypanel 7\`

🐏 *RAM 8 GB*
💰 Harga: Rp5.000
👉 Ketik: \`/buypanel 8\`

🐏 *RAM 9 GB*
💰 Harga: Rp6.000
👉 Ketik: \`/buypanel 9\`

🚀 *RAM UNLIMITED*
💰 Harga: Rp7.000
👉 Ketik: \`/buypanel unli\``
      reply(listMessage)
      break
    }
    // ... Sisa logic buypanel sama seperti sebelumnya ...
}
break

      case 'batal': {
        if (db.data.order[user_id] == undefined) return

        await ronzz.deleteMessage(db.data.order[user_id].messageId)
        reply("Berhasil membatalkan pembayaran")
        delete db.data.order[user_id]
      }
        break

      case 'rekap': {
        if (!isOwner) return reply(mess.owner)
        ronzz.reply(`Hai Owner\nIngin melihat rekap transaksi? Silahkan pilih jenis rekap di bawah ini`, {
          parse_mode: "MARKDOWN",
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [
              [{
                text: 'Rekap Mingguan',
                callback_data: 'rekapminggu ' + user.id.toString()
              }, {
                text: 'Rekap Bulanan',
                callback_data: 'rekapbulan ' + user.id.toString()
              }]
            ]
          }
        })
      }
        break

      case 'kalkulator': {
        if (!q.split(" ")[1]) return reply(`Contoh: /${command} 5 7`)
        if (!q.split(" ")[2]) return ronzz.reply("Silahkan pilih kalkulator dibawah", {
          reply_markup: {
            inline_keyboard: [
              [{
                text: '+',
                callback_data: 'tambah ' + user.id.toString() + ` ${q.split(" ")[0]} ${q.split(" ")[1]}`
              }, {
                text: '-',
                callback_data: 'kurang ' + user.id.toString() + ` ${q.split(" ")[0]} ${q.split(" ")[1]}`
              }], [{
                text: '÷',
                callback_data: 'bagi ' + user.id.toString() + ` ${q.split(" ")[0]} ${q.split(" ")[1]}`
              }, {
                text: '×',
                callback_data: 'kali ' + user.id.toString() + ` ${q.split(" ")[0]} ${q.split(" ")[1]}`
              }]
            ]
          }
        })
      }
        break

      case 'setdone':
        if (!isGroup) return reply(mess.group)
        if (!isOwner) return reply(mess.owner)
        if (db.data.chat[from].sDone.length !== 0) return reply(`Set done sudah ada di group ini.`)
        if (!q) return reply(`Gunakan dengan cara /${command} teks\n\nList function:\n@tag : untuk tag orang\n@tanggal\n@jam\n@status`)
        db.data.chat[from].sDone = q
        reply(`Sukses set done`)
        break

      case 'deldone':
        if (!isGroup) return reply(mess.group)
        if (!isOwner) return reply(mess.owner)
        if (db.data.chat[from].sDone.length == 0) return reply(`Belum ada set done di sini.`)
        db.data.chat[from].sDone = ""
        reply(`Sukses delete set done`)
        break

      case 'changedone':
        if (!isGroup) return reply(mess.group)
        if (!isOwner) return reply(mess.owner)
        if (!q) return reply(`Gunakan dengan cara /${command} teks\n\nList function:\n@tag : untuk tag orang\n@tanggal\n@jam\n@status`)
        db.data.chat[from].sDone = q
        reply(`Sukses mengganti teks set done`)
        break

      case 'setproses':
        if (!isGroup) return reply(mess.group)
        if (!isOwner) return reply(mess.owner)
        if (db.data.chat[from].sProses.length !== 0) return reply(`Set proses sudah ada di group ini.`)
        if (!q) return reply(`Gunakan dengan cara /${command} teks\n\nList function:\n@tag : untuk tag orang\n@tanggal\n@jam\n@status`)
        db.data.chat[from].sProses = q
        reply(`Sukses set proses`)
        break

      case 'delproses':
        if (!isGroup) return reply(mess.group)
        if (!isOwner) return reply(mess.owner)
        if (db.data.chat[from].sProses.length == 0) return reply(`Belum ada set proses di sini.`)
        db.data.chat[from].sProses = ""
        reply(`Sukses delete set proses`)
        break

      case 'changeproses':
        if (!isGroup) return reply(mess.group)
        if (!isOwner) return reply(mess.owner)
        if (!q) return reply(`Gunakan dengan cara /${command} teks\n\nList function:\n@tag : untuk tag orang\n@tanggal\n@jam\n@status`)
        db.data.chat[from].sProses = q
        reply(`Sukses ganti teks set proses`)
        break

      case 'done': {
        if (!isGroup) return reply(mess.group)
        if (!isOwner) return reply(mess.owner)
        if (isQuoted) {
          if (db.data.chat[from].sDone.length !== 0) {
            let textDone = db.data.chat[from].sDone
            reply(textDone.replace('tag', `[@${pushname}](https://t.me/${username})`).replace('@jam', jamwib).replace('@tanggal', tanggal).replace('@status', 'Berhasil'))
          } else {
            reply(`「 *TRANSAKSI BERHASIL* 」\n\n📆 TANGGAL : ${tanggal}\n⌚ JAM : ${jamwib}\n✨ STATUS: Berhasil\n\nTerimakasih [@${pushname}](https://t.me/${username}) next order yaa🙏`)
          }
        } else {
          reply('Reply orangnya')
        }
      }
        break

      case 'proses':
        if (!isGroup) return (mess.group)
        if (!isGroupAdmins && !isOwner) return (mess.admin)
        if (isQuotedMsg) {
          if (db.data.chat[from].sProses.length !== 0) {
            let textProses = db.data.chat[from].sProses
            reply(textProses.replace('tag', `[@${pushname}](https://t.me/${username})`).replace('@jam', jamwib).replace('@tanggal', tanggal).replace('@status', 'Pending'))
          } else {
            reply(`「 *TRANSAKSI PENDING* 」\n\n📆 TANGGAL : ${tanggal}\n⌚ JAM : ${jamwib}\n✨ STATUS: Pending\n\nPesanan [@${pushname}](https://t.me/${username}) sedang diproses🙏`)
          }
        } else {
          reply('Reply orangnya')
        }
        break
        
      case 'list': {
        if (db.data.list.length == 0) return reply(`Belum ada list message di database`)
        let teks = `Hai [@${pushname}](https://t.me/${username})\nBerikut list Owner saya\n\n*╭────「 LIST RESPON 」───*\n`
        for (let x of db.data.list) {
          teks += `*┊ 🛍️ ${x.key}*\n`
        }
        teks += `*╰┈┈┈┈┈┈┈┈*`
        reply(teks)
      }
        break
        
      case 'addlist': {
        if (!isOwner) return reply(mess.owner)
        if (!q.includes("@")) return reply(`Gunakan dengan cara /${command} key@response\n\n_Contoh_\n\n/${command} test@apa`)
        if (isAlreadyResponList(q.split("@")[0])) return reply(`List respon dengan key *${q.split("@")[0]}* sudah ada.`)
        if (isImage || isQuotedImage) {
          let media = await ronzz.download()
          addResponList(q.split("@")[0], q.split("@")[1], true, media)
          reply(`Berhasil menambah list respon *${q.split("@")[0]}*`)
        } else {
          addResponList(q.split("@")[0], q.split("@")[1], false, '-')
          reply(`Berhasil menambah list respon *${q.split("@")[0]}*`)
        }
      }
        break
        
      case 'dellist': {
        if (!isOwner) return reply(mess.owner)
        if (db.data.list.length == 0) return reply(`Belum ada list respon di database`)
        if (!q) return reply(`Gunakan dengan cara /${command} key\n\n_Contoh_\n\n/${command} hello`)
        if (!isAlreadyResponList(q)) return reply(`List respon dengan key *${q}* tidak ada di database!`)
        delResponList(q)
        reply(`Sukses delete list respon dengan key *${q}*`)
      }
        break
        
      case 'setlist': {
        if (!isOwner) return reply(mess.owner)
        if (!q.includes("@")) return reply(`Gunakan dengan cara /${command} key@response\n\n_Contoh_\n\n/${command} test@apa`)
        if (!isAlreadyResponList(q.split("@")[0])) return reply(`List respon dengan key *${q.split("@")[0]}* tidak ada di database.`)
        if (isImage || isQuotedImage) {
          let media = await ronzz.download()
          updateResponList(q.split("@")[0], q.split("@")[1], true, media)
          reply(`Berhasil mengganti list respon *${q.split("@")[0]}*`)
        } else {
          updateResponList(q.split("@")[0], q.split("@")[1], false, '-')
          reply(`Berhasil mengganti list respon *${q.split("@")[0]}*`)
        }
      }
        break

      case 'testi': {
        if (Object.keys(db.data.testi).length === 0) return reply(`Belum ada list testi di database`)
        let teks = `Hai [@${pushname}](https://t.me/${username})\nBerikut list testi Owner saya\n\n*╭────「 LIST TESTI 」───*\n`
        for (let x of db.data.testi) {
          teks += `*┊ 🛍️ ${x.key}*\n`
        }
        teks += `*╰┈┈┈┈┈┈┈┈*`
        reply(teks)
      }
        break

      case 'addtesti': {
        if (!isOwner) return reply(mess.owner)
        if (isImage || isQuotedImage) {
          if (!q.includes("@")) return reply(`Gunakan dengan cara /${command} key@response\n\n_Contoh_\n\n/${command} test@apa`)
          if (isAlreadyResponTesti(q.split("@")[0])) return reply(`List testi dengan key *${q.split("@")[0]}* sudah ada.`)
          let media = await ronzz.download()
          addResponTesti(q.split("@")[0], q.split("@")[1], true, media)
          reply(`Berhasil menambah list testi *${q.split("@")[0]}*`)
        } else {
          reply(`Kirim gambar dengan caption /${command} key@response atau reply gambar yang sudah ada dengan caption /${command} key@response`)
        }
      }
        break

      case 'deltesti': {
        if (!isOwner) return reply(mess.owner)
        if (db.data.testi.length === 0) return reply(`Belum ada list testi di database`)
        if (!q) return reply(`Gunakan dengan cara /${command} key\n\n_Contoh_\n\n/${command} hello`)
        if (!isAlreadyResponTesti(q)) return reply(`List testi dengan key *${q}* tidak ada di database!`)
        delResponTesti(q)
        reply(`Sukses delete list testi dengan key *${q}*`)
      }
        break

      case 'settesti': {
        if (!isOwner) return reply(mess.owner)
        if (!q.includes("@")) return reply(`Gunakan dengan cara /${command} key@response\n\n_Contoh_\n\n/${command} test@apa`)
        if (!isAlreadyResponTesti(q.split("@")[0])) return reply(`List testi dengan key *${q.split("@")[0]}* tidak ada di database.`)
        if (isImage || isQuotedImage) {
          let media = await ronzz.download()
          updateResponTesti(q.split("@")[0], q.split("@")[1], true, media)
          reply(`Berhasil mengganti list testi *${q.split("@")[0]}*`)
        } else {
          reply(`Kirim gambar dengan caption /${command} key@response atau reply gambar yang sudah ada dengan caption /${command} key@response`)
        }
      }
        break
        
      case 'welcome': {
        if (!isGroup) return reply(mess.group)
        if (!isOwner) return reply(mess.owner)
        ronzz.reply(`Hai Owner\nSilahkan pilih fitur Welcome di bawah ini.`, {
          parse_mode: "MARKDOWN",
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [
              [{
                text: 'Welcome On',
                callback_data: 'welcome ' + user.id.toString() + " on " + from
              }, {
                text: 'Welcome Off',
                callback_data: 'welcome ' + user.id.toString() + " off " + from
              }]
            ]
          }
        })
      }
        break
        
      case 'goodbye': {
        if (!isGroup) return reply(mess.group)
        if (!isOwner) return reply(mess.owner)
        ronzz.reply(`Hai Owner\nSilahkan pilih fitur Good Bye di bawah ini.`, {
          parse_mode: "MARKDOWN",
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [
              [{
                text: 'Good Bye On',
                callback_data: 'goodbye ' + user.id.toString() + " on " + from
              }, {
                text: 'Good Bye Off',
                callback_data: 'goodbye ' + user.id.toString() + " off " + from
              }]
            ]
          }
        })
      }
        break
        
      case 'backup': {
        if (!isOwner) return reply(mess.owner)
        await reply('Mengumpulkan semua file ke folder...')
        let ls = (await execSync("ls")).toString().split("\n").filter((pe) =>
          pe != "node_modules" &&
          pe != "session" &&
          pe != "package-lock.json" &&
          pe != "yarn.lock" &&
          pe != ".npm" &&
          pe != ".cache" &&
          pe != ""
        )
        await simple.sleep(100)
        if (isGroup) await reply('Script akan dikirim lewat PC!')
        await execSync(`zip -r SC-AUTO-ORDER.zip ${ls.join(" ")}`)
        await ronzz.sendDocument({
          source: "./SC-AUTO-ORDER.zip"
        }, {
          chat_id: OWNER_ID,
          caption: "Sukses backup Script",
          parse_mode: "MARKDOWN",
          disable_web_page_preview: true
        })
        await execSync("rm -rf SC-AUTO-ORDER.zip");
      }
        break
        
      case 'broadcast': case 'bc': {
        if (!isOwner) return reply(mess.owner)
        if (!q) return reply(`Contoh: /${command} teks broadcast`)
        if (isImage) {
          let media = await ronzz.download()
          for (let i of db.data.user) {
            ronzz.sendPhoto({
              url: media
            }, {
              caption: q,
              chat_id: i,
              parse_mode: "MARKDOWN",
              disable_web_page_preview: true
            })
          }
          reply(`Berhasil Broadcast ke ${db.data.user.length} Users`)
        } else {
          for (let i of db.data.user) {
            ronzz.sendMessage(q, {
              chat_id: i,
              parse_mode: "MARKDOWN",
              disable_web_page_preview: true
            })
            await simple.sleep(300)
          }
          reply(`Berhasil Broadcast ke ${db.data.user.length} Users`)
        }
      }
        break

      case 'id': case 'myid': {
        ronzz.reply(user_id)
      }
        break

      default:
        if (budy.startsWith('=>')) {
          if (!isOwner) return
          function Return(sul) {
            sat = JSON.stringify(sul, null, 2)
            bang = util.format(sat)
            if (sat == undefined) {
              bang = util.format(sul)
            }
            return ronzz.reply(bang)
          }
          try {
            ronzz.reply(util.format(eval(`(async () => { ${budy.slice(3)} })()`)))
          } catch (e) {
            ronzz.reply(String(e))
          }
        }
        if (budy.startsWith('>')) {
          if (!isOwner) return
          try {
            let evaled = await eval(budy.slice(2))
            if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
            await ronzz.reply(evaled)
          } catch (err) {
            ronzz.reply(String(err))
          }
        }
        if (budy.startsWith('$')) {
          if (!isOwner) return
          let qur = budy.slice(2)
          exec(qur, (err, stdout) => {
            if (err) return reply(err)
            if (stdout) {
              ronzz.reply(stdout)
            }
          })
        }
    }
  } catch (e) {
    ronzz.reply(util.format(e))
    console.log('[ ERROR ] ' + e)
  }
}

let time = moment(new Date()).format('HH:mm:ss DD/MM/YYYY')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.greenBright(`[ ${BOT_NAME} ]  `) + time + chalk.cyanBright(` "${file}" Telah diupdate!`))
  delete require.cache[file]
  require(file)
})
