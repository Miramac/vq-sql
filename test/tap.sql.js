var tap = require('tap');
var Sql = require('../'); 
var winston = require('winston');

var connectionString =  `Driver={SQL Server Native Client 11.0};Server=db1-muc\\SQL5_MUC;Database=ZI00_Development;Trusted_Connection={Yes};`;


winston.level = 'error';
var sql = new Sql(connectionString);
//sql.logger = winston.log;


tap.test("Test simple query", function(t) {
    sql.query('SELECT id FROM dbo.Employee where id=1')
    .then(function(data) { 
        t.same([{id:1}], data)
        t.end()
    })
    .catch(function(err) {
        t.error(err);
        t.end()
    })
})



tap.test("Test procedure 1", function(t) {
    sql.procedure('dbo.hello_world_1')
    .then(function(results, output) { 
        t.same([{message:'Hello world'}], results)
        t.end()
    })
    .catch(function(err) {
       t.error(err);
        t.end()
    })
})

tap.test("Test procedure 2", function(t) {
    sql.procedure('dbo.hello_world', 'Hello world!')
    .then(function(results, output) { 
        t.same([{message:'Hello world!'}], results)
        t.end()
    })
    .catch(function(err) {
        t.error(err);
        t.end()
    })
})

tap.test("Test transaction", function(t) {
        sql.transaction(`
        INSERT INTO Employee (lastname) values ('test 1')
        INSERT INTO Employee (lastname) values ('test 2')
        INSERT INTO Employee (lastname) values ('test 3')
        INSERT INTO Employee (lastname) values ('test 4')
        INSERT INTO Employee (lastname) values ('test 5')
        INSERT INTO Employee (lastname) values ('test 6')
    `)
    .then(function() {
        sql.query('DELETE dbo.Employee where id > 5', 'cleanup')
        t.end()
    })
    .catch(function(err) {
        t.error(err);
        t.end()
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