#vq-sql

A simple wrapper for the MS-SQL module 
[node-sqlserver-v8](https://github.com/TimelordUK/node-sqlserver-v8).

All connection methods like `.query()` or `.transaction()` suports a optional callback. If the callback is missing, a promise object will be returned.

## Install
```sh
npm install vq-sql --save
```

## Examples

```javascript
var Sql = require('vq-sql');
var connectionString = `Driver={SQL Server Native Client 11.0};Server=db1-muc\\SQL5;Database=Database_1;Trusted_Connection={Yes};`

var db1 = new Sql(connectionString);

//Use a callback
db1.query('SELECT ID FROM Table1', function(err, result) {
    if(err) throw err;
    console.log(result)
});

//return a promise if the callback is missing
db1.query('SELECT ID FROM Table1')
.then(function(result){
    console.log(result)
})
.catch(function(err){
    throw err;
});

```


#API

## Sql(options)
Creates a new DB-connection. If options is a string, it is used as connection string.
```javascript
var db1 = new Sql(`Driver={SQL Server Native Client 11.0};Server=db1-muc\\SQL5;Database=Database_1;Trusted_Connection={Yes};`);
```
### options object
 * connectionString
 * connectionSettings
  * driver
  * provider
  * server
  * database
  * useTrustedConnection
  * dbUser
  * dbPassword
 * logger (provide a log function like `winston.log`)
  
```javascript
var db1 = new Sql({
    connectionSettings: {
        driver: '{SQL Server Native Client 11.0}',
        server: 'db1-muc\\SQL5',
        database: 'Database_1',
        useTrustedConnection: true
    }
});

var db2 = new Sql({
    connectionSettings: {
        driver: '{SQL Server Native Client 11.0}',
        server: 'db1-muc\\SQL5',
        database: 'Database_2',
        dbUser: '...',
        dbPassword: '...'
    }
});
```


## Connection
### .query(queryStr [, source] [, callback])

```javascript
var db1 = new Sql(connectionString);
//Use a callback
db1.query('SELECT ID FROM Table1', function(err, result) {
    if(err) throw err;
    console.log(result);
});
//return a promise if the callback is missing
db1.query('SELECT ID FROM Table1')
.then(function(result){
    console.log(result);
})
.catch(function(err){
    throw err;
});
```
The parameter `source` is used for logging.

### .transaction(queryStr [, callback])
Creates a transaction with auto-commit and auto-rollback on error 
```javascript
var db1 = new Sql(connectionString);
db1.transaction(`
    INSERT INTO dbo.Table1 (id, col1) values (1, 'test 1')
    INSERT INTO dbo.Table1 (id, col1) values (2, 'test 2')
    INSERT INTO dbo.Table1 (id, col1) values (3, 'test 3')
    INSERT INTO dbo.Table1 (id, col1) values (4, 'test 4')
    INSERT INTO dbo.Table1 (id, col1) values (5, 'test 5')
`)
.then(function() {
    console.log('Done');
})
.catch(function(err) {
    throw err;
})
```

### .bulkInsert(table, data [, callback])
```javascript
var db1 = new Sql(connectionString);
db1.bulkInsert('dbo.Table1', [{
    ID: 9981,
    Col1: 'col1 9981',
    Col2: 'col2 9981'
}, {
    ID: 9982,
    Col1: 'col1 9982',
    Col2: 'col2 9982'
}, {
    ID: 9983,
    Col1: 'col1 9983',
    Col2: 'col2 9983'
}, {
    ID: 9984,
    Col1: 'col1 9984',
    Col2: 'col2 9984'
}, {
    ID: 9985,
    Col1: 'col1 9985',
    Col2: 'col2 9985'
}])
.then(function() {
    console.log('Done')
})
.catch(function(err) {
    throw err;
})
```
