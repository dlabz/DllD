var express = require('express')
var serveStatic = require('serve-static')
var path = require('path')
var app = express()

const uri = path.join(__dirname, 'public');

app.use(serveStatic(path.join(__dirname, 'public')))
app.use(serveStatic('public/ftp', { 'index': ['index.html', 'index.htm'] }))
app.listen(3456);

console.info({uri,serv:3456});