"use strict";

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
    
    /**
    *  Return Object (public)
    */
    var sql = this;
    
    /**
     * Loggong option 
     */
    sql.logger = options.logger || null;

    /**
     * Execute sql statement. If the callback function is missing, a promise will be returned
     */
    sql.query = function(queryStr, parameters, source, cb){
        if(typeof source === 'function'){
            cb = source;
            source = null;
        }
        if(typeof parameters === 'function'){
            cb = parameters;
            parameters = [];
        }
        if(typeof parameters === 'string'){
            source = parameters;
            parameters = [];
        }
        parameters = parameters || [];
        parameters = (Array.isArray(parameters)) ? parameters : [parameters];
        if(!cb) return queryQ(queryStr, parameters, source);
        log('debug', (parameters.length>0) ? {queryStr: queryStr, parameters:parameters} : queryStr , source);
        nodeSql.query(options.connectionString, queryStr, parameters, cb)
    };
    
    /**
     * Execute sql statement and return a promise
     */
    var queryQ = function(queryStr, parameters, source){
        var deferred = Q.defer();
        sql.query(queryStr, parameters, source, function (err, results) {
            if (err) {
                log('error', err, source);
                deferred.reject(err);
            } else {
                deferred.resolve(results);
            }
        });
        return deferred.promise;
    };
    
    /**
     * Opens an sql connection
     */
    sql.open = function(cb){
        if(!cb) return sql.openQ();
        nodeSql.open(options.connectionString, cb);
    }
    
    sql.openQ = function(){
        var deferred = Q.defer();
        sql.open(function (err, results) {
            if (err) {
                log('error', err);
                deferred.reject(err);
            } else {
                deferred.resolve(results);
            }
        });
        return deferred.promise;
    }
    
    /**
     * create a Transaction with auto commit or rollback on error
     */ 
    sql.transaction = function(queryStr, source, cb) {
        if(typeof source === 'function'){
            cb = source;
            source = null;
        }
        return sql.openQ()
        .then(function(connection) {
            var deferred = Q.defer();
            connection.beginTransaction( function( err ) { 
                if(err) throw err;
                 log('info', 'Begin transaction', source);
            });
            log('debug', queryStr, source);
            var query = connection.queryRaw(queryStr);
            
            query.on('error', function(err) {
                connection.rollback( function( err ) {
                        if(err) throw err;
                    });
                    log('info', 'Rollback transaction', source);
                    log('error', err, source);
                    if(cb) cb(err);
                    deferred.reject(new Error(err));
            })
            
            query.on('done', function() {
                connection.commit( function( err ) {
                    if(err) throw err;
                    log('info', 'Commit transaction', source);
                    if(cb) cb();
                    deferred.resolve();
                })
            })
            return deferred.promise;
        });
    }
    //shortcut
    sql.trans = sql.transaction;
    
    //Stored Procedure Support
    sql.procedure = function(procName, parameters, cb) {
        if (typeof parameters === 'function'){
            cb = parameters;
            parameters = null;
        }
        parameters = parameters || [];
        parameters = (Array.isArray(parameters)) ? parameters : [parameters];
        return sql.openQ()
        .then(function(connection) {
            var deferred = Q.defer();
            var procedureMgr = connection.procedureMgr();
            log('debug', procName + ' ' + parameters.join());
            procedureMgr.callproc(procName, parameters, function(err, result, output) {
                if(cb) {
                    cb(err, result, output)
                }else if(err) {
                    log('error', err);
                    deferred.reject(new Error(err));
                } else {
                    deferred.resolve({result: result, output: output});
                }
            });
            return deferred.promise;
        });
    };
    //shortcut
    sql.proc = sql.procedure;
    
    /**
     * Bulk operations
     */
    sql.bulkInsert = function(table, data, cb) {
         return sql.openQ()
        .then(function(connection) {
            var deferred = Q.defer();
            var tableMgr = connection.tableMgr();
            tableMgr.bind(table, function(bulkMgr) {
                bulkMgr.insertRows(data, function(err, result) {
                    if(cb) {
                        cb(err, result);
                    } else if(err) {
                        log('error', err);
                        deferred.reject(new Error(err));
                    } else {
                        deferred.resolve(result);
                    }
                });
            });            
            return deferred.promise;
        })
    };
    
    sql.bulkUpdate = function(table, data, cb) {
        
    };
    
    /**
    * expose quote
    */
    sql.quote = quote;
    
    /**
    * expose cast functions
    */
    sql.Double = nodeSql.Double;
    sql.BigInt = nodeSql.BigInt
    sql.VarBinary = nodeSql.VarBinary 
    sql.Integer = nodeSql.Integer
    sql.WVarChar = nodeSql.WVarChar
    sql.SSTimeStampOffset = nodeSql.SSTimeStampOffset
    
    
    /**
     * quote SQL values
     */
     var quote = function (value, addComma) {
        addComma = addComma || false;
        if(value === null){
            value = "NULL";
        }else if(typeof value === "number"){
            value = value;
        }else if(typeof value === "object"){
            value = JSON.stringify(value);
        }
        if(typeof value === "string" && value !== "NULL" && value.indexOf("*") === -1){
            value = "'"+value.replace(/'/g,"''")+"'";
        }

        return value +((addComma) ? "," : "");
    }
    
    
    var log = function(level, msg, source) {
        if(!msg) {
           msg = level;
           level = 'info';
        }
        if(sql.logger) {
            sql.logger(level, (source)? {'source':source, message:msg} : msg )
        }
    }
}

module.exports = Sql;
