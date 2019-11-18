try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

var chat = require("./chat.js");
var check = require("./check.js");
var cryptobreedables = require("./cryptobreedables.js");
var event = require("./event.js");
var log = require("./log.js");
var storage = require("./storage.js");
var transaction = require("./transaction.js");
var user = require("./user.js");

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

const { Client } = require('discord.js');
const client = new Client();

// A lightweight JavaScript date library for parsing, validating, manipulating, and formatting dates.
const moment = require('moment-timezone');
const npmmoment = require('moment');

// var AsciiTable = require('ascii-table'); // Build ascii table -> https://github.com/sorensen/ascii-table <- not used but a brillant lib ;)

const Big = require('big.js'); // https://github.com/MikeMcl/big.js -> http://mikemcl.github.io/big.js/

const sortJson = require('sort-json'); // https://www.npmjs.com/package/sort-json

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // !activate <item type> <item ID> / Activate itemID
    /* ------------------------------------------------------------------------------ */

    command_activate: async function(userID,userName,messageType,userRole,msg,partTwo,partThree){
        // Private message not allowed
        if(messageType === 'dm'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.private,false,false,false,false);
            return;
        }
        var possiblePets = config.activate.possiblePets;
        if(!partTwo || !partThree || possiblePets.indexOf(partTwo) <= -1 ){
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }
        // Get user data
        var getUserData = await event.event_get_user_data(userID,messageType,msg);
        var userAttackItems = getUserData.attackItems;
        var userAttackItemsPet = getUserData.attackItems[partTwo];
        if(userAttackItems.hasOwnProperty(partTwo)){
            if(userAttackItemsPet.hasOwnProperty(partThree)){
                // Write new pet
                var activateItem = await storage.storage_write_local_storage(userID,'games.cryptobreedables.attackItems.'+partTwo+'.activeID',partThree);
                // If not possible to write new pet
                if(!activateItem){ 
                    // If fail to write new pet
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;
                }
                chat.chat_reply(msg,'normal',userName,messageType,false,false,false,false,config.messages.activate.success,false,false,false,false);
                log.log_write_game(config.messages.activate.log.action,config.messages.activate.log.user+' '+userName+' - '+config.messages.activate.success+' '+partTwo+':'+partThree);
                return;
            }else{
                chat.chat_reply(msg,'normal',userName,messageType,false,false,false,false,config.messages.activate.noItem,false,false,false,false);
                return;
            }
        }else{
            chat.chat_reply(msg,'normal',userName,messageType,false,false,false,false,config.messages.activate.noneOfType,false,false,false,false);
            return;
        }
    },

    /* ------------------------------------------------------------------------------ */
    // !battle <monster strength> / Start a battle with a set monster strenght
    /* ------------------------------------------------------------------------------ */
    
    command_battle: function(manuallyFired,userID,userName,messageType,userRole,msg,partTwo){
        // Private message not allowed
        if(messageType === 'dm'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.private,false,false,false,false);
            return;
        }
        // Check if user is allowed to fire the command
        if(userRole < 2 && manuallyFired){ // mods are allowed to start battles
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
            return;
        }
        // Check if value is given, is numeric, is not out of int range
        if(!partTwo || !check.check_isNumeric(partTwo) || check.check_out_of_int_range(partTwo)){
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }
        // Set value BigInt and from minus to plus if its negative
        partTwo = Math.abs(partTwo).toFixed();
        // Check if min lifepoints are set 
        if(partTwo < config.battle.minLifePoints){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.battle.minLifePoints + " " + config.battle.minLifePoints + " " + config.messages.battle.minLifePoints2,false,false,false,false);
            return;
        }
        // Check if currently active event is running
        if(eventActive){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.warning,false,config.messages.battle.active,false,false,false,false);
            return;
        }
        // If event not active and manually fired reset round count and first start life value
        if(!eventActive && manuallyFired){ 

            // Mention warrior group if enabled
            if(config.commands.mention){
                try{
                    chat.chat_reply(msg,'normal',false,messageType,false,false,false,false,'<@&'+config.bot.mentionGroup+'>',false,false,false,false);
                }catch (error){
                }
            }

            eventCurrentRound = battleStartRound;
            battleStartLifePoints = partTwo;
            battleCurrentLifePoints = partTwo;
            log.log_write_game(config.messages.battle.log.action,config.messages.battle.log.user+' '+userName+' - '+config.messages.battle.log.start+' '+partTwo);
        }
        // Caluclate life display from global vars
        battleCurrentLifeDisplay = '';
        event.event_life_display(battleCurrentLifePoints);
        // Set global eventActive
        eventActive = true;
        eventName = "battle";
        // Set start round or current round
        if(eventCurrentRound > battleEndRound)
            eventCurrentRound = battleStartRound
        // Create monster image if manually fired
        var monsterImage = '';
        if(manuallyFired){
            var monsterNumber = check.check_random_from_to(config.monster.img.numberFrom,config.monster.img.numberTo);
            battleMonsterImage = config.monster.img.name+monsterNumber+'.jpg';
        }
        monsterImage = battleMonsterImage;
        // Create the monster message and start the event
        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(msg,'embed',false,messageType,config.colors.special,false,config.messages.battle.title+' '+battleCurrentLifeDisplay,[[config.messages.battle.lifePoints,'```'+partTwo+'```',true],[config.messages.battle.round,'```'+eventCurrentRound+'/'+config.battle.endRound+'```',true]],config.messages.battle.description,false,false,monsterImage,false).then(function(reactCollectorMessage) {
            // Save message to global eventCollectorMessage
            eventCollectorMessage = reactCollectorMessage;
            event.event_battle_build(eventCollectorMessage,userID,userName,messageType,userRole,msg);
        });
        return;
    },  
    
    /* ------------------------------------------------------------------------------ */
    // !cversion -> Get current bot and wallet infos
    /* ------------------------------------------------------------------------------ */

    command_cversion: async function(userID,userName,messageType,msg){
        var botVersion = config.bot.version;
        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(msg,'embed',false,messageType,config.colors.success,false,config.messages.version.title,[[config.messages.version.botversion,botVersion,false]],false,false,false,false,false); 
        return;
    },

    /* ------------------------------------------------------------------------------ */
    // !claim -> Get a free box every 24 hours
    /* ------------------------------------------------------------------------------ */

    command_claim: async function(userID,userName,messageType,userRole,msg){

        // Private message not allowed
        if(messageType === 'dm'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.private,false,false,false,false);
            return;
        }
        // Check if currently active event is running and block command
        if(eventActive){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.warning,false,config.messages.use.eventActive,false,false,false,false);
            return;
        }

        // Get claim user data
        var claimUserData = await event.event_get_user_data(userID,messageType,msg);

        // Check if user is already defined level
        if(claimUserData.level < config.claim.minLevel){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.claim.error,false,config.messages.claim.lowLevel +' `'+config.claim.minLevel+'`',false,false,false,false);
            return;
        }

        // Get user last claim date
        if(claimUserData.hasOwnProperty('claim')){
            lastClaim = claimUserData.claim;
        }else{ // If no date
            lastClaim = '2000-01-01T11:11:11.111Z';
        }

        // Calculate time between last claim to now
        var time = new Date() - new Date(lastClaim);
        var seconds = npmmoment.duration(time).seconds();
        var minutes = npmmoment.duration(time).minutes();
        var hours   = npmmoment.duration(time).hours();
        var days    = npmmoment.duration(time).days();
        var timesince = '```'+days+' Days '+hours+' Hours '+minutes+' Minutes '+seconds+' Seconds```';

        // If last claim less 24 hours 
        if(days < config.claim.daysBetween){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.claim.error,false,config.messages.claim.notReady+timesince,false,false,false,false);
            return;
        }

        // Save new claim date to user profile
        var writeClaimTime = await storage.storage_write_local_storage(userID,'games.cryptobreedables.claim',new Date()); 
        if(!writeClaimTime){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        // Open box for user
        this.command_use(userID,userName,messageType,userRole,msg,'box',true);

        return;
    },
    
    /* ------------------------------------------------------------------------------ */
    // !d / !destroy -> Exit current event that is running
    /* ------------------------------------------------------------------------------ */

    command_destroy: function(manuallyFired,userID,userName,messageType,userRole,msg){
        // Private message not allowed
        if(messageType === 'dm'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.private,false,false,false,false);
            return;
        }
        // Check if user is allowed to fire the command
        if(userRole < 2 && manuallyFired){ // mods are allowed to start battles
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
            return;
        }
        // If battle active
        if(eventActive){
            // Stop active event
            event.event_destroy(1,eventCollector);
            // Delete event message
            chat.chat_delete_message(eventCollectorMessage);
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.destroy.title,false,config.messages.destroy.description,false,false,false,false);
            return;
        }else{
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.warning,false,config.messages.destroy.error,false,false,false,false);
            return;
        }
    },

    /* ------------------------------------------------------------------------------ */
    // !gift -> Send a gift to a user
    /* ------------------------------------------------------------------------------ */

    command_gift: async function(userID,userName,messageType,userRole,msg,partTwo,partThree,partFour){
        var receiverUser = partTwo;
        // Private message not allowed
        if(messageType === 'dm'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.private,false,false,false,false);
            return;
        }
        // Check if value is given, is numeric, is not out of int range
        if(!partTwo || !partThree || !partFour || !check.check_isNumeric(partFour) || check.check_out_of_int_range(partFour)){
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }
        // Check if user is currently blocked to use this command
        if(commandBlockedUsers.includes(userID)){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.currentlyBlocked,false,false,false,false);
            return;
        }else{
            // Add user to command block list to prevent double spend while command running
            check.check_add_blocklist(userID);
        }
        // Set value BigInt and from minus to plus if its negative
        partFour = Math.abs(partFour).toFixed();
        // Get gift sender user data
        var getGiftUserData = await event.event_get_user_data(userID,messageType,msg);
        var userGiftHealth = getGiftUserData.health;
        var userGiftRezHealth = getGiftUserData.rezHealth;
        var userGiftLifeIncreasePotions = getGiftUserData.items.lifeIncreasePotions;
        var userGiftHealPotions = getGiftUserData.items.healPotions;
        var userGiftEggs = getGiftUserData.items.eggs;
        var userGiftBoxes = getGiftUserData.items.boxes;
        var userGiftDivineShields = getGiftUserData.items.divineShield.count;
        var userGiftDivineShieldHealth = getGiftUserData.items.divineShield.health;
        // Check if receiver user is a valid discord id
        if(!check.check_valid_discord_id(receiverUser)){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.gift.notvalid,false,false,false,false);
            // Remove user from command block list to allow to fire new commands
            check.check_remove_blocklist(userID);
            return;
        }
        // Get receiver user discord_id
        receiverUser = receiverUser.slice(2, -1);
        // Check if discord admin and remove ! from of discord id!
        if(receiverUser.substring(0,1) == '!'){
            receiverUser = receiverUser.substr(1);
        }
        // If discord id is own discord id <- self tip
        if(Big(userID).eq(receiverUser) && userRole < 3){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.gift.self,false,false,false,false);
            // Remove user from command block list to allow to fire new commands
            check.check_remove_blocklist(userID);
            return;
        } 
        // Get receiver user data
        var getReceiverUserData = await event.event_get_user_data(receiverUser,messageType,msg);
        var userReceiverHealth = getReceiverUserData.health;
        var userReceiverRezHealth = getReceiverUserData.rezHealth;
        var userReceiverLifeIncreasePotions = getReceiverUserData.items.lifeIncreasePotions;
        var userReceiverHealPotions = getReceiverUserData.items.healPotions;
        var userReceiverEggs = getReceiverUserData.items.eggs;
        var userReceiverBoxes = getReceiverUserData.items.boxes;
        var userReceiverDivineShields = getReceiverUserData.items.divineShield.count;
        var userReceiverDivineShieldHealth = getReceiverUserData.items.divineShield.health;
        // Credit user by gift item
        switch (partThree) {
            case 'box':
                    // Check if userGiftBoxes is 0 // admin can tip even if no items
                    if(userGiftBoxes == 0 && userRole < 3){
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.gift.empty,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }
                    // Check if the gift user has enough boxes // admin can tip even if no items
                    if(Big(userGiftBoxes).lt(partFour) && userRole < 3){
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.gift.big+' `'+partFour+'` '+config.messages.gift.big1+' `'+userGiftBoxes+'`'+config.messages.gift.big2,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }   
                    // Calculate new item value
                    var newItemValue = new Big(userGiftBoxes).minus(partFour);
                    // Remove items from gifter if not admin
                    if(userRole < 3){
                        var writeNewValue= await storage.storage_write_local_storage(userID,'games.cryptobreedables.items.boxes',newItemValue); 
                        // If not possible to write new health
                        if(!writeNewValue){ 
                            // If fail to write new health
                            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                            // Remove user from command block list to allow to fire new commands
                            check.check_remove_blocklist(userID);
                            return;
                        }
                    }
                    // Credit user with item/s
                    var newCreditItemValue = new Big(userReceiverBoxes).plus(partFour);
                    var creditNewValue= await storage.storage_write_local_storage(receiverUser,'games.cryptobreedables.items.boxes',newCreditItemValue); 
                    // If not possible to write new health
                    if(!creditNewValue){ 
                        // If fail to write new health
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }
                    // Success message
                    chat.chat_reply(msg,'normal',userName,messageType,false,false,false,false,' '+config.messages.gift.success+' <@'+receiverUser+'> `'+partFour+'` '+config.messages.gift.items.boxes+config.messages.gift.big2,false,false,false,false);
                    log.log_write_game(config.messages.gift.log.action,config.messages.gift.log.user+' '+userName+' - '+config.messages.gift.success+' '+receiverUser+' '+partFour+' '+partThree+config.messages.gift.big2);
                // Remove user from command block list to allow to fire new commands
                check.check_remove_blocklist(userID);
                break;
            case 'divineshield':
                    // Check if userGiftDivineShields is 0 // admin can tip even if no items
                    if(userGiftDivineShields == 0 && userRole < 3){
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.gift.empty,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }
                    // Check if the gift user has enough divines hields // admin can tip even if no items
                    if(Big(userGiftDivineShields).lt(partFour) && userRole < 3){
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.gift.big+' `'+partFour+'` '+config.messages.gift.big1+' `'+userGiftDivineShields+'`'+config.messages.gift.big2,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }   
                    // Calculate new item value
                    var newItemValue = new Big(userGiftDivineShields).minus(partFour);
                    // Remove items from gifter if not admin
                    if(userRole < 3){
                        var writeNewValue= await storage.storage_write_local_storage(userID,'games.cryptobreedables.items.divineShield.count',newItemValue); 
                        // If not possible to write new health
                        if(!writeNewValue){ 
                            // If fail to write new health
                            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                            // Remove user from command block list to allow to fire new commands
                            check.check_remove_blocklist(userID);
                            return;
                        }
                    }
                    // Credit user with item/s
                    var newCreditItemValue = new Big(userReceiverDivineShields).plus(partFour);
                    var creditNewValue= await storage.storage_write_local_storage(receiverUser,'games.cryptobreedables.items.divineShield.count',newCreditItemValue); 
                    // If not possible to write new health
                    if(!creditNewValue){ 
                        // If fail to write new health
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }
                    // If user divineshield count is empty also add shield health
                    if(userReceiverDivineShields <= 0){
                        var creditNewValue = await storage.storage_write_local_storage(receiverUser,'games.cryptobreedables.items.divineShield.health',config.items.divineShield.totalHealth); 
                        // If not possible to write new health
                        if(!creditNewValue){ 
                            // If fail to write new health
                            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                            // Remove user from command block list to allow to fire new commands
                            check.check_remove_blocklist(userID);
                            return;
                        }
                    }
                    // Success message
                    chat.chat_reply(msg,'normal',userName,messageType,false,false,false,false,' '+config.messages.gift.success+' <@'+receiverUser+'> `'+partFour+'` '+config.messages.gift.items.divineShield+config.messages.gift.big2,false,false,false,false);
                    log.log_write_game(config.messages.gift.log.action,config.messages.gift.log.user+' '+userName+' - '+config.messages.gift.success+' '+receiverUser+' '+partFour+' '+partThree+config.messages.gift.big2);
                // Remove user from command block list to allow to fire new commands
                check.check_remove_blocklist(userID);       
                break;
            case 'lifeincreasepotion':
                    // Check if userGiftLifeIncreasePotions is 0 // admin can tip even if no items
                    if(userGiftLifeIncreasePotions == 0 && userRole < 3){
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.gift.empty,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }
                    // Check if the gift user has enough health potions // admin can tip even if no items
                    if(Big(userGiftLifeIncreasePotions).lt(partFour) && userRole < 3){
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.gift.big+' `'+partFour+'` '+config.messages.gift.big1+' `'+userGiftLifeIncreasePotions+'`'+config.messages.gift.big2,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    } 
                    // Calculate new item value
                    var newItemValue = new Big(userGiftLifeIncreasePotions).minus(partFour);
                    // Remove items from gifter if not admin
                    if(userRole < 3){
                        var writeNewValue= await storage.storage_write_local_storage(userID,'games.cryptobreedables.items.lifeIncreasePotions',newItemValue); 
                        // If not possible to write new health
                        if(!writeNewValue){ 
                            // If fail to write new health
                            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                            // Remove user from command block list to allow to fire new commands
                            check.check_remove_blocklist(userID);
                            return;
                        }
                    }  
                    // Credit user with item/s
                    var newCreditItemValue = new Big(userReceiverLifeIncreasePotions).plus(partFour);
                    var creditNewValue= await storage.storage_write_local_storage(receiverUser,'games.cryptobreedables.items.lifeIncreasePotions',newCreditItemValue); 
                    // If not possible to write new health
                    if(!creditNewValue){ 
                        // If fail to write new health
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }
                    // Success message
                    chat.chat_reply(msg,'normal',userName,messageType,false,false,false,false,' '+config.messages.gift.success+' <@'+receiverUser+'> `'+partFour+'` '+config.messages.gift.items.lifeIncreasePotions+config.messages.gift.big2,false,false,false,false);
                log.log_write_game(config.messages.gift.log.action,config.messages.gift.log.user+' '+userName+' - '+config.messages.gift.success+' '+receiverUser+' '+partFour+' '+partThree+config.messages.gift.big2);
                // Remove user from command block list to allow to fire new commands
                check.check_remove_blocklist(userID);
                break;
            case 'healpotion':
                    // Check if userGiftHealPotions is 0 // admin can tip even if no items
                    if(userGiftHealPotions == 0 && userRole < 3){
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.gift.empty,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }
                    // Check if the gift user has enough health potions // admin can tip even if no items
                    if(Big(userGiftHealPotions).lt(partFour) && userRole < 3){
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.gift.big+' `'+partFour+'` '+config.messages.gift.big1+' `'+userGiftLifeIncreasePotions+'`'+config.messages.gift.big2,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    } 
                    // Calculate new item value
                    var newItemValue = new Big(userGiftHealPotions).minus(partFour);
                    // Remove items from gifter if not admin
                    if(userRole < 3){
                        var writeNewValue= await storage.storage_write_local_storage(userID,'games.cryptobreedables.items.healPotions',newItemValue); 
                        // If not possible to write new health
                        if(!writeNewValue){ 
                            // If fail to write new health
                            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                            // Remove user from command block list to allow to fire new commands
                            check.check_remove_blocklist(userID);
                            return;
                        }
                    }  
                    // Credit user with item/s
                    var newCreditItemValue = new Big(userReceiverHealPotions).plus(partFour);
                    var creditNewValue= await storage.storage_write_local_storage(receiverUser,'games.cryptobreedables.items.healPotions',newCreditItemValue); 
                    // If not possible to write new health
                    if(!creditNewValue){ 
                        // If fail to write new health
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }
                    // Success message
                    chat.chat_reply(msg,'normal',userName,messageType,false,false,false,false,' '+config.messages.gift.success+' <@'+receiverUser+'> `'+partFour+'` '+config.messages.gift.items.healPotions+config.messages.gift.big2,false,false,false,false);
                log.log_write_game(config.messages.gift.log.action,config.messages.gift.log.user+' '+userName+' - '+config.messages.gift.success+' '+receiverUser+' '+partFour+' '+partThree+config.messages.gift.big2);
                // Remove user from command block list to allow to fire new commands
                check.check_remove_blocklist(userID);
                break;
            case 'egg':
                    // Check if user is allowed to fire the command
                    if(userRole < 3){ // admins are allowed to start battles
                        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }
                    // Credit user with item/s
                    var newCreditItemValue = new Big(userReceiverEggs).plus(partFour);
                    var creditNewValue= await storage.storage_write_local_storage(receiverUser,'games.cryptobreedables.items.eggs',newCreditItemValue); 
                    // If not possible to write new health
                    if(!creditNewValue){ 
                        // If fail to write new health
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }
                    // Success message
                    chat.chat_reply(msg,'normal',userName,messageType,false,false,false,false,' '+config.messages.gift.success+' <@'+receiverUser+'> `'+partFour+'` '+config.messages.gift.items.eggs+config.messages.gift.big2,false,false,false,false);
                log.log_write_game(config.messages.gift.log.action,config.messages.gift.log.user+' '+userName+' - '+config.messages.gift.success+' '+receiverUser+' '+partFour+' '+partThree+config.messages.gift.big2);
                // Remove user from command block list to allow to fire new commands
                check.check_remove_blocklist(userID);
                break;
            case 'life':
                    // Check if user is allowed to fire the command
                    if(userRole < 3){ // admins are allowed to start battles
                        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }
                    // Credit user with item/s
                    var newCreditItemValue = new Big(userReceiverHealth).plus(partFour);
                    if(Big(newCreditItemValue).gt(userReceiverRezHealth)){
                        newCreditItemValue = userReceiverRezHealth;
                    }
                    var creditNewValue= await storage.storage_write_local_storage(receiverUser,'games.cryptobreedables.health',newCreditItemValue); 
                    // If not possible to write new health
                    if(!creditNewValue){ 
                        // If fail to write new health
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }
                    // Success message
                    chat.chat_reply(msg,'normal',userName,messageType,false,false,false,false,' '+config.messages.gift.success+' <@'+receiverUser+'> `'+partFour+'` '+config.messages.gift.items.life+config.messages.gift.big2,false,false,false,false);
                log.log_write_game(config.messages.gift.log.action,config.messages.gift.log.user+' '+userName+' - '+config.messages.gift.success+' '+receiverUser+' '+partFour+' '+partThree+config.messages.gift.big2);
                // Remove user from command block list to allow to fire new commands
                check.check_remove_blocklist(userID);
                break;
            case 'protection':
                    // Check if user is allowed to fire the command
                    if(userRole < 3){ // admins are allowed to start battles
                        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }   
                    // Credit user with item/s
                    var newCreditItemValue = new Big(userReceiverDivineShieldHealth).plus(partFour);
                    if(Big(newCreditItemValue).gt(config.items.divineShield.totalHealth)){
                        newCreditItemValue = config.items.divineShield.totalHealth;
                    }
                    var creditNewValue= await storage.storage_write_local_storage(receiverUser,'games.cryptobreedables.items.divineShield.health',newCreditItemValue); 
                    // If not possible to write new health
                    if(!creditNewValue){ 
                        // If fail to write new health
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }
                    // Success message
                    chat.chat_reply(msg,'normal',userName,messageType,false,false,false,false,' '+config.messages.gift.success+' <@'+receiverUser+'> `'+partFour+'` '+config.messages.gift.items.protection+config.messages.gift.big2,false,false,false,false);
                log.log_write_game(config.messages.gift.log.action,config.messages.gift.log.user+' '+userName+' - '+config.messages.gift.success+' '+receiverUser+' '+partFour+' '+partThree+config.messages.gift.big2);
                // Remove user from command block list to allow to fire new commands
                check.check_remove_blocklist(userID);
                break;
            default:
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                // Remove user from command block list to allow to fire new commands
                check.check_remove_blocklist(userID);
                return;
        }
        return;
    },

    /* ------------------------------------------------------------------------------ */
    // !h / !help -> Show help command infos
    /* ------------------------------------------------------------------------------ */

    command_help: function(userID,userName,messageType,userRole,msg){
        // Normal commands
        var enabledUserCommands = [];
        if(config.commands.me)
            enabledUserCommands.push([config.messages.help.meTitle,config.messages.help.meValue,false]);
        if(config.commands.gift)
            enabledUserCommands.push([config.messages.help.giftTitle,config.messages.help.giftValue,false]);
        if(config.commands.use)
            enabledUserCommands.push([config.messages.help.useTitle,config.messages.help.useValue,false]);
        if(config.commands.rez)
            enabledUserCommands.push([config.messages.help.rezTitle,config.messages.help.rezValue,false]);
        if(config.commands.activate)
            enabledUserCommands.push([config.messages.help.activateTitle,config.messages.help.activateValue,false]);
        if(config.commands.claim)
            enabledUserCommands.push([config.messages.help.claimTitle,config.messages.help.claimValue,false]);
        if(config.commands.jackpot)
            enabledUserCommands.push([config.messages.help.jackpotTitle,config.messages.help.jackpotValue,false]);
        if(config.commands.top)
            enabledUserCommands.push([config.messages.help.topTitle,config.messages.help.topValue,false]);
        if(config.commands.mention)
            enabledUserCommands.push([config.messages.help.mentionTitle,config.messages.help.mentionValue,false]);
        if(config.commands.version)
        enabledUserCommands.push([config.messages.help.versionTitle,config.messages.help.versionValue,false]);
        // Admin commands
        var enabledAdminCommands = []; 
        if(config.commands.battle)
            enabledAdminCommands.push([config.messages.help.admin.battleTitle,config.messages.help.admin.battleValue,false]);
        if(config.commands.destroy)
            enabledAdminCommands.push([config.messages.help.admin.destroyTitle,config.messages.help.admin.destroyValue,false]);
        if(config.commands.gift)
            enabledAdminCommands.push([config.messages.help.admin.giftTitle,config.messages.help.admin.giftValue,false]);
        if(config.commands.startstop)
        enabledAdminCommands.push([config.messages.help.admin.startStopTitle,config.messages.help.admin.startStopValue,false]);
        if(config.commands.kill)
            enabledAdminCommands.push([config.messages.help.admin.killTitle,config.messages.help.admin.killValue,false]);
        if(config.commands.lock)
            enabledAdminCommands.push([config.messages.help.admin.lockTitle,config.messages.help.admin.lockValue,false]);
        if(config.commands.summary)
            enabledAdminCommands.push([config.messages.help.admin.summaryTitle,config.messages.help.admin.summaryValue,false]);
        if(config.commands.shop)
            enabledAdminCommands.push([config.messages.help.admin.shopTitle,config.messages.help.admin.shopValue,false]);
        if(userRole >= 3){
            chat.chat_reply(msg,'private',userName,messageType,config.colors.normal,false,config.messages.help.admin.title,enabledAdminCommands,false,false,false,false,false);
        }
        chat.chat_reply(msg,'embed',userName,messageType,config.colors.normal,false,config.messages.help.title,enabledUserCommands,false,false,false,false,false);
        return;
    },

    /* ------------------------------------------------------------------------------ */
    // !jackpot / Show current jackpot values
    /* ------------------------------------------------------------------------------ */

    command_jackpot: async function(userID,userName,messageType,userRole,msg){
        // Get user data
        var getJackpotData = await storage.storage_read_jackpot();
        // CHeck if user is register else create start values
        if(getJackpotData === undefined){
            chat.chat_reply(msg,'embed','<@'+userID+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        var currentJackpotValue = getJackpotData.value;
        var lastWinner = getJackpotData.lastWinner;
        if(lastWinner != "None"){
            lastWinner = "<@"+lastWinner+">"
        }
        var lastWinnerValue = getJackpotData.lastWinnerValue;
        chat.chat_reply(msg,'embed',false,messageType,config.colors.yellow,false,config.jackpot.chatIcons.jackpot+' '+config.messages.jackpot.title,[[config.messages.jackpot.value,config.jackpot.chatIcons.coins+' `'+Big(currentJackpotValue).toFixed(8)+'` '+config.bot.coinName+' ('+config.bot.coinSymbol+')',false],[config.messages.jackpot.lastName,lastWinner,true],[config.messages.jackpot.lastValue,lastWinnerValue,true]],false,false,false,false,false);
        return;
    },

    /* ------------------------------------------------------------------------------ */
    // !kill - Kill the complete bot process
    /* ------------------------------------------------------------------------------ */

    command_kill: function(userID,userName,messageType,userRole,msg){
        // Check if user is allowed to fire the command
        if(userRole < 3){ // admins are allowed to kill bot
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
            return;
        }
        process.exit(1);
    },

    /* ------------------------------------------------------------------------------ */
    // !lock <on/off/list/reset> <@username> -> Lock or unlock a user from blocklist commands. Show or reset blocklist users.
    /* ------------------------------------------------------------------------------ */

    command_lock: async function(userID,userName,messageType,userRole,msg,partTwo,partThree){
        receiverUser = partThree;
        // Private message not allowed
        if(messageType === 'dm'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.private,false,false,false,false);
            return;
        }
        // Check if user is allowed to fire the command
        if(userRole < 3){ // admins are allowed to use lock command
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
            return;
        }
        switch (partTwo) {
            case "on":
                // Check if receiver user is a valid discord id
                if(!check.check_valid_discord_id(receiverUser)){
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.lock.notvalid,false,false,false,false);
                    return;
                }
                // Get receiver user discord_id
                receiverUser = receiverUser.slice(2, -1);
                // Check if discord admin and remove ! from of discord id!
                if(receiverUser.substring(0,1) == '!'){
                    receiverUser = receiverUser.substr(1);
                }
                // Add user to command block list
                check.check_add_blocklist(receiverUser);
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.blue,false,config.messages.title.info,false,config.messages.lock.on+' '+receiverUser,false,false,false,false);
                break;
            case "off":
                // Check if receiver user is a valid discord id
                if(!check.check_valid_discord_id(receiverUser)){
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.lock.notvalid,false,false,false,false);
                    return;
                }
                // Get receiver user discord_id
                receiverUser = receiverUser.slice(2, -1);
                // Check if discord admin and remove ! from of discord id!
                if(receiverUser.substring(0,1) == '!'){
                    receiverUser = receiverUser.substr(1);
                }
                // Remove user from command block list
                check.check_remove_blocklist(receiverUser);
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.blue,false,config.messages.title.info,false,config.messages.lock.off+' '+receiverUser,false,false,false,false);
                break;
            case "list":
                var userList = "";
                commandBlockedUsers.forEach(function(user) {
                    userList += "\n"+user;
                });
                if(userList === "")
                    userList = config.messages.lock.none;
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.blue,false,config.messages.title.info,false,config.messages.lock.list+userList,false,false,false,false);
                break;
            case "reset":
                commandBlockedUsers = [];
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.blue,false,config.messages.title.info,false,config.messages.lock.reset,false,false,false,false);
                break;
            default:
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,false,false,config.messages.notValidCommand,false,false,false,false);
                return;
        }
    },

    /* ------------------------------------------------------------------------------ */
    // !me - Show user stats and items
    /* ------------------------------------------------------------------------------ */

    command_me: async function(userID,userName,messageType,msg){
        var me = '';
        var getUserData = await event.event_get_user_data(userID,messageType,msg);
        var userLevel = getUserData.level;
        var userLevelExp = getUserData.exp;
        var userNextLevel = new Big(userLevel).plus(1);
        var userNextLevelExp = config.userLevel[Big(userNextLevel).toString()];
        var userHealth = getUserData.health;
        var userRezHealth = getUserData.rezHealth;
        var userLifeIncreasePotions = getUserData.items.lifeIncreasePotions;
        var userHealPotions = getUserData.items.healPotions;
        var userEggs = getUserData.items.eggs;
        var userBoxes = getUserData.items.boxes;
        var userDivineShields = getUserData.items.divineShield.count;
        var userDivineShieldHealth = getUserData.items.divineShield.health;
        var userDeath = getUserData.death;
        var userKills = getUserData.kills;
        me += config.me.chatIcons.profile+' '+config.bot.websiteUserProfile+userID+'\n';
        me += config.me.chatIcons.levelUp+' **'+config.messages.me.level+':** '+userLevel+' - **'+config.messages.me.exp+':** '+userLevelExp+'/'+userNextLevelExp+'\n';
        me += config.me.chatIcons.fullHeart+' **'+config.messages.me.health+':** '+userHealth+'/'+userRezHealth+'\n';
        me += config.me.chatIcons.egg+' **'+config.messages.me.eggs+':** '+userEggs+'\n';
        me += config.me.chatIcons.lifeIncreasePotion+' **'+config.messages.me.lifeIncreasePotions+':** '+userLifeIncreasePotions+'\n';
        me += config.me.chatIcons.healPotion+' **'+config.messages.me.healPotions+':** '+userHealPotions+'\n';
        me += config.me.chatIcons.box+' **'+config.messages.me.boxes+':** '+userBoxes+'\n';
        me += config.me.chatIcons.divineShield+' **'+config.messages.me.divineShield+':** '+userDivineShields+' - **'+config.messages.me.health+':** '+userDivineShieldHealth+'\n';
        me += config.me.chatIcons.sword+' **'+config.messages.me.kills+':** '+userKills+'\n';
        me += config.me.chatIcons.dead+' **'+config.messages.me.death+':** '+userDeath;
        chat.chat_reply(msg,'embed',false,messageType,config.colors.white,false,config.messages.me.title+' - '+userName.username,false,me,false,false,false,false);
        return; 
    },

    /* ------------------------------------------------------------------------------ */
    // !mention <on/off>
    /* ------------------------------------------------------------------------------ */

    command_mention: async function(userID,userName,messageType,msg,partTwo){
        // Private message not allowed
        if(messageType === 'dm'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.private,false,false,false,false);
            return;
        }
        switch (partTwo) {
            case "on":
                    msg.member.addRole(config.bot.mentionGroup).then().catch();
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.mention.title+' '+partTwo,false,config.messages.mention.join,false,false,false,false);
                break;
            case "off":
                    msg.member.removeRole(config.bot.mentionGroup).then().catch();
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.mention.title+' '+partTwo,false,config.messages.mention.leave,false,false,false,false);
                break;
            default:
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,false,false,config.messages.notValidCommand,false,false,false,false);
                return;
        }        
    },

    /* ------------------------------------------------------------------------------ */
    // !rez -> Rez user if he is dead
    /* ------------------------------------------------------------------------------ */

    command_rez: async function(userID,userName,messageType,msg){
        // Private message not allowed
        if(messageType === 'dm'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.private,false,false,false,false);
            return;
        }
        // Check if user is currently blocked to use this command
        if(commandBlockedUsers.includes(userID)){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.currentlyBlocked,false,false,false,false);
            return;
        }else{
            // Add user to command block list to prevent double spend while command running
            check.check_add_blocklist(userID);
        }
        // Get user data
        var getUserData = await event.event_get_user_data(userID,messageType,msg);
        var userHealth = getUserData.health;
        var userRezHealth = getUserData.rezHealth;

        if(userHealth <= 0){

            ///////////////////
            // Check if user has enough money to rez

            // Check if rez for money is enabled
            if(config.rez.enabled){

                var returnMessageAdd = "";

                var userBalance = await user.user_get_balance(userID);

                try {
                    userBalance = Big(userBalance.balance).toString();
                }
                catch (e) {
                    userBalance = false;
                }

                // Automated prices if enabled and global coincentprice not false
                var rezCosts = config.rez.costs
                if(config.shop.shopCosts.realPrices.enabled && coinCentPrice > 0){
                    rezCosts = Big(config.rez.costs).times(coinCentPrice);
                }

                if(!userBalance || Big(userBalance).lt(rezCosts)){
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.rez.error.title,false,config.messages.rez.error.message,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(userID);
                    return;
                }

                // Substract balance from user
                var balanceSubstract = await user.user_substract_balance(rezCosts,userID);
                if(!balanceSubstract){
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(userID);
                    return;  
                }

                // Save Payment to user transaction table
                var savePaymentDone= await transaction.transaction_save_payment_to_db(rezCosts,userID,config.bot.botID,config.messages.payment.game.paid);
                if(!savePaymentDone){     
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(userID);
                    return;  
                }
                if(config.shop.shopCosts.realPrices.enabled && coinCentPrice > 0){
                    returnMessageAdd = " "+config.rez.chatIcons.coins+' `'+Big(rezCosts).toFixed(8)+'` '+config.bot.coinName+' ('+config.bot.coinSymbol+') ('+Big(config.rez.costs).div(100).toFixed(2)+' '+coinCurrency+')'+config.messages.rez.payment;
                }else{
                    returnMessageAdd = " "+config.rez.chatIcons.coins+' `'+Big(rezCosts).toFixed(8)+'` '+config.bot.coinName+' ('+config.bot.coinSymbol+')'+config.messages.rez.payment; 
                }

            }
            ///////////////////
            ///////////////////
            
            // Write new health
            var writeNewHealth= await storage.storage_write_local_storage(userID,'games.cryptobreedables.health',userRezHealth); 
            // If not possible to write new health
            if(!writeNewHealth){ 
                // If fail to write new health
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                // Remove user from command block list to allow to fire new commands
                check.check_remove_blocklist(userID);
                return;
            }
            chat.chat_reply(msg,'normal',userName,messageType,false,false,false,false,config.messages.rez.success+' '+config.rez.chatIcons.fullHeart+' '+config.messages.rez.health+' '+userRezHealth+"/"+userRezHealth+config.messages.rez.textEnd+returnMessageAdd,false,false,false,false);
            log.log_write_game(config.messages.rez.log.action,config.messages.rez.log.user+' '+userName+' - '+config.messages.rez.success+' '+config.rez.chatIcons.fullHeart+' '+config.messages.rez.health+' '+userRezHealth+"/"+userRezHealth+config.messages.rez.textEnd+returnMessageAdd);
            // Remove user from command block list to allow to fire new commands
            check.check_remove_blocklist(userID);
            return;
        }else{
            chat.chat_reply(msg,'normal',userName,messageType,false,false,false,false,config.messages.rez.alive+' '+config.rez.chatIcons.fullHeart+' '+config.messages.rez.health+' '+userHealth+"/"+userRezHealth+config.messages.rez.textEnd,false,false,false,false);
            // Remove user from command block list to allow to fire new commands
            check.check_remove_blocklist(userID);
        }
        return;
    },

    /* ------------------------------------------------------------------------------ */
    // !shop - Show shop
    /* ------------------------------------------------------------------------------ */

    command_shop: async function(manuallyFired,userID,userName,messageType,userRole,msg,partTwo){
        // Overwrite global shop values
        switch(partTwo) {
            case "normal":
                if(!eventActive && manuallyFired){ 
                    shopRoundTime = config.shop[partTwo].roundTime;
                    shopEndRound = config.shop[partTwo].totalRounds;
                    shopImg = config.shop[partTwo].img;
                    shopIcons = config.shop[partTwo].shopIcons;
                    // Set icons to current global eventCollectorMessage
                    shopMessageItems = '\n';
                    Object.keys(shopIcons).forEach(function(k){
                        // Automated prices if enabled and global coincentprice not false
                        var itemCosts = config.shop.shopCosts[k];
                        if(config.shop.shopCosts.realPrices.enabled && coinCentPrice > 0){
                            itemCosts = Big(config.shop.shopCosts[k]).times(coinCentPrice).toFixed(8);
                            shopMessageItems += '<:'+k+':'+shopIcons[k]+'> **'+config.messages.shop[partTwo].shopItems[k]+'** ('+itemCosts+' '+config.bot.coinSymbol+') ('+Big(config.shop.shopCosts[k]).div(100).toFixed(2)+' '+coinCurrency+')\n';
                        }else{
                            shopMessageItems += '<:'+k+':'+shopIcons[k]+'> **'+config.messages.shop[partTwo].shopItems[k]+'** ('+itemCosts+' '+config.bot.coinSymbol+')\n';
                        }    
                    });
                }
                break;
            case "special":
                if(!eventActive && manuallyFired){ 
                    shopRoundTime = config.shop[partTwo].roundTime;
                    shopEndRound = config.shop[partTwo].totalRounds;
                    shopImg = config.shop[partTwo].img;
                    shopIcons = config.shop[partTwo].shopIcons;
                    // Set icons to current global eventCollectorMessage
                    shopMessageItems = '\n';
                    Object.keys(shopIcons).forEach(function(k){
                        // Automated prices if enabled and global coincentprice not false
                        var itemCosts = config.shop.shopCosts[k];
                        if(config.shop.shopCosts.realPrices.enabled && coinCentPrice > 0){
                            itemCosts = Big(config.shop.shopCosts[k]).times(coinCentPrice).toFixed(8);
                            shopMessageItems += '<:'+k+':'+shopIcons[k]+'> **'+config.messages.shop[partTwo].shopItems[k]+'** ('+itemCosts+' '+config.bot.coinSymbol+') ('+Big(config.shop.shopCosts[k]).div(100).toFixed(2)+' '+coinCurrency+')\n';
                        }else{
                            shopMessageItems += '<:'+k+':'+shopIcons[k]+'> **'+config.messages.shop[partTwo].shopItems[k]+'** ('+itemCosts+' '+config.bot.coinSymbol+')\n';
                        }
                    });
                }
                break;
            case "rare":
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,false,false,config.messages.notValidCommand,false,false,false,false);
                return;
            default:
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,false,false,config.messages.notValidCommand,false,false,false,false);
                return;
        }
        // Private message not allowed
        if(messageType === 'dm'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.private,false,false,false,false);
            return;
        }
        // Check if user is allowed to fire the command
        if(userRole < 2 && manuallyFired){ // admins are allowed to use shop command
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
            return;
        }
        // Check if currently active event is running
        if(eventActive){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.warning,false,config.messages.battle.active,false,false,false,false);
            return;
        }
        // If event not active and manually fired reset round count
        if(!eventActive && manuallyFired){ 
            eventCurrentRound = 1;
            log.log_write_game(config.messages.shop.log.action,config.messages.shop.log.user+' '+userName+' - '+config.messages.shop.log.start);
        }
        // Set global eventActive
        eventActive = true;
        eventName = "shop";
        // Set start round or current round
        // Create shop message and start the event
        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(msg,'embed',false,messageType,config.colors.special,false,config.messages.shop.title.toUpperCase()+' '+partTwo.toUpperCase()+' ('+eventCurrentRound+'/'+shopEndRound+')',false,config.messages.shop.disclaimer+'\n'+shopMessageItems,false,false,shopImg,false).then(function(reactCollectorMessage) {
            // Save message to global eventCollectorMessage
            eventCollectorMessage = reactCollectorMessage;
            event.event_shop_build(eventCollectorMessage,userID,userName,messageType,userRole,msg,partTwo);
        });
        return;
    },

    /* ------------------------------------------------------------------------------ */
    // !summary - Show current game stats
    /* ------------------------------------------------------------------------------ */

    command_summary: async function(userID,userName,messageType,userRole,msg,partTwo){
        // Check if user is allowed to fire the command
        if(userRole < 3){ // 
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
            return;
        }
        // Check if value is given and  is a allowed one
        if(!partTwo || !check.check_isNumeric(partTwo) || check.check_out_of_int_range(partTwo)){
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }
        var gameOutValue = await transaction.transaction_get_game_payout_from_db(partTwo); 
        if(!gameOutValue){ 
            gameOutValue = 0;
        }
        var gameInValue = await transaction.transaction_get_game_income_from_db(partTwo); 
        if(!gameInValue){ 
            gameInValue = 0;
        }
        // Debug
        //log.log_write_console('OUT: '+gameOutValue+' - IN: '+gameInValue);
        chat.chat_reply(msg,'private',userName,messageType,config.colors.normal,false,config.messages.summary.title+' ('+partTwo+' '+config.messages.summary.days+')',[[config.messages.summary.out,Big(gameOutValue).toFixed(8)+' '+config.bot.coinName+' ('+config.bot.coinSymbol+")",false],[config.messages.summary.in,Big(gameInValue).toFixed(8)+' '+config.bot.coinName+' ('+config.bot.coinSymbol+")",false]],false,false,false,false,false);
        return;
    },

    /* ------------------------------------------------------------------------------ */
    // !top - Show top 10 players
    /* ------------------------------------------------------------------------------ */

    command_top: async function(userID,userName,messageType,msg){
        var internCount = 0;
        var top = '';
        var getAllData = await storage.storage_read_all();
        if(getAllData == undefined){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        var list = [];
        for(var discordid in getAllData){
            var obj = getAllData[discordid];
            obj['discordid'] = discordid;
            // Fix that jackpot does not get added to list ;)
            if(discordid != 'jackpot')
                list.push(obj);
        }
        list.sort( function(a,b) { return b.games.cryptobreedables.exp - a.games.cryptobreedables.exp; } );
        //list.forEach(function(user,index) {
        if(list.length < config.top.displayCount){
            displayCount = list.length
        }else{
            displayCount = config.top.displayCount;
        }
        for (var key = 0; key < displayCount; key++) {
            var userDiscordID = list[key]['discordid'];
            var userLevel = list[key]['games']['cryptobreedables']['level'];
            var userNextLevel = new Big(userLevel).plus(1);
            var userNextLevelExp = config.userLevel[Big(userNextLevel).toString()];
            var userExp = list[key]['games']['cryptobreedables']['exp'];
            var userHealth = list[key]['games']['cryptobreedables']['health'];
            var userRezHealth = list[key]['games']['cryptobreedables']['rezHealth'];
            var userLifeIncreasePotions = list[key]['games']['cryptobreedables']['items']['lifeIncreasePotions'];
            var userHealPotions = list[key]['games']['cryptobreedables']['items']['healPotions'];
            var userBoxes = list[key]['games']['cryptobreedables']['items']['boxes'];
            var userEggs = list[key]['games']['cryptobreedables']['items']['eggs'];
            var userDivineShields = list[key]['games']['cryptobreedables']['items']['divineShield']['count'];
            var userDivineShieldHealth = list[key]['games']['cryptobreedables']['items']['divineShield']['health'];
            var position = key +1;
            switch (position) {
                case 1:
                    position = config.top.chatIcons.place1;
                    break;
                case 2:
                    position = config.top.chatIcons.place2;
                    break;
                case 3:
                    position = config.top.chatIcons.place3;
                    break;
                case 4:
                    position = config.top.chatIcons.place4;
                    break;
                case 5:
                    position = config.top.chatIcons.place5;
                    break;
                case 6:
                    position = config.top.chatIcons.place6;
                    break;
                case 7:
                    position = config.top.chatIcons.place7;
                    break;
                case 8:
                    position = config.top.chatIcons.place8;
                    break;
                case 9:
                    position = config.top.chatIcons.place9;
                    break;
                case 10:
                    position = config.top.chatIcons.place10;
                  break;
                default:
                    position = config.top.chatIcons.fail;
            }
            var topTitle = config.top.chatIcons.title+' '+config.messages.top.title+' '+config.messages.top.top+' '+displayCount+config.messages.top.top2+' '+config.top.chatIcons.title;
            top += position+' <@'+userDiscordID+'>';
            top += config.messages.top.seperator+' **'+config.messages.top.level+':** '+userLevel;
            top += '\n';
            top += config.top.chatIcons.levelUp+' **'+config.messages.top.exp+':** '+userExp+config.messages.top.seperator3+userNextLevelExp;
            top += config.messages.top.seperator+' '+config.top.chatIcons.fullHeart+' **'+config.messages.top.health+':** '+userHealth+config.messages.top.seperator3+userRezHealth;
            //top += config.messages.top.seperator+' '+config.top.chatIcons.egg+' **'+config.messages.top.eggs+':** '+userEggs;
            //top += config.messages.top.seperator+config.top.chatIcons.box+' **'+config.messages.top.boxes+':** '+userBoxes;
            //top += config.top.chatIcons.lifeIncreasePotion+' **'+config.messages.top.lifeIncreasePotions+':** '+userLifeIncreasePotions;
            //top += config.top.chatIcons.healPotion+' **'+config.messages.top.healPotions+':** '+userHealPotions;
            //top += config.messages.top.seperator+config.top.chatIcons.divineShield+' **'+config.messages.top.divineShield+':** '+userDivineShields+' '+config.messages.top.seperator2+' **'+config.messages.top.health+':** '+userDivineShieldHealth;
            top += '\n';
            if(key+1 == 5 || key+1 == 10 || key+1 == 15 || key+1 == 20 || key+1 == 25 || key+1 == 30 || key+1 == 35 || key+1 == 40 || key+1 == 45 || key+1 == 50 || key+1 == displayCount){
                chat.chat_reply(msg,'embed',false,messageType,config.colors.white,false,topTitle,false,top,false,false,false,false);
                top = '';
            }   
        };
        return; 
    },

    /* ------------------------------------------------------------------------------ */
    // !use <item> - Use a item
    /* ------------------------------------------------------------------------------ */

    command_use: async function(userID,userName,messageType,userRole,msg,partTwo,claim = false){
        // Private message not allowed
        if(messageType === 'dm'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.private,false,false,false,false);
            return;
        }
        // Check if currently active event is running and block command
        if(eventActive){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.warning,false,config.messages.use.eventActive,false,false,false,false);
            return;
        }
        // Get user data
        var getUserData = await event.event_get_user_data(userID,messageType,msg);
        var userExp = getUserData.exp;
        var userHealth = getUserData.health;
        var userRezHealth = getUserData.rezHealth;
        var userBoxes = getUserData.items.boxes;
        var userLifeIncreasePotions = getUserData.items.lifeIncreasePotions;
        var userHealPotions = getUserData.items.healPotions;
        var userDivineShields = getUserData.items.divineShield.count;
        var userDivineShieldHealth = getUserData.items.divineShield.health;
        var userEggs = getUserData.items.eggs;
        var userAttackItems = getUserData.attackItems;
        // Check if user is currently blocked to use this command
        if(commandBlockedUsers.includes(userID)){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.currentlyBlocked,false,false,false,false);
            return;
        }else{
            // Add user to command block list to prevent double spend while command running
            check.check_add_blocklist(userID);
        }

        // Use items
        switch(partTwo) {
            case "box":

                    /* -------------------- */
                    // If the box is from free claim credit one box
                    if(claim){
                        userBoxes = Big(userBoxes).plus(1);
                    }
                    /* -------------------- */

                    var box = config.messages.use.box+' '+config.use.chatIcons.box+' '+config.messages.use.box1+'\n';
                    // Check if the user has boxes
                    if(Big(userBoxes).lt(1)){
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.use.empty,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    } 
                    // Calculate new item value
                    var newItemValue = new Big(userBoxes).minus(1);
                    // Remove item from user
                    var writeNewValue= await storage.storage_write_local_storage(userID,'games.cryptobreedables.items.boxes',newItemValue); 
                    // If not possible to write new health
                    if(!writeNewValue){ 
                        // If fail to write new health
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }
                    //////////
                    // EXP
                    //////////
                    var checkTriggerExp = check.check_chance_bool(config.use.box.exp.chance);
                    if(checkTriggerExp){
                        var creditExp = check.check_random_from_to(config.use.box.exp.min,config.use.box.exp.max);
                        var newExp = new Big(userExp).plus(creditExp);
                        // Write new exp
                        var writeNewExp = await storage.storage_write_local_storage(userID,'games.cryptobreedables.exp',newExp); 
                        // If not possible to write new exp
                        if(!writeNewExp){ 
                            // If fail to write new exp
                            chat.chat_reply(msg,'embed','<@'+userID+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                            return;
                        }
                        box += config.messages.use.won+' '+config.use.chatIcons.levelUp+' `'+creditExp+'` '+config.messages.use.exp+config.messages.use.end+'\n';
                    }
                    //////////
                    // Life
                    //////////
                    var checkTriggerLife = check.check_chance_bool(config.use.box.life.chance);
                    if(checkTriggerLife){
                        var creditLife = check.check_random_from_to(config.use.box.life.min,config.use.box.life.max);
                        var newLife = new Big(userHealth).plus(creditLife);
                        // Check if bigger as max life and set max
                        if(Big(newLife).gt(userRezHealth)){
                            newLife = userRezHealth;
                        }
                        // Write new life
                        var writeNewLife = await storage.storage_write_local_storage(userID,'games.cryptobreedables.health',newLife);
                        // If not possible to write new life
                        if(!writeNewLife){ 
                            // If fail to write new life
                            chat.chat_reply(msg,'embed','<@'+userID+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                            return;
                        }
                        box += config.messages.use.won+' '+config.use.chatIcons.fullHeart+' `'+creditLife+'` '+config.messages.use.life+config.messages.use.end+'\n';
                    }
                    //////////
                    // Protection
                    //////////
                    var checkTriggerProtection = check.check_chance_bool(config.use.box.protection.chance);
                    if(checkTriggerProtection){
                        var creditProtection = check.check_random_from_to(config.use.box.protection.min,config.use.box.protection.max);
                        var newProtection = new Big(userDivineShieldHealth).plus(creditProtection);
                        // Check if bigger as max protection and set max
                        if(Big(newProtection).gt(config.items.divineShield.totalHealth)){
                            newProtection = config.items.divineShield.totalHealth;
                        }
                        // Write new life
                        var writeNewProtection = await storage.storage_write_local_storage(userID,'games.cryptobreedables.items.divineShield.health',newProtection); 
                        // If not possible to write new life
                        if(!writeNewProtection){ 
                            // If fail to write new life
                            chat.chat_reply(msg,'embed','<@'+userID+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                            return;
                        }
                        // FIX: If 0 shields also add a new shield so the protection can get used 
                        if(userDivineShields <= 0){
                            // Write new divineshield
                            var writeNewDivineShields = await storage.storage_write_local_storage(userID,'games.cryptobreedables.items.divineShield.count',1); 
                            // If not possible to write new life
                            if(!writeNewDivineShields){
                                // If fail to write new life
                                chat.chat_reply(msg,'embed','<@'+userID+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                                return;
                            }
                        }
                        box += config.messages.use.won+' '+config.use.chatIcons.divineShield+' `'+creditProtection+'` '+config.messages.use.protection+config.messages.use.end+'\n';
                    }
                    //////////
                    // Divine shield
                    //////////
                    var maxDivineShields = "";
                    var checkTriggerDivineShield = check.check_chance_bool(config.use.box.divineshield.chance);
                    if(checkTriggerDivineShield){
                        var newDivineShields = new Big(userDivineShields).plus(1);
                        // Check if bigger as max protection and set max
                        if(Big(newDivineShields).gt(config.items.divineShield.maxItems)){
                            maxDivineShields = config.messages.use.maxdivineShields;
                        }else{
                            // Write new divineshield
                            var writeNewDivineShields = await storage.storage_write_local_storage(userID,'games.cryptobreedables.items.divineShield.count',newDivineShields); 
                            // If not possible to write new life
                            if(!writeNewDivineShields){ 
                                // If fail to write new life
                                chat.chat_reply(msg,'embed','<@'+userID+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                                return;
                            }
                            // Write new divineshield protection if all was killed
                            if(userDivineShields <= 0){
                                var writeNewDivineShieldHealth = await storage.storage_write_local_storage(userID,'games.cryptobreedables.items.divineShield.health',100); 
                                // If not possible to write new life
                                if(!writeNewDivineShieldHealth){ 
                                    // If fail to write new life
                                    chat.chat_reply(msg,'embed','<@'+userID+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                                    return;
                                }
                            }
                        }
                        box += config.messages.use.won+' '+config.use.chatIcons.divineShield+' `1` '+config.messages.use.divineShield+config.messages.use.end+' '+maxDivineShields+'\n';
                    }
                    //////////
                    // Life increase potion
                    //////////
                    var checkTriggerLifeIncreasePotion = check.check_chance_bool(config.use.box.lifeincreasepotion.chance);
                    if(checkTriggerLifeIncreasePotion){
                        var newLifeIncreasePotions = new Big(userLifeIncreasePotions).plus(1);
                        // Write new life
                        var writeNewLifeIncreasePotions = await storage.storage_write_local_storage(userID,'games.cryptobreedables.items.lifeIncreasePotions',newLifeIncreasePotions); 
                        // If not possible to write new life
                        if(!writeNewLifeIncreasePotions){ 
                            // If fail to write new life
                            chat.chat_reply(msg,'embed','<@'+userID+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                            return;
                        }
                        box += config.messages.use.won+' '+config.use.chatIcons.lifeIncreasePotion+' `1` '+config.messages.use.lifeIncreasePotion+config.messages.use.end+'\n';
                    }
                    //////////
                    // Heal potion
                    //////////
                    var maxHealPotions = "";
                    var checkTriggerHealPotion = check.check_chance_bool(config.use.box.healpotion.chance);
                    if(checkTriggerHealPotion){
                        var newHealPotions = new Big(userHealPotions).plus(1);
                        // Check if bigger as max protection and set max
                        if(Big(newHealPotions).gt(config.items.healPotion.maxItems)){
                            maxHealPotions = config.messages.use.maxhealPotions;
                        }else{
                            var writeNewHealPotions = await storage.storage_write_local_storage(userID,'games.cryptobreedables.items.healPotions',newHealPotions); 
                            // If not possible to write new life
                            if(!writeNewHealPotions){ 
                                // If fail to write new life
                                chat.chat_reply(msg,'embed','<@'+userID+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                                return;
                            }
                        }
                        box += config.messages.use.won+' '+config.use.chatIcons.healPotion+' `1` '+config.messages.use.healPotion+config.messages.use.end+' '+maxHealPotions+'\n';
                    }
                    //////////
                    // Box
                    //////////
                    var checkTriggerBox = check.check_chance_bool(config.use.box.box.chance);
                    if(checkTriggerBox){
                        var newBoxes = new Big(userBoxes);
                        // Write new life
                        var writeNewBoxes = await storage.storage_write_local_storage(userID,'games.cryptobreedables.items.boxes',newBoxes); 
                        // If not possible to write new life
                        if(!writeNewBoxes){ 
                            // If fail to write new life
                            chat.chat_reply(msg,'embed','<@'+userID+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                            return;
                        }
                        box += config.messages.use.won+' '+config.use.chatIcons.box+' `1` '+config.messages.use.box3+config.messages.use.end+'\n';
                    }
                    //////////
                    // Coins
                    //////////
                    var coinsCredited = 1;
                    var coinsTransactionSaved = 1;
                    var failedToCreditMessage = "";
                    var checkTriggerCoins = check.check_chance_bool(config.use.box.coins.chance);
                    if(checkTriggerCoins){
                        var creditCoins = check.check_random_from_to_floating(config.use.box.coins.min,config.use.box.coins.max,config.use.box.coins.floating);
                        // Credit balance to user
                        var creditResult = await user.user_add_balance(Big(creditCoins).toString(),userID);
                        if(!creditResult){
                            // Remove user from command block list to allow to fire new commands
                            check.check_remove_blocklist(userID); 
                            chat.chat_reply(msg,'embed','<@'+userID+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                            coinsCredited = 0; 
                        }
                        // Write to payment table received
                        var saveTipReceived = await transaction.transaction_save_payment_to_db(Big(creditCoins).toString(),config.bot.botID,userID,config.messages.payment.game.received);
                        if(!saveTipReceived){
                            // Remove user from command block list to allow to fire new commands
                            check.check_remove_blocklist(userID); 
                            chat.chat_reply(msg,'embed','<@'+userID+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                            coinsTransactionSaved = 0;
                        }
                        // If credit failed or save of transaction history to db failed
                        if(coinsCredited == 0 || coinsTransactionSaved == 0){
                            failedToCreditMessage += config.messages.walletFailed;
                        }
                        box += config.messages.use.won+' '+config.use.chatIcons.coins+' `'+creditCoins+'` '+config.bot.coinName+' ('+config.bot.coinSymbol+")"+config.messages.use.end+' '+failedToCreditMessage+'\n';
                    }
                    //////////
                    // Jackpot
                    //////////
                    var jackpotCredited = 1;
                    var jackpotTransactionSaved = 1;
                    var failedToCreditJackpotMessage = "";
                    var checkTriggerJackpot = check.check_chance_bool(config.use.box.jackpot.chance);
                    if(checkTriggerJackpot){
                        var jackpotPercentage = check.check_random_from_to(config.use.box.jackpot.min,config.use.box.jackpot.max);
                        // Get jackpot data
                        var getJackpotData = await storage.storage_read_jackpot();
                        if(getJackpotData){
                            var currentJackpotValue = getJackpotData.value;
                            // Remove rain value from jackpot
                            var jockpotWinValue = new Big(currentJackpotValue).div(100).times(jackpotPercentage).toFixed(8);
                            var newJackpotValue = new Big(currentJackpotValue).minus(jockpotWinValue).toFixed(8);
                            var saveNewJackpotValue = await storage.storage_write_jackpot('value',newJackpotValue); 
                            var saveLastJackpotWinner = await storage.storage_write_jackpot('lastWinner',userID); 
                            var saveLastJackpotWinValue = await storage.storage_write_jackpot('lastWinnerValue',jockpotWinValue); 
                            if(!saveNewJackpotValue || !saveLastJackpotWinner || !saveLastJackpotWinValue){ 
                                // Remove user from command block list to allow to fire new commands
                                check.check_remove_blocklist(userID); 
                                chat.chat_reply(msg,'embed','<@'+userID+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                                return;
                            }
                            // Credit balance to user
                            var creditResult = await user.user_add_balance(Big(jockpotWinValue).toString(),userID);
                            if(!creditResult){
                                // Remove user from command block list to allow to fire new commands
                                check.check_remove_blocklist(userID); 
                                chat.chat_reply(msg,'embed','<@'+userID+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                                jackpotCredited = 0; 
                            }
                            // Write to payment table received
                            var saveTipReceived = await transaction.transaction_save_payment_to_db(Big(jockpotWinValue).toString(),config.bot.botID,userID,config.messages.payment.game.received);
                            if(!saveTipReceived){
                                // Remove user from command block list to allow to fire new commands
                                check.check_remove_blocklist(userID); 
                                chat.chat_reply(msg,'embed','<@'+userID+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                                jackpotTransactionSaved = 0;
                            }
                            // If credit failed or save of transaction history to db failed
                            if(jackpotCredited == 0 || jackpotTransactionSaved == 0){
                                failedToCreditJackpotMessage += config.messages.walletFailed;
                            }
                            box += config.use.chatIcons.jackpot+' '+config.messages.use.jackpot+' '+config.messages.use.won+' `'+jackpotPercentage+'`'+config.messages.use.jackpot1+' '+config.use.chatIcons.coins+' `'+jockpotWinValue+'` '+config.bot.coinName+' ('+config.bot.coinSymbol+")"+config.messages.use.end+' '+failedToCreditJackpotMessage+'\n';
                        }
                    }
                    //////////
                    chat.chat_reply(msg,'normal',userName,messageType,false,false,false,false,box,false,false,false,false);
                    log.log_write_game(config.messages.use.log.action,config.messages.use.log.user+' '+userName+' - '+box);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(userID);
                return;
            case "lifeincreasepotion":
                    // Check if the user has enough health potions
                    if(Big(userLifeIncreasePotions).lt(1)){
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.use.empty,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    } 
                    // Calculate new item value
                    var newItemValue = new Big(userLifeIncreasePotions).minus(1);
                    // Remove item from user
                    var writeNewValue= await storage.storage_write_local_storage(userID,'games.cryptobreedables.items.lifeIncreasePotions',newItemValue); 
                    // If not possible to write new health
                    if(!writeNewValue){ 
                        // If fail to write new health
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }
                    // Credit user with item
                    var creditLife = check.check_random_from_to(config.use.lifeincreasepotion.min,config.use.lifeincreasepotion.max);
                    var newLife = new Big(userRezHealth).plus(creditLife);
                    // Save new user health
                    var writeNewValue= await storage.storage_write_local_storage(userID,'games.cryptobreedables.rezHealth',newLife); 
                    // If not possible to write new health
                    if(!writeNewValue){ 
                        // If fail to write new health
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }
                    // Success message
                    chat.chat_reply(msg,'normal',userName,messageType,false,false,false,false,config.messages.use.lifeIncreasePotions+' '+config.use.chatIcons.lifeIncreasePotion+' '+config.messages.use.lifeIncreasePotions1+' '+config.messages.use.lifeIncreasePotions2+' '+config.use.chatIcons.fullHeart+' '+config.messages.use.lifeIncreasePotions3+' `'+creditLife+'` '+config.messages.use.lifeIncreasePotions4,false,false,false,false);
                    log.log_write_game(config.messages.use.log.action,config.messages.use.log.user+' '+userName+' - '+config.messages.use.lifeIncreasePotions+' '+config.use.chatIcons.lifeIncreasePotion+' '+config.messages.use.lifeIncreasePotions1+' '+config.messages.use.lifeIncreasePotions2+' '+config.use.chatIcons.fullHeart+' '+config.messages.use.lifeIncreasePotions3+' `'+creditLife+'` '+config.messages.use.lifeIncreasePotions4);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(userID);
                return;
            case "healpotion":
                    // Check if the user has enough health potions
                    if(Big(userHealPotions).lt(1)){
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.use.empty,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    } 
                    // Calculate new item value
                    var newItemValue = new Big(userHealPotions).minus(1);
                    // Remove item from user
                    var writeNewValue= await storage.storage_write_local_storage(userID,'games.cryptobreedables.items.healPotions',newItemValue); 
                    // If not possible to write new health
                    if(!writeNewValue){ 
                        // If fail to write new health
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }
                    // Credit user with item
                    var creditLife = check.check_random_from_to(config.use.healpotion.min,config.use.healpotion.max);
                    var newLife = new Big(userHealth).plus(creditLife);
                    // Check if life is bigger rezHeal
                    if(Big(newLife).gt(userRezHealth)){
                        newLife = userRezHealth;
                    }
                    // Save new user health
                    var writeNewValue= await storage.storage_write_local_storage(userID,'games.cryptobreedables.health',newLife); 
                    // If not possible to write new health
                    if(!writeNewValue){ 
                        // If fail to write new health
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }
                    // Success message
                    chat.chat_reply(msg,'normal',userName,messageType,false,false,false,false,config.messages.use.healPotions+' '+config.use.chatIcons.healPotion+' '+config.messages.use.healPotions1+' '+config.messages.use.healPotions2+' '+config.use.chatIcons.fullHeart+' '+config.messages.use.healPotions3+' `'+creditLife+'` '+config.messages.use.healPotions4,false,false,false,false);
                    log.log_write_game(config.messages.use.log.action,config.messages.use.log.user+' '+userName+' - '+config.messages.use.healPotions+' '+config.use.chatIcons.healPotion+' '+config.messages.use.healPotions1+' '+config.messages.use.healPotions2+' '+config.use.chatIcons.fullHeart+' '+config.messages.use.healPotions3+' `'+creditLife+'` '+config.messages.use.healPotions4);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(userID);
                return;
            case "egg":
                // Check if the user has enough eggs
                if(Big(userEggs).lt(1)){
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.use.empty,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(userID);
                    return;
                } 
                // Calculate new item value
                var newItemValue = new Big(userEggs).minus(1);
                // Remove item from user
                var writeNewValue= await storage.storage_write_local_storage(userID,'games.cryptobreedables.items.eggs',newItemValue); 
                // If not possible to write new health
                if(!writeNewValue){ 
                    // If fail to write new health
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(userID);
                    return;
                }
                // Get random pet type from config pet array
                var randomPet = check.check_getRandomFromArray(config.use.egg.possiblePets,1);
                var newPet = await cryptobreedables.pet_create_item_random_characteristics(randomPet[0]); // Get random pet from array and create pet values
                if(!newPet){
                    // If fail to create new pet
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(userID);
                    return;
                }
                // Check if current pet type array exists on array. If yes add a new pet to it, else create first active petID and pet
                var petID = 'cb'+check.check_get_random_string(10); // Create pet new id
                // Check if object contains id and create new ones until its unique
                while(userAttackItems.hasOwnProperty(petID)){
                    petID = 'cb'+check.check_get_random_string(10);
                }
                // Write active id if pet type does not exists yet
                if(!userAttackItems.hasOwnProperty(randomPet[0])){
                
                    var writeNewPetIndex = await storage.storage_write_local_storage(userID,'games.cryptobreedables.attackItems.'+randomPet[0]+'.activeID',petID);
                    // If not possible to write new index
                    if(!writeNewPetIndex){ 
                        // If fail to write new pet
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(userID);
                        return;
                    }
                }
                // Write new pet
                var writeNewPet = await storage.storage_write_local_storage(userID,'games.cryptobreedables.attackItems.'+randomPet[0]+'.'+petID,newPet);
                // If not possible to write new pet
                if(!writeNewPet){ 
                    // If fail to write new pet
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(userID);
                    return;
                }
                // Get pet image hash for image display
                var petImageHash = await cryptobreedables.pet_get_image_hash(randomPet[0],newPet);
                // If not possible to get pet image hash
                if(!petImageHash){ 
                    // If fail to write new pet
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(userID);
                    return;
                }
                // Check if json error response true
                if(petImageHash.error){
                    // If error and no pet image hash
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(userID);
                    return;
                }
                // Create pet characteristics array for return
                var petCharacteristics = [];
                for (const [key, value] of Object.entries(newPet)) {
                    outputValue = value;
                    if(key == 'color'){
                        outputValue = cryptobreedables.pet_create_rgb_percent_colour(value.split(','),'string');
                    }
                    if(key == 'shine'){
                        outputValue = value*100+'%';
                    }
                    if(key == 'glow'){
                        outputValue = value*100+'%';
                    }
                    petCharacteristics.push([key.toUpperCase(),outputValue,true]);
                }
                // Return success message
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.use.eggstitle+' ('+randomPet[0]+')',petCharacteristics,config.messages.use.eggs,false,false,config.bot.websiteImgLink+petImageHash.hash+'.png',false);
                log.log_write_game(config.messages.use.log.action,config.messages.use.log.user+' '+userName+' - '+config.messages.use.eggs+' '+JSON.stringify(newPet));    
                // Remove user from command block list to allow to fire new commands
                check.check_remove_blocklist(userID);
                return;
            default:
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,false,false,config.messages.notValidCommand,false,false,false,false);
                // Remove user from command block list to allow to fire new commands
                check.check_remove_blocklist(userID);
                return;
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Fire commands - Role value 0 = normal user, 1 = vip user, 2 = moderator, 3 = admin
    /* ------------------------------------------------------------------------------ */

    fire_command: function(msg,userID,userName,messageType,userRole,partOne,partTwo,partThree,partFour,partFive,serverUser){
        switch(partOne) {
            case "activate":
                if(config.commands.activate){
                    this.command_activate(userID,userName,messageType,userRole,msg,partTwo,partThree);
                }
                return;
            case "battle":
                if(config.commands.battle){
                    this.command_battle(1,userID,userName,messageType,userRole,msg,partTwo);
                }
                return;
            case 'cversion':
                if(config.commands.version){
                    this.command_cversion(userID,userName,messageType,msg);
                }
                return;
            case 'claim':
                if(config.commands.claim){
                    this.command_claim(userID,userName,messageType,userRole,msg);
                }
                return;
            case "destroy":
                if(config.commands.destroy){
                    this.command_destroy(1,userID,userName,messageType,userRole,msg);
                }
                return;
            case "gift":
                if(config.commands.gift){
                    this.command_gift(userID,userName,messageType,userRole,msg,partTwo,partThree,partFour);
                }
                return;
            case "h":
            case 'help':
                if(config.commands.help){
                    this.command_help(userID,userName,messageType,userRole,msg);
                }
                return;
            case 'jackpot':
                if(config.commands.jackpot){
                    this.command_jackpot(userID,userName,messageType,userRole,msg);
                }
                return;
            case 'kill':
                if(config.commands.kill){
                    this.command_kill(userID,userName,messageType,userRole,msg);
                }
                return;
            case "lock":
                if(config.commands.lock){
                    this.command_lock(userID,userName,messageType,userRole,msg,partTwo,partThree,partFour);
                }
                return;
            case 'me':
                if(config.commands.me){
                    this.command_me(userID,userName,messageType,msg);
                }
                return;
            case 'mention':
                if(config.commands.mention){
                    this.command_mention(userID,userName,messageType,msg,partTwo);
                }
                return;
            case 'rez':
                if(config.commands.rez){
                    this.command_rez(userID,userName,messageType,msg);
                }
                return;
            case 'shop':
                if(config.commands.shop){
                    this.command_shop(1,userID,userName,messageType,userRole,msg,partTwo);
                }
                return;
            case 'summary':
                if(config.commands.summary){
                    this.command_summary(userID,userName,messageType,userRole,msg,partTwo);
                }
                return;
            case 'top':
                if(config.commands.top){
                    this.command_top(userID,userName,messageType,msg);
                }
                return;
            case 'use':
                if(config.commands.use){
                    this.command_use(userID,userName,messageType,userRole,msg,partTwo);
                }
                return;
            default:
                return chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,false,false,config.messages.notValidCommand,false,false,false,false);
        }
    }

};