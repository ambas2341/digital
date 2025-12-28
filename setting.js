const fs = require("fs");
const chalk = require('chalk');
const moment = require("moment-timezone");

// ==============================================
//           KONFIGURASI PAYMENT GATEWAY
// ==============================================

// [ CONFIG ORDER KUOTA / ORKUT ] - BARU
global.payment = {
    username: "hendryawn",  // GANTI DENGAN USERNAME ORKUT
    token: "2331655:Jwy647hcDmfvsWFdgz2YuPLRHSOG5pxM",         // GANTI DENGAN TOKEN API ORKUT
    apikey: "ubot"   // GANTI DENGAN API KEY SCRIPT GATEWAY
}

// [ PAKASIR ]
global.PAKASIR_PROJECT = "panel"
global.PAKASIR_API_KEY = "riuH0xj3C97mOkbLxmfE5WKjeY9zCoTb"

// [ TRIPAY ]
global.TRIPAY_API_KEY = "NPgMGMJguwvdK3CZUp12vlhMZSPPiCbus5s6NGSh"
global.TRIPAY_PRIVATE_KEY = "6VhBl-qKvMR-X6Hik-2OI4u-h24yO"
global.TRIPAY_MERCHANT_CODE = "T44265"

// [ DUITKU ]
global.DUITKU_MERCHANT_CODE = "D20182"
global.DUITKU_API_KEY = "caa4719cecc7354ad8671daf42a44d82"


// ==============================================
//           KONFIGURASI PANEL & BOT
// ==============================================

// [ API PANEL ]
global.egg = "15" // Egg ID
global.nestid = "5" // nest ID
global.loc = "1" // Location ID
global.domain = "https://fanzzz.404-eror.systems"
global.apikey = "ptla_MlKIQoH4H55YPTjaF9ZDVhAhWX7LsRSHaaJdplxg7o5" //ptla
global.capikey = "ptlc_dih3OthphCOtq9jp8DmE1siUIo7Rt18rmw5unR11zZR" //ptlc

// [ SETTING BOT ]
global.BOT_TOKEN = "8027347334:AAFM7_Gxmsfl1QX1d-XDD4f-aDDDNNjqSIk" 
global.BOT_NAME = "BOT DIGITAL PRODUK" 
global.OWNER_ID = "5894696119" 
global.OWNER_NAME = "PICUNG" 
global.OWNER_NUMBER = "5894696119" 
global.OWNER = ["https://t.me/sipicung"] 
global.CHANNEL = "https://t.me/tokopicung" 

// [ IMAGES ]
global.thumbnail = "./options/image/thumbnail.jpg"

// [ MESSAGES ]
global.mess = {
  sukses: "Done🤗",
  admin: "Command ini hanya bisa digunakan oleh Admin Grup",
  botAdmin: "Bot Harus menjadi admin",
  owner: "Command ini hanya dapat digunakan oleh owner bot",
  prem: "Command ini khusus member premium",
  group: "Command ini hanya bisa digunakan di grup",
  private: "Command ini hanya bisa digunakan di Private Chat",
  wait: "⏳ Mohon tunggu sebentar...",
  error: {
    lv: "Link yang kamu berikan tidak valid",
    api: "Maaf terjadi kesalahan"
  }
}

// Export agar bisa dibaca modules lain (opsional tapi bagus)
module.exports = { payment: global.payment }

// ==============================================
//             AUTO RELOAD FILE
// ==============================================
let time = moment(new Date()).format('HH:mm:ss DD/MM/YYYY')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.greenBright(`[ ${global.BOT_NAME} ]  `) + time + chalk.cyanBright(` "${file}" Telah diupdate!`))
  delete require.cache[file]
  require(file)
})
