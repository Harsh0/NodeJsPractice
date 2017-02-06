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

function fileAccess(filepath){
  return new Promise((resolve,reject)=>{
    fs.access(filepath,fs.F_OK,error=>{
      if(!error){
        resolve(filepath);
      }else{
        reject(error);
      }
    })
  });
}

function streamFile(filepath){
    return new Promise((resolve,reject)=>{
        let filestream = fs.createReadStream(filepath);
        filestream.on('open',()=>{
            resolve(filestream);
        });
        filestream.on('error',error=>{
            reject(error);
        });
    })
}

function webserver(req,res){
  //if the route requested is '/', then load 'index.htm' or else
  //load the requested file
  let baseURI = url.parse(req.url,true);
  let filepath = __dirname + (baseURI.pathname==='/'?'/index.htm':baseURI.pathname);
  let ContentType = mimes[path.extname(filepath)];
  //check if the requested file is accessible or not
  fileAccess(filepath)
    .then(streamFile)
    .then(fileStream =>{
      res.writeHead(200,{'Content-type':ContentType});
      fileStream.pipe(res);
    })
    .catch(error =>{
      res.writeHead(404);
      res.end(JSON.stringify(error));
    })
}


http.createServer(webserver).listen(3000,()=>{
  console.log('Server started at 3000');
})
