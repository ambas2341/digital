const fs = require("fs");
const chalk = require('chalk');
const moment = require("moment-timezone");

//Orderkuota (API Baru)
global.auth_username = "hendryawn"   // Ganti sesuai data dari OrderKuota
global.auth_token    = "2331655:Jwy647hcDmfvsWFdgz2YuPLRHSOG5pxM"      // Ganti sesuai data dari OrderKuota
global.codeqr = "00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214052376821155260303UMI51440014ID.CO.QRIS.WWW0215ID20253857722770303UMI5204541153033605802ID5921FREEN STORE OK23316556008SUKABUMI61054311162070703A016304BB57"

global.TRIPAY_API_KEY = "NPgMGMJguwvdK3CZUp12vlhMZSPPiCbus5s6NGSh"
global.TRIPAY_PRIVATE_KEY = "6VhBl-qKvMR-X6Hik-2OI4u-h24yO"
global.TRIPAY_MERCHANT_CODE = "T44265"

// Duitku Config
DUITKU_MERCHANT_CODE = "D20182"
DUITKU_API_KEY = "caa4719cecc7354ad8671daf42a44d82"

//~~~~~~~~~ Settings Api Panel ~~~~~~~~//
global.egg = "15" // Egg ID
global.nestid = "5" // nest ID
global.loc = "1" // Location ID
global.domain = "https://fanzzz.404-eror.systems"
global.apikey = "ptla_MlKIQoH4H55YPTjaF9ZDVhAhWX7LsRSHaaJdplxg7o5" //ptla
global.capikey = "ptlc_dih3OthphCOtq9jp8DmE1siUIo7Rt18rmw5unR11zZR" //ptlc

//Setting
global.BOT_TOKEN = "8027347334:AAFM7_Gxmsfl1QX1d-XDD4f-aDDDNNjqSIk" //Create bot here https://t.me/BotFather and get the bot token
global.BOT_NAME = "BOT DIGITAL PRODUK" //Your bot name
global.OWNER_ID = "5894696119" //Your id
global.OWNER_NAME = "PICUNG" //Your name
global.OWNER_NUMBER = "5894696119" //Your Telegram number
global.OWNER = ["https://t.me/sipicung"] //Pastikan username sudah sesuai agar fitur khusus owner bisa di pakai
global.CHANNEL = "https://t.me/tokopicung" //Your Telegram channel 

//Images
global.thumbnail = "./options/image/thumbnail.jpg"

//Message
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

let time = moment(new Date()).format('HH:mm:ss DD/MM/YYYY')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.greenBright(`[ ${BOT_NAME} ]  `) + time + chalk.cyanBright(` "${file}" Telah diupdate!`))
  delete require.cache[file]
  require(file)
})
