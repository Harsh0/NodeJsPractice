'use strict';
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
let mimes={
  '.htm':'text/html',
  '.css':'text/css',
  '.js':'text/javascript',
  '.gif':'image/gif',
  '.jpg':'image/jpeg',
  '.png':'image/png'
}
function webserver(req,res){
  //if the route requested is '/', then load 'index.htm' or else
  //load the requested file
  let baseURI = url.parse(req.url,true);
  let filepath = __dirname + (baseURI.pathname==='/'?'/index.htm':baseURI.pathname);
  //check if the requested file is accessible or not
  fs.access(filepath,fs.F_OK,error=>{
      if(!error){
        //read and serve the file
        fs.readFile(filepath,(error,content)=>{
          if(!error){
            console.log(filepath);
            //resolve the file
            let ContentType = mimes[path.extname(filepath)];
            //serve the file from the buffer
            res.writeHead(200,{'Content-type':ContentType});
            res.end(content,'utf-8');
          }else{
            //serve a 500
            res.writeHead(500);
            res.end('The server could not read the file requested');
          }
        })
      }else{
        res.writeHead(404);
        res.end('Content not found');
      }
  });
}

http.createServer(webserver).listen(3000,()=>{
  console.log('Server started at 3000');
})
