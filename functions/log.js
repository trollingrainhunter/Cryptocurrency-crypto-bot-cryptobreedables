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

const log4js = require('log4js');
log4js.configure({
    appenders: { 
      cryptobreedables_error: { type: 'file', filename: 'cryptobreedables_error.log', maxLogSize: config.bot.errorLoggingMaxFileSize, backups: config.bot.errorLoggingMaxBackups, compress: config.bot.errorLoggingZipOldLogs }, 
      game: { type: 'file', filename: 'game.log', maxLogSize: config.bot.gameLoggingMaxFileSize, backups: config.bot.gameLoggingMaxBackups, compress: config.bot.gameLoggingZipOldLogs }
    },
    categories: { 
        default: { appenders: ['cryptobreedables_error'], level: 'error' },
        default: { appenders: ['game'], level: 'info' },
    }
});
const logger = log4js.getLogger('cryptobreedables_error');
const loggerGame = log4js.getLogger('game');

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // Log: Message to database
    /* ------------------------------------------------------------------------------ */

    log_write_database: function(UserID,logDescription = '',logValue = 0) {
        var self = this;
        mysqlPool.getConnection(function(error, connection){
            if(error){
                try
                    {
                    mysqlPool.releaseConnection(connection);
                    }
                catch (e){}
                var errorMessage = "log_write_database: MySQL connection problem.";
                if(config.bot.errorLogging){
                    self.log_write_file(errorMessage);
                    self.log_write_file(error);
                }
                self.log_write_console(errorMessage);
                self.log_write_console(error);
            }
            connection.execute("INSERT INTO log (discord_id,description,value) VALUES (?,?,?)",[UserID,logDescription,logValue],function (error, results, fields){
                mysqlPool.releaseConnection(connection);
                if(error)
                {
                    var errorMessage = "log_write_database: MySQL query problem. (INSERT INTO log (discord_id,description,value) VALUES (?,?,?))";
                    if(config.bot.errorLogging){
                        self.log_write_file(errorMessage);
                        self.log_write_file(error);
                    }
                    self.log_write_console(errorMessage);
                    self.log_write_console(error);
                }
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Log: Message to file
    /* ------------------------------------------------------------------------------ */

    log_write_file: function(message) {
        logger.error(message);
    },

    /* ------------------------------------------------------------------------------ */
    // Log: Game actions
    /* ------------------------------------------------------------------------------ */
    log_write_game: function(action,content) {
        if(config.bot.gameLogging){
            message = config.messages.log.action+' '+action+' - '+config.messages.log.content+' '+content;
            loggerGame.info(message);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Log: Message to console
    /* ------------------------------------------------------------------------------ */

    log_write_console: function(message) {
        console.error(message);
    },

};