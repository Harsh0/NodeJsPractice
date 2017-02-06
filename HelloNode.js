'use strict';
const http = require('http');
http
    .createServer((req,res)=>{
        res.writeHead(200,{'content-type':'text/html'});
        res.end('<h1>Hello Nodejs</h1>');
    })
    .listen(3000,()=>{
        console.log('Server started at 3000')
    })