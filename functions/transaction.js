//var config = require('../config.js');
try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

var log = require("./log.js");

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

// Mysql2
const mysql = require('mysql2');
// connect mysql database
mysqlPool  = mysql.createPool({
    connectionLimit : config.mysql.connectionLimit,
    waitForConnections: config.mysql.waitForConnections,
    host     : config.mysql.dbHost,
    user     : config.mysql.dbUser,
    port     : config.mysql.dbPort,
    password : config.mysql.dbPassword,
    database : config.mysql.dbName
});

const Big = require('big.js'); // https://github.com/MikeMcl/big.js -> http://mikemcl.github.io/big.js/

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {
    
    /* ------------------------------------------------------------------------------ */
    // Save payment to db
    /* ------------------------------------------------------------------------------ */
    transaction_save_payment_to_db: function(paymentAmount,fromID,toID,type){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "transaction_save_payment_to_db: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    connection.execute("INSERT INTO payments (amount,from_discord_id,to_discord_id,type,coin_price) VALUES (?,?,?,?,?)",[Big(paymentAmount).toString(),fromID,toID,type,coinPrice],function (error, results, fields){
                        mysqlPool.releaseConnection(connection);
                        if(error)
                        {   
                            var errorMessage = "transaction_save_payment_to_db: MySQL query problem. (INSERT INTO payments (amount,from_discord_id,to_discord_id,type) VALUES (?,?,?,?))";
                            if(config.bot.errorLogging){
                                log.log_write_file(errorMessage);
                                log.log_write_file(error);
                            }
                            log.log_write_console(errorMessage);
                            log.log_write_console(error);
                            resolve(false);
                        }else{
                            resolve(true);
                        }
                    });
                }
            });
        })
    },

    /* ------------------------------------------------------------------------------ */
    // Get total game payouts 
    /* ------------------------------------------------------------------------------ */
    transaction_get_game_payout_from_db: function(partTwo){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "transaction_get_game_payout_from_db: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    connection.execute("SELECT sum(amount) AS outvalue FROM payments WHERE from_discord_id = ? AND datetime >= NOW() - INTERVAL ? DAY",[config.bot.botID,partTwo],function (error, results, fields){
                        mysqlPool.releaseConnection(connection);
                        if(error)
                        {   
                            var errorMessage = "transaction_get_game_payout_from_db : MySQL query problem. (SELECT sum(amount) AS outvalue FROM payments WHERE from_discord_id = ?)";
                            if(config.bot.errorLogging){
                                log.log_write_file(errorMessage);
                                log.log_write_file(error);
                            }
                            log.log_write_console(errorMessage);
                            log.log_write_console(error);
                            resolve(false);
                        }else{
                            resolve(results[0]['outvalue']);
                        }
                    });
                }
            });
        })
    },

    /* ------------------------------------------------------------------------------ */
    // Get total game income
    /* ------------------------------------------------------------------------------ */
    transaction_get_game_income_from_db: function(partTwo){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "transaction_get_game_income_from_db: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    connection.execute("SELECT sum(amount) AS invalue FROM payments WHERE to_discord_id = ? AND datetime >= NOW() - INTERVAL ? DAY",[config.bot.botID,partTwo],function (error, results, fields){
                        mysqlPool.releaseConnection(connection);
                        if(error)
                        {   
                            var errorMessage = "transaction_get_game_income_from_db: MySQL query problem. (SELECT sum(amount) AS invalue FROM payments WHERE to_discord_id = ?)";
                            if(config.bot.errorLogging){
                                log.log_write_file(errorMessage);
                                log.log_write_file(error);
                            }
                            log.log_write_console(errorMessage);
                            log.log_write_console(error);
                            resolve(false);
                        }else{
                            resolve(results[0]['invalue']);
                        }
                    });
                }
            });
        })
    },

    /* ------------------------------------------------------------------------------ */
    // Get coin price
    /* ------------------------------------------------------------------------------ */
    transaction_get_coin_price: function(){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "transaction_get_coin_price: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    connection.execute("SELECT id, price AS coinPrice, currency as coinCurrency FROM coin_price_history ORDER BY id DESC LIMIT 1",[],function (error, results, fields){
                        mysqlPool.releaseConnection(connection);
                        if(error)
                        {   
                            var errorMessage = "transaction_get_coin_price: MySQL query problem. (SELECT id, price AS coinPrice, currency as coinCurrency FROM coin_price_history ORDER BY id DESC LIMIT 1)";
                            if(config.bot.errorLogging){
                                log.log_write_file(errorMessage);
                                log.log_write_file(error);
                            }
                            log.log_write_console(errorMessage);
                            log.log_write_console(error);
                            resolve(false);
                        }else{
                            resolve(results[0]);
                        }
                    });
                }
            });
        })
    }
};