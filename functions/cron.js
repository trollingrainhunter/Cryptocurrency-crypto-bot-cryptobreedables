try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

var findRemoveSync = require('find-remove');
var PromiseFtp = require('promise-ftp');
const fs = require('fs');
const Big = require('big.js'); // https://github.com/MikeMcl/big.js -> http://mikemcl.github.io/big.js/

var check = require("./check.js");
var log = require("./log.js");
var transaction = require("./transaction.js");

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // Backup game data
    /* ------------------------------------------------------------------------------ */

    cron_backup_game_data: function() {
        setInterval(function (){ 
            // Check if bot is curently disabled
            if(botEnabled){
                var backupTimestamp = Date.now();
                // destination.txt will be created or overwritten by default.
                fs.copyFile(process.cwd()+'/lowdb/lowdb.json', process.cwd()+'/lowdb/backups/lowdb-'+backupTimestamp+'.json', (error) => {
                    if (error) {
                        var errorMessage = "cron_backup_game_data: Failed to save backup of lowdb.json";
                        if(config.bot.errorLogging){
                            log.log_write_file(errorMessage);
                            log.log_write_file(error);
                        }
                        log.log_write_console(errorMessage);
                        log.log_write_console(error);
                    }
                    log.log_write_console('lowdb.json was copied to backup folder.');
                });
            }
        }, config.backup.cronTime*1000);
    },

    /* ------------------------------------------------------------------------------ */
    // Delete old backup files
    /* ------------------------------------------------------------------------------ */

    cron_backup_delete: function() {
        setInterval(function (){ 
            // Check if bot is curently disabled
            if(botEnabled){
                findRemoveSync(process.cwd()+'/lowdb/backups', {age: {seconds: config.backup.deleteTime}, extensions: '.json'});
                log.log_write_console('old lowdb.json backup files deleted from backup folder.');
            }
        }, config.backup.deleteCronTime*1000);
    },

    /* ------------------------------------------------------------------------------ */
    // Upload game data to ftp
    /* ------------------------------------------------------------------------------ */

    cron_upload_game_data: function() {
        setInterval(function (){ 
            // Check if bot is curently disabled
            if(botEnabled){
                var ftp = new PromiseFtp();
                ftp.connect({host: config.ftpupload.host, user: config.ftpupload.user, password: config.ftpupload.password, port: config.ftpupload.port})
                .then(function (serverMessage) {
                return ftp.put(process.cwd()+config.ftpupload.filepath, config.ftpupload.destpath);
                }).then(function () {
                log.log_write_console('lowdb.json was sent to website folder.');
                return ftp.end();
                });
            }
        }, config.ftpupload.cronTime*1000);
    },

    /* ------------------------------------------------------------------------------ */
    // Automated monsters
    /* ------------------------------------------------------------------------------ */

    cron_battle: function() {
        setInterval(function (){ 
            // Check if bot is curently disabled
            if(botEnabled){
                if(!eventActive){
                    var monsterHealth = check.check_random_from_to(config.battle.cron.monsterHealth.min,config.battle.cron.monsterHealth.max);
                    // Auto health
                    if(config.battle.cron.autoHealth.enabled){
                        monsterHealth = battleHealthAuto;
                    }
                    command.command_battle(1,config.bot.adminIDs[0],'','text','3','battlecron',monsterHealth);
                    log.log_write_console('cron_battle fired and new monster spawned.');
                }else{
                    log.log_write_console('cron_battle not fired because event already active.');
                }
            }
        }, config.battle.cron.randomBattleStartTime*1000);
    },

    /* ------------------------------------------------------------------------------ */
    // Automated shop
    /* ------------------------------------------------------------------------------ */

    cron_shop: function() {
        setInterval(function (){ 
            // Check if bot is curently disabled
            if(botEnabled){
                var shopType = check.check_getRandomFromArray(config.shop.cron.possibleShops,1);
                if(!eventActive){
                    command.command_shop(1,config.bot.adminIDs[0],'','text','3','shopcron',shopType[0]);
                    log.log_write_console('cron_shop fired and new shop opened.');
                }else{
                    log.log_write_console('cron_shop not fired because event already active.');
                }
            }
        }, config.shop.cron.randomShopStartTime*1000);
    },

    /* ------------------------------------------------------------------------------ */
    // Get coin price
    /* ------------------------------------------------------------------------------ */

    cron_price: async function() {
        var newCoinPrice = 0; 
        newCoinPrice = await transaction.transaction_get_coin_price();
        if(newCoinPrice){
            coinPrice = newCoinPrice['coinPrice'];
            coinCentPrice = Big(0.01).div(newCoinPrice['coinPrice']).toFixed(8);
            coinCurrency = newCoinPrice['coinCurrency'];
        }
        setInterval(async function (){ 
            // Check if bot is curently disabled
            if(botEnabled){
                newCoinPrice = await transaction.transaction_get_coin_price();
                if(newCoinPrice){
                    coinPrice = newCoinPrice['coinPrice'];
                    coinCentPrice = Big(0.01).div(newCoinPrice['coinPrice']).toFixed(8);
                    coinCurrency = newCoinPrice['coinCurrency'];
                } 
            }
        }, config.shop.shopCosts.realPrices.cronTime*1000);
    } 
 
};