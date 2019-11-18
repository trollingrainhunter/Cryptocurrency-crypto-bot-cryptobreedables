try{
  var config = process.cwd()+'/config.js';
  config = require(config);
}catch (error){
  console.error('ERROR -> Unable to load config file.');
  process.exit(1); 
}

var chat = require("./functions/chat.js");
var check = require("./functions/check.js");
global.command = require("./functions/command.js");
var cron = require("./functions/cron.js");
var log = require("./functions/log.js");

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

const { Client } = require('discord.js');
const client = new Client();
global.globalClient = client;

var cooldownTimes = {}; // Cooldown timers by user, id and timestamp

/* BOT ENABLE/DISABLE */
global.botEnabled = 1;

// Block list 
global.commandBlockedUsers = [];

/* Event globals */
global.eventDestroyManually = false;
global.eventActive = false;
global.eventCollectorMessage = false;
global.eventCollector = false;
global.eventCurrentRound = 1;
global.eventCurrentUsers = [];
global.eventlastUsers = [];
global.eventName = "";
/* Battle globals */
global.battleStartLifePoints = 0;
global.battleCurrentLifePoints = 0;
global.battleCurrentLifePointsPercentage = 100;
global.battleCurrentLifeDisplay = '';
global.battleRoundTime = config.battle.roundTime;
global.battleStartRound = config.battle.startRound;
global.battleEndRound = config.battle.endRound;
global.battleMonsterImage = 'monster1.jpg';
global.battleHealthAuto = config.battle.cron.monsterHealth.min;
/* Shop globals */ // Fallback -> gets overwritten in shop function
global.shopRoundTime = 10; 
global.shopEndRound = 3; // gets overwritten in function
global.shopImg = 'shop_normal.png';
global.shopIcons = config.shop.normal.shopIcons;
global.shopMessageItems = '';

// Coin price if real price enabled on config
global.coinPrice = 0;
global.coinCentPrice = 0;
global.coinCurrency = "";

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

client.on('error', console.error);
process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));

client.on('ready', () => {
  log.log_write_console(config.messages.botStarted + ` ${client.user.tag}!`);
});

client.on('message', msg => {
  
  var userID = msg.author.id;
  var userName = msg.author;
  var messageFull = msg;
  var messageType = msg.channel.type;
  var messageContent = msg.content;
  var channelID = msg.channel.id;
  var userRoles = 'none';
  var serverUsers = [];
  var userBot = msg.author.bot;
  var currentTimestamp = Math.floor(Date.now() / 1000);

  // Only check messages if its not the bot itself or another bot
  if(userID == config.bot.botID) 
    return;

  // Only check if its not other bot
  if(userBot) 
    return;

// If message has command prefix
if(messageContent.startsWith(config.bot.commandPrefix)){

    // Get user role if not direct message 
    if(messageType !== 'dm'){
      try{
        var userRoles = msg.member.roles;
      }catch (error){
        log.log_write_console('Failed to get role 1');
        var userRoles = 'none';
      }
    }
    
    try{
      var userRole = check.check_user_role(userID,userRoles);
    }catch (error){
      log.log_write_console('Failed to get role 2');
      var userRole = 0;
    }

    // Enable / Disable bot commands
    // Check if command is start or stop
    var startStopCheck = messageContent.split(/ +/);
    if(startStopCheck[0].substr(1) === 'cstop' && userRole == 3){
      botEnabled = 0;
      chat.chat_reply(msg,'embed',false,messageType,config.colors.special,false,false,false,config.messages.startstop.disabled,false,false,false,false);
      return;
    }
    if(startStopCheck[0].substr(1) === 'cstart' && userRole == 3){
      botEnabled = 1;
      chat.chat_reply(msg,'embed',false,messageType,config.colors.special,false,false,false,config.messages.startstop.enabled,false,false,false,false);
      return;
    }
    if(!botEnabled){
      return;
    }

    // If its not a dm message check if its a valid channel for commands
    if(!check.check_respond_channel(channelID) && messageType !== 'dm')
      return;

    // Check if admin mode is enabled and only allow commands from admins
    if(config.bot.adminMode && userRole != 3){
      if(messageType !== 'dm')
        msg.delete();
        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(msg,'embed',userName,messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.adminMode,false,false,false,false);
      return;
    }

    // Save and check cooldown timer but ignor admins/mods/vips  ˇˇ
    if(userRole < 1){ 
      if(cooldownTimes[userID] > (currentTimestamp-config.bot.cooldownTime) && cooldownTimes[userID] !== undefined){
        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(msg,'embed',userName,messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.cooldown,false,false,false,false);
        return;
      }
      cooldownTimes[userID] = currentTimestamp;
    }

    // Check if direct messages to bot are disabled
    if(!config.bot.allowDM && messageType === 'dm'){ 
      //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
      chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.DMDisabled,false,false,false,false);
      return;
    }

    // Check if its a valid message and if it use the right prefix
    if(!check.check_valid_content(messageContent)){ // if not valid
      // Delete message if not direct message and delete
      if(messageType !== 'dm')
        msg.delete();
      //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
      chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
      return;
    }

    // Remove double spaces and make command lowercase in case user used uppercase letters
    var recievedCommand = messageContent.toLowerCase().split(/ +/);

    // Check if command is on ignor list
    var ignorCheck = recievedCommand[0].substr(1);
    if(config.bot.commandIgnor.includes(ignorCheck)){
      return;
    }
    
    // Process command
    command.fire_command(messageFull,userID,userName,messageType,userRole,recievedCommand[0].substr(1),recievedCommand[1],recievedCommand[2],recievedCommand[3],recievedCommand[4],serverUsers);
}

});

// Start the bot
client.login(config.bot.botToken);

// Start cronjobs
if(config.backup.enabled) // Backup cron
  cron.cron_backup_game_data();

if(config.backup.deleteOld) // Delete old backups
  cron.cron_backup_delete();

if(config.ftpupload.enabled) // FTP upload cron
  cron.cron_upload_game_data();

if(config.battle.cron.enabled) // automated monsters
  cron.cron_battle();

if(config.shop.cron.enabled) // automated shops
  cron.cron_shop();

if(config.shop.shopCosts.realPrices.enabled) // Get coin price
  cron.cron_price();
