const http = require('http');
const fs = require('fs');
const mongo = require('mongodb');
const port = process.argv[2]||80;
const mongourl = "";
var MongoClient = mongo.MongoClient;
var db;
let connectMongo = ()=>{
  MongoClient.connect(mongourl,(err,database)=>{
    if(err){
        // try connecting again
        connectMongo();
    }else{
      db = database;
      console.log("mongodb connected!");
    }
  })
}
connectMongo();
http.createServer((req,res)=>{
  if(['/','/main.js'].indexOf(req.url)>-1){
    if(req.url=='/main.js'){
      res.writeHead(200,{'Content-Type':'text/javascript'});
      let rs = fs.createReadStream('main.js');
      rs.pipe(res);
      return;
    }
    res.writeHead(200,{'Content-Type':'text/html'});
    let rs = fs.createReadStream('index.html');
    rs.pipe(res);
    return;
  }else if(req.url=='/getdata'){
    let c = db.collection('business');
    c.find({}).toArray((err,docs)=>{
      if(err){
        res.writeHead(500,{'Content-Type':'text/plain'})
        res.end("Internal Server Error")
      }else{
        res.writeHead(200,{'Content-Type':'application/json'});
        res.end(JSON.stringify(docs));
      }
    })
  }else if(req.url=='/pushdata'){
    let c = db.collection('business');
    var data ="";
    req.on('data',(d)=>{
      data += d;
    })
    req.on('end',()=>{
      data = JSON.parse(data);
      c.insertMany(data,(err,docs)=>{
        if(err){
          res.writeHead(500,{'Content-Type':'text/plain'})
          res.end("Internal Server Error")
        }else{
          res.writeHead(200,{'Content-Type':'application/json'});
          res.end(JSON.stringify(docs.ops));
        }
      })
    })
  }else{
    res.writeHead(404,{'Content-Type':'text/plain'});
    res.end('Not Found');
    return;
  }
}).listen(port,()=>{
  console.log("Server started at port "+port);
});
process.on('SIGINT', () => {
  console.log("Trying to close mongodb connection");
  db.close(()=>{
    console.log('Successfully Closed mongodb connection');
    process.kill(0);
  })
});
