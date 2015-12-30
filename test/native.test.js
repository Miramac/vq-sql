var connectionString =  `Driver={SQL Server Native Client 11.0};Server=db1-muc\\SQL5_MUC;Database=ZI00_UnitTests;Trusted_Connection={Yes};`;

var nodeSql = require('msnodesqlv8');

var regex = /\.(?!(?:\S+\.?)+])/g
regex = /\.(?![^\[]*\])/g
var table = '[Table1]';
console.log(table.split(regex).length, table.split(regex))
table = '[Tab le1]';
console.log(table.split(regex).length, table.split(regex))
table = 'dbo.Table1';
console.log(table.split(regex).length, table.split(regex))
table = '[dbo].[Table1]';
console.log(table.split(regex).length, table.split(regex))
table = '[dbo].[Tabl e1]';
console.log(table.split(regex).length, table.split(regex))
table = '[fa.s\\fd].[Tabl e1]';
console.log(table.split(regex).length, table.split(regex))
table = '[dbo].[Ta[b]le1]';
console.log(table.split(regex).length, table.split(regex))
table = 'dbo.[don\'t [do]] that]';
console.log(table.split(regex).length, table.split(regex))

// table = 'fh.jil';
// console.log(table.split(/\.(?!(?:\w+\|?)+])/g))

// table = 'jil.gh.jk';
// console.log(table.split(/\.(?!(?:\w+\|?)+])/g))


 //return
table = '[VOCATUS-AG.DE\\Roloff].Table1'
table = '[Ta[b]]le1]'
var data = [{
         ID:-9981,
         Col1: 'col1 9981',
         Col2: 'col2 9981'
     },{
         ID:-9982,
         Col1: 'col1 9982',
         Col2: 'col2 9982'
     },{
         ID:-9983,
         Col1: 'col1 9983',
         Col2: 'col2 9983'
     },{
         ID:-9984,
         Col1: 'col1 9984',
         Col2: 'col2 9984'
     },{
         ID:-9985,
         Col1: 'col1 9985',
         Col2: 'col2 9985'
     }];

nodeSql.open(connectionString, function(err, connection) {
    if(err) throw err;
    var tableMgr = connection.tableMgr();
    tableMgr.bind(table, function(bulkMgr) {
        console.log(bulkMgr.columns.length)
    });            
});


//Procedure %.*ls has no parameters and arguments were supplied.