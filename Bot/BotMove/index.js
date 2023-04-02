const mineflayer = require('mineflayer')
const Movements = require('mineflayer-pathfinder').Movements
const pathfinder = require('mineflayer-pathfinder').pathfinder
const { GoalBlock} = require('mineflayer-pathfinder').goals
const antiafk = require("mineflayer-antiafk");
const pvp = require('mineflayer-pvp').plugin

var http = require('http');  
http.createServer(function (req, res) {   
  res.write("Suscribe To Jin Mori <3");   
  res.end(); 
}).listen(8080);

const config = require('./settings.json');

function createBot () {
  const bot = mineflayer.createBot({
      username: config['bot-account']['username'],
      password: config['bot-account']['password'],
      host: config.server.ip,
      port: config.server.port,
      version: config.server.version
  })

  bot.loadPlugin(pathfinder)
  const mcData = require('minecraft-data')(bot.version)
  const defaultMove = new Movements(bot, mcData)
  bot.settings.colorsEnabled = false

  bot.once("spawn", function(){
      console.log("\x1b[33m[BotLog] El bot entró al servidor", '\x1b[0m')

      if(config.utils['auto-auth'].enabled){
        console.log("[INFO] Inicio del autologeo")

          var password = config.utils['auto-auth'].password
          setTimeout(function() {
              bot.chat(`/register ${password} ${password}`)
              bot.chat(`/login ${password}`)
          }, 500);

          console.log(`[Auth] Comandos de inicio de sesion activados.`)
      }

      if(config.utils['chat-messages'].enabled){
        console.log("[INFO] Se inicio el autochat")
        var messages = config.utils['chat-messages']['messages']

          if(config.utils['chat-messages'].repeat){
            var delay = config.utils['chat-messages']['repeat-delay']
            let i = 0

            let msg_timer = setInterval(() => {
                bot.chat(`${messages[i]}`)

                if(i+1 == messages.length){
                    i = 0
                } else i++
            }, delay * 1000)
          } else {
              messages.forEach(function(msg){
                  bot.chat(msg)
              })
        }
      }
      

      const pos = config.position

      if (config.position.enabled){
          console.log(`\x1b[32m[BotLog] Moviendose a la ubicación (${pos.x}, ${pos.y}, ${pos.z})\x1b[0m`)
          bot.pathfinder.setMovements(defaultMove)
          bot.pathfinder.setGoal(new GoalBlock(pos.x, pos.y, pos.z))
      }
      
      if(config.utils['anti-afk'].enabled){
        bot.setControlState('jump', true)
        if(config.utils['anti-afk'].sneak){
            bot.setControlState('sneak', true)
        }
      }
  })

bot.loadPlugin(pathfinder)

bot.loadPlugin(antiafk);
        
 bot.on("spawn", ()=>{
    bot.afk.start();
})

  bot.on("chat", function(username, message){
      if(config.utils['chat-log']){
          console.log(`[ChatLog] <${username}> ${message}`)
      }
  })

  bot.on("goal_reached", function(){
      console.log(`\x1b[32m[BotLog] El bot llego a la ubicación establecida. ${bot.entity.position}\x1b[0m`)
  })

  bot.on("death", function(){
      console.log(`\x1b[33m[BotLog] El bot murio, pero respawneo ${bot.entity.position}`, '\x1b[0m')
  })

  if(config.utils['auto-reconnect']){
      bot.on('end', function(){
        createBot()
      })
  }

  bot.on('kicked', (reason) => console.log('\x1b[33m',`[BotLog] El bot ha sido kickeado del servidor. Razon: \n${reason}`, '\x1b[0m'))
  bot.on('error', err => console.log(`\x1b[31m[ERROR] ${err.message}`, '\x1b[0m'))

}

createBot()