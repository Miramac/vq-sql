"use strict";
var winston = require('winston');
var nodeSql = require('msnodesqlv8');
var Q = require('q');


 
function Sql(options) {
    options = options || {};
    options = (typeof options === "string") ? {connectionString: options} : options;
     //Build the connection string if not provided
    if(!options.connectionString && options.connectionSettings) {
        //Driver
        options.connectionString = (options.connectionSettings.driver) ? 'Driver='+options.connectionSettings.driver+';' : '';
        //Provider if needed
        options.connectionString += (options.connectionSettings.provider) ? 'Provider='+options.connectionSettings.provider+';' : '';
        //server and db
        options.connectionString += 'Server='+options.connectionSettings.server+';Database='+options.database+';';
        // TrustedConnection?
        if(options.connectionSettings.useTrustedConnection) {
            options.connectionString += 'Trusted_Connection=yes';
        } else {
           options. connectionString += ';User Id='+options.connectionSettings.dbUser+';Password='+options.connectionSettings.dbPassword+';';
        }
    }
    options.logFile = options.logFile || './log/sql.log';
    winston.add(winston.transports.File, { filename: options.logFile  });
    
    /**
    *  Return Object (public)
    */
    var sql = {};
    /**
    * Debug mode: Log all SQL statemants
    * @property debug
    * @type {Boolean}
    * @default false
    */
    sql.debug = options.debug || false;
    
    /**
    *  transactions array
    */
    var transactions = {};
    
    /**
     * Execute sql statement. If the callback function is missing, a promise will be returned
     */
    sql.query = function(queryStr, cb){
        if(!cb) return sql.queryQ(queryStr);
        if(options.logging) winston.debug(queryStr);
        nodeSql.query(options.connectionString, queryStr, cb)
    };
    
     /**
     * Execute sql statement and return a promise
     */
    sql.queryQ = function(queryStr){
        var deferred = Q.defer();
        sql.query(queryStr, function (error, results) {
            if (error) {
                 winston.error(err);
                deferred.reject(new Error(error));
            } else {
                deferred.resolve(results);
            }
        });
        return deferred.promise;
    };
    
    return sql;
}

module.exports = Sql;
