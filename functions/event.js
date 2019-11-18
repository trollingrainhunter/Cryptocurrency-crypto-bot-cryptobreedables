try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

const { RichEmbed } = require('discord.js');
var check = require("./check.js");
var cryptobreedables = require("./cryptobreedables.js");
var chat = require("./chat.js");
var log = require("./log.js");
var storage = require("./storage.js");
var transaction = require("./transaction.js");
var user = require("./user.js");

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

const Big = require('big.js'); // https://github.com/MikeMcl/big.js -> http://mikemcl.github.io/big.js/

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // Build event for message
    /* ------------------------------------------------------------------------------ */

    event_battle_build: function(eventCollectorMessage,userID,userName,messageType,userRole,msg){ 
    // Create collector filter
        const reactFilter = (reaction, user) => {
            // Get id from current requester
            var collectUser = user.id;
            // If the user that clicked the icon is not a bot user
            // If the icon is in the event icon list
            // If battleCurrentLifePoints > 0 - If bot is already dead dont allow more attacks to be sure the last user killed the monster
            if(collectUser != eventCollectorMessage.author.id && config.battle.attackIcons.hasOwnProperty(reaction.emoji.name) && battleCurrentLifePoints > 0){ 
                // Save users that collected to array if array does not already contain the user id (this round already attacked)
                if(eventCurrentUsers.indexOf(collectUser) === -1){
                    eventCurrentUsers.push(collectUser);
                    return true;
                }
            }else{
                return false;
            }
        };
        // Create collector
        const reactCollector = eventCollectorMessage.createReactionCollector(reactFilter, { time: battleRoundTime*1000 });
        // Save collector to global eventCollector
        eventCollector = reactCollector;
        reactCollector.on('collect', (reaction, reactionCollector) => {
            // Check icon used and attck monster by userid and mg
            var reactIcon = reaction.emoji.name; 
            var reactUser = eventCurrentUsers[eventCurrentUsers.length - 1];
            // Do stuff for current clicked emoji
            this.event_battle_items(reactIcon,reactUser,eventCollectorMessage,userID,userName,messageType,userRole,msg);
            //console.log('Icon: ' + reactIcon + ' User: ' + reactUser);
        });
        
        reactCollector.on('end', collected => {
            // Only do if event active
            if(eventActive){
                // Do rain here for all users that entered 
                this.event_rain(eventCurrentUsers,msg,messageType,userID,userName,userRole);

                //////////////////////////////////////////////////////////////////////////////////////////
                // Credit user who killed the monster
                if(battleCurrentLifePoints <= 0){
                    this.event_credit_kill_user(messageType,msg);
                }
            }
            
        });
        // Set icons to current global eventCollectorMessage
        Object.keys(config.battle.attackIcons).forEach(function(k){
            //console.log(k + ' - ' + config.battle.attackIcons[k]);
            eventCollectorMessage.react(config.battle.attackIcons[k]);
        });
        
    },

    event_shop_build: function(eventCollectorMessage,userID,userName,messageType,userRole,msg,partTwo){ 
        // Create collector filter
        const reactFilter = (reaction, user) => {
            // Get id from current requester
            var collectUser = user.id;
            // If the user that clicked the icon is not a bot user
            // If the icon is in the event icon list
            if(collectUser != eventCollectorMessage.author.id && shopIcons.hasOwnProperty(reaction.emoji.name)){ 
                // Save users that collected to array if array does not already contain the user id (this round already used the shop)
                if(eventCurrentUsers.indexOf(collectUser) === -1){
                    eventCurrentUsers.push(collectUser);
                    return true;
                }
            }else{
                return false;
            }
        };
        // Create collector
        const reactCollector = eventCollectorMessage.createReactionCollector(reactFilter, { time: shopRoundTime*1000 });
        // Save collector to global eventCollector
        eventCollector = reactCollector;
        reactCollector.on('collect', (reaction, reactionCollector) => {
            // Check icon used and attck monster by userid and mg
            var reactIcon = reaction.emoji.name; 
            var reactUser = eventCurrentUsers[eventCurrentUsers.length - 1];
            // Do stuff for current clicked emoji
            this.event_shop_items(reactIcon,reactUser,eventCollectorMessage,userID,userName,messageType,userRole,msg,partTwo);
            //console.log('Icon: ' + reactIcon + ' User: ' + reactUser);
        });
        
        reactCollector.on('end', collected => {
            // Only do if event active
            if(eventActive){
                // Stop active event
                this.event_destroy(0,eventCollector);
                // Update current round
                eventCurrentRound++;
                // Start next round if its not bigger as max allowed round
                //////////////
                if(eventCurrentRound <= shopEndRound) { 
                    command.command_shop(0,userID,userName,messageType,userRole,msg,partTwo);
                }else{
                    eventCurrentUsers = [];
                    chat.chat_reply(msg,'normal',false,messageType,false,false,false,false,config.messages.shop.closed,false,false,false,false);
                }
            }
        });
        // Set icons to current global eventCollectorMessage
        Object.keys(shopIcons).forEach(function(k){
            //console.log(k + ' - ' + config.shop.shopIcons[k]);
            eventCollectorMessage.react(shopIcons[k]);
        });
    },

    event_update_message: function(eventCollectorMessage,userID,userName,messageType,userRole,msg){
        // Caluclate life display from global vars
        battleCurrentLifeDisplay = '';
        this.event_life_display(battleCurrentLifePoints); 
        // Edit current round and update lifepoints
        try {
            chat.chat_edit_message(eventCollectorMessage,chat.chat_build_reply('embed',false,messageType,config.colors.special,false,config.messages.battle.title+' '+battleCurrentLifeDisplay,[[config.messages.battle.lifePoints,'```'+battleCurrentLifePoints+'```',true],[config.messages.battle.round,'```'+eventCurrentRound+'/'+config.battle.endRound+'```',true]],config.messages.battle.description,false,false,battleMonsterImage,false));
        }catch(error){
        }
    },

    event_life_display: function(lifePoints){
        var full_hearts = 0;
        var half_heart = 0;
        var empty_hearts = 0;
        var battleCurrentLifePointsPercentage = battleCurrentLifePoints/battleStartLifePoints*100;
        full_hearts = battleCurrentLifePointsPercentage/10;
        if (full_hearts !== ~~full_hearts)
        {
            full_hearts = ~~full_hearts;
                half_heart = 1;
        }
        if (battleCurrentLifePoints <= 0){
            full_hearts = 0;
            half_heart = 0;
        }
        empty_hearts = 10 - full_hearts - half_heart; 
        /*
        log.log_write_console('percentage:' + battleCurrentLifePointsPercentage);
        log.log_write_console('full_hearts:' + full_hearts);
        log.log_write_console('half_heart:' + half_heart);
        log.log_write_console('empty_hearts:' + empty_hearts);
        */
        for (i = 0; i < full_hearts; i++)
            battleCurrentLifeDisplay += config.battle.lifeIcons.fullHeart;

        if (half_heart) 
            battleCurrentLifeDisplay += config.battle.lifeIcons.halfHeart;

        for (i = 0; i < empty_hearts; i++) 
            battleCurrentLifeDisplay += config.battle.lifeIcons.emptyHeart;
    },

    event_destroy: function(manuallyFired,event){
        eventActive = false;
        try {
            event.stop();
            if(manuallyFired){
                log.log_write_game(config.messages.destroy.log.action,config.messages.destroy.log.content);
            }
        }catch(error){
            log.log_write_console('failed to stop event');
            return;
        }
        eventCollector = false;
        if(eventName != 'shop')
            eventCurrentUsers = [];
    },

    event_shop_items: async function(reactIcon,reactUser,eventCollectorMessage,userID,userName,messageType,userRole,msg,partTwo){
        //console.log(reactIcon+' '+reactUser+' '+userID+' '+userName);
        //////////////////////////////////////////////////////////////////////////////////////////
        // Get user data from local storage and config
        
        // Get user data
        var getUserData = await this.event_get_user_data(reactUser,messageType,msg);

        // User divineShield
        var divineShieldCount = getUserData.items.divineShield.count;
        if(divineShieldCount === undefined)
            return;

        // User boxes
        var boxCount = getUserData.items.boxes;
        if(boxCount === undefined)
            return;

        // User eggs
        var eggCount = getUserData.items.eggs;
        if(eggCount === undefined)
            return;

        // User lifeIncreasePotion
        var lifeIncreasePotionCount = getUserData.items.lifeIncreasePotions;
        if(lifeIncreasePotionCount === undefined)
            return;
        
        // User healPotion
        var healPotionCount = getUserData.items.healPotions;
        if(healPotionCount === undefined)
            return;
        
        // User attack items
        var userAttackItems = getUserData.attackItems;
        if(userAttackItems === undefined)
            return;

        // Check if user is currently blocked to use this command
        if(commandBlockedUsers.includes(reactUser)){
            chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.currentlyBlocked,false,false,false,false);
            return;
        }else{
            // Add user to command block list to prevent double spend while command running
            check.check_add_blocklist(reactUser);
        }
        
        // Get user balance
        var userBalance = await user.user_get_balance(reactUser);

        try {
            userBalance = Big(userBalance.balance).toString();
        }
        catch (e) {
            userBalance = false;
        }

        switch (reactIcon) {
            case 'box':
                // Automated prices if enabled and global coincentprice not false
                var itemCosts = config.shop.shopCosts.box;
                if(config.shop.shopCosts.realPrices.enabled && coinCentPrice > 0){
                    itemCosts = Big(config.shop.shopCosts.box).times(coinCentPrice).toFixed(8);
                }
                // Check if possible to grab user balance and check if he has enough to buy the item
                if(!userBalance || Big(userBalance).lt(itemCosts)){
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.shop.error.title,false,config.messages.shop.error.message,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;
                }
                // Substract balance from user
                var balanceSubstract = await user.user_substract_balance(itemCosts,reactUser);
                if(!balanceSubstract){
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;  
                }
                // Save Payment to user transaction table
                var savePaymentDone= await transaction.transaction_save_payment_to_db(itemCosts,reactUser,config.bot.botID,config.messages.payment.game.paid);
                if(!savePaymentDone){     
                    chat.chat_reply(msg,'embed',' <@'+reactUser+'> ',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;  
                } 
                // Credit user with item/s
                var newCreditItemValue = new Big(boxCount).plus(1);
                var creditNewValue = await storage.storage_write_local_storage(reactUser,'games.cryptobreedables.items.boxes',newCreditItemValue); 
                // If not possible to write new health
                if(!creditNewValue){ 
                    // If fail to write new health
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;
                }
                var rainMessage = "";
                // Add rain value for users to jackpot if enabled
                if(config.shop.jackpot.enabled){
                    ///////////////////////////////////////////
                    // Get jackpot data
                    var getJackpotData = await storage.storage_read_jackpot();
                    if(getJackpotData){
                        var currentJackpotValue = getJackpotData.value;
                        // Add rain value to jackpot
                        var calculateValueToAdd =  new Big(itemCosts).div(100).times(config.shop.jackpot.percentage);
                        var newJackpotValue = new Big(currentJackpotValue).plus(calculateValueToAdd).toFixed(8);
                        var creditNewJackpotValue = await storage.storage_write_jackpot('value',newJackpotValue); 
                        var rainMessage = config.shop.chatIcons.jackpot+" "+config.messages.shop.jackpot.success+" "+config.shop.chatIcons.coins+" `"+new Big(calculateValueToAdd).toFixed(8)+"` "+config.bot.coinName+' ('+config.bot.coinSymbol+") "+config.messages.shop.jackpot.success1+" "+config.messages.shop.jackpot.success2+" "+config.shop.chatIcons.coins+" `"+newJackpotValue+"` "+config.bot.coinName+' ('+config.bot.coinSymbol+") "+config.messages.shop.jackpot.success3;
                        // If not possible to write new health
                        if(!creditNewJackpotValue){ 
                            // Failed to credit rain to jackpot
                        }
                    }
                }
                // Log purchase to game log
                log.log_write_game(config.messages.shop.log.action,config.messages.shop.log.user+' <@'+reactUser+'> - '+config.messages.shop.success+' 1 '+config.messages.shop[partTwo].shopItems[reactIcon]+config.messages.shop.end+' '+rainMessage);
                // Check if real price enabled
                var realPriceText = "";
                if(config.shop.shopCosts.realPrices.enabled && coinCentPrice > 0){
                    realPriceText =  " ("+Big(config.shop.shopCosts.box).div(100).toFixed(2)+' '+coinCurrency+")";
                }
                // Success message for user
                chat.chat_reply(msg,'normal','<@'+reactUser+'>',messageType,false,false,false,false,' '+config.messages.shop.success+' `1` `'+config.messages.shop[partTwo].shopItems[reactIcon]+'` '+config.messages.shop.success2+' '+config.battle.chatIcons.coins+' `'+Big(itemCosts).toFixed(8)+'` '+config.bot.coinName+' ('+config.bot.coinSymbol+")"+realPriceText+config.messages.shop.end+' '+rainMessage,false,false,false,false);
                // Remove user from command block list to allow to fire new commands
                check.check_remove_blocklist(reactUser);
                return;
            case 'potion_red':
                // Automated prices if enabled and global coincentprice not false
                var itemCosts = config.shop.shopCosts.potion_red;
                if(config.shop.shopCosts.realPrices.enabled && coinCentPrice > 0){
                    itemCosts = Big(config.shop.shopCosts.potion_red).times(coinCentPrice).toFixed(8);
                }
                // Check if possible to grab user balance and check if he has enough to buy the item
                if(!userBalance || Big(userBalance).lt(itemCosts)){
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.shop.error.title,false,config.messages.shop.error.message,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;
                }
                // Substract balance from user
                var balanceSubstract = await user.user_substract_balance(itemCosts,reactUser);
                if(!balanceSubstract){
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;  
                }
                // Save Payment to user transaction table
                var savePaymentDone= await transaction.transaction_save_payment_to_db(itemCosts,reactUser,config.bot.botID,config.messages.payment.game.paid);
                if(!savePaymentDone){     
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;  
                } 
                // Credit user with item/s
                var newCreditItemValue = new Big(lifeIncreasePotionCount).plus(1);
                var creditNewValue = await storage.storage_write_local_storage(reactUser,'games.cryptobreedables.items.lifeIncreasePotions',newCreditItemValue); 
                // If not possible to write new health
                if(!creditNewValue){ 
                    // If fail to write new health
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;
                }
                // Log purchase to game log
                log.log_write_game(config.messages.shop.log.action,config.messages.shop.log.user+' <@'+reactUser+'> - '+config.messages.shop.success+' 1 '+config.messages.shop[partTwo].shopItems[reactIcon]+config.messages.shop.end);
                // Check if real price enabled
                var realPriceText = "";
                if(config.shop.shopCosts.realPrices.enabled && coinCentPrice > 0){
                    realPriceText =  " ("+Big(config.shop.shopCosts.potion_red).div(100).toFixed(2)+' '+coinCurrency+")";
                }
                // Success message for user
                chat.chat_reply(msg,'normal','<@'+reactUser+'>',messageType,false,false,false,false,' '+config.messages.shop.success+' `1` `'+config.messages.shop[partTwo].shopItems[reactIcon]+'` '+config.messages.shop.success2+' '+config.battle.chatIcons.coins+' `'+Big(itemCosts).toFixed(8)+'` '+config.bot.coinName+' ('+config.bot.coinSymbol+")"+realPriceText+config.messages.shop.end,false,false,false,false);
                // Remove user from command block list to allow to fire new commands
                check.check_remove_blocklist(reactUser);
                return;
            case 'potion_green':
                // Automated prices if enabled and global coincentprice not false
                var itemCosts = config.shop.shopCosts.potion_green;
                if(config.shop.shopCosts.realPrices.enabled && coinCentPrice > 0){
                    itemCosts = Big(config.shop.shopCosts.potion_green).times(coinCentPrice).toFixed(8);
                }
                // Check if possible to grab user balance and check if he has enough to buy the item
                if(!userBalance || Big(userBalance).lt(itemCosts)){
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.shop.error.title,false,config.messages.shop.error.message,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;
                }
                // Substract balance from user
                var balanceSubstract = await user.user_substract_balance(itemCosts,reactUser);
                if(!balanceSubstract){
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;  
                }
                // Save Payment to user transaction table
                var savePaymentDone= await transaction.transaction_save_payment_to_db(itemCosts,reactUser,config.bot.botID,config.messages.payment.game.paid);
                if(!savePaymentDone){     
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;  
                } 
                // Credit user with item/s
                var newCreditItemValue = new Big(healPotionCount).plus(1);
                var creditNewValue = await storage.storage_write_local_storage(reactUser,'games.cryptobreedables.items.healPotions',newCreditItemValue); 
                // If not possible to write new health
                if(!creditNewValue){ 
                    // If fail to write new health
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;
                }
                // Log purchase to game log
                log.log_write_game(config.messages.shop.log.action,config.messages.shop.log.user+' <@'+reactUser+'> - '+config.messages.shop.success+' 1 '+config.messages.shop[partTwo].shopItems[reactIcon]+config.messages.shop.end);
                // Check if real price enabled
                var realPriceText = "";
                if(config.shop.shopCosts.realPrices.enabled && coinCentPrice > 0){
                    realPriceText =  " ("+Big(config.shop.shopCosts.potion_green).div(100).toFixed(2)+' '+coinCurrency+")";
                }
                // Success message for user
                chat.chat_reply(msg,'normal','<@'+reactUser+'>',messageType,false,false,false,false,' '+config.messages.shop.success+' `1` `'+config.messages.shop[partTwo].shopItems[reactIcon]+'` '+config.messages.shop.success2+' '+config.battle.chatIcons.coins+' `'+Big(itemCosts).toFixed(8)+'` '+config.bot.coinName+' ('+config.bot.coinSymbol+")"+realPriceText+config.messages.shop.end,false,false,false,false);
                // Remove user from command block list to allow to fire new commands
                check.check_remove_blocklist(reactUser);
                return;
            case 'divineshield':
                // Automated prices if enabled and global coincentprice not false
                var itemCosts = config.shop.shopCosts.divineshield;
                if(config.shop.shopCosts.realPrices.enabled && coinCentPrice > 0){
                    itemCosts = Big(config.shop.shopCosts.divineshield).times(coinCentPrice).toFixed(8);
                }
                // Check if possible to grab user balance and check if he has enough to buy the item
                if(!userBalance || Big(userBalance).lt(itemCosts)){
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.shop.error.title,false,config.messages.shop.error.message,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;
                }
                // Substract balance from user
                var balanceSubstract = await user.user_substract_balance(itemCosts,reactUser);
                if(!balanceSubstract){
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;  
                }
                // Save Payment to user transaction table
                var savePaymentDone= await transaction.transaction_save_payment_to_db(itemCosts,reactUser,config.bot.botID,config.messages.payment.game.paid);
                if(!savePaymentDone){     
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;  
                } 
                // Credit user with item/s
                var newCreditItemValue = new Big(divineShieldCount).plus(1);
                var creditNewValue = await storage.storage_write_local_storage(reactUser,'games.cryptobreedables.items.divineShield.count',newCreditItemValue); 
                // If not possible to write new health
                if(!creditNewValue){ 
                    // If fail to write new health
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;
                }
                // If user divineshield count is empty also add shield health
                if(divineShieldCount <= 0){
                    var creditNewValue = await storage.storage_write_local_storage(reactUser,'games.cryptobreedables.items.divineShield.health',config.items.divineShield.totalHealth); 
                    // If not possible to write new health
                    if(!creditNewValue){ 
                    // If fail to write new health
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;
                    }
                }
                // Log purchase to game log
                log.log_write_game(config.messages.shop.log.action,config.messages.shop.log.user+' <@'+reactUser+'> - '+config.messages.shop.success+' 1 '+config.messages.shop[partTwo].shopItems[reactIcon]+config.messages.shop.end);
                // Check if real price enabled
                var realPriceText = "";
                if(config.shop.shopCosts.realPrices.enabled && coinCentPrice > 0){
                    realPriceText =  " ("+Big(config.shop.shopCosts.divineshield).div(100).toFixed(2)+' '+coinCurrency+")";
                }
                // Success message for user
                chat.chat_reply(msg,'normal','<@'+reactUser+'>',messageType,false,false,false,false,' '+config.messages.shop.success+' `1` `'+config.messages.shop[partTwo].shopItems[reactIcon]+'` '+config.messages.shop.success2+' '+config.battle.chatIcons.coins+' `'+Big(itemCosts).toFixed(8)+'` '+config.bot.coinName+' ('+config.bot.coinSymbol+")"+realPriceText+config.messages.shop.end,false,false,false,false);
                // Remove user from command block list to allow to fire new commands
                check.check_remove_blocklist(reactUser);
                return;
            case 'reddragon':
                // Automated prices if enabled and global coincentprice not false
                var itemCosts = config.shop.shopCosts.reddragon;
                if(config.shop.shopCosts.realPrices.enabled && coinCentPrice > 0){
                    itemCosts = Big(config.shop.shopCosts.reddragon).times(coinCentPrice).toFixed(8);
                }
                // Check if possible to grab user balance and check if he has enough to buy the item
                if(!userBalance || Big(userBalance).lt(itemCosts)){
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.shop.error.title,false,config.messages.shop.error.message,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;
                }
                // Substract balance from user
                var balanceSubstract = await user.user_substract_balance(itemCosts,reactUser);
                if(!balanceSubstract){
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;  
                }
                // Save Payment to user transaction table
                var savePaymentDone= await transaction.transaction_save_payment_to_db(itemCosts,reactUser,config.bot.botID,config.messages.payment.game.paid);
                if(!savePaymentDone){     
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;  
                } 
                // Create red dragon
                var newPet = await cryptobreedables.pet_create_item_random_characteristics(reactIcon); // Get random pet from array and create pet values
                if(!newPet){
                    // If fail to create new pet
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;  
                }
                // Check if current pet type array exists on array. If yes add a new pet to it, else create first active petID and pet
                var petID = 'cb'+check.check_get_random_string(10); // Create pet new id
                // Check if object contains id and create new ones until its unique
                while(userAttackItems.hasOwnProperty(petID)){
                    petID = 'cb'+check.check_get_random_string(10);
                }
                // Write active id if pet type does not exists yet
                if(!userAttackItems.hasOwnProperty(reactIcon)){
                
                    var writeNewPetIndex = await storage.storage_write_local_storage(reactUser,'games.cryptobreedables.attackItems.'+reactIcon+'.activeID',petID);
                    // If not possible to write new index
                    if(!writeNewPetIndex){ 
                        chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(reactUser);
                        return;  
                    }
                }
                // Write new pet
                var writeNewPet = await storage.storage_write_local_storage(reactUser,'games.cryptobreedables.attackItems.'+reactIcon+'.'+petID,newPet);
                // If not possible to write new pet
                if(!writeNewPet){ 
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;  
                }
                // Log purchase to game log
                log.log_write_game(config.messages.shop.log.action,config.messages.shop.log.user+' <@'+reactUser+'> - '+config.messages.shop.success+' 1 '+config.messages.shop[partTwo].shopItems[reactIcon]+config.messages.shop.end);
                // Check if real price enabled
                var realPriceText = "";
                if(config.shop.shopCosts.realPrices.enabled && coinCentPrice > 0){
                    realPriceText =  " ("+Big(config.shop.shopCosts.reddragon).div(100).toFixed(2)+' '+coinCurrency+")";
                }
                // Success message for user
                chat.chat_reply(msg,'normal','<@'+reactUser+'>',messageType,false,false,false,false,' '+config.messages.shop.success+' `1` `'+config.messages.shop[partTwo].shopItems[reactIcon]+'` '+config.messages.shop.success2+' '+config.battle.chatIcons.coins+' `'+Big(itemCosts).toFixed(8)+'` '+config.bot.coinName+' ('+config.bot.coinSymbol+")"+realPriceText+config.messages.shop.end,false,false,false,false);
                // Remove user from command block list to allow to fire new commands
                check.check_remove_blocklist(reactUser);
                return;
            case 'blackdragon':
                // Automated prices if enabled and global coincentprice not false
                var itemCosts = config.shop.shopCosts.blackdragon;
                if(config.shop.shopCosts.realPrices.enabled && coinCentPrice > 0){
                    itemCosts = Big(config.shop.shopCosts.blackdragon).times(coinCentPrice).toFixed(8);
                }
                // Check if possible to grab user balance and check if he has enough to buy the item
                if(!userBalance || Big(userBalance).lt(itemCosts)){
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.shop.error.title,false,config.messages.shop.error.message,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;
                }
                // Substract balance from user
                var balanceSubstract = await user.user_substract_balance(itemCosts,reactUser);
                if(!balanceSubstract){
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;  
                }
                // Save Payment to user transaction table
                var savePaymentDone= await transaction.transaction_save_payment_to_db(itemCosts,reactUser,config.bot.botID,config.messages.payment.game.paid);
                if(!savePaymentDone){     
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;  
                } 
                // Create red dragon
                var newPet = await cryptobreedables.pet_create_item_random_characteristics(reactIcon); // Get random pet from array and create pet values
                if(!newPet){
                    // If fail to create new pet
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;  
                }
                // Check if current pet type array exists on array. If yes add a new pet to it, else create first active petID and pet
                var petID = 'cb'+check.check_get_random_string(10); // Create pet new id
                // Check if object contains id and create new ones until its unique
                while(userAttackItems.hasOwnProperty(petID)){
                    petID = 'cb'+check.check_get_random_string(10);
                }
                // Write active id if pet type does not exists yet
                if(!userAttackItems.hasOwnProperty(reactIcon)){
                
                    var writeNewPetIndex = await storage.storage_write_local_storage(reactUser,'games.cryptobreedables.attackItems.'+reactIcon+'.activeID',petID);
                    // If not possible to write new index
                    if(!writeNewPetIndex){ 
                        chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                        // Remove user from command block list to allow to fire new commands
                        check.check_remove_blocklist(reactUser);
                        return;  
                    }
                }
                // Write new pet
                var writeNewPet = await storage.storage_write_local_storage(reactUser,'games.cryptobreedables.attackItems.'+reactIcon+'.'+petID,newPet);
                // If not possible to write new pet
                if(!writeNewPet){ 
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;  
                }
                // Log purchase to game log
                log.log_write_game(config.messages.shop.log.action,config.messages.shop.log.user+' <@'+reactUser+'> - '+config.messages.shop.success+' 1 '+config.messages.shop[partTwo].shopItems[reactIcon]+config.messages.shop.end);
                // Check if real price enabled
                var realPriceText = "";
                if(config.shop.shopCosts.realPrices.enabled && coinCentPrice > 0){
                    realPriceText =  " ("+Big(config.shop.shopCosts.blackdragon).div(100).toFixed(2)+' '+coinCurrency+")";
                }
                // Success message for user
                chat.chat_reply(msg,'normal','<@'+reactUser+'>',messageType,false,false,false,false,' '+config.messages.shop.success+' `1` `'+config.messages.shop[partTwo].shopItems[reactIcon]+'` '+config.messages.shop.success2+' '+config.battle.chatIcons.coins+' `'+Big(itemCosts).toFixed(8)+'` '+config.bot.coinName+' ('+config.bot.coinSymbol+")"+realPriceText+config.messages.shop.end,false,false,false,false);
                // Remove user from command block list to allow to fire new commands
                check.check_remove_blocklist(reactUser);
                return;
            case 'egg':
                // Automated prices if enabled and global coincentprice not false
                var itemCosts = config.shop.shopCosts.egg;
                if(config.shop.shopCosts.realPrices.enabled && coinCentPrice > 0){
                    itemCosts = Big(config.shop.shopCosts.egg).times(coinCentPrice).toFixed(8);
                }
                // Check if possible to grab user balance and check if he has enough to buy the item
                if(!userBalance || Big(userBalance).lt(itemCosts)){
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.shop.error.title,false,config.messages.shop.error.message,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;
                }
                // Substract balance from user
                var balanceSubstract = await user.user_substract_balance(itemCosts,reactUser);
                if(!balanceSubstract){
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;  
                }
                // Save Payment to user transaction table
                var savePaymentDone= await transaction.transaction_save_payment_to_db(itemCosts,reactUser,config.bot.botID,config.messages.payment.game.paid);
                if(!savePaymentDone){     
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;  
                } 
                // Credit user with item/s
                var newCreditItemValue = new Big(eggCount).plus(1);
                var creditNewValue = await storage.storage_write_local_storage(reactUser,'games.cryptobreedables.items.eggs',newCreditItemValue); 
                // If not possible to write new health
                if(!creditNewValue){ 
                    // If fail to write new health
                    chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    // Remove user from command block list to allow to fire new commands
                    check.check_remove_blocklist(reactUser);
                    return;
                }
                // Log purchase to game log
                log.log_write_game(config.messages.shop.log.action,config.messages.shop.log.user+' <@'+reactUser+'> - '+config.messages.shop.success+' 1 '+config.messages.shop[partTwo].shopItems[reactIcon]+config.messages.shop.end);
                // Check if real price enabled
                var realPriceText = "";
                if(config.shop.shopCosts.realPrices.enabled && coinCentPrice > 0){
                    realPriceText =  " ("+Big(config.shop.shopCosts.egg).div(100).toFixed(2)+' '+coinCurrency+")";
                }
                // Success message for user
                chat.chat_reply(msg,'normal','<@'+reactUser+'>',messageType,false,false,false,false,' '+config.messages.shop.success+' `1` `'+config.messages.shop[partTwo].shopItems[reactIcon]+'` '+config.messages.shop.success2+' '+config.battle.chatIcons.coins+' `'+Big(itemCosts).toFixed(8)+'` '+config.bot.coinName+' ('+config.bot.coinSymbol+")"+realPriceText+config.messages.shop.end,false,false,false,false);
                // Remove user from command block list to allow to fire new commands
                check.check_remove_blocklist(reactUser);
                return;
            default:
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                // Remove user from command block list to allow to fire new commands
                check.check_remove_blocklist(reactUser);
                return;
        }
    },

    event_battle_items: async function(reactIcon,reactUser,eventCollectorMessage,userID,userName,messageType,userRole,msg){

        //////////////////////////////////////////////////////////////////////////////////////////
        // Get user data from local storage and config
        
        // Get user data
        var getUserData = await this.event_get_user_data(reactUser,messageType,msg);
        
        // User level
        var userLevel = getUserData.level;
        if(userLevel === undefined)
            return;

        // User exp
        var userExp = getUserData.exp;
        if(userExp === undefined)
            return;

        // Next level exp
        var nextLevel = new Big(userLevel).plus(1);
        var nextLevelExp = config.userLevel[Big(nextLevel).toString()];
        
        // User health
        var userHealth = getUserData.health;
        if(userHealth === undefined)
            return;

        var userRezHealth = getUserData.rezHealth;
        if(userRezHealth === undefined)
            return;
            
        // User divineShield
        var divineShieldCount = getUserData.items.divineShield.count;
        var divineShieldHealth = getUserData.items.divineShield.health;
        if(divineShieldCount === undefined || divineShieldHealth === undefined)
            return;

        // User attack items
        var userAttackItems = getUserData.attackItems;
        if(userAttackItems === undefined)
            return;
            
        //////////////////////////////////////////////////////////////////////////////////////////
        // Check if user is dead
        if(userHealth <= 0){
            chat.chat_reply(msg,'normal','<@'+reactUser+'>',messageType,false,false,false,false,config.messages.battle.dead+' '+config.rez.chatIcons.rez+' '+config.messages.battle.dead2,false,false,false,false);
            log.log_write_game(config.messages.battle.log.action,config.messages.battle.log.user+' '+reactUser+' - '+config.messages.battle.dead+' '+config.rez.chatIcons.rez+' '+config.messages.battle.dead2);
            // Remove user from current user array so no rain if dead!
            let deadUserRemove = [reactUser]            
            eventCurrentUsers = eventCurrentUsers.filter(item => !deadUserRemove.includes(item))
            return;
        }

        //////////////////////////////////////////////////////////////////////////////////////////
        // Attack by possible attack items from config
        var attack = config.items.attack;
        // Reacht on icons
        switch(reactIcon) {
            case 'sword':
                //////////////////////////////////////////////////////////////////////////////////////////
                // Attack the monster by click on sword icon
                var attackMonsterMessage = ''; 
                // Culculate damage by level and get attack setting from config
                var damage = attack.damage;
                var triggerChance = attack.triggerChance;
                if(userLevel <= attack.levelMultiplier1)
                    damage += userLevel*attack.levelMultiplierSmallerEqual1
                if(userLevel > attack.levelMultiplier1 && userLevel <= attack.levelMultiplier2)
                    damage += userLevel*attack.levelMultiplierBigger1SmallerEqual2
                if(userLevel > attack.levelMultiplier2 && userLevel <= attack.levelMultiplier3)
                    damage += userLevel*attack.levelMultiplierBigger2SmallerEqual3
                if(userLevel > attack.levelMultiplier3)
                    damage += userLevel*attack.levelMultiplierBigger3
                var randomPercentage = check.check_random_from_to(attack.randomPlusMinusPercentage.from,attack.randomPlusMinusPercentage.to);
                damage = damage+(damage/100*randomPercentage);
                damage = Math.floor(damage);
                // User calculate hit chance and hit if true else only message without update message
                var checkTriggerChance = check.check_chance_bool(triggerChance);
                if(checkTriggerChance){

                    //////////////////////////////////////////////////////////////////////////////////////////
                    // Reduce damage based on user health in % - userHealth - userRezHealth

                    var userHealthPercentage = Big(userHealth).div(userRezHealth).times(100).toFixed(0);
                    var damage = Big(damage).div(100).times(userHealthPercentage).toFixed(0);

                    //////////////////////////////////////////////////////////////////////////////////////////
                    // Check if crit attack and edit message
                    var checkTriggerCrit = check.check_chance_bool(config.items.attack.critDamage.chance);
                    if(checkTriggerCrit){
                        var checkCritMultiplier = check.check_random_from_to(config.items.attack.critDamage.multiplier.from,config.items.attack.critDamage.multiplier.to);
                        var damageCritText = config.messages.battle.attackCrit+' '+checkCritMultiplier+config.messages.battle.attackCrit2+damage+config.messages.battle.attackCrit3;
                        damage = new Big(damage).times(checkCritMultiplier);
                        damageCritText += ' '+damage;
                    }else{
                        damageCritText = damage; 
                    }

                    // Hit monster message
                    attackMonsterMessage += config.messages.battle.attackHit+' '+damageCritText+' '+config.battle.chatIcons.sword+' ('+userHealthPercentage+'%)';
                    // Calculate new exp and credite user with exp from fight
                    var creditExp = check.check_random_from_to(config.battle.triggerExp.min,config.battle.triggerExp.max);
                    var newExp = new Big(userExp).plus(creditExp);
                    // Write new exp
                    var writeNewExp = await storage.storage_write_local_storage(reactUser,'games.cryptobreedables.exp',newExp); 
                    // If not possible to write new exp
                    if(!writeNewExp){ 
                        // If fail to write new exp
                        chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                        return;
                    }
                    attackMonsterMessage += " (+"+creditExp+' '+config.messages.battle.exp+")";
                    // Attack monster with user dmg here
                    battleCurrentLifePoints = new Big(battleCurrentLifePoints).minus(damage);

                }else{
                    // Miss monster message
                    attackMonsterMessage += config.messages.battle.attackMiss; 
                    // Calculate new exp and credite user with exp from miss fight
                    var creditExp = check.check_random_from_to(config.battle.triggerFailExp.min,config.battle.triggerFailExp.max);
                    var newExp = new Big(userExp).plus(creditExp);
                    // Write new exp
                    var writeNewExp = await storage.storage_write_local_storage(reactUser,'games.cryptobreedables.exp',newExp); 
                    // If not possible to write new exp
                    if(!writeNewExp){ 
                        // If fail to write new exp
                        chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                        return;
                    }
                    attackMonsterMessage += " (+"+creditExp+' '+config.messages.battle.exp+")";
                }

                ////////////////////////////////////
                ////////////////////////////////////
                ////////////////////////////////////
                /* Attack items */
                // once foreach type (key), update activeID (level and exp)
                ////////////////////////////////////
                ////////////////////////////////////
                ////////////////////////////////////

                for (const [key, value] of Object.entries(userAttackItems)) {
                    var attackItem = key;
                    var attackItemActiveID = value.activeID;
                    var attackItemActiveItemLevel = value[attackItemActiveID].level;
                    var attackItemActiveItemExp = value[attackItemActiveID].exp;

                    //log.log_write_console('Attack Item: '+attackItem);
                    //log.log_write_console('Attack Item Active ID: '+attackItemActiveID);
                    //log.log_write_console('Attack Item Active Level: '+attackItemActiveItemLevel);
                    //log.log_write_console('Attack Item Active EXP: '+attackItemActiveItemExp);

                    // Culculate damage by level and get attack setting from config
                    var attackItemActiveDamage = config.items[attackItem].damage;
                    var attackItemActiveTriggerChance = config.items[attackItem].triggerChance;
                    //log.log_write_console('Attack Item Active Damage: '+attackItemActiveDamage);
                    //log.log_write_console('Attack Item Active TriggerChance: '+attackItemActiveTriggerChance);
                    if(attackItemActiveItemLevel <= config.items[attackItem].levelMultiplier1)
                        attackItemActiveDamage += attackItemActiveItemLevel*config.items[attackItem].levelMultiplierSmallerEqual1
                    if(attackItemActiveItemLevel > config.items[attackItem].levelMultiplier1 && attackItemActiveItemLevel <= config.items[attackItem].levelMultiplier2)
                        attackItemActiveDamage += attackItemActiveItemLevel*config.items[attackItem].levelMultiplierBigger1SmallerEqual2
                    if(attackItemActiveItemLevel > config.items[attackItem].levelMultiplier2 && attackItemActiveItemLevel <= config.items[attackItem].levelMultiplier3)
                        attackItemActiveDamage += attackItemActiveItemLevel*config.items[attackItem].levelMultiplierBigger2SmallerEqual3
                    if(attackItemActiveItemLevel > config.items[attackItem].levelMultiplier3)
                        attackItemActiveDamage += attackItemActiveItemLevel*config.items[attackItem].levelMultiplierBigger3
                    var attackItemActiveRandomPercentage = check.check_random_from_to(config.items[attackItem].randomPlusMinusPercentage.from,config.items[attackItem].randomPlusMinusPercentage.to);
                    attackItemActiveDamage = attackItemActiveDamage+(attackItemActiveDamage/100*attackItemActiveRandomPercentage);
                    attackItemActiveDamage = Math.floor(attackItemActiveDamage);
                    //log.log_write_console('Attack Item Active Damage By Level: '+attackItemActiveDamage);

                    // Item calculate hit chance and hit if true else only message without update message
                    var attackItemActiveCheckTriggerChance = check.check_chance_bool(attackItemActiveTriggerChance);
                    if(attackItemActiveCheckTriggerChance){
                        // Item hit
                        //log.log_write_console('Attack Item Active Hit');

                        //////////////////////////////////////////////////////////////////////////////////////////
                        // Reduce damage based on user health in % - userHealth - userRezHealth

                        var userHealthPercentage = Big(userHealth).div(userRezHealth).times(100).toFixed(0);
                        var attackItemActiveDamage = Big(attackItemActiveDamage).div(100).times(userHealthPercentage).toFixed(0);

                        //////////////////////////////////////////////////////////////////////////////////////////
                        // Check if crit attack and edit message
                        var attackItemActiveCheckTriggerCrit = check.check_chance_bool(config.items[attackItem].critDamage.chance);
                        if(attackItemActiveCheckTriggerCrit){
                            var attackItemActiveCheckCritMultiplier = check.check_random_from_to(config.items[attackItem].critDamage.multiplier.from,config.items[attackItem].critDamage.multiplier.to);
                            var attackItemActiveDamageCritText = config.messages.battle.attackItemCrit+' '+attackItemActiveCheckCritMultiplier+config.messages.battle.attackItemCrit2+attackItemActiveDamage+config.messages.battle.attackItemCrit3;
                            attackItemActiveDamage = new Big(attackItemActiveDamage).times(attackItemActiveCheckCritMultiplier);
                            attackItemActiveDamageCritText += ' '+attackItemActiveDamage;
                        }else{
                            attackItemActiveDamageCritText = attackItemActiveDamage; 
                        }

                        // Random attack name and icon if not empty
                        var attackItemText = "";
                        var attackItemActiveItemAttacks = config.items[attackItem].attacks;
                        // If attacks are defined grab a random one for attack
                        if(attackItemActiveItemAttacks.length > 0){
                            var attackItemActiveItemAttack = check.check_getRandomFromArray(attackItemActiveItemAttacks,1)[0];
                            //log.log_write_console(attackItemActiveItemAttack[0]);
                            //log.log_write_console(attackItemActiveItemAttack[1]);
                            attackItemText = config.messages.battle.attackItemHit3+' '+attackItemActiveItemAttack[1]+'`'+attackItemActiveItemAttack[0]+'` ';
                        }

                        // Hit monster message
                        attackMonsterMessage += '. '+config.messages.battle.attackItemHit+''+config.items[attackItem].chatIcons[attackItem]+'`'+attackItem.charAt(0).toUpperCase()+attackItem.slice(1)+'` '+config.messages.battle.attackItemHit2+' '+attackItemText+config.messages.battle.attackItemHit4+' '+attackItemActiveDamageCritText+' '+config.battle.chatIcons.sword+' ('+userHealthPercentage+'%)';
                        
                        // Calculate new exp and credite item with exp from fight
                        var attackItemActiveCreditExp = check.check_random_from_to(config.battle.triggerItemExp.min,config.battle.triggerItemExp.max);
                        var attackItemActiveNewExp = new Big(attackItemActiveItemExp).plus(attackItemActiveCreditExp);
                        // Write new exp
                        var writeAttackItemActiveNewExp = await storage.storage_write_local_storage(reactUser,'games.cryptobreedables.attackItems.'+attackItem+'.'+attackItemActiveID+'.exp',attackItemActiveNewExp); 
                        // If not possible to write new exp
                        if(!writeAttackItemActiveNewExp){ 
                            // If fail to write new exp
                            chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                            return;
                        } 

                        attackMonsterMessage += " (+"+attackItemActiveCreditExp+' '+config.messages.battle.exp+")";
                        // Attack monster with user dmg here
                        battleCurrentLifePoints = new Big(battleCurrentLifePoints).minus(attackItemActiveDamage);

                    }else{
                        // Item miss
                        //log.log_write_console('Attack Item Active Miss');

                        // Miss monster message
                        attackMonsterMessage += '. '+config.messages.battle.attackItemHit+''+config.items[attackItem].chatIcons[attackItem]+'`'+attackItem.charAt(0).toUpperCase()+attackItem.slice(1)+'` '+config.messages.battle.attackItemMiss; 

                        // Calculate new exp and credite item with exp from fight
                        var attackItemActiveCreditExp = check.check_random_from_to(config.battle.triggerItemFailExp.min,config.battle.triggerItemFailExp.max);
                        var attackItemActiveNewExp = new Big(attackItemActiveItemExp).plus(attackItemActiveCreditExp);
                        // Write new exp
                        var writeAttackItemActiveNewExp = await storage.storage_write_local_storage(reactUser,'games.cryptobreedables.attackItems.'+attackItem+'.'+attackItemActiveID+'.exp',attackItemActiveNewExp); 
                        // If not possible to write new exp
                        if(!writeAttackItemActiveNewExp){ 
                            // If fail to write new exp
                            chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                            return;
                        } 

                        attackMonsterMessage += " (+"+attackItemActiveCreditExp+' '+config.messages.battle.exp+")";

                    }

                    // Update message after damage is done and hit chance did hit
                    this.event_update_message(eventCollectorMessage,userID,userName,messageType,userRole,msg);

                    ////////////////////////////////////
                    /* Attack items check and update level and on level up send message to chat */
                    // once foreach type (key), update activeID (level and exp)
                    ////////////////////////////////////

                    // Next level exp
                    var attackItemActiveNextLevel = new Big(attackItemActiveItemLevel).plus(1);
                    var attackItemActiveNextLevelExp = config.itemLevel[Big(attackItemActiveNextLevel).toString()];
                    //log.log_write_console('Attack Item Active Next Level: '+attackItemActiveNextLevel);
                    //log.log_write_console('Attack Item Active Next Level EXP: '+attackItemActiveNextLevelExp);

                    ////////////////////////////////////

                    //////////////////////////////////////////////////////////////////////////////////////////
                    // Check and update item level and on level up send message to chat 

                    if(Big(attackItemActiveNewExp).gt(attackItemActiveNextLevelExp)){
                        this.event_update_item_level(reactUser,attackItem,attackItemActiveID,attackItemActiveNextLevel,messageType,msg);
                    }

                }

                ////////////////////////////////////
                ////////////////////////////////////
                ////////////////////////////////////

                break;
            default:
                return;
          }

        //////////////////////////////////////////////////////////////////////////////////////////
        // Attack monster message
        attackMonsterMessage += config.messages.battle.textEnd;
        chat.chat_reply(msg,'normal','<@'+reactUser+'>',messageType,false,false,false,false,attackMonsterMessage,false,false,false,false);
        log.log_write_game(config.messages.battle.log.action,config.messages.battle.log.user+' '+reactUser+' - '+attackMonsterMessage);

        //////////////////////////////////////////////////////////////////////////////////////////
        // Monster attack - Check if monster trigger or fail to attack user
        var checkTriggerMonster = check.check_chance_bool(config.monster.triggerChance);
        if(checkTriggerMonster){
            
            //////////////////////////////////////////////////////////////////////////////////////////
            // Check if user owns a divineShield and if it triggeres and protect from attack
            var checkTriggerDivineShield = check.check_chance_bool(config.items.divineShield.trigger_chance);
            if(divineShieldCount > 0 && checkTriggerDivineShield){

                //////////////////////////////////////////////////////////////////////////////////////////
                // Divine shield triggered and protects user
                this.event_divine_shield(reactUser,divineShieldHealth,divineShieldCount,messageType,msg);

            }else{

                //////////////////////////////////////////////////////////////////////////////////////////
                // Monster hit the user
                this.event_monster_attack(reactUser,messageType,msg);

            }
        }

        //////////////////////////////////////////////////////////////////////////////////////////
        // Check and update user level and on level up send message to chat 

        if(Big(newExp).gt(nextLevelExp)){
            this.event_update_user_level(reactUser,nextLevel,messageType,msg);
        }

    },

    event_divine_shield: async function(reactUser,divineShieldHealth,divineShieldCount,messageType,msg){
        var divineShieldMessage = '';
        divineShieldMessage += config.messages.divineShield.protect+' '+config.items.divineShield.chatIcons.divineShield+' '+config.messages.divineShield.protect2;
        // Check if shield has enough protection or if it dies
        // Get random protectionRemove value
         var protectionRemove = check.check_random_from_to(config.items.divineShield.protectRemove.min,config.items.divineShield.protectRemove.max);
         var newDivineShieldHealth = divineShieldHealth - protectionRemove;
         if(newDivineShieldHealth <= 0){ // Has not enought protection
            // Remove one shield and set shield health back to full value
            divineShieldCount = new Big(divineShieldCount).minus(1);
            // RESET VALUE
            newDivineShieldHealth = config.items.divineShield.totalHealth;
            // If shields empty set protection to zero
            if(divineShieldCount <= 0){
                newDivineShieldHealth = 0;
            }
            // Remove one shield
            var writeRemoveShield = await storage.storage_write_local_storage(reactUser,'games.cryptobreedables.items.divineShield.count',divineShieldCount); 
            // If not possible to write new shield value
            if(!writeRemoveShield){ 
                // If fail to write new shield value
                chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            // Reset shield health
            var writeResetShield = await storage.storage_write_local_storage(reactUser,'games.cryptobreedables.items.divineShield.health',newDivineShieldHealth); 
            // If not possible to reset shield value
            if(!writeResetShield){ 
                // If fail to reset shield value
                chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            divineShieldMessage += " "+config.messages.divineShield.destroyed+' '+config.items.divineShield.chatIcons.destroyed+' '+config.messages.divineShield.destroyed2;
         }else{ // Has enought protection
            // Write new shield health
            var writeShieldValue = await storage.storage_write_local_storage(reactUser,'games.cryptobreedables.items.divineShield.health',newDivineShieldHealth); 
            // If not possible to write shield value
            if(!writeShieldValue){ 
                // If fail to write shield value
                chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            divineShieldMessage += " "+config.messages.divineShield.reduced+' '+protectionRemove+' '+config.messages.divineShield.reduced2;
         }
         // Add stats to message end
         divineShieldMessage += " ("+divineShieldCount+") "+config.items.divineShield.chatIcons.divineShield+" "+config.messages.divineShield.shields+' - '+config.messages.divineShield.protection+' '+newDivineShieldHealth+'/'+config.items.divineShield.totalHealth+config.messages.divineShield.textEnd;
         chat.chat_reply(msg,'normal','<@'+reactUser+'>',messageType,false,false,false,false,divineShieldMessage,false,false,false,false);
         log.log_write_game(config.messages.divineShield.log.action,config.messages.divineShield.log.user+' '+reactUser+' - '+divineShieldMessage);
    },

    event_update_user_level: async function(reactUser,nextLevel,messageType,msg){
        // Write new level
        var writeNewLevel= await storage.storage_write_local_storage(reactUser,'games.cryptobreedables.level',nextLevel); 
        // If not possible to write new level
        if(!writeNewLevel){ 
            // If fail to write new level
            chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        // Inform user about level up
        chat.chat_reply(msg,'normal','<@'+reactUser+'>',messageType,false,false,false,false,config.messages.level.levelUp+' **'+nextLevel+'** '+config.level.chatIcons.levelUp+' '+config.messages.level.textEnd,false,false,false,false);
        log.log_write_game(config.messages.level.log.action,config.messages.level.log.user+' '+reactUser+' - '+config.messages.level.levelUp+' **'+nextLevel+'** '+config.level.chatIcons.levelUp+' '+config.messages.level.textEnd);
    },

    event_update_item_level: async function(reactUser,attackItem,attackItemActiveID,attackItemActiveNextLevel,messageType,msg){
        
        // Write new level
        var attackItemActiveWriteNewLevel = await storage.storage_write_local_storage(reactUser,'games.cryptobreedables.attackItems.'+attackItem+'.'+attackItemActiveID+'.level',attackItemActiveNextLevel); 
        // If not possible to write new level
        if(!attackItemActiveWriteNewLevel){ 
            // If fail to write new level
            chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        
        // Inform user about level up
        chat.chat_reply(msg,'normal','<@'+reactUser+'>',messageType,false,false,false,false,config.messages.level.itemLevelUp+''+config.items[attackItem].chatIcons[attackItem]+'`'+attackItem.charAt(0).toUpperCase()+attackItem.slice(1)+'` '+config.messages.level.itemLevelUp2+' **'+attackItemActiveNextLevel+'** '+config.level.chatIcons.levelUp+' '+config.messages.level.textEnd,false,false,false,false);
        log.log_write_game(config.messages.level.log.action,config.messages.level.log.user+' '+reactUser+' - '+config.messages.level.itemLevelUp+''+config.items[attackItem].chatIcons[attackItem]+'`'+attackItem.charAt(0).toUpperCase()+attackItem.slice(1)+'` '+config.messages.level.itemLevelUp2+' **'+attackItemActiveNextLevel+'** '+config.level.chatIcons.levelUp+' '+config.messages.level.textEnd);
        
    },

    event_credit_kill_user: async function(messageType,msg){
        // Credit kill user
        var killMonsterMessage = '';
        var killUser = eventCurrentUsers[eventCurrentUsers.length - 1];

        // Get user data
        var getUserData = await this.event_get_user_data(killUser,messageType,msg);

        var userExp = getUserData.exp;
        var userKills = getUserData.kills;

        if(userExp === undefined){
            // If fail to write new user
            chat.chat_reply(msg,'embed','<@'+killUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;  
        }
        // Calculate new exp and credite user with exp from miss fight
        var creditExp = check.check_random_from_to(config.battle.triggerKillExp.min,config.battle.triggerKillExp.max);
        var newExp = new Big(userExp).plus(creditExp);
        // Write new exp
        var writeNewExp = await storage.storage_write_local_storage(killUser,'games.cryptobreedables.exp',newExp); 
        // If not possible to write new exp
        if(!writeNewExp){ 
            // If fail to write new exp
            chat.chat_reply(msg,'embed','<@'+killUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        killMonsterMessage += " (+"+creditExp+' '+config.messages.battle.exp+")"+config.messages.battle.textEnd;

        // Save kill to user stats
        var newKills = new Big(userKills).plus(1);
        // Write new kill
        var writeNewKills = await storage.storage_write_local_storage(killUser,'games.cryptobreedables.kills',newKills); 
        // If not possible to write new kill
        if(!writeNewKills){ 
            // If fail to write new kill
            chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        chat.chat_reply(msg,'normal','<@'+killUser+'>',messageType,false,false,false,false,config.messages.monster.killMonster+' '+config.monster.chatIcons.dead+' '+config.messages.monster.killMonster2+killMonsterMessage,false,false,false,false);
        log.log_write_game(config.messages.monster.log.action,config.messages.monster.log.user+' '+killUser+' - '+config.messages.monster.killMonster+' '+config.monster.chatIcons.dead+' '+config.messages.monster.killMonster2+killMonsterMessage);
    },

    event_get_user_data: async function(reactUser,messageType,msg){
        // Get user data
        var getUserData = await storage.storage_read_local_storage(reactUser,'games.cryptobreedables');
        // CHeck if user is register else create start values
        if(getUserData === undefined){
            // Write start values
            var writeNewUser = await storage.storage_write_local_storage(reactUser,'games.cryptobreedables',config.startUser); 
            // If not possible to write start values
            if(!writeNewUser){ 
                // If fail to write new user 
                chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                // Remove user from command block list to allow to fire new commands
                check.check_remove_blocklist(reactUser);
                return false;
            }else{
                // Grab userdata again
                getUserData = config.startUser;
                return getUserData;
            }
        }else{
            return getUserData;
        }
    },

    event_monster_attack: async function(reactUser,messageType,msg){
        var monsterHitMessage = '';

        // Get user data
        var getUserData = await this.event_get_user_data(reactUser,messageType,msg);

        var userhealth = getUserData.health;
        var userRezHealth = getUserData.rezHealth;
        var userDeath = getUserData.death;

        if(userhealth === undefined || userRezHealth === undefined){
            // If fail to write new user
            chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;  
        }
        // Calculate new exp and credite user with exp from miss fight
        var triggerDamage = check.check_random_from_to(config.monster.triggerDamage.min,config.monster.triggerDamage.max);
        var newHealth = new Big(userhealth).minus(triggerDamage);
        // Write new exp
        var writeNewHealth = await storage.storage_write_local_storage(reactUser,'games.cryptobreedables.health',newHealth); 
        // If not possible to write new exp
        if(!writeNewHealth){ 
            // If fail to write new exp
            chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        monsterHitMessage += config.messages.monster.attackHit+" "+triggerDamage+config.monster.chatIcons.blood+config.messages.monster.attackHit2+" "+config.rez.chatIcons.fullHeart+' '+config.messages.monster.health+' '+newHealth+"/"+userRezHealth+config.messages.monster.textEnd;
        chat.chat_reply(msg,'normal','<@'+reactUser+'>',messageType,false,false,false,false,monsterHitMessage,false,false,false,false);
        log.log_write_game(config.messages.battle.log.action,config.messages.battle.log.user+' '+reactUser+' - '+monsterHitMessage);
        // If dead
        if(newHealth <= 0){
            // Save death to user stats
            var newDeath = new Big(userDeath).plus(1);
            // Write new death
            var writeNewDeath = await storage.storage_write_local_storage(reactUser,'games.cryptobreedables.death',newDeath); 
            // If not possible to write new death
            if(!writeNewDeath){ 
                // If fail to write new death
                chat.chat_reply(msg,'embed','<@'+reactUser+'>',messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            // Message
            chat.chat_reply(msg,'normal','<@'+reactUser+'>',messageType,false,false,false,false,config.messages.monster.kill+' '+config.monster.chatIcons.dead+' '+config.messages.monster.kill2+' '+config.rez.chatIcons.rez+' '+config.messages.monster.kill3,false,false,false,false);
            log.log_write_game(config.messages.monster.log.dead,config.messages.monster.log.user+' '+reactUser+' - '+config.messages.monster.kill+' '+config.monster.chatIcons.dead+' '+config.messages.monster.kill2+' '+config.rez.chatIcons.rez+' '+config.messages.monster.kill3);
        }
        return;
    },

    event_drop: async function(dropUsers,msg,messageType,userID,userName,userRole){
        var checkTriggerDrop = check.check_chance_bool(config.battle.drop.chance);
        if(checkTriggerDrop && dropUsers.length > 0){
            var randomDropUser = check.check_getRandomFromArray(dropUsers,1)[0];
            var randomDropItem = check.check_getRandomFromArray(config.battle.drop.itemList,1)[0];
            // Get receiver user data
            var getReceiverUserData = await this.event_get_user_data(randomDropUser,messageType,msg);
            var userReceiverEggs = getReceiverUserData.items.eggs;
            var userReceiverBoxes = getReceiverUserData.items.boxes;
            var userReceiverDivineShields = getReceiverUserData.items.divineShield.count;
            var userReceiverLifeIncreasePotions = getReceiverUserData.items.lifeIncreasePotions;
            var userReceiverHealPotions = getReceiverUserData.items.healPotions;
            var dropItem = "";
            var dropIcon = "";
            // Credit user drop item
            switch (randomDropItem) {
                case 'egg':
                    // Credit user with item
                    dropItem = config.messages.battle.drop.egg;
                    dropIcon = config.battle.chatIcons.egg;
                    var newCreditItemValue = new Big(userReceiverEggs).plus(1);
                    var creditNewValue = await storage.storage_write_local_storage(randomDropUser,'games.cryptobreedables.items.eggs',newCreditItemValue); 
                    if(!creditNewValue){ 
                        // If fail to write new value
                    }
                    break;
                case 'box':
                    // Credit user with item
                    dropItem = config.messages.battle.drop.box;
                    dropIcon = config.battle.chatIcons.box;
                    var newCreditItemValue = new Big(userReceiverBoxes).plus(1);
                    var creditNewValue = await storage.storage_write_local_storage(randomDropUser,'games.cryptobreedables.items.boxes',newCreditItemValue); 
                    if(!creditNewValue){ 
                        // If fail to write new value
                    }
                    break;
                case 'divineshield':
                    // Credit user with item
                    dropItem = config.messages.battle.drop.divineShield;
                    dropIcon = config.battle.chatIcons.divineShield;
                    var newCreditItemValue = new Big(userReceiverDivineShields).plus(1);
                    var creditNewValue = await storage.storage_write_local_storage(randomDropUser,'games.cryptobreedables.items.divineShield.count',newCreditItemValue); 
                    if(!creditNewValue){ 
                        // If fail to write new value
                    }
                    // If user divineshield count is empty also add shield health userReceiverDivineShieldsHealth
                    if(userReceiverDivineShields <= 0){
                        var creditNewValue = await storage.storage_write_local_storage(randomDropUser,'games.cryptobreedables.items.divineShield.health',config.items.divineShield.totalHealth); 
                        // If not possible to write new health
                        if(!creditNewValue){ 

                            // If fail to write new value
                        }
                    }
                    break;
                case 'lifeincreasepotion':
                    // Credit user with item
                    dropItem = config.messages.battle.drop.lifeIncreasePotion;
                    dropIcon = config.battle.chatIcons.lifeIncreasePotion;
                    var newCreditItemValue = new Big(userReceiverLifeIncreasePotions).plus(1);
                    var creditNewValue = await storage.storage_write_local_storage(randomDropUser,'games.cryptobreedables.items.lifeIncreasePotions',newCreditItemValue); 
                    if(!creditNewValue){ 
                        // If fail to write new value
                    }
                    break;
                case 'healpotion':
                    // Credit user with item
                    dropItem = config.messages.battle.drop.healPotion;
                    dropIcon = config.battle.chatIcons.healPotion;
                    var newCreditItemValue = new Big(userReceiverHealPotions).plus(1);
                    var creditNewValue = await storage.storage_write_local_storage(randomDropUser,'games.cryptobreedables.items.healPotions',newCreditItemValue); 
                    if(!creditNewValue){ 
                        // If fail to write new value
                    }
                    break;
                default:
                    return;
            }  
            // Message
            chat.chat_reply(msg,'normal','<@'+randomDropUser+'>',messageType,false,false,false,false,config.messages.battle.drop.success+' '+dropIcon+' `'+dropItem+'` '+config.messages.battle.drop.success1,false,false,false,false);
            log.log_write_game(config.messages.battle.log.drop,config.messages.battle.log.user+' '+randomDropUser+' - '+config.messages.battle.drop.success+' '+dropIcon+' `'+dropItem+'` '+config.messages.battle.drop.success1);
        }
        return;
    },

    event_rain: async function(rainUsers,msg,messageType,userID,userName,userRole){
        var coinsCredited = 1;
        var coinsTransactionSaved = 1;
        var failedToCreditMessage = "";
        var rainSuccessfulMessage = config.messages.battle.rain.success;
        // Check rain chance and if users to rain
        var checkTriggerRain = check.check_chance_bool(config.battle.rain.chance);
        if(checkTriggerRain && eventCurrentUsers.length > 0){
            var index;
            var totalRainValue = Big(check.check_random_from_to_floating(config.battle.rain.min,config.battle.rain.max,config.battle.rain.floating)).div(config.battle.endRound);
            var rainUserCount = rainUsers.length;
            var userRainValue = new Big(totalRainValue).div(rainUserCount).toFixed(8);
            rainSuccessfulMessage += " "+config.battle.chatIcons.coins+" `"+new Big(totalRainValue).toFixed(8)+"` "+config.bot.coinName+' ('+config.bot.coinSymbol+") "+config.messages.battle.rain.success1+" `"+rainUserCount+"` "+config.messages.battle.rain.success2+' ';
            for (index = 0; index < rainUsers.length; ++index) {
                rainUser = rainUsers[index];
                // Credit balance to user
                var creditResult = await user.user_add_balance(Big(userRainValue).toString(),rainUser);
                if(!creditResult){
                    coinsCredited = 0; 
                }
                // Write to payment table received
                var saveTipReceived = await transaction.transaction_save_payment_to_db(Big(userRainValue).toString(),config.bot.botID,rainUser,config.messages.payment.game.received);
                if(!saveTipReceived){
                    coinsTransactionSaved = 0;
                }
                rainSuccessfulMessage += "<@"+rainUser+">, ";
            };
            rainSuccessfulMessage += config.battle.chatIcons.coins+" `"+userRainValue+"` "+config.bot.coinName+' ('+config.bot.coinSymbol+") "+config.messages.battle.rain.success3;
            // If credit failed or save of transaction history to db failed
            if(coinsCredited == 0 || coinsTransactionSaved == 0){
                failedToCreditMessage += config.messages.walletFailed;
            }
            rainSuccessfulMessage += " "+failedToCreditMessage;
            // Send output
            chat.chat_reply(msg,'normal',false,messageType,false,false,false,false,rainSuccessfulMessage,false,false,false,false);
            log.log_write_game(config.messages.battle.log.rain,rainSuccessfulMessage);

            // Add same rain value for users to jackpot
            ///////////////////////////////////////////
            // Get jackpot data
            var getJackpotData = await storage.storage_read_jackpot();
            // CHeck if user is register else create start values
            if(getJackpotData){
                var currentJackpotValue = getJackpotData.value;
                // Add rain value to jackpot
                var newJackpotValue = new Big(currentJackpotValue).plus(userRainValue).toFixed(8);
                var creditNewJackpotValue = await storage.storage_write_jackpot('value',newJackpotValue); 
                var rainMessage = config.battle.chatIcons.jackpot+" "+config.messages.battle.jackpot.success+" "+config.battle.chatIcons.coins+" `"+new Big(userRainValue).toFixed(8)+"` "+config.bot.coinName+' ('+config.bot.coinSymbol+") "+config.messages.battle.jackpot.success1+" "+config.messages.battle.jackpot.success2+" "+config.battle.chatIcons.coins+" `"+newJackpotValue+"` "+config.bot.coinName+' ('+config.bot.coinSymbol+") "+config.messages.battle.jackpot.success3;
                // If not possible to write new health
                if(!creditNewJackpotValue){ 
                    // Failed to credit rain to jackpot
                }else{
                    // Success message for jackpot rain
                    chat.chat_reply(msg,'normal',false,messageType,false,false,false,false,rainMessage,false,false,false,false);
                    log.log_write_game(config.messages.battle.log.rainjackpot,rainMessage);
                }
            }

        }
        
        // Drop random item to random user
        this.event_drop(eventCurrentUsers,msg,messageType,userID,userName,userRole);
        
        // Stop active event
        this.event_destroy(0,eventCollector);
        // Delete event message
        chat.chat_delete_message(eventCollectorMessage);
        // Check if win
        if(battleCurrentLifePoints <= 0){
            chat.chat_reply(msg,'image',false,false,false,false,false,false,false,false,false,config.battle.victory_img,false);
            log.log_write_game(config.messages.battle.log.action,config.messages.battle.log.user+' '+config.messages.battle.log.win);
            // Kill message
            killMonsterMessage = config.messages.battle.kill;
            // Reset round counter
            eventCurrentRound = battleStartRound;
            // Auto health update
            if(config.battle.cron.autoHealth.enabled){
                battleHealthAuto = battleHealthAuto+config.battle.cron.autoHealth.value;
            }
            // If event still active
            if(eventActive)
                this.event_destroy(0,eventCollector);
            return;
        }
        // Check if defeat
        if(eventCurrentRound >= battleEndRound){
            chat.chat_reply(msg,'image',false,false,false,false,false,false,false,false,false,config.battle.defense_img,false);
            log.log_write_game(config.messages.battle.log.action,config.messages.battle.log.user+' '+config.messages.battle.log.loss);
            // Reset round counter
            eventCurrentRound = battleStartRound;
            // Auto health update
            if(config.battle.cron.autoHealth.enabled){
                battleHealthAuto = battleHealthAuto-config.battle.cron.autoHealth.value;
                if(battleHealthAuto < config.battle.cron.monsterHealth.min){
                    battleHealthAuto = config.battle.cron.monsterHealth.min;
                }
            }
            // If event still active
            if(eventActive)
                this.event_destroy(0,eventCollector);
            return;
        }
        // Update current round
        eventCurrentRound++;
        // Start next round if its not bigger as max allowed round and still has life
        //////////////
        if(eventCurrentRound <= battleEndRound) { 
            command.command_battle(0,userID,userName,messageType,userRole,msg,battleCurrentLifePoints);
        }
    }
    
};