try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

var check = require("./check.js");
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
    // Check if user is registered by id
    /* ------------------------------------------------------------------------------ */

    user_registered_check: function(userID){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "user_registered_check: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve('error');
                }else{
                    connection.execute("SELECT * FROM user WHERE discord_id = ?",[userID],function (error, results, fields){
                        mysqlPool.releaseConnection(connection);
                        if(error)
                        {
                            var errorMessage = "user_registered_check: MySQL query problem. (SELECT * FROM user WHERE discord_id = ?)";
                            if(config.bot.errorLogging){
                                log.log_write_file(errorMessage);
                                log.log_write_file(error);
                            }
                            log.log_write_console(errorMessage);
                            log.log_write_console(error);
                            resolve('error');
                        }else{
                            if(results.length > 0){
                                resolve(true);
                            }else{
                                resolve(false);
                            }
                        }
                    });
                }
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Register new user
    /* ------------------------------------------------------------------------------ */

    user_register: function(userName,userID){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "user_get_info: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    connection.execute("INSERT INTO user (username,discord_id) VALUES (?,?) ON DUPLICATE KEY UPDATE username = ?",[userName,userID,userName],function (error, results, fields){
                        mysqlPool.releaseConnection(connection);
                        if(error){
                            var errorMessage = "user_register: MySQL query problem. (INSERT INTO user (username,discord_id) VALUES (?,?) ON DUPLICATE KEY UPDATE username = ?)";
                            if(config.bot.errorLogging){
                                log.log_write_file(errorMessage);
                                log.log_write_file(error);
                            }
                            log.log_write_console(errorMessage);
                            log.log_write_console(error);
                            resolve(false);
                        }else{
                            resolve(true)
                        }
                    });
                }
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get user balance by id
    /* ------------------------------------------------------------------------------ */

    user_get_balance: function(userID){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "user_get_balance: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    connection.execute("SELECT balance FROM user WHERE discord_id = ? LIMIT 1",[userID],function (error, results, fields){
                        mysqlPool.releaseConnection(connection);
                        if(error)
                        {
                            var errorMessage = "user_get_balance: MySQL query problem. (SELECT balance FROM user WHERE discord_id = ? LIMIT 1)";
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
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Substract balance from user by id
    /* ------------------------------------------------------------------------------ */

    user_substract_balance: function(substractAmount,userID){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "user_substract_balance: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    connection.execute("UPDATE user SET balance = balance - ? WHERE discord_id = ?",[Big(substractAmount).toString(),userID],function (error, results, fields){
                        mysqlPool.releaseConnection(connection);
                        if(error)
                        {   
                            var errorMessage = "user_substract_balance: MySQL query problem. (UPDATE user SET balance = balance - ? WHERE discord_id = ?)";
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
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Add balance to user by id
    /* ------------------------------------------------------------------------------ */

    user_add_balance: function(addAmount,userID){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "user_add_balance: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    connection.execute("INSERT INTO user (username,discord_id,balance) VALUES (?,?,?) ON DUPLICATE KEY UPDATE balance = balance + ?",['tipUser',userID,Big(addAmount).toString(),Big(addAmount).toString()],function (error, results, fields){
                        mysqlPool.releaseConnection(connection);
                        if(error)
                        {   
                            var errorMessage = "user_add_balance: MySQL query problem. (INSERT INTO user (username,discord_id,balance) VALUES (?,?,?) ON DUPLICATE KEY UPDATE balance = balance + ?)";
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
        });
    }

};