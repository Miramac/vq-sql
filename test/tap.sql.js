var tap = require('tap');
var Sql = require('../'); 
var winston = require('winston');

var connectionString =  `Driver={SQL Native Client};Server=db1-muc\\SQL5_MUC;Database=ZI00_Development;Trusted_Connection={Yes};`;


winston.level = 'debug';
var sql = new Sql(connectionString);
sql.logger = winston.log;


tap.test("Test simple query", function(t) {
    sql.query('SELECT id FROM dbo.Employee where id=1')
    .then(function(data) { 
        t.similar([{id:1}], data)
        t.end()
    })
    .catch(function(err) {
        throw err;
    })
})

tap.test("Test transaction", function(t) {
        sql.transaction(`
        INSERT INTO Employee (lastname) values ('testify1')
        INSERT INTO Employee (lastname) values ('testify2')
        INSERT INTO Employee (lastname) values ('testify3')
        INSERT INTO Employee (lastname) values ('testify4')
        INSERT INTO Employee (lastname) values ('testify5')
        INSERT INTO Employee (lastname) values ('testify6')
    `)
    .then(function() {
        sql.query('DELETE dbo.Employee where id > 5', 'cleanup')
        t.end()
    })
    .catch(function(err) {
        throw err;
    })
})

//winston.log('info',"SDSD");
/*
sql.query('DELETE dbo.Employee where id > 5', 'cleanup')
.then(function() {

    
    sql.query('SELECT id FROM dbo.Employee where id=5')
    .then(function(data) {
        if(data.length === 1) {
            return sql.query('SELECT * FROM dbo.Employee where ID='+data[0].id)
        }
    })
    .then(function(data) {
        console.log("DATA:", data)
    })
    .catch(winston.error)
    
    
    sql.transaction(`
        INSERT INTO Employee (lastname) values ('testify1')
        INSERT INTO Employee (lastname) values ('testify2')
        INSERT INTO Employee (lastname) values ('testify3')
        INSERT INTO Employee (lastname) values ('testify4')
        INSERT INTO Employee (lastname) values ('testify5')
        INSERT INTO Employee (lastname) values ('testify6')
    `)
    .catch(console.error)
    
});

*/