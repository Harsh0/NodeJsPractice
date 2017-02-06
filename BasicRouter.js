'use strict';
const http = require('http');
const url = require('url');
const qs = require('querystring');

let routes = {
  'GET':{
    '/':(req,res)=>{
      res.writeHead(200,{'Content-type':'text/html'});
      res.end('<h1>Hello Router</h1>')
    },
    '/about':(req,res)=>{
      res.writeHead(200,{'Content-type':'text/html'});
      res.end('<h1>This is about page</h1>')
    },
    '/api/getinfo':(req,res)=>{
      res.writeHead(200,{'Content-type':'application/json'});
      res.end(JSON.stringify(req.queryParams));
    }
  },
  'POST':{
    '/api/login':(req,res)=>{
      let body ='';
      req.on('data',data =>{
        body += data;
        if(body.length>2097152){
          res.writeHead(413,{'Content-type':'text/html'});
          res.end('<h3>Error: The file being uploaded exceeds the uploading limit</h3>',
          ()=>req.connection.destroy());
        }
      });
      req.on('end',()=>{
        let params = qs.parse(body);
        res.end(JSON.stringify(params ));
      });
    }
  },
  'NA':(req,res)=>{
    res.writeHead(400);
    res.end('content not found');
  }
}
function router(req,res){
  let baseURI = url.parse(req.url,true);
  let resolveRoute = routes[req.method][baseURI.pathname.toLowerCase()];
  if(resolveRoute){
    req.queryParams = baseURI.query;
    resolveRoute(req,res);
  }else{
    routes['NA'](req,res);
  }
}
http.createServer(router).listen(3000,()=>{
  console.log('Server started at 3000');
})
